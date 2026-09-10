import { supabase } from "../supabaseClient";
import { applyFeedbackChange } from "../cache/feedbacks";

let channel = null;
let refCount = 0;

/**
 * Ref-counted realtime subscription for the feedbacks table.
 * Maintains a single open channel regardless of how many components mount useFeedbacks.
 */
export function subscribeToFeedbacks(queryClient) {
  if (!supabase || typeof supabase.channel !== "function") {
    return () => {};
  }

  refCount++;

  if (!channel) {
    channel = supabase
      .channel("realtime:feedbacks")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "feedbacks" },
        async (payload) => {
          let row = payload.new;
          // If INSERT, attempt to populate users join if user_id exists
          if (payload.eventType === "INSERT" && row?.user_id && !row.users) {
            try {
              const { data: userData } = await supabase
                .from("users")
                .select("full_name, avatar_url, role")
                .eq("id", row.user_id)
                .maybeSingle();
              if (userData) {
                row = { ...row, users: userData };
              }
            } catch {}
          }

          applyFeedbackChange(queryClient, {
            type: payload.eventType,
            row,
            oldRow: payload.old,
          });
        }
      )
      .subscribe((status, err) => {
        if (status === "CHANNEL_ERROR") {
          console.warn("[feedbacksChannel] Realtime subscription error:", err);
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
