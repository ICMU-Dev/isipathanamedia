import { supabase } from "../supabaseClient";
import { applySiteConfigChange } from "../cache/siteConfig";

let channel = null;
let refCount = 0;

/**
 * Ref-counted realtime subscription for site_config updates on the assets table.
 */
export function subscribeToSiteConfig(queryClient) {
  if (!supabase || typeof supabase.channel !== "function") {
    return () => {};
  }

  refCount++;

  if (!channel) {
    channel = supabase
      .channel("realtime:site_config")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "assets",
          filter: "key=eq.site_config",
        },
        (payload) => {
          applySiteConfigChange(queryClient, {
            type: payload.eventType,
            row: payload.new,
            oldRow: payload.old,
          });
        }
      )
      .subscribe((status, err) => {
        if (status === "CHANNEL_ERROR") {
          console.warn("[siteConfigChannel] Realtime error:", err);
        }
      });
  }

  return () => {
    refCount--;
    if (refCount <= 0 && channel) {
      supabase.removeChannel(channel);
      channel = null;
      refCount = 0;
    }
  };
}
