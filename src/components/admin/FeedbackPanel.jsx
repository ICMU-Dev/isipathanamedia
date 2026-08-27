import React, { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bug,
  Lightbulb,
  Sparkles,
  AlertTriangle,
  MoreHorizontal,
  Monitor,
  Smartphone,
  Tablet,
  RefreshCw,
  Trash2,
  MessageSquare,
  ChevronDown,
  CheckCircle2,
  Clock,
  XCircle,
  Send,
  X,
  InboxIcon,
  ShieldCheck,
  CalendarDays,
  Link as LinkIcon,
  TrendingUp,
  Copy,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";

// ─── Constants ────────────────────────────────────────────────────────────────

const TYPE_CONFIG = {
  bug: {
    label: "Bug",
    icon: <Bug size={11} />,
    color: "text-red-400",
    bg: "bg-red-600/10",
    border: "border-red-600/20",
  },
  feature: {
    label: "Feature",
    icon: <Sparkles size={11} />,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  improvement: {
    label: "Improvement",
    icon: <Lightbulb size={11} />,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  known_issue: {
    label: "Known Issue",
    icon: <AlertTriangle size={11} />,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  other: {
    label: "Other",
    icon: <MoreHorizontal size={11} />,
    color: "text-slate-400",
    bg: "bg-slate-500/10",
    border: "border-slate-500/20",
  },
};

const STATUS_CONFIG = {
  open: {
    label: "Open",
    icon: <Clock size={10} />,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  in_progress: {
    label: "In Progress",
    icon: <TrendingUp size={10} />,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  resolved: {
    label: "Resolved",
    icon: <CheckCircle2 size={10} />,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  wont_fix: {
    label: "Won't Fix",
    icon: <XCircle size={10} />,
    color: "text-red-400",
    bg: "bg-red-600/10",
    border: "border-red-600/20",
  },
};

const DeviceIcon = ({ device }) => {
  if (device === "mobile")
    return <Smartphone size={10} className="opacity-50" />;
  if (device === "tablet") return <Tablet size={10} className="opacity-50" />;
  return <Monitor size={10} className="opacity-50" />;
};

function formatDate(str) {
  if (!str) return "";
  try {
    return new Date(str).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return str;
  }
}

// ─── Compact Status Selector for Super Admin ────────────────────────────────

const StatusSelector = ({ current, onSelect }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const config = STATUS_CONFIG[current] || STATUS_CONFIG.open;

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((p) => !p);
        }}
        className={`flex items-center gap-1 px-2 py-0.5 rounded-2xl text-[10px] font-medium border transition-colors ${config.color} ${config.bg} ${config.border} hover:opacity-80`}>
        {config.icon}
        {config.label}
        <ChevronDown
          size={9}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            transition={{ duration: 0.1 }}
            className="absolute z-[100] top-full mt-1 left-0 w-36 bg-[#181818] border border-white/5 rounded-2xl shadow-2xl overflow-hidden">
            {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
              <button
                key={val}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(val);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-[10px] font-medium transition-colors hover:bg-white/[0.06] ${cfg.color} ${
                  current === val ? "bg-white/[0.04]" : ""
                }`}>
                {cfg.icon}
                {cfg.label}
                {current === val && (
                  <CheckCircle2 size={10} className="ml-auto opacity-50" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Reply Modal ───────────────────────────────────────────────────────────────

const ReplyModal = ({ feedback, onClose, onSaved }) => {
  const [reply, setReply] = useState(feedback?.admin_reply || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const { error: dbError } = await supabase
        .from("feedbacks")
        .update({
          admin_reply: reply.trim() || null,
          replied_at: reply.trim() ? new Date().toISOString() : null,
        })
        .eq("id", feedback.id);
      if (dbError) throw dbError;
      onSaved({ ...feedback, admin_reply: reply.trim() || null });
      onClose();
    } catch (err) {
      if (
        err.message?.includes("admin_reply") ||
        err.message?.includes("schema cache")
      ) {
        setError(
          "Database missing 'admin_reply' column. Run SQL ALTER TABLE script in Supabase.",
        );
      } else {
        setError(err.message || "Failed to save reply.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 8 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className="relative w-full max-w-lg bg-[var(--admin-card-bg)]   borderborder-white/[0.06]  rounded-2xl shadow-2xl overflow-hidden z-10 will-change-transform"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <MessageSquare size={13} className="text-[var(--accent)]" />
            <h3 className="text-[13px] font-semibold text-white">
              Reply to Feedback
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-2xl text-white/30 hover:text-white transition-colors">
            <X size={14} />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div className="p-3 bg-white/[0.02] border border-white/[0.06]  rounded-2xl text-xs">
            <p className="font-semibold text-white/80">{feedback.title}</p>
            <p className="text-white/40 mt-1 line-clamp-2 leading-relaxed">
              {feedback.description}
            </p>
          </div>

          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Type official reply..."
            rows={3}
            maxLength={2000}
            disabled={saving}
            className={`w-full bg-white/[0.03] borderborder-white/[0.06]  rounded-2xl p-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-theme-accent/50 resize-none ${
              saving ? "opacity-50 cursor-not-allowed" : ""
            }`}
          />

          {error && <p className="text-xs text-red-400">{error}</p>}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] text-white/50 text-xs transition-colors">
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-2 rounded-2xl btn-theme-primary text-xs font-semibold flex items-center justify-center gap-1.5 disabled:opacity-40">
              {saving ? "Saving..." : "Save Reply"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Compact Feedback Row Card ──────────────────────────────────────────────────

const FeedbackCard = React.memo(({
  item,
  isSuperAdmin,
  onStatusChange,
  onDelete,
  onReply,
}) => {
  const typeConfig = TYPE_CONFIG[item.type] || TYPE_CONFIG.other;
  const statusConfig = STATUS_CONFIG[item.status] || STATUS_CONFIG.open;
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyToAI = (e) => {
    e.stopPropagation();
    const prompt = `I need help debugging an issue reported in my web application. Here are the details of the feedback:

### Issue Context
- **Title**: ${item.title}
- **Type**: ${item.type}
- **Reporter**: ${item.users?.full_name || "Anonymous"}
- **URL Path**: \`${item.url_path || "N/A"}\`
- **Device Type**: ${item.device_type}
- **Date Reported**: ${formatDate(item.created_at)}

### Description
${item.description}
${item.admin_reply ? `\n### Admin Reply\n${item.admin_reply}\n` : ""}
Please analyze this feedback and provide:
1. Potential root causes for this issue.
2. The likely files or components involved.
3. Steps to investigate or reproduce.
4. Suggested code fixes or solutions.`;

    navigator.clipboard.writeText(prompt).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm("Delete entry?")) return;
    setDeleting(true);
    await onDelete(item.id);
    setDeleting(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      onClick={() => setExpanded((p) => !p)}
      className="bg-white/[0.02] border border-white/[0.06] rounded-2xl relative hover:border-white/[0.12] transition-colors cursor-pointer">
      <div className="p-3.5">
        <div className="flex items-center justify-between gap-3">
          {/* Left: Type badge + Title */}
          <div className="flex flex-col items-start gap-2.5 min-w-0 flex-1">
            <div className="flex   gap-2">
              <span
                className={`mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium border flex items-center gap-1 shrink-0 ${typeConfig.color} ${typeConfig.bg} ${typeConfig.border}`}>
                {typeConfig.icon}
              </span>
              <div
                className={`mt-0.5  scale-[0.9] origin-left px-1.5 py-0.5 rounded text-[10px] font-medium border flex items-center gap-1 shrink-0 text-white bg-white/5 opacity-30`}>
                <span className="flex items-center gap-1 capitalize">
                  <DeviceIcon device={item.device_type} />
                  {item.device_type}
                </span>
                <span>·</span>
                <span>{formatDate(item.created_at)}</span>
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-[13px] font-semibold text-white/90 leading-snug">
                {item.title}
              </h4>
              {item.admin_reply && !expanded && (
                <div className="flex items-center gap-1.5 mt-1.5 text-[10px] font-medium text-[var(--accent)]">
                  <MessageSquare size={10} />
                  <span>Show admin reply</span>
                </div>
              )}
              {/* Meta line */}
              <div className="flex flex-wrap flex-col items-start gap-x-2 gap-y-2 mt-1 text-[10px] text-white/35">
                <span>{item.users?.full_name || "Anonymous"}</span>
                {isSuperAdmin ? (
                  <StatusSelector
                    current={item.status}
                    onSelect={(val) => onStatusChange(item.id, val)}
                  />
                ) : (
                  <span
                    className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border ${statusConfig.color} ${statusConfig.bg} ${statusConfig.border}`}>
                    {statusConfig.icon}
                    {statusConfig.label}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Status badge & Actions */}
          <div className="flex  items-center gap-2 shrink-0">
            {isSuperAdmin && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleCopyToAI}
                  title="Copy to AI Prompt"
                  className="p-1 rounded-2xl text-white/30 hover:text-[var(--accent)] hover:bg-white/5 transition-colors">
                  {copied ? (
                    <CheckCircle2 size={12} className="text-emerald-400" />
                  ) : (
                    <Copy size={12} />
                  )}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onReply(item);
                  }}
                  title="Reply"
                  className="p-1 rounded-2xl text-white/30 hover:text-[var(--accent)] hover:bg-white/5 transition-colors">
                  <MessageSquare size={12} />
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  title="Delete"
                  className="p-1 rounded-2xl text-white/30 hover:text-red-400 hover:bg-white/5 transition-colors disabled:opacity-30">
                  <Trash2 size={12} />
                </button>
              </div>
            )}

            <ChevronDown
              size={12}
              className={`text-white/20 transition-transform ${expanded ? "rotate-180" : ""}`}
            />
          </div>
        </div>
      </div>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/[0.06]  flex-col justify-between flex bg-white/[0.01] p-3.5 space-y-3">
            <div>
              <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">
                Description
              </p>
              <p className="text-xs text-white/70 leading-relaxed whitespace-pre-wrap">
                {item.description}
              </p>
            </div>

            {item.url_path && (
              <div className="flex items-center gap-1.5 text-[11px] text-white/30 font-mono">
                <LinkIcon size={11} className="shrink-0 opacity-60" />
                <span>{item.url_path}</span>
              </div>
            )}

            {item.admin_reply && (
              <div className="bg-[#181818] border border-theme-accent/ rounded-2xl p-3">
                <p className="text-[10px] text-[var(--accent)] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <MessageSquare size={10} />
                  Admin Reply
                </p>
                <p className="text-xs text-white/80 leading-relaxed">
                  {item.admin_reply}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

// ─── Main Panel ────────────────────────────────────────────────────────────────

const FeedbackPanel = () => {
  const { user } = useAuth();
  const role = user?.role?.toLowerCase();
  const isSuperAdmin =
    role === "super-admin" || role === "superadmin" || role === "super_admin";

  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [replyTarget, setReplyTarget] = useState(null);

  const fetchFeedbacks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: dbError } = await supabase
        .from("feedbacks")
        .select("*, users(full_name, role)")
        .order("created_at", { ascending: false })
        .limit(200);
      if (dbError) throw dbError;
      setFeedbacks(data || []);
    } catch (err) {
      setError(err.message || "Failed to load feedbacks.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeedbacks();

    const channel = supabase
      .channel("feedbacks_panel_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "feedbacks" },
        (payload) => {
          if (payload.eventType === "DELETE") {
            setFeedbacks((prev) => prev.filter((f) => String(f.id) !== String(payload.old.id)));
          } else if (payload.eventType === "UPDATE") {
            setFeedbacks((prev) =>
              prev.map((f) =>
                String(f.id) === String(payload.new.id) ? { ...f, ...payload.new } : f
              )
            );
          } else if (payload.eventType === "INSERT") {
            // For insert we'd optimally fetch the user relation, but as a quick sync we can just prepend it.
            // Note: users(name) relation won't be in the raw payload. We could fetch the single record or rely on manual refresh.
            // For a robust sync, we can just trigger a full fetch (with limit) when an insert happens since they are rare.
            fetchFeedbacks();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchFeedbacks]);

  const handleStatusChange = useCallback(async (id, newStatus) => {
    setFeedbacks((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: newStatus } : f)),
    );
    try {
      await supabase
        .from("feedbacks")
        .update({ status: newStatus })
        .eq("id", id);
    } catch {
      fetchFeedbacks();
    }
  }, [fetchFeedbacks]);

  const handleDelete = useCallback(async (id) => {
    try {
      await supabase.from("feedbacks").delete().eq("id", id);
      setFeedbacks((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  }, []);

  const handleReplySaved = useCallback((updated) => {
    setFeedbacks((prev) =>
      prev.map((f) => (f.id === updated.id ? updated : f)),
    );
  }, []);

  const openCount = feedbacks.filter((f) => f.status === "open").length;
  const resolvedCount = feedbacks.filter((f) => f.status === "resolved").length;

  const filtered = feedbacks.filter((f) => {
    if (filterType !== "all" && f.type !== filterType) return false;
    if (filterStatus !== "all" && f.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="animate-fade-in space-y-4">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <h3 className="text-sm font-bold text-white tracking-wide">
            Feedbacks
          </h3>
          <span className="px-2 py-0.5 bg-white/[0.06] border border-white/[0.06] rounded-full text-[11px] font-semibold text-white/60">
            {feedbacks.length}
          </span>
          {openCount > 0 && (
            <span className="text-[11px] font-medium text-amber-400/80">
              ({openCount} open)
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={fetchFeedbacks}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.07] rounded-2xl text-white/50 hover:text-white text-xs transition-colors disabled:opacity-40">
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Streamlined Single-Row Filter Controls */}
      <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1">
        {/* Status Filter Segmented Control */}
        <div className="flex items-center bg-white/[0.03] border border-white/[0.06] p-1 rounded-2xl shrink-0">
          {[
            { id: "all", label: "All" },
            { id: "open", label: "Open" },
            { id: "in_progress", label: "In Progress" },
            { id: "resolved", label: "Resolved" },
          ].map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setFilterStatus(s.id)}
              className={`px-3 py-1 rounded-2xl text-[11px] font-medium transition-all ${
                filterStatus === s.id
                  ? "bg-white/10 text-white shadow-xs font-semibold"
                  : "text-white/40 hover:text-white/70"
              }`}>
              {s.label}
            </button>
          ))}
        </div>

        {/* Type Dropdown Filter */}
        <div className="relative shrink-0">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="appearance-none bg-white/[0.03] border border-white/[0.06] text-white/60 hover:text-white text-[11px] font-medium rounded-2xl px-3 py-1.5 pr-7 cursor-pointer focus:outline-none">
            <option value="all" className="bg-[#181818] text-white">
              All Types
            </option>
            <option value="bug" className="bg-[#181818] text-white">
              Bugs
            </option>
            <option value="feature" className="bg-[#181818] text-white">
              Features
            </option>
            <option value="improvement" className="bg-[#181818] text-white">
              Improvements
            </option>
            <option value="known_issue" className="bg-[#181818] text-white">
              Known Issues
            </option>
            <option value="other" className="bg-[#181818] text-white">
              Other
            </option>
          </select>
          <ChevronDown
            size={12}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
          />
        </div>
      </div>

      {/* Feedbacks List */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-white/30">
          <RefreshCw size={20} className="animate-spin mr-2" />
          <span className="text-xs">Loading...</span>
        </div>
      ) : error ? (
        <div className="p-6 text-center text-xs text-red-400 bg-red-600/10 border border-red-600/20 rounded-2xl">
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-white/25 gap-2">
          <InboxIcon size={28} className="opacity-40" />
          <p className="text-xs font-medium">No feedback items found</p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {filtered.map((item) => (
              <FeedbackCard
                key={item.id}
                item={item}
                isSuperAdmin={isSuperAdmin}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
                onReply={setReplyTarget}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Reply Modal */}
      <AnimatePresence>
        {replyTarget && (
          <ReplyModal
            key="reply-modal"
            feedback={replyTarget}
            onClose={() => setReplyTarget(null)}
            onSaved={handleReplySaved}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default FeedbackPanel;
