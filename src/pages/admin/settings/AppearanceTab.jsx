import React, { useState } from "react";
import TabHeader from "../../../components/admin/TabHeader";
import { Zap, MessageSquarePlus, Check, Palette, Wand2, RotateCcw, Loader2, ChevronDown } from "lucide-react";
import { Switch } from "../../../components/motion/switch";
import { useTheme, DEFAULT_CUSTOM_THEME, THEMES } from "../../../context/ThemeContext";
import { useAuth } from "../../../context/AuthContext";
import { ColorPicker } from "../../../components/admin/ColorPicker";

// ─── Suggested custom combos ───
const SUGGESTED_COMBOS = [
  { name: "Stealth", bg: "#000000", cardBg: "#0a0a0a", accent: "#ffffff", textPrimary: "#ffffff", textSecondary: "#888888" },
  { name: "Midnight", bg: "#020617", cardBg: "#0f172a", accent: "#3b82f6", textPrimary: "#f8fafc", textSecondary: "#94a3b8" },
  { name: "Lava", bg: "#0a0000", cardBg: "#140505", accent: "#ef4444", textPrimary: "#fca5a5", textSecondary: "#991b1b" },
  { name: "Hacker", bg: "#000000", cardBg: "#050a05", accent: "#22c55e", textPrimary: "#4ade80", textSecondary: "#166534" },
  { name: "Sepia", bg: "#1f1814", cardBg: "#2d231e", accent: "#d97706", textPrimary: "#fef3c7", textSecondary: "#b45309" },
];

const PRESET_COLORS = [
  { name: "Black", hex: "#000000" },
  { name: "Midnight", hex: "#020617" },
  { name: "Darker", hex: "#0a0a0a" },
  { name: "Dark Gray", hex: "#1f2937" },
  { name: "Gray", hex: "#6b7280" },
  { name: "Light Gray", hex: "#d1d5db" },
  { name: "White", hex: "#ffffff" },
  { name: "Red", hex: "#ef4444" },
  { name: "Orange", hex: "#f97316" },
  { name: "Yellow", hex: "#eab308" },
  { name: "Green", hex: "#22c55e" },
  { name: "Cyan", hex: "#06b6d4" },
  { name: "Blue", hex: "#3b82f6" },
  { name: "Indigo", hex: "#6366f1" },
  { name: "Pink", hex: "#ec4899" }
];

const ColorDot = ({ label, value, onChange }) => {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative">
        <select
          value={value?.toLowerCase()}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded-2xl border border-[var(--admin-border)] shadow-inner appearance-none cursor-pointer text-transparent"
          style={{ backgroundColor: value }}
        >
          {!PRESET_COLORS.find(c => c.hex.toLowerCase() === value?.toLowerCase()) && (
            <option value={value?.toLowerCase()} className="text-[var(--admin-text-primary)] bg-[var(--admin-card-bg)]">Custom</option>
          )}
          {PRESET_COLORS.map(c => (
            <option key={c.hex} value={c.hex} className="text-[var(--admin-text-primary)] bg-[var(--admin-card-bg)]">
              {c.name}
            </option>
          ))}
        </select>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none drop-shadow-md">
          <ChevronDown size={12} className="text-white mix-blend-difference" />
        </div>
      </div>
      <span className="text-[8px] font-bold text-[var(--admin-text-secondary)] uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
};

