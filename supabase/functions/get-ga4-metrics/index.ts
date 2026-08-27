import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const ALLOWED_ORIGIN = "https://isipathanamedia.online";
const getCorsHeaders = (origin: string | null) => {
  const isAllowed = origin === ALLOWED_ORIGIN || (origin && origin.startsWith("http://localhost:"));
  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : ALLOWED_ORIGIN,
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

  if (origin && origin !== ALLOWED_ORIGIN && !origin.startsWith("http://localhost:")) {
    return jsonResponse({ error: "Forbidden origin" }, 403, origin);
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonResponse({ error: "Missing Authorization header" }, 401, origin);
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      return jsonResponse({ error: "Unauthorized" }, 401, origin);
    }

    // Verify admin
    const { data: userData, error: profileError } = await supabaseClient
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !userData || !["admin", "super_admin", "super-admin", "superadmin"].includes(userData.role)) {
      return jsonResponse({ error: "Forbidden" }, 403, origin);
    }

    const body = await req.json();
    const { articleId } = body;

    if (!articleId) {
      return jsonResponse({ error: "Missing required field: articleId" }, 400, origin);
    }

    // Hardcoded keys for now as requested
    const credentialsStr = `{"type":"service_account","project_id":"isipathanamedia-web-auth","private_key_id":"40bf63eac3449fbf419ebc768a07430c7ed2df96","private_key":"-----BEGIN PRIVATE KEY-----\\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDd+PfbfFK5wREw\\nysIgXOs5OSQywSuU9WrM7dtGA5AlIg4/gPnY92WHYC/nTtH1EO6pahB2fLs/zKQ2\\nsge1zy6FTvEBkLMkzK1v78DGpwRSQ196wzzSQRm6g3hM9xQTugz4VX1PTOtYowCv\\n/K0tJn/iEmXH4T1UVaGWOFB8JGFX2cUGESX9hgQdtsqNHdB/1/+XYtq3tS/I+7Yf\\n4IfbtrGBjXd9Y5tlAXMzqxdVfvOpOss4qRNCVR209FdajpnVgoc4bLTsn7MO9DhC\\nOqgk3JrztwL/NiglAvMLravrVsQn5gRKidSnWSr9iVtaLqZCUCgSLNX36Y5qPKUc\\nPfF+cgoBAgMBAAECggEAAkKWYuUqp6M91UAnW/TBLJO3XlJLfbiEnusP6ShFcoH6\\nbtHHo58/4QflOm8XiCLxiTQ1MP9Ew3OcI9iTek1IQK/EYDLNPvxb5RcsRGq2lwOk\\nplUgFpt5q3eYo3f60BXHJSbllqO6FCsiLf/2/tp5eb7B3mY87qw8iNXu4YS1mn1k\\n/ghQ4jEJK9wf3zFVojs2JgkFIU7OhxkYyGwqS97JGxr7aXT9gQ7P+PNyf9H7Uzmj\\nUwkgB3bNPTmYzqig9+5x5dBZhhCpnsEXC18sImRsEGNZSrSyqMLjBUDeZq0prsNg\\ngne5RebHwjoTk9TXtydfKuXpsBqhlvJJMpopyDejzQKBgQD/g6IODi+nKcUad0AW\\n2dFDYR6c/2fMLV67XI1zLONVxbgIoIgtpbpWG87kLTudTdghcQlcYCVLiAZZSPQQ\\nmp6W9QIkNV6LKihx+6wJBlbYBWZlG41MW7Kaajly4iWnrMpyqQdwgAnEXpKIAv5s\\nnePPckVq5j6USeM8OCozQLo7kwKBgQDeZQJlhogdot+NyEhI2OUBx9qe3sZTpzXV\\n4lD6+Yw8LT68St0UwwCKVYyh45zihXWnMQIumK1UM07+gQnBvzy6UGvW4ARtdnJv\\nhHu0MwQmbC1x1+Rx1B4d8g0syydCx5j4dYtmDA+FACdcYdDfade1IMRIPrF8RtrD\\nP43AkLsomwKBgQCrgtlJo/4asDANBtTvQcB1AQECk3JCHIZFL+gG0q+6iGBy8gbW\\n1TLR0BK9GRu2CGW2dOC6sBL4s1LHpe+mIZOocsfANE7FDURe1ndxC19J274Syj67\\nbaXifsEXO3PZLGQsOQe0XU2xEWY8g/3yPL2JJwQvsGN7OGmep3i0NJONnwJ/GFLz\\n8CbGvHcT/G3regw+//Lb9oRnLL8dJEeck9a3f91y/yUxCRRK+tZgi1RZ1GzEcYTq\\nuC36xzrVaQC0EHzaJ4akRNw7n71Uxt22qf7qdUlfrxPt6IVKxfuzdTLDGIq8MHCq\\nzn6DNAjQRUptjgIFlcn/rectgmo9gx1wY59w2QKBgQDLSGngUn++UpFGDuVi1f3L\\nhTt8oc7WZDrHOvwg5DKXlzgpbPWMZ8lj1ArdrsObESb7NIH9fidnIZXuFkHUbvWc\\nGmsstHUf2HV23uPW9yxI/1HazQIFRoj93GZhsGop1+wjVDNw82Dcpn7niBSGNmUD\\njsQBviOwdQDyhkPblksjbg==\\n-----END PRIVATE KEY-----\\n","client_email":"icmu-ga4-reader@isipathanamedia-web-auth.iam.gserviceaccount.com","client_id":"103903528365314054565","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/icmu-ga4-reader%40isipathanamedia-web-auth.iam.gserviceaccount.com","universe_domain":"googleapis.com"}`;
    const propertyId = "530565035";

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
              matchType: "EXACT"
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
              matchType: "EXACT"
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
