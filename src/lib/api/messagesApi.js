import { supabase } from "../supabaseClient";

/**
 * Fetch messages for admins sorted by created_at descending.
 */
export async function fetchMessagesList() {
  try {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      if (error.code === "PGRST205" || error.message?.includes("schema cache")) {
        return [];
      }
      throw error;
    }
    return data || [];
  } catch (err) {
    if (!err.message?.includes("schema cache") && err.code !== "PGRST205") {
      console.warn("Messages fetch note:", err.message);
    }
    return [];
  }
}

/**
 * Send a new public message and trigger push notification to admins.
 * Note: .select() is intentionally NOT chained to .insert() because anon/public
 * users have INSERT RLS permissions but NOT SELECT permissions on messages.
 * Chaining .select() forces PostgREST to evaluate SELECT RLS on RETURNING *,
 * resulting in a 401/403 RLS violation for public visitors.
 */
export async function sendMessage(messageData) {
  const messageId =
    messageData.id ||
    (typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`);

  const payload = {
    ...messageData,
    id: messageId,
    created_at: messageData.created_at || new Date().toISOString(),
  };

  const { error } = await supabase.from("messages").insert([payload]);

  if (error) {
    console.error("[messagesApi] Failed to insert message:", error);
    throw error;
  }

  // Background push notification trigger to notify admins (fire-and-forget)
  try {
    if (supabase?.functions?.invoke) {
      supabase.functions
        .invoke("send-feedback-push", {
          body: {
            title: "New Public Message",
            description: payload.message
              ? payload.message.substring(0, 100)
              : "You received a new message.",
            type: "message",
            reporter_name: payload.name || "Anonymous",
            submitter_user_id: null,
            target_url: "/admin-redirect?to=messages",
          },
        })
        .then(({ error: pushError }) => {
          if (pushError) {
            console.warn(
              "[messagesApi] Push notify warning:",
              pushError.message || pushError
            );
          }
        })
        .catch((err) =>
          console.warn("[messagesApi] Push notify failed:", err?.message || err)
        );
    }
  } catch (err) {
    console.warn("[messagesApi] Push notify invoke error:", err?.message || err);
  }

  return payload;
}

/**
 * Delete a message by ID.
 */
export async function deleteMessage(id) {
  const { error, count } = await supabase
    .from("messages")
    .delete({ count: "exact" })
    .eq("id", id);
  if (error) {
    console.error("[messagesApi] Failed to delete message:", error);
    throw error;
  }
  return { id, count };
}
