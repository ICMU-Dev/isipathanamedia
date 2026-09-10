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
import {
  MessageCircle,
  AlertCircle,
  Mail,
  Bug,
  Sparkles,
  AlertTriangle,
  X,
  Radio,
} from "lucide-react";
import { isAdmin as checkIsAdmin, isSuperAdmin as checkIsSuperAdmin, isWriter as checkIsWriter } from "../utils/roles";
import { queryClient } from "../lib/queryClient";
import { messagesKeys, feedbacksKeys, newsKeys } from "../lib/queryKeys";
import initialChangelogs from "../data/changelogs.json";

const DEV_SYSTEM_NOTIFS_KEY = "icmu_dev_system_notifications";


const NotificationContext = createContext();
export const useNotification = () => useContext(NotificationContext);

/** Plays a short, pleasant two-tone chime using the Web Audio API. No external audio file needed. */
export const playNotificationSound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const now = ctx.currentTime;

    // First tone — bright ping
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(880, now); // A5
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
    // Silently fail — audio is optional/enhancement
  }
};

// LocalStorage Keys for read state & dismissed state
const READ_NOTIFS_KEY = "icmu_read_feedback_ids";
const DISMISSED_NOTIFS_KEY = "icmu_dismissed_notification_ids";

const getStoredIds = (key) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map((id) => String(id)) : [];
  } catch (err) {
    console.warn(`[NotificationContext] Error reading ${key} from localStorage:`, err);
    return [];
  }
};

