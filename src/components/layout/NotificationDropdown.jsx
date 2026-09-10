import React, { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { Link, useParams } from "react-router-dom";
import {
  Bell,
  CheckCheck,
  Bug,
  Sparkles,
  AlertTriangle,
  Radio,
  Info,
  ExternalLink,
  Mail,
  Inbox,
  X,
  Trash2,
  ChevronRight,
  ChevronDown,
  Clock,
  AlertCircle,
  FileText,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotification } from "../../context/NotificationContext";
import { useTheme } from "../../context/ThemeContext";
import { UserAvatar } from "../ui/avatar";

const formatRelativeTime = (timestamp) => {
  if (!timestamp) return "now";
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return "recently";

  const diffSeconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSeconds < 45) return "now";
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

const getDateGroup = (dateString) => {
  if (!dateString) return "EARLIER";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "EARLIER";

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (targetDate.getTime() >= today.getTime()) {
    return "TODAY";
  } else if (targetDate.getTime() >= yesterday.getTime()) {
    return "YESTERDAY";
  } else {
    return "EARLIER";
  }
};

const getCategoryDetails = (item) => {
  if (item.category === "inbox") {
    return {
      label: "INBOX",
      actionText: "inquiry",
      icon: <Mail size={11} className="text-theme-accent" />,
      colorClass: "text-theme-accent bg-theme-accent/10 border-theme-accent/20",
    };
  }

  if (item.category === "feedback") {
    const sub = item.subType?.toLowerCase();
    if (sub === "bug") {
      return {
        label: "BUG",
        actionText: "bug report",
        icon: <Bug size={11} className="text-red-400" />,
        colorClass: "text-red-400 bg-red-500/10 border-red-500/20",
      };
    }
    if (sub === "known_issue") {
      return {
        label: "ISSUE",
        actionText: "known issue",
        icon: <AlertTriangle size={11} className="text-amber-400" />,
        colorClass: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      };
    }
    if (sub === "feature" || sub === "feature_request") {
      return {
        label: "FEATURE",
        actionText: "feature request",
        icon: <Sparkles size={11} className="text-purple-400" />,
        colorClass: "text-purple-400 bg-purple-500/10 border-purple-500/20",
      };
    }
    return {
      label: "FEEDBACK",
      actionText: "feedback",
      icon: <Info size={11} className="text-theme-accent" />,
      colorClass: "text-theme-accent bg-theme-accent/10 border-theme-accent/20",
    };
  }

  if (item.category === "article") {
    const sub = item.subType?.toLowerCase();
    if (sub === "needs_attention") {
      return {
        label: "ATTENTION",
        actionText: "revisions requested",
        icon: <AlertCircle size={11} className="text-orange-400" />,
        colorClass: "text-orange-400 bg-orange-500/10 border-orange-500/20",
      };
    }
    if (sub === "pending_review") {
      return {
        label: "REVIEW",
        actionText: "review queue",
        icon: <Clock size={11} className="text-blue-400" />,
        colorClass: "text-blue-400 bg-blue-500/10 border-blue-500/20",
      };
    }
    if (sub === "approved") {
      return {
        label: "PUBLISHED",
        actionText: "article approved",
        icon: <CheckCheck size={11} className="text-emerald-400" />,
        colorClass: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      };
    }
    if (sub === "rejected") {
      return {
        label: "DECLINED",
        actionText: "article declined",
        icon: <X size={11} className="text-rose-400" />,
        colorClass: "text-rose-400 bg-rose-500/10 border-rose-500/20",
      };
    }
    return {
      label: "ARTICLE",
      actionText: "article update",
      icon: <FileText size={11} className="text-theme-accent" />,
      colorClass: "text-theme-accent bg-theme-accent/10 border-theme-accent/20",
    };
  }

  const isRelease = item.subType === "release" || Boolean(item.version);
  const badgeText = item.badge || (isRelease ? "RELEASE" : "SYSTEM");

  let colorClass = "text-theme-accent bg-theme-accent/10 border-theme-accent/20";
  if (badgeText.includes("MAJOR")) {
    colorClass = "text-amber-400 bg-amber-500/10 border-amber-500/20";
  } else if (badgeText.includes("BUG")) {
    colorClass = "text-blue-400 bg-blue-500/10 border-blue-500/20";
  } else if (badgeText.includes("SECURITY")) {
    colorClass = "text-rose-400 bg-rose-500/10 border-rose-500/20";
  }

  return {
    label: badgeText,
    actionText: isRelease ? "platform release" : "system update",
    icon: isRelease ? <Sparkles size={11} className="text-theme-accent" /> : <Radio size={11} className="text-theme-accent" />,
    colorClass,
  };
};

const getInitials = (name) => {
  if (!name) return "IC";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const NotificationDropdown = ({ isCollapsed = false, isMobile = false }) => {
  const { adminPath } = useParams();
  const basePath = adminPath ? `/${adminPath}` : "";
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'inbox' | 'feedbacks' | 'system'
  const [feedbackSubFilter, setFeedbackSubFilter] = useState("all"); // 'all' | 'bug' | 'known_issue' | 'feature' | 'other'
  const [expandedId, setExpandedId] = useState(null); // Collapsed by default
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);
  const popoverRef = useRef(null);
  const [notchOffset, setNotchOffset] = useState(null);
  const { theme } = useTheme();

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    clearAllNotifications,
  } = useNotification();

  // Close on outside click (supporting touch and desktop mousedown, plus portal containment)
  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedTrigger = triggerRef.current && triggerRef.current.contains(event.target);
      const clickedDropdown = dropdownRef.current && dropdownRef.current.contains(event.target);
      const clickedPopover = popoverRef.current && popoverRef.current.contains(event.target);

      if (!clickedTrigger && !clickedDropdown && !clickedPopover) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  // Compute exact notch pointer alignment directly under trigger button on mobile
  useEffect(() => {
    if (!isOpen || !isMobile) return;

    const updatePosition = () => {
      if (!triggerRef.current || !popoverRef.current) return;
      const btnRect = triggerRef.current.getBoundingClientRect();
      const popRect = popoverRef.current.getBoundingClientRect();
      const btnCenter = btnRect.left + btnRect.width / 2;
      const offset = btnCenter - popRect.left - 7; // 7px is half of 14px (w-3.5) notch
      const safeOffset = Math.max(16, Math.min(popRect.width - 24, offset));
      setNotchOffset(safeOffset);
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, { passive: true });
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
    };
  }, [isOpen, isMobile]);

  // Category counts
  const inboxCount = useMemo(
    () => notifications.filter((n) => n.category === "inbox").length,
    [notifications]
  );
  const articleCount = useMemo(
    () => notifications.filter((n) => n.category === "article").length,
    [notifications]
  );
  const feedbacksCount = useMemo(
    () => notifications.filter((n) => n.category === "feedback").length,
    [notifications]
  );
  const systemCount = useMemo(
    () => notifications.filter((n) => n.category === "system").length,
    [notifications]
  );

  // Filtered items
  const filteredNotifications = useMemo(() => {
    let items = notifications;

    if (activeTab === "inbox") {
      items = items.filter((n) => n.category === "inbox");
    } else if (activeTab === "article") {
      items = items.filter((n) => n.category === "article");
    } else if (activeTab === "feedbacks") {
      items = items.filter((n) => n.category === "feedback");
      if (feedbackSubFilter !== "all") {
        if (feedbackSubFilter === "feature") {
          items = items.filter(
            (n) => n.subType === "feature" || n.subType === "feature_request"
          );
        } else {
          items = items.filter((n) => n.subType === feedbackSubFilter);
        }
      }
    } else if (activeTab === "system") {
      items = items.filter((n) => n.category === "system");
    }

    return items;
  }, [notifications, activeTab, feedbackSubFilter]);

  // Group filtered items by date: TODAY, YESTERDAY, EARLIER
  const groupedNotifications = useMemo(() => {
    const groups = {
      TODAY: [],
      YESTERDAY: [],
      EARLIER: [],
    };

    filteredNotifications.forEach((item) => {
      const groupKey = getDateGroup(item.createdAt);
      if (groups[groupKey]) {
        groups[groupKey].push(item);
      } else {
        groups.EARLIER.push(item);
      }
    });

    return groups;
  }, [filteredNotifications]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* ── Trigger Button ── */}
      {isMobile ? (
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-8 h-8 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-[var(--admin-text-primary,#fff)] opacity-85 hover:opacity-100 hover:text-theme-accent hover:border-theme-accent/30 transition-all cursor-pointer shadow-sm active:scale-95"
          title="Notifications & Activity Log">
          <Bell size={15} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-theme-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-theme-accent text-[8px] font-bold text-[var(--admin-bg,#000)] items-center justify-center border-2 border-[var(--admin-card-bg,#121216)] shadow-[0_0_6px_rgba(var(--accent-rgb,75,196,51),0.8)]">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            </span>
          )}
        </button>
      ) : isCollapsed ? (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-9 h-9 mx-auto flex items-center justify-center rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-theme-accent/30 text-[var(--admin-text-primary,#fff)] opacity-70 hover:opacity-100 transition-all relative group cursor-pointer shadow-sm active:scale-95"
          title="Notifications & Activity Log">
          <Bell
            size={16}
            className="text-[var(--admin-text-primary,#fff)] group-hover:text-theme-accent transition-colors"
          />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-theme-accent shadow-[0_0_8px_rgba(var(--accent-rgb,75,196,51),0.9)] animate-pulse" />
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] hover:border-theme-accent/30 text-[var(--admin-text-primary,#fff)] transition-all group cursor-pointer shadow-sm active:scale-[0.99]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative w-7 h-7 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-[var(--admin-text-primary,#fff)] group-hover:text-theme-accent transition-colors shrink-0">
              <Bell size={14} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-theme-accent shadow-[0_0_6px_rgba(var(--accent-rgb,75,196,51),0.9)] animate-pulse" />
              )}
            </div>
            <div className="flex flex-col items-start min-w-0">
              <span className="text-[11.5px] font-semibold tracking-wide text-[var(--admin-text-primary,#fff)] truncate">
                Notifications
              </span>
              <span className="text-[9.5px] text-[var(--admin-text-secondary,#a1a1aa)] opacity-70">
                {unreadCount > 0
                  ? `${unreadCount} unread`
                  : `${notifications.length} events`}
              </span>
            </div>
          </div>

          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-2xl text-[9px] font-bold bg-theme-accent/15 text-theme-accent border border-theme-accent/30 shadow-sm">
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {/* ── Dropdown Popover (Spacious, Modern & Perfectly Aligned) ── */}
      {isOpen && (() => {
        const content = (
          <>
            {/* Arrow Notch / Speech Bubble Pointer */}
            {isMobile ? (
              <div
                className="absolute -top-1.5 w-3.5 h-3.5 rotate-45 bg-[var(--admin-card-bg,#121216)] border-t border-l border-[var(--admin-border,rgba(255,255,255,0.08))] pointer-events-none z-20"
                style={
                  notchOffset !== null
                    ? { left: `${notchOffset}px` }
                    : { right: "56px" }
                }
              />
            ) : (
              <div className="absolute -left-1.5 bottom-4 w-3.5 h-3.5 rotate-45 bg-[var(--admin-card-bg,#121216)] border-b border-l border-[var(--admin-border,rgba(255,255,255,0.08))] pointer-events-none z-20" />
            )}

            {/* Popover Inner Card */}
            <div
              className={`relative z-10 w-full flex flex-col rounded-3xl border border-[var(--admin-border,rgba(255,255,255,0.08))] bg-[var(--admin-card-bg,#121216)] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.9)] backdrop-blur-2xl overflow-hidden ${
                isMobile
                  ? "max-h-[min(520px,calc(100dvh-140px))]"
                  : "max-h-[min(540px,calc(100dvh-100px))]"
              }`}>

          {/* ── Spacious Header ── */}
          <div className="px-4 py-3 border-b border-[var(--admin-border,rgba(255,255,255,0.06))] flex items-center justify-between bg-white/[0.02] shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-theme-accent/15 border border-theme-accent/25 flex items-center justify-center">
                <Bell size={14} className="text-theme-accent" />
              </div>
              <span className="text-sm font-bold text-[var(--admin-text-primary,#fff)] tracking-tight">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-theme-accent/20 text-theme-accent border border-theme-accent/30 shadow-xs">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-[var(--admin-text-secondary,#a1a1aa)]">
              {/* Mark all as read */}
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="p-1.5 hover:text-theme-accent hover:bg-white/[0.08] rounded-xl transition-colors cursor-pointer"
                  title="Mark all as read">
                  <CheckCheck size={14} />
                </button>
              )}

              {/* Clear all */}
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={clearAllNotifications}
                  className="p-1.5 hover:text-red-400 hover:bg-white/[0.08] rounded-xl transition-colors cursor-pointer"
                  title="Clear all notifications">
                  <Trash2 size={14} />
                </button>
              )}

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:text-[var(--admin-text-primary,#fff)] hover:bg-white/[0.08] rounded-xl transition-colors cursor-pointer ml-1"
                title="Close">
                <X size={15} />
              </button>
            </div>
          </div>

          {/* ── Category Tabs (Less Compact) ── */}
          <div className="px-3 py-2 border-b border-[var(--admin-border,rgba(255,255,255,0.04))] flex items-center gap-1.5 bg-black/[0.06] overflow-x-auto hide-scrollbar">
            {[
              { id: "all", label: "All", count: notifications.length },
              { id: "inbox", label: "Inbox", count: inboxCount },
              { id: "article", label: "Articles", count: articleCount },
              { id: "feedbacks", label: "Feedback", count: feedbacksCount },
              { id: "system", label: "System", count: systemCount },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 sm:gap-1.5 shrink-0 ${
                  activeTab === tab.id
                    ? "bg-theme-accent/20 text-theme-accent border border-theme-accent/35 shadow-xs"
                    : "text-[var(--admin-text-secondary,#a1a1aa)] hover:text-[var(--admin-text-primary,#fff)] hover:bg-white/[0.05] border border-transparent"
                }`}>
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-white/10 font-mono font-bold">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ── Subcategory Pills (Feedbacks) ── */}
          {activeTab === "feedbacks" && (
            <div className="px-3 py-1.5 border-b border-[var(--admin-border,rgba(255,255,255,0.03))] flex items-center gap-1.5 overflow-x-auto hide-scrollbar bg-black/10">
              {[
                { id: "all", label: "All" },
                { id: "bug", label: "Bug", color: "bg-red-500" },
                { id: "known_issue", label: "Issue", color: "bg-amber-500" },
                { id: "feature", label: "Feature", color: "bg-purple-500" },
                { id: "other", label: "Other", color: "bg-theme-accent" },
              ].map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setFeedbackSubFilter(sub.id)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                    feedbackSubFilter === sub.id
                      ? "bg-white/15 text-white font-bold border border-white/20"
                      : "text-[var(--admin-text-secondary,#a1a1aa)] hover:text-white border border-transparent"
                  }`}>
                  {sub.color && (
                    <span className={`w-1.5 h-1.5 rounded-full ${sub.color}`} />
                  )}
                  <span>{sub.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* ── List Content (Spacious & Less Compact) ── */}
          <div className="flex-1 min-h-0 max-h-[min(380px,calc(100dvh-220px))] overflow-y-auto hide-scrollbar p-3 space-y-2">
            {filteredNotifications.length === 0 ? (
              <div className="py-10 text-center text-[var(--admin-text-secondary,#a1a1aa)] flex flex-col items-center justify-center">
                <div className="w-10 h-10 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-2.5">
                  <Bell size={18} className="opacity-40 text-theme-accent" />
                </div>
                <span className="text-xs font-semibold text-[var(--admin-text-primary,#fff)]">
                  No notifications yet
                </span>
                <span className="text-[11px] text-[var(--admin-text-secondary,#a1a1aa)] opacity-70 mt-1 max-w-xs text-center">
                  New inquiries, article updates, and system feedbacks will appear here.
                </span>
              </div>
            ) : (
              ["TODAY", "YESTERDAY", "EARLIER"].map((groupKey) => {
                const itemsInGroup = groupedNotifications[groupKey];
                if (!itemsInGroup || itemsInGroup.length === 0) return null;

                return (
                  <div key={groupKey} className="space-y-1.5">
                    {/* Date Group Header */}
                    <div className="px-1 pt-1.5 pb-0.5 text-[9px] font-bold uppercase tracking-wider text-[var(--admin-text-secondary,#a1a1aa)] opacity-60">
                      {groupKey}
                    </div>

                    {/* Group Items (Comfortable, spacious rows) */}
                    {itemsInGroup.map((item) => {
                      const isRead = item.read;
                      const isExpanded = expandedId === item.id;
                      const cat = getCategoryDetails(item);
                      const initials = getInitials(item.senderName);

                      return (
                        <div
                          key={item.id}
                          className={`group/row relative rounded-2xl transition-all border overflow-hidden ${
                            isExpanded
                              ? "bg-white/[0.06] border-theme-accent/40 shadow-sm"
                              : isRead
                                ? "bg-white/[0.015] border-white/[0.03] hover:bg-white/[0.04] hover:border-white/[0.06]"
                                : "bg-white/[0.04] border-white/[0.07] hover:bg-white/[0.06] shadow-xs"
                          }`}>
                          
                          {/* ── Row Header ── */}
                          <div
                            onClick={() => {
                              if (!isRead) markAsRead(item.id);
                              setExpandedId(isExpanded ? null : item.id);
                            }}
                            className="flex items-start gap-3 p-3 cursor-pointer select-none">
                            
                            {/* Category Icon / Avatar Thumbnail */}
                            <div className="relative shrink-0 mt-0.5">
                              {item.senderAvatar ? (
                                <UserAvatar
                                  src={item.senderAvatar}
                                  name={item.senderName}
                                  size="sm"
                                  shape="rounded"
                                  className="w-8 h-8 rounded-xl border border-white/15"
                                  fallback={item.category === "inbox" ? initials : cat.icon}
                                  fallbackClassName={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-[10px] border ${cat.colorClass}`}
                                />
                              ) : (
                                <div
                                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs border ${cat.colorClass}`}>
                                  {item.category === "inbox" ? initials : cat.icon}
                                </div>
                              )}
                            </div>

                            {/* Summary Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1.5">
                                <span
                                  className={`text-xs truncate ${
                                    !isRead
                                      ? "font-bold text-[var(--admin-text-primary,#fff)]"
                                      : "font-medium text-[var(--admin-text-secondary,#a1a1aa)] opacity-90"
                                  }`}>
                                  {item.senderName || (item.category === "inbox" ? "Inquiry" : "System")}
                                </span>
                                
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <span className="text-[10px] font-mono text-[var(--admin-text-secondary,#a1a1aa)] opacity-60">
                                    {formatRelativeTime(item.createdAt)}
                                  </span>

                                  {/* Unread Accent Dot */}
                                  {!isRead && (
                                    <span className="w-2 h-2 rounded-full bg-theme-accent shadow-[0_0_8px_rgba(var(--accent-rgb,75,196,51),0.9)] shrink-0" />
                                  )}
                                </div>
                              </div>

                              <div className="text-[11px] text-[var(--admin-text-secondary,#a1a1aa)] opacity-75 truncate mt-0.5">
                                {item.title || cat.actionText}
                              </div>
                            </div>

                            {/* Chevron Expand Indicator */}
                            <div className="mt-1 shrink-0">
                              <ChevronDown
                                size={13}
                                className={`text-[var(--admin-text-secondary,#a1a1aa)] opacity-50 transition-transform duration-200 ${
                                  isExpanded ? "rotate-180 text-theme-accent opacity-100" : ""
                                }`}
                              />
                            </div>
                          </div>

                          {/* ── Expanded Drawer (Spacious & Clean) ── */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.18, ease: "easeInOut" }}
                                className="overflow-hidden">
                                <div className="px-4 pb-3.5 pt-1 text-left border-t border-white/[0.05]">
                                  {/* Title */}
                                  {item.title && (
                                    <div className="text-xs font-bold text-[var(--admin-text-primary,#fff)] leading-snug mt-1.5">
                                      {item.title}
                                    </div>
                                  )}

                                  {/* Description */}
                                  {item.description && (
                                    <p className="text-xs text-[var(--admin-text-secondary,#a1a1aa)] leading-relaxed mt-1 opacity-90">
                                      {item.description}
                                    </p>
                                  )}

                                  {/* Key Highlights / Steps (for releases) */}
                                  {Array.isArray(item.steps) && item.steps.length > 0 && (
                                    <div className="mt-2.5 p-2.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-1.5">
                                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-theme-accent uppercase tracking-wider">
                                        <Sparkles size={11} />
                                        <span>Key Highlights</span>
                                      </div>
                                      <ul className="space-y-1">
                                        {item.steps.slice(0, 4).map((step, idx) => (
                                          <li
                                            key={idx}
                                            className="text-[11px] text-[var(--admin-text-secondary,#a1a1aa)] leading-snug flex items-start gap-1.5">
                                            <span className="text-theme-accent font-bold mt-0.5">•</span>
                                            <span>
                                              <strong className="text-[var(--admin-text-primary,#fff)] font-semibold">
                                                {typeof step === "string" ? step : step.t}
                                              </strong>
                                              {typeof step !== "string" && step.d ? `: ${step.d}` : ""}
                                            </span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {/* Inline Actions Bar */}
                                  <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-white/[0.05]">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      {item.category === "inbox" && (
                                        <Link
                                          to={`${basePath}/dashboard/messages`}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            markAsRead(item.id);
                                            setIsOpen(false);
                                          }}
                                          className="h-8 px-3.5 rounded-xl text-xs font-bold bg-theme-accent/15 text-theme-accent hover:bg-theme-accent/25 border border-theme-accent/30 transition-all inline-flex items-center gap-1.5 cursor-pointer">
                                          <Inbox size={12} />
                                          <span>Open Conversation</span>
                                        </Link>
                                      )}

                                      {item.category === "article" && (
                                        <Link
                                          to={
                                            item.targetUrl
                                              ? item.targetUrl.startsWith("/dashboard")
                                                ? `${basePath}${item.targetUrl}`
                                                : item.targetUrl
                                              : `${basePath}/dashboard/news`
                                          }
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            markAsRead(item.id);
                                            setIsOpen(false);
                                          }}
                                          className="h-8 px-3.5 rounded-xl text-xs font-bold bg-blue-500/15 text-blue-300 hover:bg-blue-500/25 border border-blue-500/30 transition-all inline-flex items-center gap-1.5 cursor-pointer">
                                          <FileText size={12} />
                                          <span>View Article</span>
                                        </Link>
                                      )}

                                      {item.category === "feedback" && (
                                        <Link
                                          to={`${basePath}/dashboard/settings#feedbacks`}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            markAsRead(item.id);
                                            setIsOpen(false);
                                          }}
                                          className="h-8 px-3.5 rounded-xl text-xs font-bold bg-purple-500/15 text-purple-300 hover:bg-purple-500/25 border border-purple-500/30 transition-all inline-flex items-center gap-1.5 cursor-pointer">
                                          <ExternalLink size={12} />
                                          <span>Inspect Feedback</span>
                                        </Link>
                                      )}

                                      {item.category === "system" && (
                                        <>
                                          {(item.version || item.subType === "release") && (
                                            <Link
                                              to={`${basePath}/dashboard`}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                markAsRead(item.id);
                                                setIsOpen(false);
                                              }}
                                              className="h-8 px-3.5 rounded-xl text-xs font-bold bg-theme-accent/15 text-theme-accent hover:bg-theme-accent/25 border border-theme-accent/30 transition-all inline-flex items-center gap-1.5 cursor-pointer">
                                              <Sparkles size={12} />
                                              <span>Release Notes</span>
                                            </Link>
                                          )}
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              dismissNotification(item.id);
                                            }}
                                            className="h-8 px-3.5 rounded-xl text-xs font-semibold bg-white/[0.05] text-[var(--admin-text-secondary,#a1a1aa)] hover:text-white hover:bg-white/10 transition-colors cursor-pointer">
                                            Dismiss
                                          </button>
                                        </>
                                      )}
                                    </div>

                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        dismissNotification(item.id);
                                      }}
                                      className="text-xs text-[var(--admin-text-secondary,#a1a1aa)] hover:text-red-400 transition-colors cursor-pointer shrink-0">
                                      Dismiss
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                );
              })
            )}
          </div>

          {/* ── Spacious Footer ── */}
          <div className="px-4 py-3 border-t border-[var(--admin-border,rgba(255,255,255,0.06))] flex items-center justify-between bg-white/[0.02] shrink-0">
            <Link
              to={`${basePath}/dashboard/messages`}
              onClick={() => setIsOpen(false)}
              className="text-xs font-medium text-theme-accent hover:underline transition-colors flex items-center gap-1">
              <span>View all communications</span>
              <ChevronRight size={13} />
            </Link>

            <Link
              to={`${basePath}/dashboard/settings`}
              onClick={() => setIsOpen(false)}
              className="text-xs text-[var(--admin-text-secondary,#a1a1aa)] hover:text-[var(--admin-text-primary,#fff)] transition-colors">
              Preferences
            </Link>
          </div>
        </div>
      </>
    );

    if (isMobile) {
      if (typeof document === "undefined") return null;
      return createPortal(
        <div
          ref={popoverRef}
          className="fixed inset-x-3 top-[68px] sm:top-[72px] max-w-[420px] mx-auto z-[120] animate-liquid-reveal font-sans text-[var(--admin-text-primary,#fff)] pointer-events-auto">
          {content}
        </div>,
        document.body
      );
    }

    return (
      <div
        ref={popoverRef}
        className="absolute z-[120] w-[410px] animate-liquid-reveal font-sans text-[var(--admin-text-primary,#fff)] left-full ml-6 bottom-0 origin-bottom-left">
        {content}
      </div>
    );
  })()}
</div>
  );
};

export default NotificationDropdown;
