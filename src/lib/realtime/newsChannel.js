import { supabase } from "../supabaseClient";
import { applyNewsChange } from "../cache/news";

let channel = null;
let refCount = 0;

/**
 * Call from a hook's useEffect or context. Ref-counted so multiple components
 * subscribing to news don't open duplicate channels. Unsubscribes when all unmount.
 */
export function subscribeToNews(queryClient, ctx = {}) {
  if (!supabase || typeof supabase.channel !== "function") {
    return () => {};
  }

  refCount++;

  if (!channel) {
    channel = supabase
      .channel("realtime:news")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "news" },
        (payload) => {
          applyNewsChange(
            queryClient,
            {
              type: payload.eventType,
              row: payload.new,
              oldRow: payload.old,
            },
            ctx
          );
        }
      )
      .subscribe((status, err) => {
        if (status === "CHANNEL_ERROR") {
          console.warn("[newsChannel] Realtime error:", err);
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
