import { supabase } from "../supabaseClient";
import { applyMessageChange } from "../cache/messages";

let channel = null;
let refCount = 0;

/**
 * Ref-counted realtime subscription for the messages table.
 */
export function subscribeToMessages(queryClient) {
  if (!supabase || typeof supabase.channel !== "function") {
    return () => {};
  }

  refCount++;

  if (!channel) {
    channel = supabase
      .channel("realtime:messages")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        (payload) => {
          applyMessageChange(queryClient, {
            type: payload.eventType,
            row: payload.new,
            oldRow: payload.old,
          });
        }
      )
      .subscribe((status, err) => {
        if (status === "CHANNEL_ERROR") {
          console.warn("[messagesChannel] Realtime error:", err);
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
