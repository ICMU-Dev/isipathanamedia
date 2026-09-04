import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import webpush from "npm:web-push@3.6.7";

const ALLOWED_ORIGIN = "https://isipathanamedia.online";
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-user-index",
};

const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY") || "";
const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY") || "";

webpush.setVapidDetails("mailto:dev.icmu@gmail.com", vapidPublicKey, vapidPrivateKey);

const jsonResponse = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });

  const origin = req.headers.get("origin");
  if (origin && origin !== ALLOWED_ORIGIN && !origin.startsWith("http://localhost:")) {
    return jsonResponse({ error: "Forbidden origin" }, 403);
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const body = await req.json();
    const { title, description, type, reporter_name, submitter_user_id } = body;

    if (!title || !description || !type) {
      return jsonResponse({ error: "Missing required fields: title, description, type" }, 400);
    }

    // 1. Fetch admin + super_admin user IDs
    const { data: adminUsers, error: usersError } = await supabaseClient
      .from("users")
      .select("id")
      .in("role", ["admin", "super_admin", "super-admin", "superadmin"]);

    if (usersError) throw usersError;
    if (!adminUsers?.length) return jsonResponse({ success: true, message: "No admins to notify" });

    // Exclude the submitter from receiving a push notification for their own feedback
    const targetAdminIds = adminUsers
      .map((u) => u.id)
      .filter((id) => id !== submitter_user_id);

    if (!targetAdminIds.length) {
      return jsonResponse({ success: true, message: "No target admins found" });
    }

    // 2. Fetch only ALLOWED push subscriptions for target admins
    const { data: subscriptions, error: subsError } = await supabaseClient
      .from("push_subscriptions")
      .select("id, endpoint, p256dh, auth, user_id")
      .in("user_id", targetAdminIds)
      .eq("is_allowed", true); // ← Critical: only deliver to opted-in users

    if (subsError) throw subsError;
    if (!subscriptions?.length) {
      return jsonResponse({ success: true, message: "No active subscriptions" });
    }

    // 3. Build notification payload
    const targetUrl = body.target_url || "/admin-redirect";

    const payload = JSON.stringify({
      title: reporter_name,
      body: description,
      badge: `/web-app-manifest-192x192.png`, // Large icon for notification body
      icon: `/web-app-manifest-192x192.png`, // Small monochrome icon for Android status bar
      tag: `feedback-${Date.now()}`,
      data: { url: targetUrl },
      actions: [
        { action: "close", title: "Close" }
      ]
    });

    // 4. Send in parallel — clean up expired subscriptions (410/404)
    const staleIds: string[] = [];
    await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            payload,
            { urgency: "high", TTL: 86400 }
          );
        } catch (err) {
          if (err.statusCode === 410 || err.statusCode === 404) {
            staleIds.push(sub.id);
          } else {
            console.error(`Push failed for sub ${sub.id}:`, err.message);
          }
        }
      }),
    );

    // 5. Clean up stale subscriptions in background
    if (staleIds.length) {
      supabaseClient
        .from("push_subscriptions")
        .delete()
        .in("id", staleIds)
        .then(() => console.log(`Cleaned ${staleIds.length} stale subscriptions`))
        .catch(console.error);
    }

    return jsonResponse({
      success: true,
      sent: subscriptions.length - staleIds.length,
      cleaned: staleIds.length,
    });
  } catch (error) {
    console.error("send-feedback-push error:", error);
    return jsonResponse({ error: "An error occurred processing the request." }, 500);
  }
});