const AppearanceTab = ({
  notificationsBlocked,
  toggleNotificationsBlocked,
  notifPermission,
    feedbackEnabled,
  toggleFeedbackWidget,
  themeId,
  setTheme,
  isNotifLoading,
  isSuperAdminOrAdmin,
}) => {
  const { user, updateUserSettings } = useAuth();
  const { customTheme, applyCustomTheme, persistCustomTheme } = useTheme();
  const allThemes = Object.values(THEMES);

  // Custom theme builder state
  const [showCustom, setShowCustom] = useState(false);
  const base = customTheme || DEFAULT_CUSTOM_THEME;
  const [draft, setDraft] = useState(base);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleThemeSelect = async (id) => {
    setTheme(id);
    if (user) {
      const currentSettings = user.userSettings || {};
      if (currentSettings.activeTheme !== id) {
        await updateUserSettings({ ...currentSettings, activeTheme: id });
      }
    }
  };

  // Custom theme handlers
  const handleColorChange = (key, value) => {
    const next = { ...draft, [key]: value };
    setDraft(next);
    applyCustomTheme(next);
  };

  const applyCombo = (combo) => {
    const next = { ...draft, ...combo, name: combo.name + " Custom" };
    setDraft(next);
    applyCustomTheme(next);
  };

  const handleApplySave = async () => {
    setIsSaving(true);
    const finalTheme = { ...draft, id: "custom", isCustom: true };
    persistCustomTheme(finalTheme);
    const currentSettings = user?.userSettings || {};
    await updateUserSettings({ ...currentSettings, customTheme: finalTheme, activeTheme: "custom" });
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = () => {
    setDraft(base);
    applyCustomTheme(base);
  };

  return (
    <div className="space-y-5">
      {/* ─── Notifications ─── */}
      <TabHeader
        title="Notifications"
        subtitle="Configure notification preferences."
      />
      <div className="p-4 sm:p-5 bg-[var(--admin-card-bg)] border border-[var(--admin-border)] rounded-2xl flex items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-[var(--accent)]" />
            <h4 className="text-xs sm:text-sm font-semibold text-[var(--admin-text-primary)] flex items-center gap-2">
              Enable Notifications
              {isNotifLoading && <span className="w-3 h-3 border-2 border-[var(--admin-border)] border-t-transparent rounded-full animate-spin" />}
            </h4>
          </div>
          <p className="text-[11px] sm:text-xs text-[var(--admin-text-secondary)] leading-relaxed max-w-xl">
            Enable desktop push notifications for new messages and system feedbacks.
          </p>
          {notifPermission === "denied" && (
            <p className="text-[10px] text-red-400 mt-1">
              Notifications are blocked in your browser settings.
            </p>
          )}
        </div>
        <Switch
          checked={!notificationsBlocked}
          onCheckedChange={toggleNotificationsBlocked}
          disabled={isNotifLoading}
        />
      </div>

      <hr className="border-[var(--admin-border)] my-6" />

      {/* ─── Testing Mode ─── */}
      <TabHeader
        title="Testing Mode"
        subtitle="Turn on testing mode to send feedbacks."
      />
      <div className="p-4 sm:p-5 bg-[var(--admin-card-bg)] border border-[var(--admin-border)] rounded-2xl flex items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <MessageSquarePlus size={16} className="text-[var(--accent)]" />
            <h4 className="text-xs sm:text-sm font-semibold text-[var(--admin-text-primary)]">
              Floating Feedback Icon
            </h4>
          </div>
          <p className="text-[11px] sm:text-xs text-[var(--admin-text-secondary)] leading-relaxed max-w-xl">
            Enable the floating feedback icon across public pages and admin dashboard (visible only to logged-in admins & writers).
          </p>
        </div>
        <Switch
          checked={feedbackEnabled}
          onCheckedChange={toggleFeedbackWidget}
        />
      </div>

      <hr className="border-[var(--admin-border)] my-6" />

      {/* ═══════════════════════════════════════════════════ */}
      {/* ─── UNIFIED THEME SECTION ─── */}
      {/* ═══════════════════════════════════════════════════ */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1 mb-4">
          <Palette size={16} className="text-[var(--accent)]" />
          <h3 className="text-sm font-bold text-[var(--admin-text-primary)] tracking-wide">
            Theme
          </h3>
          <span className="text-[8px] font-black uppercase tracking-widest bg-theme-accent/ text-[var(--accent)] px-2 py-0.5 rounded-full border border-theme-accent/">
            Beta
          </span>
        </div>

        {/* All preset themes as swatches in a scrollable row */}
        <div className="p-3 sm:p-4 bg-[var(--admin-card-bg)] border border-[var(--admin-border)] rounded-2xl space-y-3">
          <p className="text-[10px] font-bold text-[var(--admin-text-secondary)] uppercase tracking-widest px-1">
            Presets
          </p>
          <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide">
            {allThemes.map((t) => {
              const isSelected = themeId === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => handleThemeSelect(t.id)}
                  title={t.name}
                  className={` flex flex-col items-center gap-1.5 transition-all ${
                    isSelected ? "scale-100" : "opacity-10 hover:opacity-100 hover:scale-105"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-2xl  shadow-lg relative overflow-hidden ${
                      isSelected
                        ? "border-[var(--accent)]"
                        : "border-transparent"
                    }`}
                    style={{ background: `linear-gradient(135deg, ${t.bg} 50%, ${t.accent} 50%)` }}
                  >
                    {isSelected && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Check size={14} className="text-white drop-shadow-md" strokeWidth={3} />
                      </div>
                    )}
                  </div>
                  <span className={`text-[8px] font-bold max-w-[48px] truncate ${
                    isSelected ? "text-[var(--accent)]" : "text-[var(--admin-text-secondary)]"
                  }`}>
                    {t.name.split(" ")[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── Custom Theme (Admin only, collapsible) ─── */}
        {isSuperAdminOrAdmin && (
          <div className="bg-[var(--admin-card-bg)] border border-[var(--admin-border)] rounded-2xl overflow-visible">
            {/* Toggle header */}
            <button
              onClick={() => setShowCustom(!showCustom)}
              className="w-full flex items-center justify-between p-3 sm:p-4 hover:bg-[var(--admin-input-bg)] transition-colors"
            >
              <div className="flex items-center gap-2">
                <Wand2 size={14} className="text-[var(--accent)]" />
                <span className="text-xs font-bold text-[var(--admin-text-primary)]">
                  Custom Theme
                </span>
                <span className="text-[8px] font-black uppercase tracking-widest text-[var(--admin-text-secondary)] bg-[var(--admin-input-bg)] px-1.5 py-0.5 rounded">
                  Admin
                </span>
              </div>
              <ChevronDown
                size={14}
                className={`text-[var(--admin-text-secondary)] transition-transform ${showCustom ? "rotate-180" : ""}`}
              />
            </button>

            {/* Collapsible body */}
            {showCustom && (
              <div className="px-3 sm:px-4 pb-4 space-y-3 border-t border-[var(--admin-border)]">
                {/* Quick combos */}
                <div className="flex gap-1.5 overflow-x-auto pt-3 pb-1 scrollbar-hide">
                  {SUGGESTED_COMBOS.map((combo) => (
                    <button
                      key={combo.name}
                      onClick={() => applyCombo(combo)}
                      className="flex items-center gap-1 px-2 py-1 rounded-full border border-[var(--admin-border)] hover:border-theme-accent/ transition-colors whitespace-nowrap bg-[var(--admin-input-bg)] shrink-0"
                    >
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: combo.accent }} />
                      <span className="text-[9px] font-semibold text-[var(--admin-text-primary)]">{combo.name}</span>
                    </button>
                  ))}
                </div>

                {/* Color pickers grid */}
                <div className="grid grid-cols-1 gap-1.5">
                  <ColorPicker label="BG" value={draft.bg || "#000000"} onChange={(v) => handleColorChange("bg", v)} />
                  <ColorPicker label="Card" value={draft.cardBg || "#0a0a0a"} onChange={(v) => handleColorChange("cardBg", v)} />
                  <ColorPicker label="Accent" value={draft.accent || "#4bc433"} onChange={(v) => handleColorChange("accent", v)} />
                  <ColorPicker label="Text" value={draft.textPrimary || "#ffffff"} onChange={(v) => handleColorChange("textPrimary", v)} />
                  <ColorPicker label="Muted" value={draft.textSecondary || "#888888"} onChange={(v) => handleColorChange("textSecondary", v)} />
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleApplySave}
                    disabled={isSaving}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-2xl text-xs font-bold transition-all active:scale-95 disabled:opacity-50 text-white"
                    style={{ backgroundColor: "var(--accent)" }}
                  >
                    {isSaving ? <Loader2 size={12} className="animate-spin" /> : saved ? <Check size={12} /> : <Wand2 size={12} />}
                    {isSaving ? "Saving…" : saved ? "Saved!" : "Apply & Save"}
                  </button>
                  <button
                    onClick={handleReset}
                    disabled={isSaving}
                    className="flex items-center justify-center px-3 rounded-2xl border border-[var(--admin-border)] text-[var(--admin-text-secondary)] hover:opacity-80 transition-all active:scale-95 bg-[var(--admin-input-bg)]"
                  >
                    <RotateCcw size={12} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppearanceTab;
