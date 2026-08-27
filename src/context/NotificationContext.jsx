import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "../lib/supabaseClient";
import { toast } from "sonner";
import { MessageCircle, AlertCircle, X } from "lucide-react";

const NotificationContext = createContext();
export const useNotification = () => useContext(NotificationContext);

/** Plays a short, pleasant two-tone chime using the Web Audio API. No external file needed. */
const playNotificationSound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const now = ctx.currentTime;

    // First tone — bright ping
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(880, now);        // A5
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc1.connect(gain1).connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.25);

    // Second tone — resolving note
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1174.66, now + 0.12); // D6
    gain2.gain.setValueAtTime(0, now);
    gain2.gain.setValueAtTime(0.12, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc2.connect(gain2).connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.4);

    // Clean up after done
    setTimeout(() => ctx.close(), 500);
  } catch (e) {
    // Silently fail — audio is a nice-to-have, not critical
  }
};

// LocalStorage Helper Constants & Safe Accessors
const READ_FEEDBACK_KEY = "icmu_read_feedback_ids";

const getStoredReadIds = () => {
  try {
    const raw = localStorage.getItem(READ_FEEDBACK_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map((id) => String(id)) : [];
  } catch (err) {
    console.warn(
      "[NotificationContext] Error reading feedback IDs from localStorage:",
      err
    );
    return [];
  }
};

const saveStoredReadIds = (ids) => {
  try {
    const stringifiedIds = Array.from(new Set(ids.map((id) => String(id))));
    // Cap to most recent 1000 to prevent localStorage QuotaExceededError memory leaks
    const cappedIds = stringifiedIds.slice(-1000);
    localStorage.setItem(READ_FEEDBACK_KEY, JSON.stringify(cappedIds));
  } catch (err) {
    console.warn(
      "[NotificationContext] Error saving feedback IDs to localStorage:",
      err
    );
  }
};

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isLoadingFeedbacks, setIsLoadingFeedbacks] = useState(false);
  const [feedbackError, setFeedbackError] = useState(null);

  // Determine user role and admin status
  const role = user?.role?.toLowerCase() || "";
  const isSuperAdmin =
    role === "super-admin" || role === "superadmin" || role === "super_admin";
  const isAdmin = role === "admin" || isSuperAdmin;

  // 1. Request Browser Desktop Notification Permissions upon login
  useEffect(() => {
    if (!user) return;

    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        setPermissionGranted(true);
      } else if (
        Notification.permission !== "denied" &&
        !localStorage.getItem("icmu_notif_prompted")
      ) {
        localStorage.setItem("icmu_notif_prompted", "true");
        Notification.requestPermission()
          .then((permission) => {
            if (permission === "granted") {
              setPermissionGranted(true);
            }
          })
          .catch(() => {});
      }
    }
  }, [user]);

  // 2. Mount Database Fetching & Garbage Collection for Admin Users
  const fetchFeedbacks = useCallback(async () => {
    if (!user || !isAdmin || !supabase) {
      setNotifications([]);
      return;
    }

    setIsLoadingFeedbacks(true);
    setFeedbackError(null);

    try {
      const { data, error } = await supabase
        .from("feedbacks")
        .select("*, users(full_name)")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      const dbFeedbacks = data || [];
      const dbIdSet = new Set(dbFeedbacks.map((fb) => String(fb.id)));

      const storedIds = getStoredReadIds();
      const validReadSet = new Set(storedIds.map((id) => String(id)));

      // Map DB feedbacks into context notifications state
      const mappedFeedbacks = dbFeedbacks.map((fb) => ({
        id: String(fb.id),
        dbId: fb.id,
        senderId: "system",
        senderName: fb.users?.full_name || "System",
        text: `New ${fb.type?.toUpperCase()} Feedback: ${fb.title}`,
        title: fb.title,
        description: fb.description,
        type: fb.type,
        status: fb.status,
        userId: fb.user_id || null,
        createdAt: fb.created_at || new Date().toISOString(),
        read: validReadSet.has(String(fb.id)),
        isFeedback: true,
      }));

      setNotifications((prev) => {
        const nonFeedbacks = prev.filter((n) => !n.isFeedback);
        return [...mappedFeedbacks, ...nonFeedbacks];
      });
    } catch (err) {
      console.error(
        "[NotificationContext] Error fetching feedbacks:",
        err.message
      );
      setFeedbackError(err.message);
    } finally {
      setIsLoadingFeedbacks(false);
    }
  }, [user, isAdmin]);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  // 3. Realtime Postgres Changes Subscription for Feedback Inserts
  useEffect(() => {
    const currentUserId = user?.id;
    if (!currentUserId || !isAdmin || !supabase) return;

    let feedbackChannel = null;

    feedbackChannel = supabase
      .channel(`feedbacks_realtime_${currentUserId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "feedbacks",
        },
        (payload) => {
          if (payload.eventType === "DELETE") {
            setNotifications((prev) => prev.filter((n) => String(n.dbId) !== String(payload.old.id)));
            return;
          }

          if (payload.eventType === "UPDATE") {
            setNotifications((prev) =>
              prev.map((n) =>
                String(n.dbId) === String(payload.new.id) ? { ...n, status: payload.new.status } : n
              )
            );
            return;
          }

          if (payload.eventType === "INSERT") {
            const rawFb = payload.new;
            if (!rawFb) return;

            // Exclude self: if the user who submitted the feedback is the current user, ignore the toast.
            if (rawFb.user_id === currentUserId) return;

            const stringId = String(rawFb.id);
            const storedReadSet = new Set(
              getStoredReadIds().map((id) => String(id))
            );

            const notifItem = {
              id: stringId,
              dbId: rawFb.id,
              senderId: "system",
              senderName: rawFb.user_id === currentUserId ? user?.name : "System",
              text: `New ${rawFb.type?.toUpperCase()} Feedback: ${rawFb.title}`,
              title: rawFb.title,
              description: rawFb.description,
              type: rawFb.type,
              status: rawFb.status,
              userId: rawFb.user_id || null,
              createdAt: rawFb.created_at || new Date().toISOString(),
              read: storedReadSet.has(stringId),
              isFeedback: true,
            };

            setNotifications((prev) => {
              if (prev.some((n) => String(n.id) === stringId)) return prev;
              return [notifItem, ...prev];
            });

            const isBlocked = localStorage.getItem("icmu_notifications_blocked") === "true";
            if (!isBlocked) {
              toast.custom(
                (t) => (
                  <div
                    onClick={() => toast.dismiss(t)}
                    className="flex flex-row items-start gap-3 p-4 bg-[var(--admin-card-bg,#1c1c1e)] rounded-2xl shadow-2xl min-w-[320px] max-w-sm border border-[var(--admin-border,rgba(255,255,255,0.1))] font-sans relative cursor-pointer hover:brightness-110 transition-all">
                    <div className="relative shrink-0 mt-0.5">
                      <img
                        src="/favicon-96x96.png"
                        alt="IC Logo"
                        className="w-10 h-10 rounded-full object-cover bg-white p-2"
                      />
                      <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-600 border-2 border-[var(--admin-card-bg)] items-center justify-center">
                          <AlertCircle size={10} className="text-white" />
                        </span>
                      </span>
                    </div>
                    <div className="flex flex-col flex-1 gap-1 pr-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[14px] font-bold text-[var(--admin-text-primary)] tracking-tight">
                          System Feedback
                        </span>
                        <span className="text-[11px] text-[var(--admin-text-primary)] opacity-50 font-medium">
                          Just now
                        </span>
                      </div>
                      <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[var(--admin-text-primary)] text-[var(--admin-card-bg)] w-max mb-1 mt-0.5">
                        {rawFb.type}
                      </span>
                      <span className="text-[13px] font-semibold text-[var(--admin-text-primary)] leading-tight">
                        {rawFb.title}
                      </span>
                      {rawFb.description && (
                        <span className="text-[12px] text-[var(--admin-text-primary)] opacity-70 line-clamp-2 leading-relaxed mt-1">
                          {rawFb.description}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toast.dismiss(t);
                      }}
                      className="text-[var(--admin-text-primary)] opacity-30 hover:opacity-100 transition-opacity p-1 absolute top-3 right-3">
                      <X size={14} strokeWidth={2.5} />
                    </button>
                  </div>
                ),
                { position: "top-right", duration: 6000 }
              );
            }
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setFeedbackError(null);
          fetchFeedbacks(); // Refetch to catch any events missed while disconnected
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setFeedbackError("Real-time connection lost. Reconnecting...");
        }
      });

    return () => {
      if (feedbackChannel) supabase.removeChannel(feedbackChannel);
    };
  }, [user, isAdmin, fetchFeedbacks]);

  // 4. Multi-Tab Synchronization via Window Storage Event Listener
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === READ_FEEDBACK_KEY || e.key === null) {
        const storedReadIds = getStoredReadIds();
        const readSet = new Set(storedReadIds.map((id) => String(id)));
        setNotifications((prev) =>
          prev.map((n) =>
            n.isFeedback ? { ...n, read: readSet.has(String(n.id)) } : n
          )
        );
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Unread Count Calculation
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  // 5. Action Handlers
  const markAsRead = useCallback((id) => {
    const strId = String(id);
    setNotifications((prev) =>
      prev.map((n) => (String(n.id) === strId ? { ...n, read: true } : n))
    );

    const currentRead = getStoredReadIds();
    if (!currentRead.includes(strId)) {
      saveStoredReadIds([...currentRead, strId]);
    }
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      const allFbIds = updated
        .filter((n) => n.isFeedback)
        .map((n) => String(n.id));
      const currentRead = getStoredReadIds();
      const merged = Array.from(new Set([...currentRead, ...allFbIds]));
      saveStoredReadIds(merged);
      return updated;
    });
  }, []);

  const markAllFeedbacksAsRead = useCallback(() => {
    setNotifications((prev) => {
      const updated = prev.map((n) =>
        n.isFeedback ? { ...n, read: true } : n
      );
      const allFbIds = updated
        .filter((n) => n.isFeedback)
        .map((n) => String(n.id));
      const currentRead = getStoredReadIds();
      const merged = Array.from(new Set([...currentRead, ...allFbIds]));
      saveStoredReadIds(merged);
      return updated;
    });
  }, []);

  const markAllMessagesAsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((n) => (!n.isFeedback ? { ...n, read: true } : n))
    );
  }, []);

  const removeNotification = useCallback((id) => {
    const strId = String(id);
    setNotifications((prev) => prev.filter((n) => String(n.id) !== strId));
    const currentRead = getStoredReadIds();
    const cleaned = currentRead.filter((storedId) => storedId !== strId);
    saveStoredReadIds(cleaned);
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const contextValue = useMemo(
    () => ({
      notifications,
      unreadCount,
      permissionGranted,
      isLoadingFeedbacks,
      feedbackError,
      markAsRead,
      markAllAsRead,
      markAllFeedbacksAsRead,
      markAllMessagesAsRead,
      removeNotification,
      clearNotifications,
      refetchFeedbacks: fetchFeedbacks,
    }),
    [
      notifications,
      unreadCount,
      permissionGranted,
      isLoadingFeedbacks,
      feedbackError,
      markAsRead,
      markAllAsRead,
      markAllFeedbacksAsRead,
      markAllMessagesAsRead,
      removeNotification,
      clearNotifications,
      fetchFeedbacks,
    ]
  );

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

