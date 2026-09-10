import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import webpush from "npm:web-push@3.6.7";

const ALLOWED_ORIGIN_ENV = Deno.env.get("ALLOWED_ORIGIN") || Deno.env.get("SITE_ORIGIN") || "";
const ALLOWED_ORIGINS = ALLOWED_ORIGIN_ENV.split(",").map((o) => o.trim()).filter(Boolean);

const isAllowedOrigin = (origin: string | null) => {
  if (!origin) return true;
  if (ALLOWED_ORIGINS.length > 0 && ALLOWED_ORIGINS.includes(origin)) return true;
  return (
    origin.startsWith("http://localhost:") ||
    origin.startsWith("http://127.0.0.1:") ||
    origin.endsWith(".netlify.app")
  );
};

const getCorsHeaders = (origin: string | null) => {
  const allowed = isAllowedOrigin(origin);
  const allowOrigin = allowed && origin ? origin : (ALLOWED_ORIGINS[0] || "*");
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-user-index",
  };
};

const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY") || "";
const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY") || "";
const vapidSubject = Deno.env.get("VAPID_SUBJECT") || "";

if (vapidPublicKey && vapidPrivateKey && vapidSubject) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
}

const jsonResponse = (data: unknown, status = 200, origin: string | null = null) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...getCorsHeaders(origin) },
  });

serve(async (req) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") return new Response("ok", { headers: getCorsHeaders(origin) });

  if (origin && !isAllowedOrigin(origin)) {
    return jsonResponse({ error: "Forbidden origin" }, 403, origin);
  }

  if (!vapidPublicKey || !vapidPrivateKey || !vapidSubject) {
    return jsonResponse({ error: "Push notifications not configured: missing VAPID keys" }, 503, origin);
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const body = await req.json();
    const { title, description, type, reporter_name, submitter_user_id } = body;

    if (!title || !description || !type) {
      return jsonResponse({ error: "Missing required fields: title, description, type" }, 400, origin);
    }

    // 1. Fetch admin + super_admin user IDs (including dual roles like admin,broadcaster)
    const { data: allUsers, error: usersError } = await supabaseClient
      .from("users")
      .select("id, role");

    if (usersError) throw usersError;

    const adminUsers = (allUsers || []).filter((u) => {
      const r = (u.role || "").toLowerCase();
      return r.includes("admin") || r.includes("super");
    });

    if (!adminUsers.length) return jsonResponse({ success: true, message: "No admins to notify" }, 200, origin);

    // Exclude the submitter from receiving a push notification for their own feedback
    const targetAdminIds = adminUsers
      .map((u) => u.id)
      .filter((id) => id !== submitter_user_id);

    if (!targetAdminIds.length) {
      return jsonResponse({ success: true, message: "No target admins found" }, 200, origin);
    }

    // 2. Fetch only ALLOWED push subscriptions for target admins
    const { data: subscriptions, error: subsError } = await supabaseClient
      .from("push_subscriptions")
      .select("id, endpoint, p256dh, auth, user_id")
      .in("user_id", targetAdminIds)
      .eq("is_allowed", true); // ← Critical: only deliver to opted-in users

    if (subsError) throw subsError;
    if (!subscriptions?.length) {
      return jsonResponse({ success: true, message: "No active subscriptions" }, 200, origin);
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
    }, 200, origin);
  } catch (error) {
    console.error("send-feedback-push error:", error);
    return jsonResponse({ error: "An error occurred processing the request." }, 500, origin);
  }
});