const saveStoredIds = (key, ids) => {
  try {
    const unique = Array.from(new Set(ids.map((id) => String(id))));
    // Cap to most recent 1000 items to prevent storage bloat
    const capped = unique.slice(-1000);
    localStorage.setItem(key, JSON.stringify(capped));
  } catch (err) {
    console.warn(`[NotificationContext] Error saving ${key} to localStorage:`, err);
  }
};

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [notificationError, setNotificationError] = useState(null);

  // Clearance validation
  const userRole = user?.role;
  const isSuperAdmin = checkIsSuperAdmin(userRole);
  const isAdmin = checkIsAdmin(userRole);
  const isWriter = checkIsWriter(userRole);
  const canReceiveNotifications = isAdmin || isWriter;

  // 1. Request Browser Desktop Notification Permissions
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

  // 2. Fetch Notifications from Supabase (Feedbacks + Messages + Articles)
  const fetchNotifications = useCallback(async () => {
    if (!user || !canReceiveNotifications || !supabase) {
      setNotifications([]);
      return;
    }

    setIsLoadingNotifications(true);
    setNotificationError(null);

    try {
      const readIds = new Set(getStoredIds(READ_NOTIFS_KEY));
      const dismissedIds = new Set(getStoredIds(DISMISSED_NOTIFS_KEY));
      const unifiedItems = [];

      // 1. Fetch Admin Data (Feedbacks, Messages, Pending Articles)
      if (isAdmin) {
        const [feedbacksRes, messagesRes, pendingNewsRes] = await Promise.allSettled([
          supabase
            .from("feedbacks")
            .select("*, users:user_id(id, full_name, role, avatar_url)")
            .order("created_at", { ascending: false })
            .limit(50),
          supabase
            .from("messages")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(50),
          supabase
            .from("news")
            .select("id, title, author, status, needs_attention, review_notes, created_at, date, submitted_by")
            .eq("status", "pending")
            .order("created_at", { ascending: false })
            .limit(50),
        ]);

        // Process Feedbacks
        let dbFeedbacks = [];
        if (feedbacksRes.status === "fulfilled" && !feedbacksRes.value.error) {
          dbFeedbacks = feedbacksRes.value.data || [];
        } else {
          try {
            const { data } = await supabase
              .from("feedbacks")
              .select("*")
              .order("created_at", { ascending: false })
              .limit(50);
            if (data) dbFeedbacks = data;
          } catch {}
        }

        for (const fb of dbFeedbacks) {
            const strId = `fb-${fb.id}`;
            if (dismissedIds.has(strId) || dismissedIds.has(String(fb.id))) continue;

            unifiedItems.push({
              id: strId,
              rawId: fb.id,
              category: "feedback",
              subType: fb.type || "other",
              title: fb.title || "Feedback Report",
              description: fb.description || "",
              senderName: fb.users?.full_name || "System Admin",
              senderAvatar: fb.users?.avatar_url || null,
              senderEmail: null,
              senderPhone: null,
              status: fb.status || "open",
              userId: fb.user_id || null,
              createdAt: fb.created_at || new Date().toISOString(),
              read: readIds.has(strId) || readIds.has(String(fb.id)),
              isFeedback: true,
              isInbox: false,
            });
          }

        // Process Inbox Messages
        if (messagesRes.status === "fulfilled" && !messagesRes.value.error) {
          const dbMessages = messagesRes.value.data || [];
          for (const msg of dbMessages) {
            const strId = `msg-${msg.id}`;
            if (dismissedIds.has(strId) || dismissedIds.has(String(msg.id))) continue;

            unifiedItems.push({
              id: strId,
              rawId: msg.id,
              category: "inbox",
              subType: "contact",
              title:
                msg.subject ||
                (msg.message
                  ? msg.message.length > 50
                    ? msg.message.slice(0, 50) + "…"
                    : msg.message
                  : `Inquiry from ${msg.name || "Visitor"}`),
              description: msg.message || "",
              senderName: msg.name || "Website Visitor",
              senderAvatar: null,
              senderEmail: msg.email || null,
              senderPhone: msg.phone || null,
              status: msg.status || "received",
              userId: null,
              createdAt: msg.created_at || new Date().toISOString(),
              read: readIds.has(strId) || readIds.has(String(msg.id)),
              isFeedback: false,
              isInbox: true,
            });
          }
        }

        // Process Pending Articles for Admins
        if (pendingNewsRes.status === "fulfilled" && !pendingNewsRes.value.error) {
          const dbNews = pendingNewsRes.value.data || [];
          for (const art of dbNews) {
            const strId = `art-review-${art.id}`;
            if (dismissedIds.has(strId) || dismissedIds.has(String(art.id))) continue;

            unifiedItems.push({
              id: strId,
              rawId: art.id,
              category: "article",
              subType: "pending_review",
              title: "Article Submitted for Review",
              description: `"${art.title}" submitted by ${art.author || "Writer"} requires review.`,
              senderName: art.author || "Newsroom Writer",
              senderAvatar: null,
              status: "pending",
              targetUrl: `/dashboard/news?tab=pending`,
              createdAt: art.created_at || art.date || new Date().toISOString(),
              read: readIds.has(strId) || readIds.has(String(art.id)),
              isArticle: true,
            });
          }
        }
      }

      // 2. Fetch Writer-Specific Article Notifications
      if (isWriter && user?.id) {
        const { data: writerNews, error: writerError } = await supabase
          .from("news")
          .select("id, title, author, status, needs_attention, review_notes, created_at, date, submitted_by")
          .eq("submitted_by", user.id)
          .order("created_at", { ascending: false })
          .limit(50);

        if (!writerError && writerNews) {
          for (const art of writerNews) {
            if (art.needs_attention) {
              const strId = `art-attn-${art.id}`;
              if (dismissedIds.has(strId) || dismissedIds.has(String(art.id))) continue;
              unifiedItems.push({
                id: strId,
                rawId: art.id,
                category: "article",
                subType: "needs_attention",
                title: `Needs Attention: "${art.title}"`,
                description: art.review_notes || "Editor requested changes before this article can be approved.",
                senderName: "Review Administrator",
                senderAvatar: null,
                status: "needs_attention",
                targetUrl: `/dashboard/news?tab=pending`,
                createdAt: art.created_at || art.date || new Date().toISOString(),
                read: readIds.has(strId) || readIds.has(String(art.id)),
                isArticle: true,
              });
            } else if (art.status === "published") {
              const strId = `art-approved-${art.id}`;
              if (dismissedIds.has(strId) || dismissedIds.has(String(art.id))) continue;
              unifiedItems.push({
                id: strId,
                rawId: art.id,
                category: "article",
                subType: "approved",
                title: `Article Published: "${art.title}"`,
                description: "Your article has been reviewed, approved, and published.",
                senderName: "Review Administrator",
                senderAvatar: null,
                status: "published",
                targetUrl: `/news/${art.id}`,
                createdAt: art.created_at || art.date || new Date().toISOString(),
                read: readIds.has(strId) || readIds.has(String(art.id)),
                isArticle: true,
              });
            } else if (art.status === "rejected") {
              const strId = `art-rejected-${art.id}`;
              if (dismissedIds.has(strId) || dismissedIds.has(String(art.id))) continue;
              unifiedItems.push({
                id: strId,
                rawId: art.id,
                category: "article",
                subType: "rejected",
                title: `Article Declined: "${art.title}"`,
                description: art.review_notes || "This article was declined by an administrator.",
                senderName: "Review Administrator",
                senderAvatar: null,
                status: "rejected",
                targetUrl: `/dashboard/news?tab=pending`,
                createdAt: art.created_at || art.date || new Date().toISOString(),
                read: readIds.has(strId) || readIds.has(String(art.id)),
                isArticle: true,
              });
            }
          }
        }
      }

      // 1. Convert base changelog releases into persistent system release notifications
      const baseReleases = Array.isArray(initialChangelogs) ? initialChangelogs : [];
      const changelogSystemNotifs = baseReleases.map((rel) => {
        const id = `sys-rel-${rel.version || rel.id}`;
        const isRead = readIds.has(id);
        const dateIso = rel.isoDate || (rel.date ? new Date(rel.date).toISOString() : new Date().toISOString());
        return {
          id,
          rawId: rel.version,
          category: "system",
          subType: "release",
          badge: rel.badge || (rel.isMajor ? "MAJOR RELEASE" : "SYSTEM UPDATE"),
          version: rel.version,
          title: `Release v${rel.version}: ${rel.title}`,
          description: rel.desc || rel.subtitle || "System release update",
          senderName: "Platform Dev Release",
          senderAvatar: null,
          senderEmail: null,
          senderPhone: null,
          status: "released",
          userId: null,
          createdAt: dateIso,
          read: isRead,
          isFeedback: false,
          isInbox: false,
          isArticle: false,
          steps: Array.isArray(rel.steps) ? rel.steps : [],
          targetUrl: "/dashboard",
        };
      });

      // 2. Load custom developer system announcements from localStorage
      let localDevNotifs = [];
      try {
        const stored = JSON.parse(localStorage.getItem(DEV_SYSTEM_NOTIFS_KEY) || "[]");
        if (Array.isArray(stored)) {
          localDevNotifs = stored.map((item) => ({
            ...item,
            read: readIds.has(String(item.id)),
          }));
        }
      } catch {}

      const allSystemNotifs = [...localDevNotifs, ...changelogSystemNotifs].filter(
        (n) => !dismissedIds.has(String(n.id))
      );

      const uniqueSystemMap = new Map();
      allSystemNotifs.forEach((item) => {
        if (!uniqueSystemMap.has(String(item.id))) {
          uniqueSystemMap.set(String(item.id), item);
        }
      });
      const validSystemNotifs = Array.from(uniqueSystemMap.values());

      setNotifications((prev) => {
        const itemMap = new Map();

        // 1. Add all freshly fetched database items (feedbacks, messages, articles)
        unifiedItems.forEach((item) => {
          if (!dismissedIds.has(String(item.id)) && !dismissedIds.has(String(item.rawId))) {
            itemMap.set(String(item.id), item);
          }
        });

        // 2. Add system notifications
        validSystemNotifs.forEach((item) => {
          if (!dismissedIds.has(String(item.id))) {
            itemMap.set(String(item.id), item);
          }
        });

        // 3. Preserve only temporary optimistic items from prev that weren't in unifiedItems yet
        prev.forEach((item) => {
          if (
            (item.isInbox || item.isFeedback) &&
            !String(item.id).startsWith("temp-") &&
            !String(item.rawId).startsWith("temp-")
          ) {
            // Real DB item that no longer exists in unifiedItems (it was deleted), do NOT resurrect it!
            return;
          }
          if (!dismissedIds.has(String(item.id)) && !dismissedIds.has(String(item.rawId))) {
            if (!itemMap.has(String(item.id))) {
              itemMap.set(String(item.id), item);
            }
          }
        });

        const combined = Array.from(itemMap.values());
        combined.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        return combined;
      });
    } catch (err) {
      console.error("[NotificationContext] Error fetching notifications:", err.message);
      setNotificationError(err.message);
    } finally {
      setIsLoadingNotifications(false);
    }
  }, [user?.id, isAdmin, isWriter, canReceiveNotifications]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // 3. Direct Synchronization with TanStack Query Cache (Single Source of Truth)
  useEffect(() => {
    const syncFromCache = () => {
      const readIds = new Set(getStoredIds(READ_NOTIFS_KEY));
      const dismissedIds = new Set(getStoredIds(DISMISSED_NOTIFS_KEY));

      const cachedMessages = queryClient.getQueryData(messagesKeys.list());
      const cachedFeedbacks = queryClient.getQueryData(feedbacksKeys.list());

      if (!Array.isArray(cachedMessages) && !Array.isArray(cachedFeedbacks)) return;

      setNotifications((prev) => {
        const itemMap = new Map();

        // 1. Preserve all non-inbox and non-feedback notifications (articles, system releases)
        prev.forEach((item) => {
          if (
            item.category !== "inbox" &&
            !item.isInbox &&
            item.category !== "feedback" &&
            !item.isFeedback
          ) {
            itemMap.set(String(item.id), item);
          }
        });

        // 2. Synchronize messages from TanStack Query cache
        if (Array.isArray(cachedMessages)) {
          cachedMessages.forEach((rawMsg) => {
            const strId = `msg-${rawMsg.id}`;
            if (dismissedIds.has(strId) || dismissedIds.has(String(rawMsg.id))) return;

            itemMap.set(strId, {
              id: strId,
              rawId: rawMsg.id,
              category: "inbox",
              subType: "contact",
              title:
                rawMsg.subject ||
                (rawMsg.message
                  ? rawMsg.message.length > 50
                    ? rawMsg.message.slice(0, 50) + "…"
                    : rawMsg.message
                  : `Inquiry from ${rawMsg.name || "Visitor"}`),
              description: rawMsg.message || "",
              senderName: rawMsg.name || "Website Visitor",
              senderAvatar: null,
              senderEmail: rawMsg.email || null,
              senderPhone: rawMsg.phone || null,
              status: rawMsg.status || "received",
              userId: null,
              createdAt: rawMsg.created_at || new Date().toISOString(),
              read: readIds.has(strId) || readIds.has(String(rawMsg.id)),
              isFeedback: false,
              isInbox: true,
            });
          });
        }

        // 3. Synchronize feedbacks from TanStack Query cache
        if (Array.isArray(cachedFeedbacks)) {
          cachedFeedbacks.forEach((rawFb) => {
            const strId = `fb-${rawFb.id}`;
            if (dismissedIds.has(strId) || dismissedIds.has(String(rawFb.id))) return;

            itemMap.set(strId, {
              id: strId,
              rawId: rawFb.id,
              category: "feedback",
              subType: rawFb.type || "other",
              title: rawFb.title || "Feedback Report",
              description: rawFb.description || "",
              senderName: rawFb.users?.full_name || "System Admin",
              senderAvatar: rawFb.users?.avatar_url || null,
              senderEmail: null,
              senderPhone: null,
              status: rawFb.status || "open",
              userId: rawFb.user_id || null,
              createdAt: rawFb.created_at || new Date().toISOString(),
              read: readIds.has(strId) || readIds.has(String(rawFb.id)),
              isFeedback: true,
              isInbox: false,
            });
          });
        }

        const combined = Array.from(itemMap.values());
        combined.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        return combined;
      });
    };

    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event?.type === "updated" || event?.type === "added") {
        const queryKey = event.query.queryKey;
        if (
          (queryKey[0] === "messages" && queryKey[1] === "list") ||
          (queryKey[0] === "feedbacks" && queryKey[1] === "list")
        ) {
          syncFromCache();
        }
      }
    });

    syncFromCache();

    return unsubscribe;
  }, []);

  // 4. Realtime Postgres Subscriptions for Feedbacks, Messages & News
  useEffect(() => {
    const currentUserId = user?.id;
    if (!currentUserId || !canReceiveNotifications || !supabase || typeof supabase.channel !== "function") return;

    const channel = supabase
      .channel(`admin_notifications_${currentUserId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "feedbacks",
        },
        (payload) => {
          if (payload.eventType === "DELETE") {
            const rawId = payload.old?.id ?? payload.new?.id;
            if (rawId) {
              const strRawId = String(rawId);
              setNotifications((prev) =>
                prev.filter(
                  (n) =>
                    String(n.rawId) !== strRawId &&
                    String(n.id) !== `fb-${strRawId}` &&
                    String(n.id) !== strRawId
                )
              );
            }
            queryClient.invalidateQueries({ queryKey: feedbacksKeys.lists() });
            return;
          }

          if (payload.eventType === "UPDATE") {
            const updated = payload.new;
            setNotifications((prev) =>
              prev.map((n) =>
                n.rawId === updated.id || n.id === `fb-${updated.id}`
                  ? { ...n, status: updated.status }
                  : n
              )
            );
            queryClient.invalidateQueries({ queryKey: feedbacksKeys.lists() });
            fetchNotifications();
            return;
          }

          if (payload.eventType === "INSERT") {
            const rawFb = payload.new;
            if (!rawFb) return;

            // Invalidate and refetch TanStack Query cache so feedback lists stay fresh
            queryClient.invalidateQueries({ queryKey: feedbacksKeys.lists() });
            queryClient.refetchQueries({ queryKey: feedbacksKeys.lists() });
            fetchNotifications();

            const strId = `fb-${rawFb.id}`;
            const dismissedIds = new Set(getStoredIds(DISMISSED_NOTIFS_KEY));
            if (!dismissedIds.has(strId)) {
              const readIds = new Set(getStoredIds(READ_NOTIFS_KEY));
              const newItem = {
                id: strId,
                rawId: rawFb.id,
                category: "feedback",
                subType: rawFb.type || "other",
                title: rawFb.title || "New Feedback",
                description: rawFb.description || "",
                senderName: "Admin User",
                senderAvatar: null,
                senderEmail: null,
                senderPhone: null,
                status: rawFb.status || "open",
                userId: rawFb.user_id || null,
                createdAt: rawFb.created_at || new Date().toISOString(),
                read: readIds.has(strId),
                isFeedback: true,
                isInbox: false,
              };

              setNotifications((prev) => {
                if (prev.some((n) => n.id === strId)) return prev;
                return [newItem, ...prev];
              });
            }

            // Ignore self-submitted feedback for audio chime & toast alert
            if (rawFb.user_id === currentUserId) return;

            // Audio Alert
            playNotificationSound();

            const isBlocked = localStorage.getItem("icmu_notifications_blocked") === "true";
            if (!isBlocked) {
              const subType = rawFb.type?.toLowerCase();
              let icon = <AlertCircle size={18} className="text-theme-accent" />;
              let badgeColor = "bg-theme-accent/20 text-theme-accent border-theme-accent/30";

              if (subType === "bug") {
                icon = <Bug size={18} className="text-red-400" />;
                badgeColor = "bg-red-500/20 text-red-400 border-red-500/30";
              } else if (subType === "known_issue") {
                icon = <AlertTriangle size={18} className="text-amber-400" />;
                badgeColor = "bg-amber-500/20 text-amber-400 border-amber-500/30";
              } else if (subType === "feature" || subType === "feature_request") {
                icon = <Sparkles size={18} className="text-purple-400" />;
                badgeColor = "bg-purple-500/20 text-purple-400 border-purple-500/30";
              }

              toast.custom(
                (t) => (
                  <div
                    onClick={() => toast.dismiss(t)}
                    className="flex flex-row items-start gap-3 p-4 bg-[var(--admin-card-bg,#1c1c1e)] rounded-2xl shadow-2xl min-w-[320px] max-w-sm border border-[var(--admin-border,rgba(255,255,255,0.1))] font-sans relative cursor-pointer hover:brightness-110 transition-all">
                    <div className="relative shrink-0 mt-0.5">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${badgeColor}`}>
                        {icon}
                      </div>
                      <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-theme-accent opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-theme-accent border-2 border-[var(--admin-card-bg)] items-center justify-center shadow-[0_0_6px_rgba(var(--accent-rgb,75,196,51),0.8)]">
                          <AlertCircle size={10} className="text-[var(--admin-bg,#000)]" />
                        </span>
                      </span>
                    </div>
                    <div className="flex flex-col flex-1 gap-1 pr-4 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-bold text-[var(--admin-text-primary,#fff)] tracking-tight">
                          New In-App Feedback
                        </span>
                        <span className="text-[10px] text-[var(--admin-text-secondary,#a1a1aa)] opacity-70">
                          Just now
                        </span>
                      </div>
                      <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30 w-max">
                        {rawFb.type || "Feedback"}
                      </span>
                      <span className="text-[12px] font-semibold text-[var(--admin-text-primary,#fff)] leading-tight truncate">
                        {rawFb.title}
                      </span>
                      {rawFb.description && (
                        <span className="text-[11px] text-[var(--admin-text-secondary,#a1a1aa)] line-clamp-2 leading-relaxed mt-0.5">
                          {rawFb.description}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toast.dismiss(t);
                      }}
                      className="text-[var(--admin-text-secondary,#a1a1aa)] opacity-40 hover:opacity-100 transition-opacity p-1 absolute top-3 right-3">
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
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          if (payload.eventType === "DELETE") {
            const rawId = payload.old?.id ?? payload.new?.id;
            if (rawId) {
              const strRawId = String(rawId);
              setNotifications((prev) =>
                prev.filter(
                  (n) =>
                    String(n.rawId) !== strRawId &&
                    String(n.id) !== `msg-${strRawId}` &&
                    String(n.id) !== strRawId
                )
              );
            }
            queryClient.invalidateQueries({ queryKey: messagesKeys.lists() });
            return;
          }

          if (payload.eventType === "UPDATE") {
            queryClient.invalidateQueries({ queryKey: messagesKeys.lists() });
            fetchNotifications();
            return;
          }

          if (payload.eventType === "INSERT") {
            const rawMsg = payload.new;
            if (!rawMsg) return;

            // Invalidate and refetch TanStack Query cache so inbox updates immediately
            queryClient.invalidateQueries({ queryKey: messagesKeys.lists() });
            queryClient.refetchQueries({ queryKey: messagesKeys.lists() });
            fetchNotifications();

            const strId = `msg-${rawMsg.id}`;
            const dismissedIds = new Set(getStoredIds(DISMISSED_NOTIFS_KEY));
            if (dismissedIds.has(strId)) return;

            const readIds = new Set(getStoredIds(READ_NOTIFS_KEY));

            const newItem = {
              id: strId,
              rawId: rawMsg.id,
              category: "inbox",
              subType: "contact",
              title:
                rawMsg.subject ||
                (rawMsg.message
                  ? rawMsg.message.length > 50
                    ? rawMsg.message.slice(0, 50) + "…"
                    : rawMsg.message
                  : `Inquiry from ${rawMsg.name || "Visitor"}`),
              description: rawMsg.message || "",
              senderName: rawMsg.name || "Website Visitor",
              senderAvatar: null,
              senderEmail: rawMsg.email || null,
              senderPhone: rawMsg.phone || null,
              status: rawMsg.status || "received",
              userId: null,
              createdAt: rawMsg.created_at || new Date().toISOString(),
              read: readIds.has(strId),
              isFeedback: false,
              isInbox: true,
            };

            setNotifications((prev) => {
              if (prev.some((n) => n.id === strId)) return prev;
              return [newItem, ...prev];
            });

            // Audio Alert
            playNotificationSound();

            const isBlocked = localStorage.getItem("icmu_notifications_blocked") === "true";
            if (!isBlocked) {
              toast.custom(
                (t) => (
                  <div
                    onClick={() => toast.dismiss(t)}
                    className="flex flex-row items-start gap-3 p-4 bg-[var(--admin-card-bg,#1c1c1e)] rounded-2xl shadow-2xl min-w-[320px] max-w-sm border border-[var(--admin-border,rgba(255,255,255,0.1))] font-sans relative cursor-pointer hover:brightness-110 transition-all">
                    <div className="relative shrink-0 mt-0.5">
                      <div className="w-10 h-10 rounded-2xl bg-theme-accent/20 border border-theme-accent/30 flex items-center justify-center">
                        <Mail size={18} className="text-theme-accent" />
                      </div>
                      <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-theme-accent opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-theme-accent border-2 border-[var(--admin-card-bg)] items-center justify-center shadow-[0_0_6px_rgba(var(--accent-rgb,75,196,51),0.8)]">
                          <MessageCircle size={10} className="text-[var(--admin-bg,#000)]" />
                        </span>
                      </span>
                    </div>
                    <div className="flex flex-col flex-1 gap-1 pr-4 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-bold text-[var(--admin-text-primary,#fff)] tracking-tight">
                          New Website Inquiry
                        </span>
                        <span className="text-[10px] text-[var(--admin-text-secondary,#a1a1aa)] opacity-70">
                          Just now
                        </span>
                      </div>
                      <span className="text-[12px] font-semibold text-theme-accent truncate">
                        {rawMsg.name || "Visitor"} {rawMsg.email ? `(${rawMsg.email})` : ""}
                      </span>
                      <span className="text-[12px] font-medium text-[var(--admin-text-primary,#fff)] leading-tight truncate">
                        {rawMsg.subject || (rawMsg.message ? (rawMsg.message.length > 50 ? rawMsg.message.slice(0, 50) + "…" : rawMsg.message) : "Public Contact Submission")}
                      </span>
                      {rawMsg.message && (
                        <span className="text-[11px] text-[var(--admin-text-secondary,#a1a1aa)] line-clamp-2 leading-relaxed mt-0.5">
                          {rawMsg.message}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toast.dismiss(t);
                      }}
                      className="text-[var(--admin-text-secondary,#a1a1aa)] opacity-40 hover:opacity-100 transition-opacity p-1 absolute top-3 right-3">
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
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "news",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const art = payload.new;
            if (!art) return;
            if (isAdmin && art.status === "pending") {
              playNotificationSound();
              toast.info(`New Article Submitted: "${art.title}"`);
              if (Notification.permission === "granted") {
                new Notification("Article Submitted for Review", {
                  body: `"${art.title}" submitted by ${art.author || "Writer"}.`,
                });
              }
            }
          } else if (payload.eventType === "UPDATE") {
            const art = payload.new;
            if (!art) return;
            if (art.submitted_by === currentUserId) {
              if (art.needs_attention && !payload.old?.needs_attention) {
                playNotificationSound();
                toast.warning(`Revisions requested for "${art.title}"`);
                if (Notification.permission === "granted") {
                  new Notification("Article Needs Attention", {
                    body: art.review_notes || "Editor requested changes.",
                  });
                }
              } else if (art.status === "published" && payload.old?.status !== "published") {
                playNotificationSound();
                toast.success(`"${art.title}" was approved and published!`);
                if (Notification.permission === "granted") {
                  new Notification("Article Approved", {
                    body: `"${art.title}" is live!`,
                  });
                }
              } else if (art.status === "rejected" && payload.old?.status !== "rejected") {
                playNotificationSound();
                toast.error(`"${art.title}" was declined`);
              }
            } else if (isAdmin && art.status === "pending" && payload.old?.status !== "pending") {
              playNotificationSound();
              toast.info(`Article Resubmitted: "${art.title}"`);
            }
          }
          queryClient.invalidateQueries({ queryKey: newsKeys.lists() });
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, isAdmin, isWriter, canReceiveNotifications, fetchNotifications]);

  // 4. Multi-Tab Synchronization via Window Storage Event
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (!e.key || e.key === READ_NOTIFS_KEY || e.key === DISMISSED_NOTIFS_KEY) {
        const readIds = new Set(getStoredIds(READ_NOTIFS_KEY));
        const dismissedIds = new Set(getStoredIds(DISMISSED_NOTIFS_KEY));

        setNotifications((prev) =>
          prev
            .filter((n) => !dismissedIds.has(String(n.id)) && !dismissedIds.has(String(n.rawId)))
            .map((n) => ({
              ...n,
              read: readIds.has(String(n.id)) || readIds.has(String(n.rawId)),
            }))
        );
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Unread Count Calculations
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const unreadFeedbacksCount = useMemo(
    () =>
      notifications.filter(
        (n) => (n.isFeedback || n.category === "feedback") && !n.read
      ).length,
    [notifications]
  );

  const unreadMessagesCount = useMemo(
    () =>
      notifications.filter(
        (n) => (n.isInbox || n.category === "inbox") && !n.read
      ).length,
    [notifications]
  );

  // 5. Action Handlers
  const markAsRead = useCallback((id) => {
    const strId = String(id);
    const cleanId = strId
      .replace(/^fb-/, "")
      .replace(/^msg-/, "")
      .replace(/^sys-/, "")
      .replace(/^art-attn-/, "")
      .replace(/^art-review-/, "")
      .replace(/^art-approved-/, "")
      .replace(/^art-rejected-/, "");

    setNotifications((prev) =>
      prev.map((n) =>
        String(n.id) === strId ||
        String(n.rawId) === cleanId ||
        n.id === `fb-${cleanId}` ||
        n.id === `msg-${cleanId}` ||
        n.id === strId
          ? { ...n, read: true }
          : n
      )
    );

    const currentRead = getStoredIds(READ_NOTIFS_KEY);
    const toAdd = [strId, cleanId, `fb-${cleanId}`, `msg-${cleanId}`];
    const updated = Array.from(new Set([...currentRead, ...toAdd]));
    saveStoredIds(READ_NOTIFS_KEY, updated);
    window.dispatchEvent(new Event("storage"));
  }, []);

  const markAsUnread = useCallback((id) => {
    const strId = String(id);
    const cleanId = strId
      .replace(/^fb-/, "")
      .replace(/^msg-/, "")
      .replace(/^sys-/, "")
      .replace(/^art-attn-/, "")
      .replace(/^art-review-/, "")
      .replace(/^art-approved-/, "")
      .replace(/^art-rejected-/, "");

    setNotifications((prev) =>
      prev.map((n) =>
        String(n.id) === strId ||
        String(n.rawId) === cleanId ||
        n.id === `fb-${cleanId}` ||
        n.id === `msg-${cleanId}`
          ? { ...n, read: false }
          : n
      )
    );

    const currentRead = getStoredIds(READ_NOTIFS_KEY);
    const toRemove = new Set([strId, cleanId, `fb-${cleanId}`, `msg-${cleanId}`]);
    const updated = currentRead.filter((savedId) => !toRemove.has(savedId));
    saveStoredIds(READ_NOTIFS_KEY, updated);
    window.dispatchEvent(new Event("storage"));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      const allIds = updated.flatMap((n) => [
        String(n.id),
        String(n.rawId || ""),
        `fb-${n.rawId}`,
        `msg-${n.rawId}`,
      ]).filter(Boolean);
      const currentRead = getStoredIds(READ_NOTIFS_KEY);
      const merged = Array.from(new Set([...currentRead, ...allIds]));
      saveStoredIds(READ_NOTIFS_KEY, merged);
      window.dispatchEvent(new Event("storage"));
      return updated;
    });
  }, []);

  const markAllFeedbacksAsRead = useCallback(() => {
    setNotifications((prev) => {
      const updated = prev.map((n) =>
        n.isFeedback || n.category === "feedback" ? { ...n, read: true } : n
      );
      const fbIds = updated
        .filter((n) => n.isFeedback || n.category === "feedback")
        .flatMap((n) => [
          String(n.id),
          String(n.rawId || ""),
          `fb-${n.rawId}`,
          `fb-${n.id}`,
        ])
        .filter(Boolean);
      const currentRead = getStoredIds(READ_NOTIFS_KEY);
      saveStoredIds(READ_NOTIFS_KEY, Array.from(new Set([...currentRead, ...fbIds])));
      window.dispatchEvent(new Event("storage"));
      return updated;
    });
  }, []);

  const markAllMessagesAsRead = useCallback(() => {
    setNotifications((prev) => {
      const updated = prev.map((n) =>
        n.isInbox || n.category === "inbox" ? { ...n, read: true } : n
      );
      const msgIds = updated
        .filter((n) => n.isInbox || n.category === "inbox")
        .flatMap((n) => [
          String(n.id),
          String(n.rawId || ""),
          `msg-${n.rawId}`,
          `msg-${n.id}`,
        ])
        .filter(Boolean);
      const currentRead = getStoredIds(READ_NOTIFS_KEY);
      saveStoredIds(READ_NOTIFS_KEY, Array.from(new Set([...currentRead, ...msgIds])));
      window.dispatchEvent(new Event("storage"));
      return updated;
    });
  }, []);



  const dismissNotification = useCallback((id) => {
    const strId = String(id);
    setNotifications((prev) => prev.filter((n) => String(n.id) !== strId && String(n.rawId) !== strId));

    const currentDismissed = getStoredIds(DISMISSED_NOTIFS_KEY);
    if (!currentDismissed.includes(strId)) {
      saveStoredIds(DISMISSED_NOTIFS_KEY, [...currentDismissed, strId]);
    }
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications((prev) => {
      const currentDismissed = getStoredIds(DISMISSED_NOTIFS_KEY);
      const allIds = prev.map((n) => String(n.id));
      saveStoredIds(DISMISSED_NOTIFS_KEY, Array.from(new Set([...currentDismissed, ...allIds])));
      return [];
    });
  }, []);

  const sendTestNotification = useCallback((customTitle, customMessage) => {
    playNotificationSound();

    const title = customTitle || "Notification System Test";
    const description =
      customMessage || "Audio chime and real-time alerts verified successfully.";
    const testItem = {
      id: `sys-${Date.now()}`,
      rawId: Date.now(),
      category: "system",
      subType: "diagnostic",
      title,
      description,
      senderName: "Diagnostic Engine",
      senderAvatar: null,
      senderEmail: null,
      senderPhone: null,
      status: "delivered",
      userId: null,
      createdAt: new Date().toISOString(),
      read: false,
      isFeedback: false,
      isInbox: false,
    };

    setNotifications((prev) => [testItem, ...prev]);

    toast.success(title, {
      description,
      icon: <Radio size={16} className="text-theme-accent" />,
    });
  }, []);

  const triggerSystemReleaseNotification = useCallback((release) => {
    if (!release) return;
    playNotificationSound();

    const version = release.version ? String(release.version).replace(/^v/i, "") : "Update";
    const title = `Release v${version}: ${release.title || "Platform Update"}`;
    const description = release.desc || release.subtitle || "New release update published on ICMU platform.";
    const id = `sys-rel-${version}`;

    const newNotif = {
      id,
      rawId: version,
      category: "system",
      subType: "release",
      badge: release.badge || (release.isMajor ? "MAJOR RELEASE" : "FEATURE RELEASE"),
      version,
      title,
      description,
      senderName: "Platform Dev Release",
      senderAvatar: null,
      senderEmail: null,
      senderPhone: null,
      status: "released",
      userId: null,
      createdAt: new Date().toISOString(),
      read: false,
      isFeedback: false,
      isInbox: false,
      isArticle: false,
      steps: Array.isArray(release.steps) ? release.steps : [],
      targetUrl: "/dashboard",
    };

    try {
      const stored = JSON.parse(localStorage.getItem(DEV_SYSTEM_NOTIFS_KEY) || "[]");
      const updated = [newNotif, ...stored.filter((item) => String(item.id) !== id)].slice(0, 30);
      localStorage.setItem(DEV_SYSTEM_NOTIFS_KEY, JSON.stringify(updated));
    } catch {}

    setNotifications((prev) => [newNotif, ...prev.filter((n) => String(n.id) !== id)]);

    toast.success(`Platform Update v${version}`, {
      description: release.title || "New update published by developers.",
      icon: <Sparkles size={16} className="text-theme-accent" />,
    });
  }, []);

  const triggerSystemDevUpdate = useCallback((title, description, badge = "SYSTEM UPDATE") => {
    if (!title || !title.trim()) return;
    playNotificationSound();

    const id = `sys-dev-${Date.now()}`;
    const newNotif = {
      id,
      rawId: Date.now(),
      category: "system",
      subType: "dev_update",
      badge: badge || "SYSTEM UPDATE",
      version: null,
      title: title.trim(),
      description: description ? description.trim() : "Developer system announcement.",
      senderName: "Dev System Notice",
      senderAvatar: null,
      senderEmail: null,
      senderPhone: null,
      status: "broadcast",
      userId: null,
      createdAt: new Date().toISOString(),
      read: false,
      isFeedback: false,
      isInbox: false,
      isArticle: false,
      steps: [],
      targetUrl: "/dashboard",
    };

    try {
      const stored = JSON.parse(localStorage.getItem(DEV_SYSTEM_NOTIFS_KEY) || "[]");
      const updated = [newNotif, ...stored].slice(0, 30);
      localStorage.setItem(DEV_SYSTEM_NOTIFS_KEY, JSON.stringify(updated));
    } catch {}

    setNotifications((prev) => [newNotif, ...prev.filter((n) => String(n.id) !== id)]);

    toast.info(title, {
      description,
      icon: <Radio size={16} className="text-theme-accent" />,
    });
  }, []);

  const removeSystemReleaseNotification = useCallback((version) => {
    if (!version) return;
    const targetVer = String(version).replace(/^v/i, "");
    const targetSysId = `sys-rel-${targetVer}`;

    try {
      const stored = JSON.parse(localStorage.getItem(DEV_SYSTEM_NOTIFS_KEY) || "[]");
      const updated = stored.filter(
        (item) => item.version !== targetVer && String(item.id) !== targetSysId
      );
      localStorage.setItem(DEV_SYSTEM_NOTIFS_KEY, JSON.stringify(updated));
    } catch {}

    setNotifications((prev) =>
      prev.filter((n) => n.version !== targetVer && String(n.id) !== targetSysId)
    );
  }, []);

  const contextValue = useMemo(
    () => ({
      notifications,
      unreadCount,
      unreadFeedbacksCount,
      unreadMessagesCount,
      permissionGranted,
      isLoadingFeedbacks: isLoadingNotifications,
      isLoadingNotifications,
      feedbackError: notificationError,
      notificationError,
      markAsRead,
      markAsUnread,
      markAllAsRead,
      markAllFeedbacksAsRead,
      markAllMessagesAsRead,
      dismissNotification,
      removeNotification: dismissNotification, // backward compat
      clearNotifications,
      clearAllNotifications: clearNotifications,
      sendTestNotification,
      triggerSystemReleaseNotification,
      triggerSystemDevUpdate,
      removeSystemReleaseNotification,
      playNotificationSound,
      refetchFeedbacks: fetchNotifications,
      refetchNotifications: fetchNotifications,
    }),
    [
      notifications,
      unreadCount,
      unreadFeedbacksCount,
      unreadMessagesCount,
      permissionGranted,
      isLoadingNotifications,
      notificationError,
      markAsRead,
      markAsUnread,
      markAllAsRead,
      markAllFeedbacksAsRead,
      markAllMessagesAsRead,
      dismissNotification,
      clearNotifications,
      sendTestNotification,
      triggerSystemReleaseNotification,
      triggerSystemDevUpdate,
      removeSystemReleaseNotification,
      fetchNotifications,
    ]
  );

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;


