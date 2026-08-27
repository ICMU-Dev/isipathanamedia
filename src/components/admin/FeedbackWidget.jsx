import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  MessageSquarePlus,
  X,
  Bug,
  Lightbulb,
  Sparkles,
  AlertTriangle,
  MoreHorizontal,
  Send,
  CheckCircle2,
  ChevronDown,
  Monitor,
  Smartphone,
  Tablet,
  SendIcon,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabaseClient";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function detectDevice() {
  const ua = navigator.userAgent;
  if (/Mobi|Android|iPhone/i.test(ua)) return "mobile";
  if (/iPad|Tablet/i.test(ua)) return "tablet";
  return "desktop";
}

const FEEDBACK_TYPES = [
  {
    value: "bug",
    label: "Bug Report",
    icon: <Bug size={14} />,
    color: "text-red-400",
    bg: "bg-red-600/10",
    border: "border-red-600/20",
  },
  {
    value: "feature",
    label: "Feature Request",
    icon: <Sparkles size={14} />,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  {
    value: "improvement",
    label: "Improvement",
    icon: <Lightbulb size={14} />,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  {
    value: "known_issue",
    label: "Known Issue",
    icon: <AlertTriangle size={14} />,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  {
    value: "other",
    label: "Other",
    icon: <MoreHorizontal size={14} />,
    color: "text-slate-400",
    bg: "bg-slate-500/10",
    border: "border-slate-500/20",
  },
];

const PRIORITIES = [
  { value: "low", label: "Low", color: "text-slate-400" },
  { value: "medium", label: "Medium", color: "text-yellow-400" },
  { value: "high", label: "High", color: "text-orange-400" },
  { value: "critical", label: "Critical", color: "text-red-400" },
];

const DeviceIcon = ({ device }) => {
  if (device === "mobile")
    return <Smartphone size={12} className="opacity-60" />;
  if (device === "tablet") return <Tablet size={12} className="opacity-60" />;
  return <Monitor size={12} className="opacity-60" />;
};

// ─── Custom Select ─────────────────────────────────────────────────────────────

const CustomSelect = ({ options, value, onChange, placeholder, disabled }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2.5 bg-white/[0.04] borderborder-white/[0.06]  rounded-2xl text-sm text-white/80 hover:border-white/20 transition-colors focus:outline-none focus:border-theme-accent/50 disabled:opacity-50 disabled:cursor-not-allowed">
        {selected ? (
          <span
            className={`flex items-center gap-2 ${selected.color || "text-white/80"}`}>
            {selected.icon && selected.icon}
            {selected.label}
          </span>
        ) : (
          <span className="text-white/30">{placeholder}</span>
        )}
        <ChevronDown
          size={14}
          className={`text-white/30 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute z-[9999] top-full mt-1.5 left-0 right-0  bg-[var(--admin-card-bg)] border border-white/5 rounded-2xl shadow-2xl overflow-hidden">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors hover:bg-white/[0.06] ${
                  value === opt.value ? "bg-white/[0.04]" : ""
                } ${opt.color || "text-white/70"}`}>
                {opt.icon && <span className="opacity-80">{opt.icon}</span>}
                {opt.label}
                {value === opt.value && (
                  <CheckCircle2 size={12} className="ml-auto opacity-60" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Main Widget ───────────────────────────────────────────────────────────────

const FeedbackWidget = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Widget enabled setting toggle
  const [enabled, setEnabled] = useState(() => {
    try {
      return localStorage.getItem("icmu_feedback_widget_enabled") !== "false";
    } catch {
      return true;
    }
  });

  useEffect(() => {
    const handleToggle = () => {
      try {
        setEnabled(
          localStorage.getItem("icmu_feedback_widget_enabled") !== "false",
        );
      } catch {
        setEnabled(true);
      }
    };
    window.addEventListener("icmu_feedback_toggle", handleToggle);
    window.addEventListener("storage", handleToggle);
    return () => {
      window.removeEventListener("icmu_feedback_toggle", handleToggle);
      window.removeEventListener("storage", handleToggle);
    };
  }, []);

  const device = useMemo(() => detectDevice(), []);

  const isAuthorized = useMemo(() => {
    const r = user?.role?.toLowerCase();
    return (
      r === "admin" ||
      r === "super-admin" ||
      r === "superadmin" ||
      r === "super_admin" ||
      r === "writer"
    );
  }, [user?.role]);

  const [form, setForm] = useState({
    type: "",
    priority: "medium",
    title: "",
    description: "",
  });

  const needsPriority = ["bug", "known_issue"].includes(form.type);

  const resetForm = () => {
    setForm({ type: "", priority: "medium", title: "", description: "" });
    setError(null);
    setSubmitted(false);
  };

  const openModal = useCallback(() => {
    resetForm();
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setTimeout(resetForm, 300);
  }, []);

  // Global keyboard shortcut: Ctrl+Shift+F
  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === "F") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Escape to close
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, closeModal]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.type || !form.title.trim() || !form.description.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    const lastSubmit = localStorage.getItem("icmu_last_feedback_time");
    if (lastSubmit && Date.now() - parseInt(lastSubmit) < 5000) {
      const remaining = Math.ceil((5000 - (Date.now() - parseInt(lastSubmit))) / 1000);
      setError(`Please wait ${remaining}s before submitting again.`);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const { error: dbError } = await supabase.from("feedbacks").insert({
        user_id: user?.id || null,
        device_type: device,
        user_agent: navigator.userAgent,
        type: form.type,
        priority: needsPriority ? form.priority : null,
        title: form.title.trim(),
        description: form.description.trim(),
        url_path: window.location.pathname,
        status: "open",
      });

      if (dbError) throw dbError;

      // Use a generic settings path — the recipient admin's own session/routing will
      // resolve to the correct dynamic index path when they click the notification.
      const targetUrl = "/admin-redirect";

      // Fire push to other admins in background — non-blocking
      supabase.functions.invoke("send-feedback-push", {
        body: {
          title: form.title.trim(),
          description: form.description.trim(),
          type: form.type,
          reporter_name: user?.name || "Anonymous",
          submitter_user_id: user?.id || null,
          target_url: targetUrl,
        },
      }).catch((err) => console.warn("[FeedbackWidget] Push notify failed:", err));

      localStorage.setItem("icmu_last_feedback_time", Date.now().toString());
      setSubmitted(true);
    } catch (err) {
      console.error("Feedback submit error:", err);
      setError(err.message || "Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedType = FEEDBACK_TYPES.find((t) => t.value === form.type);

  // Hide widget if unauthenticated, unauthorized, or disabled by settings toggle
  if (!user || !isAuthorized || !enabled) return null;

  return (
    <>
      {/* ── Floating Trigger Button ── */}
      <motion.button
        type="button"
        onClick={openModal}
        title="Send Feedback (Ctrl+Shift+F)"
        aria-label="Open feedback form"
        className="fixed bottom-[100px] md:bottom-6 right-6 md:right-6 z-[45] w-9 h-9 rounded-full bg-[#181818] border border-white/[0.12] text-white/40 hover:text-white hover:bg-[#222] transition-colors duration-150 flex items-center justify-center shadow-lg"
        whileTap={{ scale: 0.92 }}>
        <MessageSquarePlus size={16} />
      </motion.button>

      {/* ── Modal ── */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="feedback-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-[60] bg-black/80"
              onClick={closeModal}
            />

            {/* Modal Card */}
            <motion.div
              key="feedback-modal"
              initial={{ opacity: 0, scale: 0.97, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 8 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="fixed inset-0 z-[61] flex items-center justify-center px-4 pointer-events-none will-change-transform">
              <div
                className="pointer-events-auto w-full max-w-md bg-[var(--admin-card-bg)]   borderborder-white/[0.06]  rounded-2xl shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-2xl bg-theme-accent/5 flex items-center justify-center">
                      <MessageSquarePlus
                        size={14}
                        className="text-[var(--accent)]"
                      />
                    </div>
                    <div>
                      <h2 className="text-[13px] font-semibold text-white tracking-tight">
                        Send Feedback
                      </h2>
                      <p className="text-[10px] text-white/30 mt-0.5">
                        Report a bug or suggest an improvement
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="w-7 h-7 flex items-center justify-center rounded-2xl text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-colors">
                    <X size={15} />
                  </button>
                </div>

                {/* Body */}
                <AnimatePresence mode="wait">
                  {submitted ? (
                    // ── Success State ──
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center py-12 px-6 gap-4 text-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.1, damping: 12 }}
                        className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <CheckCircle2 size={26} className="text-emerald-400" />
                      </motion.div>
                      <div>
                        <h3 className="text-[15px] font-semibold text-white">
                          Feedback Received
                        </h3>
                        <p className="text-[12px] text-white/40 mt-1.5 leading-relaxed">
                          Thanks for helping improve things. The team will
                          review it shortly.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={closeModal}
                        className="mt-2 px-6 py-2 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] text-white/70 text-[13px] font-medium transition-colors">
                        Close
                      </button>
                    </motion.div>
                  ) : (
                    // ── Form State ──
                    <motion.form
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onSubmit={handleSubmit}
                      className="p-5 space-y-4">
                      {/* Reporter Info (read-only strip) */}
                      <div className="flex items-center gap-3 px-3 py-2 bg-white/[0.02] border border-white/[0.06]  rounded-2xl">
                        {/* Avatar */}
                        <div className="w-7 h-7 rounded-full bg-white/[0.08] border border-white/5 flex items-center justify-center text-[11px] font-semibold text-white/60 shrink-0 overflow-hidden">
                          {user?.avatarUrl ? (
                            <img
                              src={user.avatarUrl}
                              alt=""
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            (user?.name?.charAt(0) || "A").toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[12px] font-medium text-white/70 truncate">
                            {user?.name || "Anonymous"}
                          </p>
                          <p className="text-[10px] text-white/30 capitalize">
                            {user?.role || "unknown"}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-white/30 shrink-0">
                          <DeviceIcon device={device} />
                          <span className="capitalize">{device}</span>
                        </div>
                      </div>

                      {/* Type selector */}
                      <div>
                        <label className="block text-[11px] font-medium text-white/40 uppercase tracking-wider mb-1.5">
                          Type <span className="text-red-400/70">*</span>
                        </label>
                        <CustomSelect
                          options={FEEDBACK_TYPES}
                          value={form.type}
                          onChange={(v) => setForm((p) => ({ ...p, type: v }))}
                          placeholder="Select a type..."
                          disabled={isSubmitting}
                        />
                      </div>

                      {/* Priority (conditional) */}
                      {needsPriority && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}>
                          <label className="block text-[11px] font-medium text-white/40 uppercase tracking-wider mb-1.5">
                            Priority
                          </label>
                          <div className="flex gap-2">
                            {PRIORITIES.map((p) => (
                              <button
                                key={p.value}
                                type="button"
                                disabled={isSubmitting}
                                onClick={() =>
                                  setForm((prev) => ({
                                    ...prev,
                                    priority: p.value,
                                  }))
                                }
                                className={`flex-1 py-1.5 text-[11px] font-medium rounded-2xl border transition-colors ${
                                  form.priority === p.value
                                    ? `${p.color} border-current bg-current/10`
                                    : "text-white/30 border-white/[0.07] hover:border-white/20 hover:text-white/60"
                                }`}>
                                {p.label}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {/* Title */}
                      <div>
                        <label className="block text-[11px] font-medium text-white/40 uppercase tracking-wider mb-1.5">
                          Title <span className="text-red-400/70">*</span>
                        </label>
                        <input
                          type="text"
                          value={form.title}
                          disabled={isSubmitting}
                          onChange={(e) =>
                            setForm((p) => ({ ...p, title: e.target.value }))
                          }
                          placeholder="Short, descriptive title..."
                          maxLength={120}
                          className="w-full bg-white/[0.03] borderborder-white/[0.06]  rounded-2xl px-3 py-2.5 text-[13px] text-white placeholder-white/20 focus:outline-none focus:border-theme-accent/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-[11px] font-medium text-white/40 uppercase tracking-wider mb-1.5">
                          Description <span className="text-red-400/70">*</span>
                        </label>
                        <textarea
                          value={form.description}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              description: e.target.value,
                            }))
                          }
                          placeholder="Describe the issue or suggestion in detail. Steps to reproduce (for bugs), expected vs actual behavior, etc."
                          rows={4}
                          maxLength={2000}
                          disabled={isSubmitting}
                          className="w-full bg-white/[0.03] borderborder-white/[0.06]  rounded-2xl px-3 py-2.5 text-[13px] text-white placeholder-white/20 focus:outline-none focus:border-theme-accent/50 transition-colors resize-none leading-relaxed disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <p className="text-right text-[10px] text-white/20 mt-1">
                          {form.description.length}/2000
                        </p>
                      </div>

                      {/* Page path (auto) */}
                      <div className="flex items-center gap-2 px-3 py-2 bg-white/[0.02] border border-white/[0.06]  rounded-2xl">
                        <span className="text-[10px] text-white/25 shrink-0">
                          Page:
                        </span>
                        <span className="text-[11px] text-white/40 truncate font-mono">
                          {window.location.pathname}
                        </span>
                      </div>

                      {/* Error */}
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-2 px-3 py-2.5 bg-red-600/10 border border-red-600/20 rounded-2xl text-red-400 text-[12px]">
                          <AlertTriangle size={13} />
                          {error}
                        </motion.div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={closeModal}
                          className="flex-1 py-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] text-white/50 hover:text-white/80 text-[13px] font-medium transition-colors">
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="flex-1 py-2.5 rounded-2xl btn-theme-primary text-[13px] font-semibold flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95">
                          {isSubmitting ? (
                            <span className="flex items-center gap-2">
                              <svg
                                className="animate-spin w-3.5 h-3.5"
                                viewBox="0 0 24 24"
                                fill="none">
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                />
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8v8H4z"
                                />
                              </svg>
                              Sending...
                            </span>
                          ) : (
                            <>
                              <SendIcon size={13} />
                              Send Feedback
                            </>
                          )}
                        </button>
                      </div>

                      <p className="text-center text-[10px] text-white/20">
                        Press{" "}
                        <kbd className="px-1 py-0.5 rounded bg-white/[0.07] text-white/30 font-mono text-[9px]">
                          Ctrl+Shift+F
                        </kbd>{" "}
                        to toggle
                      </p>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default FeedbackWidget;
