import { supabase } from "../supabaseClient";
import { KNOWN_ADMIN_PROFILES_LIST, getAdminProfile } from "../../utils/roles";

function attachReporterProfile(item) {
  if (!item) return item;
  if (item.users?.full_name) return item;

  // Try lookup by user_id
  if (item.user_id) {
    const profile = KNOWN_ADMIN_PROFILES_LIST.find((u) => u.id === item.user_id);
    if (profile) {
      return {
        ...item,
        users: {
          full_name: profile.full_name,
          avatar_url: profile.avatar_url || null,
          role: profile.role,
        },
      };
    }
  }

  // Try lookup by index in url_path (e.g. /24929/dashboard/news)
  if (item.url_path) {
    const match = item.url_path.match(/\/([0-9]{4,6})(?:\/|$)/);
    if (match) {
      const profile = getAdminProfile(match[1]);
      if (profile) {
        return {
          ...item,
          users: {
            full_name: profile.full_name,
            avatar_url: profile.avatar_url || null,
            role: profile.role,
          },
        };
      }
    }
  }

  return item;
}

/**
 * Fetch feedbacks list with reporter details sorted by created_at descending.
 */
export async function fetchFeedbacksList() {
  try {
    const { data, error } = await supabase
      .from("feedbacks")
      .select("*, users(full_name, avatar_url, role)")
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      if (error.code === "PGRST205" || error.message?.includes("schema cache")) {
        return [];
      }
      throw error;
    }
    return (data || []).map(attachReporterProfile);
  } catch (err) {
    if (!err.message?.includes("schema cache") && err.code !== "PGRST205") {
      console.warn("[feedbacksApi] Feedback fetch note:", err.message);
    }
    return [];
  }
}

/**
 * Update feedback status ('open' | 'in_progress' | 'resolved' | 'wont_fix').
 */
export async function updateFeedbackStatus(id, status) {
  const { data, error } = await supabase
    .from("feedbacks")
    .update({ status })
    .eq("id", id)
    .select("*, users(full_name, avatar_url, role)")
    .maybeSingle();

  if (error) {
    console.error("[feedbacksApi] Failed to update feedback status:", error);
    throw error;
  }
  return attachReporterProfile(data) || { id, status };
}

/**
 * Update admin reply on feedback.
 */
export async function updateFeedbackReply(id, reply) {
  const trimmed = reply ? reply.trim() : null;
  const { data, error } = await supabase
    .from("feedbacks")
    .update({
      admin_reply: trimmed,
      replied_at: trimmed ? new Date().toISOString() : null,
    })
    .eq("id", id)
    .select("*, users(full_name, avatar_url, role)")
    .maybeSingle();

  if (error) {
    console.error("[feedbacksApi] Failed to update feedback reply:", error);
    throw error;
  }
  return attachReporterProfile(data) || { id, admin_reply: trimmed };
}

/**
 * Delete a feedback record by ID.
 */
export async function deleteFeedback(id) {
  const { error, count } = await supabase
    .from("feedbacks")
    .delete({ count: "exact" })
    .eq("id", id);
  if (error) {
    console.error("[feedbacksApi] Failed to delete feedback:", error);
    throw error;
  }
  return { id, count };
}

/**
 * Submit feedback (universal widget) and trigger background push notifications.
 */
export async function submitFeedback(feedbackData) {
  const payload = {
    user_id: feedbackData.user_id || null,
    device_type: feedbackData.device_type || "desktop",
    user_agent:
      feedbackData.user_agent ||
      (typeof navigator !== "undefined" ? navigator.userAgent : null),
    type: feedbackData.type || "other",
    priority: feedbackData.priority || null,
    title: feedbackData.title ? feedbackData.title.trim() : "",
    description: feedbackData.description ? feedbackData.description.trim() : "",
    url_path: feedbackData.url_path || "/",
    status: feedbackData.status || "open",
    created_at: feedbackData.created_at || new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("feedbacks")
    .insert([payload])
    .select("*, users(full_name, avatar_url, role)")
    .maybeSingle();

  if (error) {
    console.error("[feedbacksApi] Failed to submit feedback:", error);
    throw error;
  }

  // Trigger push to other admins (fire-and-forget)
  try {
    if (supabase?.functions?.invoke) {
      supabase.functions
        .invoke("send-feedback-push", {
          body: {
            title: payload.title,
            description: payload.description,
            type: payload.type,
            reporter_name: feedbackData.reporter_name || "Anonymous",
            submitter_user_id: payload.user_id,
            target_url: "/admin-redirect?to=feedbacks",
          },
        })
        .catch((err) =>
          console.warn("[feedbacksApi] Push notify invoke error:", err?.message || err)
        );
    }
  } catch (err) {
    console.warn("[feedbacksApi] Push trigger error:", err?.message || err);
  }

  return data || payload;
}
