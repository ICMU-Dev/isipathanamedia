import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

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

const jsonResponse = (data: unknown, status = 200, origin: string | null = null) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...getCorsHeaders(origin) },
  });

// Base64Url encoding helper
function base64UrlEncode(str: string | ArrayBuffer): string {
  const base64 = typeof str === "string" 
    ? btoa(str) 
    : btoa(String.fromCharCode(...new Uint8Array(str as ArrayBuffer)));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// Convert PEM to ArrayBuffer
function pemToArrayBuffer(pem: string): ArrayBuffer {
  const b64 = pem.replace(/(-----(BEGIN|END) PRIVATE KEY-----|\n|\r)/g, "");
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// Create JWT token for Google APIs
async function createJwt(credentials: any): Promise<string> {
  const header = {
    alg: "RS256",
    typ: "JWT",
  };

  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 3600; // 1 hour

  const payload = {
    iss: credentials.client_email,
    sub: credentials.client_email,
    aud: "https://oauth2.googleapis.com/token",
    iat,
    exp,
    scope: "https://www.googleapis.com/auth/analytics.readonly",
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;

  const privateKeyBuffer = pemToArrayBuffer(credentials.private_key);

  const key = await crypto.subtle.importKey(
    "pkcs8",
    privateKeyBuffer,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    false,
    ["sign"]
  );

  const signatureBuffer = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(unsignedToken)
  );

  const encodedSignature = base64UrlEncode(signatureBuffer);
  return `${unsignedToken}.${encodedSignature}`;
}

async function getAccessToken(credentials: any): Promise<string> {
  const jwt = await createJwt(credentials);
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });
  
  if (!response.ok) {
    throw new Error(`Failed to get access token: ${await response.text()}`);
  }

  const data = await response.json();
  return data.access_token;
}

serve(async (req) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") return new Response("ok", { headers: getCorsHeaders(origin) });

  if (origin && !isAllowedOrigin(origin)) {
    return jsonResponse({ error: "Forbidden origin" }, 403, origin);
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const body = await req.json().catch(() => ({}));
    const { articleId, userIndex, userId } = body;

    if (!articleId) {
      return jsonResponse({ error: "Missing required field: articleId" }, 400, origin);
    }

    // ── Multi-Method Authorization Check ──
    let isAuthorized = false;
    const allowedRoles = ["admin", "super_admin", "super-admin", "superadmin", "writer"];

    // 1. Supabase Auth JWT (if present and not just anon key)
    const authHeader = req.headers.get("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
      if (token && token !== anonKey) {
        try {
          const { data: { user } } = await supabaseClient.auth.getUser(token);
          if (user?.id) {
            const { data: userData } = await supabaseClient
              .from("users")
              .select("role, is_active")
              .eq("id", user.id)
              .maybeSingle();
            if (userData && userData.is_active !== false && allowedRoles.includes(userData.role)) {
              isAuthorized = true;
            }
          }
        } catch (_) {}
      }
    }

    // 2. Custom header or body userIndex
    const indexNumber = req.headers.get("x-user-index") || userIndex;
    if (!isAuthorized && indexNumber) {
      const { data: userData } = await supabaseClient
        .from("users")
        .select("id, role, is_active")
        .eq("index_number", indexNumber.toString())
        .maybeSingle();
      if (userData && userData.is_active !== false && allowedRoles.includes(userData.role)) {
        isAuthorized = true;
      }
    }

    // 3. User ID lookup
    if (!isAuthorized && userId) {
      const { data: userData } = await supabaseClient
        .from("users")
        .select("id, role, is_active")
        .eq("id", userId)
        .maybeSingle();
      if (userData && userData.is_active !== false && allowedRoles.includes(userData.role)) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return jsonResponse({ error: "Unauthorized: Valid admin or writer session required." }, 401, origin);
    }

    // Read Google Service Account credentials & GA4 property securely from Supabase secrets
    const credentialsStr = Deno.env.get("GA4_SERVICE_ACCOUNT_JSON") || Deno.env.get("GA4_SERVICE_ACCOUNT_KEY") || Deno.env.get("GOOGLE_SERVICE_ACCOUNT_KEY") || "";
    const propertyId = Deno.env.get("GA4_PROPERTY_ID") || "";

    if (!credentialsStr || !propertyId) {
      return jsonResponse({
        configured: false,
        views: 0,
        users: 0,
        avgSessionDuration: 0,
        deviceBreakdown: { mobile: 0, desktop: 0, tablet: 0 }
      }, 200, origin);
    }

    const credentials = JSON.parse(credentialsStr);
    const accessToken = await getAccessToken(credentials);

    const runReportUrl = `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`;

    // 1. Fetch main metrics
    const mainReportRes = await fetch(runReportUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        dateRanges: [{ startDate: "90daysAgo", endDate: "today" }],
        metrics: [
          { name: "screenPageViews" },
          { name: "totalUsers" },
          { name: "averageSessionDuration" }
        ],
        dimensionFilter: {
          filter: {
            fieldName: "pagePath",
            stringFilter: {
              value: `/news/${articleId}`,
              matchType: "CONTAINS"
            }
          }
        }
      })
    });

    if (!mainReportRes.ok) {
       throw new Error(`Main GA4 request failed: ${await mainReportRes.text()}`);
    }

    const mainReport = await mainReportRes.json();
    const row = mainReport.rows?.[0];

    const views = parseInt(row?.metricValues?.[0]?.value || "0", 10);
    const users = parseInt(row?.metricValues?.[1]?.value || "0", 10);
    const avgSessionDuration = parseFloat(row?.metricValues?.[2]?.value || "0");

    // 2. Fetch device breakdown
    const deviceReportRes = await fetch(runReportUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        dateRanges: [{ startDate: "90daysAgo", endDate: "today" }],
        dimensions: [{ name: "deviceCategory" }],
        metrics: [{ name: "screenPageViews" }],
        dimensionFilter: {
          filter: {
            fieldName: "pagePath",
            stringFilter: {
              value: `/news/${articleId}`,
              matchType: "CONTAINS"
            }
          }
        }
      })
    });

    if (!deviceReportRes.ok) {
       throw new Error(`Device GA4 request failed: ${await deviceReportRes.text()}`);
    }

    const deviceReport = await deviceReportRes.json();
    const deviceBreakdown = { mobile: 0, desktop: 0, tablet: 0 };

    if (deviceReport.rows) {
      for (const r of deviceReport.rows) {
        const category = r.dimensionValues?.[0]?.value?.toLowerCase();
        const value = parseInt(r.metricValues?.[0]?.value || "0", 10);
        if (category === "mobile" || category === "desktop" || category === "tablet") {
          deviceBreakdown[category as keyof typeof deviceBreakdown] = value;
        }
      }
    }

    return jsonResponse({
      configured: true,
      views,
      users,
      avgSessionDuration,
      deviceBreakdown
    }, 200, origin);

  } catch (error: any) {
    console.error("get-ga4-metrics error:", error);
    return jsonResponse({ error: "An error occurred processing the request.", details: error.message }, 500, origin);
  }
});
