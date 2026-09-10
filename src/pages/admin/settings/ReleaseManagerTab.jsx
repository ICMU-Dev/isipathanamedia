import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import initialChangelogs from "../../../data/changelogs.json";
import {
  bumpVersion,
  decrementVersion,
  formatReleaseDate,
  generateChangelogMarkdown,
  fetchDevReleaseInfo,
  publishDevRelease,
  deleteDevRelease,
  isLocalhost,
} from "../../../utils/releaseManager";
import {
  Sparkles,
  Plus,
  Trash2,
  Rocket,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Tag,
  Type,
  AlignLeft,
  ListPlus,
  Clock,
  Zap,
  Radio,
} from "lucide-react";
import Loader from "../../../components/ui/Loader";
import { useNotification } from "../../../context/NotificationContext";

const BADGE_OPTIONS = [
  "FEATURE RELEASE",
  "BUG FIXES",
  "SYSTEM UPDATE",
  "MAJOR RELEASE",
  "SECURITY PATCH",
  "UI ENHANCEMENTS",
];

const ReleaseManagerTab = () => {
  const [releases, setReleases] = useState(initialChangelogs || []);
  const [currentVersion, setCurrentVersion] = useState("2.0.0");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ type: "", message: "" });
  const [copied, setCopied] = useState(false);
  const [showMarkdownPreview, setShowMarkdownPreview] = useState(false);
  const [expandedReleases, setExpandedReleases] = useState(new Set([initialChangelogs?.[0]?.version || "2.0.0"]));

  const {
    triggerSystemReleaseNotification,
    triggerSystemDevUpdate,
    removeSystemReleaseNotification,
  } = useNotification();

  // Dev Alert Broadcaster State
  const [devAlertTitle, setDevAlertTitle] = useState("");
  const [devAlertDesc, setDevAlertDesc] = useState("");
  const [devAlertBadge, setDevAlertBadge] = useState("SYSTEM UPDATE");
  const [isBroadcastingAlert, setIsBroadcastingAlert] = useState(false);

  // Form state
  const [newVersion, setNewVersion] = useState(() => bumpVersion("2.0.0", "patch"));
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("Feature Release");
  const [badge, setBadge] = useState("FEATURE RELEASE");
  const [description, setDescription] = useState("");
  const [isMajor, setIsMajor] = useState(false);
  const [features, setFeatures] = useState([
    { t: "", d: "" },
  ]);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast({ type: "", message: "" }), 3500);
  };

  const loadDevInfo = async () => {
    if (!isLocalhost()) return;
    setLoading(true);
    try {
      const res = await fetchDevReleaseInfo();
      if (res.success) {
        if (res.version) {
          setCurrentVersion(res.version);
          setNewVersion(bumpVersion(res.version, "patch"));
        }
        if (Array.isArray(res.releases) && res.releases.length > 0) {
          setReleases(res.releases);
          setExpandedReleases(new Set([res.releases[0].version]));
        }
      }
    } catch {
      // Fallback to static
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDevInfo();
  }, []);

  const handleSetVersionBump = (type) => {
    const nextV = bumpVersion(currentVersion, type);
    setNewVersion(nextV);
    setIsMajor(type === "major");
    if (type === "major") {
      setBadge("MAJOR RELEASE");
      setSubtitle("Major Release");
    } else if (type === "minor") {
      setBadge("FEATURE RELEASE");
      setSubtitle("Feature Release");
    } else {
      setBadge("BUG FIXES");
      setSubtitle("Patch & Fixes");
    }
  };

  const handleAddFeatureRow = () => {
    setFeatures((prev) => [...prev, { t: "", d: "" }]);
  };

  const handleRemoveFeatureRow = (idx) => {
    setFeatures((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleFeatureChange = (idx, field, value) => {
    setFeatures((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

  const toggleReleaseExpand = (v) => {
    setExpandedReleases((prev) => {
      const next = new Set(prev);
      if (next.has(v)) next.delete(v);
      else next.add(v);
      return next;
    });
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast("error", "Release title is required.");
      return;
    }

    const cleanVersion = newVersion.trim().replace(/^v/i, "");
    if (!cleanVersion) {
      showToast("error", "Valid version required.");
      return;
    }

    const validFeatures = features.filter((f) => f.t.trim().length > 0);

    const payload = {
      version: cleanVersion,
      title: title.trim(),
      subtitle: subtitle.trim() || "System Update",
      badge: badge || "FEATURE RELEASE",
      desc: description.trim(),
      isMajor: Boolean(isMajor),
      steps: validFeatures.map((f) => ({
        t: f.t.trim(),
        d: f.d.trim(),
      })),
      date: formatReleaseDate(),
    };

    setSaving(true);
    try {
      const res = await publishDevRelease(payload);
      if (res.success) {
        showToast("success", `Published v${res.version} (+1)`);
        if (triggerSystemReleaseNotification) {
          triggerSystemReleaseNotification({
            ...payload,
            version: res.version,
          });
        }
        setCurrentVersion(res.version);
        setReleases(res.releases || [payload, ...releases]);
        setNewVersion(bumpVersion(res.version, "patch"));
        setTitle("");
        setDescription("");
        setFeatures([{ t: "", d: "" }]);
        setExpandedReleases(new Set([cleanVersion]));
      } else {
        showToast("error", res.error || "Publish failed.");
      }
    } catch (err) {
      showToast("error", err.message || "Failed to publish.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (versionToDelete) => {
    const isConfirm = window.confirm(
      `Delete release v${versionToDelete}? Version will rollback by -1.`
    );
    if (!isConfirm) return;

    setSaving(true);
    try {
      const res = await deleteDevRelease(versionToDelete);
      if (res.success) {
        showToast("success", `Deleted v${versionToDelete} (-1)`);
        if (removeSystemReleaseNotification) {
          removeSystemReleaseNotification(versionToDelete);
        }
        setCurrentVersion(res.version);
        setReleases(res.releases || releases.filter((r) => r.version !== versionToDelete));
        setNewVersion(bumpVersion(res.version, "patch"));
      } else {
        showToast("error", res.error || "Delete failed.");
      }
    } catch (err) {
      showToast("error", err.message || "Failed to delete.");
    } finally {
      setSaving(false);
    }
  };

  const handleBroadcastAlert = (e) => {
    e.preventDefault();
    if (!devAlertTitle.trim()) {
      showToast("error", "Alert title is required.");
      return;
    }
    setIsBroadcastingAlert(true);
    try {
      if (triggerSystemDevUpdate) {
        triggerSystemDevUpdate(
          devAlertTitle.trim(),
          devAlertDesc.trim(),
          devAlertBadge
        );
      }
      showToast("success", "System notice broadcasted!");
      setDevAlertTitle("");
      setDevAlertDesc("");
    } catch {
      showToast("error", "Failed to broadcast alert.");
    } finally {
      setIsBroadcastingAlert(false);
    }
  };

  const handleCopyMarkdown = () => {
    const md = generateChangelogMarkdown(releases);
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast("success", "Markdown copied!");
  };

  return (
    <div className="w-full space-y-4 animate-in fade-in duration-200">
      {/* Toast Alert */}
      <AnimatePresence>
        {toast.message && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`p-3 rounded-xl text-xs font-semibold flex items-center justify-between border ${
              toast.type === "error"
                ? "bg-red-500/10 border-red-500/20 text-red-400"
                : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
            }`}
          >
            <div className="flex items-center gap-2">
              {toast.type === "error" ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
              <span>{toast.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Top Bar: Compact & Minimal ── */}
      <div className="bg-[var(--admin-card-bg)] border border-[var(--admin-border)] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-theme-accent/10 border border-theme-accent/20 flex items-center justify-center text-[var(--accent)] shrink-0">
            <Rocket size={16} />
          </div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-[var(--admin-text-primary)]">
              Release Manager
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              Localhost
            </span>
          </div>
        </div>

        {/* Version & Shortcut Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/[0.03] border border-white/[0.08] font-mono text-xs font-bold text-[var(--accent)]">
            <Tag size={12} className="opacity-60" />
            <span>v{currentVersion}</span>
          </div>

          <div className="flex items-center gap-1 bg-[var(--admin-input-bg)] p-1 rounded-xl border border-[var(--admin-border)]">
            <button
              type="button"
              onClick={() => handleSetVersionBump("patch")}
              className="px-2 py-0.5 text-[11px] font-semibold 2xl text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Patch (+1)"
            >
              Patch
            </button>
            <button
              type="button"
              onClick={() => handleSetVersionBump("minor")}
              className="px-2 py-0.5 text-[11px] font-semibold 2xl text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Minor (+1)"
            >
              Minor
            </button>
            <button
              type="button"
              onClick={() => handleSetVersionBump("major")}
              className="px-2 py-0.5 text-[11px] font-semibold 2xl text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Major (+1)"
            >
              Major
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopyMarkdown}
            className="p-1.5 rounded-xl bg-[var(--admin-input-bg)] border border-[var(--admin-border)] hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
            title="Copy CHANGELOG.md"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
          </button>
        </div>
      </div>

      {/* ── Form: Create Release ── */}
      <form
        onSubmit={handlePublish}
        className="bg-[var(--admin-card-bg)] border border-[var(--admin-border)] rounded-3xl p-5 sm:p-7 shadow-sm space-y-5"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[var(--admin-border)]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-theme-accent/15 border border-theme-accent/25 flex items-center justify-center text-[var(--accent)]">
              <Sparkles size={14} />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                New Release
              </h3>
             
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-[var(--accent)] bg-theme-accent/10 border border-theme-accent/25 px-3 py-1 rounded-xl">
            Target v{newVersion}
          </span>
        </div>

        {/* Row 1: Version, Category, Major Toggle */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
          {/* Version Input */}
          <div className="lg:col-span-4">
            <label className=" text-xs font-bold uppercase tracking-wider text-white/60 mb-1.5 flex items-center gap-1.5">
              <Tag size={12} className="text-[var(--accent)]" /> Version
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
                <Tag size={15} />
              </div>
              <input
                type="text"
                value={newVersion}
                onChange={(e) => setNewVersion(e.target.value)}
                placeholder="2.0.1"
                required
                className="w-full h-12 pl-11 pr-4 bg-[var(--admin-input-bg)] border border-[var(--admin-border)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/15 rounded-2xl text-sm font-mono font-semibold text-white focus:outline-none transition-all placeholder:text-white/30"
              />
            </div>
          </div>

          {/* Category Select */}
          <div className="lg:col-span-5">
            <label className=" text-xs font-bold uppercase tracking-wider text-white/60 mb-1.5 flex items-center gap-1.5">
              <Sparkles size={12} className="text-[var(--accent)]" /> Release Category
            </label>
            <select
              value={badge}
              onChange={(e) => {
                setBadge(e.target.value);
                if (e.target.value === "MAJOR RELEASE") setIsMajor(true);
              }}
              className="w-full h-12 px-4 bg-[var(--admin-input-bg)] border border-[var(--admin-border)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/15 rounded-2xl text-sm font-semibold text-white focus:outline-none cursor-pointer transition-all"
            >
              {BADGE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Major Toggle Button */}
          <div className="sm:col-span-2 lg:col-span-3 flex flex-col justify-end">
            <label className=" text-xs font-bold uppercase tracking-wider text-white/60 mb-1.5 flex items-center gap-1.5">
              <Zap size={12} className="text-[var(--accent)]" /> Type
            </label>
            <button
              type="button"
              onClick={() => setIsMajor(!isMajor)}
              className={`h-12 w-full px-4 rounded-2xl border flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider transition-all select-none cursor-pointer ${
                isMajor
                  ? "bg-theme-accent/20 border-theme-accent/50 text-[var(--accent)] shadow-[0_0_12px_rgba(var(--accent-rgb),0.2)]"
                  : "bg-[var(--admin-input-bg)] border-[var(--admin-border)] text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              <Zap size={15} className={isMajor ? "text-[var(--accent)] fill-current" : ""} />
              <span>{isMajor ? "Major Release" : "Regular Release"}</span>
            </button>
          </div>
        </div>

        {/* Row 2: Title */}
        <div>
          <label className=" text-xs font-bold uppercase tracking-wider text-white/60 mb-1.5 flex items-center gap-1.5">
            <Type size={12} className="text-[var(--accent)]" /> Release Title
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
              <Type size={15} />
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Modern UI Polish, Avatar Overhaul & Security Patch"
              required
              className="w-full h-12 pl-11 pr-4 bg-[var(--admin-input-bg)] border border-[var(--admin-border)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/15 rounded-2xl text-sm font-medium text-white focus:outline-none transition-all placeholder:text-white/35"
            />
          </div>
        </div>

        {/* Row 3: Description */}
        <div>
          <label className=" text-xs font-bold uppercase tracking-wider text-white/60 mb-1.5 flex items-center gap-1.5">
            <AlignLeft size={12} className="text-[var(--accent)]" /> Overview / Summary
          </label>
          <div className="relative">
            <div className="absolute top-3.5 left-3.5 pointer-events-none text-white/40">
              <AlignLeft size={15} />
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe what changed in this version and why it matters..."
              className="w-full pl-11 pr-4 py-3 bg-[var(--admin-input-bg)] border border-[var(--admin-border)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/15 rounded-2xl text-sm text-white focus:outline-none transition-all leading-relaxed placeholder:text-white/35 custom-scrollbar"
            />
          </div>
        </div>

        {/* Features List */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-white/70 flex items-center gap-1.5">
                <ListPlus size={14} className="text-[var(--accent)]" /> Key Highlights
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/5 border border-white/10 text-white/60">
                {features.length}
              </span>
            </div>
            <button
              type="button"
              onClick={handleAddFeatureRow}
              className="inline-flex items-center gap-1.5 h-8 px-3.5 bg-white/[0.04] hover:bg-white/[0.08] active:scale-95 rounded-xl text-xs font-bold text-[var(--accent)] border border-theme-accent/25 transition-all cursor-pointer shadow-xs"
            >
              <Plus size={13} /> Add Highlight
            </button>
          </div>

          <div className="space-y-2.5">
            {features.map((feat, idx) => (
              <div
                key={idx}
                className="p-3.5 sm:p-4 bg-white/[0.02] border border-[var(--admin-border)] hover:border-white/15 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center gap-3 transition-all"
              >
                <div className="flex items-center gap-2 shrink-0">
                  <span className="w-7 h-7 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-xs font-bold text-white/60 shrink-0">
                    {idx + 1}
                  </span>
                  <span className="sm:hidden text-xs font-medium text-white/50">Feature #{idx + 1}</span>
                </div>
                <input
                  type="text"
                  value={feat.t}
                  onChange={(e) => handleFeatureChange(idx, "t", e.target.value)}
                  placeholder="Feature name..."
                  className="h-11 px-4 rounded-xl bg-[var(--admin-input-bg)] border border-white/10 focus:border-[var(--accent)]/60 text-xs sm:text-sm font-semibold text-white focus:outline-none transition-all placeholder:text-white/30 sm:w-1/3"
                />
                <input
                  type="text"
                  value={feat.d}
                  onChange={(e) => handleFeatureChange(idx, "d", e.target.value)}
                  placeholder="Detailed description of the feature..."
                  className="min-h-11 px-4 rounded-xl bg-[var(--admin-input-bg)] border border-white/10 focus:border-[var(--accent)]/60 text-xs sm:text-sm text-white/85 focus:outline-none flex-1 transition-all placeholder:text-white/30"
                />
                {features.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveFeatureRow(idx)}
                    className="p-2.5 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors shrink-0 self-end sm:self-center cursor-pointer"
                    title="Remove Feature"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-3 border-t border-[var(--admin-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setShowMarkdownPreview(!showMarkdownPreview)}
            className="h-11 px-4 rounded-2xl bg-[var(--admin-input-bg)] hover:bg-white/10 border border-[var(--admin-border)] text-xs font-semibold text-white/80 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <FileCode size={14} />
            <span>{showMarkdownPreview ? "Hide Preview" : "View CHANGELOG.md"}</span>
          </button>

          <button
            type="submit"
            disabled={saving}
            className="h-12 px-6 rounded-2xl bg-[var(--accent)] text-black text-sm font-bold uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-[0_4px_20px_rgba(var(--accent-rgb),0.3)] flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <>
                <Loader size={15} className="text-black" />
                <span>Publishing...</span>
              </>
            ) : (
              <>
                <Rocket size={15} />
                <span>Publish Release v{newVersion}</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* ── Optional Markdown Preview ── */}
      <AnimatePresence>
        {showMarkdownPreview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-[var(--admin-card-bg)] border border-[var(--admin-border)] rounded-2xl p-4 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-white/60 uppercase tracking-wider flex items-center gap-1.5">
                <FileCode size={13} /> CHANGELOG.md
              </span>
              <button
                onClick={handleCopyMarkdown}
                className="text-xs text-[var(--accent)] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
            <pre className="p-3.5 bg-black/50 border border-white/10 rounded-xl text-[11px] font-mono text-white/80 overflow-x-auto custom-scrollbar max-h-60">
              {generateChangelogMarkdown(releases)}
            </pre>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Developer System Notice Broadcaster ── */}
      <div className="bg-[var(--admin-card-bg)] border border-[var(--admin-border)] rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-theme-accent/15 border border-theme-accent/25 flex items-center justify-center text-theme-accent shrink-0">
              <Radio size={15} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--admin-text-primary)]">
                  Developer System Alert Broadcaster
                </h3>
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase bg-theme-accent/15 text-theme-accent border border-theme-accent/25">
                  Live
                </span>
              </div>
              <p className="text-[11px] text-[var(--admin-text-secondary,#a1a1aa)] mt-0.5">
                Send instant developer announcements and maintenance updates directly into System Notifications.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleBroadcastAlert} className="space-y-3 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-8">
              <input
                type="text"
                value={devAlertTitle}
                onChange={(e) => setDevAlertTitle(e.target.value)}
                placeholder="Alert title (e.g. Engine Notice: Database migration completed)"
                className="w-full h-11 px-3.5 rounded-xl bg-[var(--admin-input-bg)] border border-[var(--admin-border)] text-xs text-[var(--admin-text-primary)] placeholder:text-white/30 focus:border-theme-accent/50 focus:outline-none transition-colors"
              />
            </div>
            <div className="sm:col-span-4">
              <select
                value={devAlertBadge}
                onChange={(e) => setDevAlertBadge(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-[var(--admin-input-bg)] border border-[var(--admin-border)] text-xs text-[var(--admin-text-primary)] focus:border-theme-accent/50 focus:outline-none transition-colors cursor-pointer">
                <option value="SYSTEM UPDATE">SYSTEM UPDATE</option>
                <option value="HOTFIX DEPLOYED">HOTFIX DEPLOYED</option>
                <option value="MAINTENANCE">MAINTENANCE</option>
                <option value="ANNOUNCEMENT">ANNOUNCEMENT</option>
                <option value="FEATURE PREVIEW">FEATURE PREVIEW</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <input
              type="text"
              value={devAlertDesc}
              onChange={(e) => setDevAlertDesc(e.target.value)}
              placeholder="Description or notes for admins (e.g. Real-time channels refreshed, no action required)..."
              className="flex-1 h-11 px-3.5 rounded-xl bg-[var(--admin-input-bg)] border border-[var(--admin-border)] text-xs text-[var(--admin-text-primary)] placeholder:text-white/30 focus:border-theme-accent/50 focus:outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={isBroadcastingAlert || !devAlertTitle.trim()}
              className="h-11 px-5 rounded-xl bg-theme-accent/20 hover:bg-theme-accent/30 text-theme-accent border border-theme-accent/35 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-40 cursor-pointer active:scale-95 shadow-xs">
              <Radio size={13} />
              <span>Broadcast Alert</span>
            </button>
          </div>
        </form>
      </div>

      {/* ── Published Releases History ── */}
      <div className="bg-[var(--admin-card-bg)] border border-[var(--admin-border)] rounded-2xl p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white/70 flex items-center gap-1.5">
            <Clock size={13} /> History ({releases.length})
          </h3>
          {loading && <Loader size={13} className="text-[var(--accent)]" />}
        </div>

        <div className="space-y-2">
          {releases.map((rel) => {
            const isExpanded = expandedReleases.has(rel.version);
            return (
              <div
                key={rel.version}
                className={`border rounded-xl p-3 sm:p-3.5 transition-all ${
                  rel.isMajor
                    ? "bg-theme-accent/[0.03] border-theme-accent/30"
                    : "bg-[var(--admin-input-bg)] border-[var(--admin-border)]"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/10 border border-white/20 text-white">
                      v{rel.version}
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-theme-accent/10 border border-theme-accent/20 text-[var(--accent)] uppercase tracking-wider">
                      {rel.badge || "RELEASE"}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                      {rel.title}
                    </h4>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-white/40 font-mono hidden sm:inline">
                      {rel.date}
                    </span>
                    {releases.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDelete(rel.version)}
                        className="p-1 text-white/30 hover:text-red-400 2xl transition-colors cursor-pointer"
                        title="Delete release (-1)"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => toggleReleaseExpand(rel.version)}
                      className="p-1 text-white/40 hover:text-white rounded-2xl transition-colors cursor-pointer"
                    >
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-2.5 pt-2.5 border-t border-white/10 space-y-2">
                    {rel.desc && (
                      <p className="text-xs text-white/70 leading-relaxed">
                        {rel.desc}
                      </p>
                    )}

                    {Array.isArray(rel.steps) && rel.steps.length > 0 && (
                      <div className="space-y-1 pt-1">
                        <div className="grid grid-cols-1 gap-1">
                          {rel.steps.map((step, sIdx) => {
                            const stepTitle = typeof step === "string" ? step : step.t;
                            const stepDesc = typeof step === "string" ? "" : step.d;
                            return (
                              <div
                                key={sIdx}
                                className="p-2 bg-white/[0.02] border border-white/[0.05] rounded-2xl text-xs"
                              >
                                <span className="font-semibold text-white/90">
                                  {stepTitle}
                                </span>
                                {stepDesc && (
                                  <p className="text-[11px] text-white/50 mt-0.5">
                                    {stepDesc}
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ReleaseManagerTab;
