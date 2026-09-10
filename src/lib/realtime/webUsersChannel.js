import { supabase } from "../supabaseClient";
import { applyWebUsersChange } from "../cache/webUsers";

let channel = null;
let refCount = 0;

/**
 * Ref-counted realtime subscription for the users table.
 */
export function subscribeToWebUsers(queryClient) {
  if (!supabase || typeof supabase.channel !== "function") {
    return () => {};
  }

  refCount++;

  if (!channel) {
    channel = supabase
      .channel("realtime:users")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "users" },
        (payload) => {
          applyWebUsersChange(queryClient, {
            type: payload.eventType,
            row: payload.new,
            oldRow: payload.old,
          });
        }
      )
      .subscribe((status, err) => {
        if (status === "CHANNEL_ERROR") {
          console.warn("[webUsersChannel] Realtime error:", err);
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
