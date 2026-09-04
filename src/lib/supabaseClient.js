import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    "Supabase environment variables are missing. App will run in offline mode.",
  );
}

// Custom fetch to inject our x-user-index header for RLS
const customFetch = (url, options = {}) => {
  const headers = new Headers(options?.headers || {});
  
  const sessionStr = sessionStorage.getItem('icmu_session') || localStorage.getItem('icmu_session');
  if (sessionStr) {
    try {
      const session = JSON.parse(sessionStr);
      if (session && session.indexNumber) {
        headers.set('x-user-index', session.indexNumber.toString());
      }
    } catch (e) {}
  }
  
  return fetch(url, { ...options, headers });
};


// Enable session persistence so Supabase sends the Auth JWT token with requests
export const supabase =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: true, // Must be true so the auth token is stored and sent to DB
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
        global: {
          headers: { "x-client-info": "icmu-web/2.0" },
          fetch: customFetch,
        },
      })
    : {
        // Dummy client fallback — mirrors the real Supabase client API surface
        // so code that calls .channel(), .from(), etc. never throws at runtime.
        from: () => ({
          select: () => ({
            order: () => Promise.resolve({ data: [], error: null }),
            eq: () => ({
              maybeSingle: () => Promise.resolve({ data: null, error: null }),
              single: () => Promise.resolve({ data: null, error: null }),
            }),
            single: () => Promise.resolve({ data: null, error: null }),
            limit: () => Promise.resolve({ data: [], error: null }),
          }),
          insert: () => ({
            select: () => Promise.resolve({ data: [], error: null }),
          }),
          update: () => ({ eq: () => Promise.resolve({ error: null }) }),
          delete: () => ({ eq: () => Promise.resolve({ error: null }) }),
          upsert: () => Promise.resolve({ error: null }),
        }),
        storage: {
          from: () => ({
            upload: () => Promise.resolve({ error: null }),
            getPublicUrl: () => ({ data: { publicUrl: "" } }),
            remove: () => Promise.resolve({ error: null }),
          }),
        },
        rpc: () =>
          Promise.resolve({
            data: null,
            error: { message: "Supabase not configured" },
          }),
        // Realtime stubs — prevents "supabase.channel is not a function" crash
        channel: () => ({
          on: function () { return this; },
          subscribe: function () { return this; },
          unsubscribe: function () { return this; },
        }),
        removeChannel: () => Promise.resolve(),
        auth: {
          getSession: () => Promise.resolve({ data: { session: null }, error: null }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
          signOut: () => Promise.resolve({ error: null }),
          signInWithOAuth: () => Promise.resolve({ error: { message: "Supabase not configured" } }),
        },
      };
