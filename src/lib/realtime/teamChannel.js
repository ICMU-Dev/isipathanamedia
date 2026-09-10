import { supabase } from "../supabaseClient";
import { applyTeamChange } from "../cache/team";

let channel = null;
let refCount = 0;

/**
 * Ref-counted realtime subscription for the team table.
 */
export function subscribeToTeam(queryClient) {
  if (!supabase || typeof supabase.channel !== "function") {
    return () => {};
  }

  refCount++;

  if (!channel) {
    channel = supabase
      .channel("realtime:team")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "team" },
        (payload) => {
          applyTeamChange(queryClient, {
            type: payload.eventType,
            row: payload.new,
            oldRow: payload.old,
          });
        }
      )
      .subscribe((status, err) => {
        if (status === "CHANNEL_ERROR") {
          console.warn("[teamChannel] Realtime error:", err);
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
