import React from "react";
import { Link as LinkIcon, RefreshCw, Save } from "lucide-react";

const UpdateFormSection = ({
  formData,
  setFormData,
  link,
  setLink,
  canEditMetadata,
  extracting,
  saving,
  isEditing,
  extractData,
  handleSave,
  navigate,
  onCancel,
}) => {
  return (
    <div className="w-full flex flex-col flex-1 p-1 bg-transparent relative">
      <div className="flex-1 flex flex-col justify-center space-y-6 md:space-y-10 custom-scrollbar">
        {/* Caption Section */}
        <div className="space-y-3 flex-1 flex flex-col min-h-[180px] md:min-h-[280px]">
          <label className="text-[10px] font-bold text-theme-primary opacity-40 uppercase tracking-widest ml-1">
            Caption / Description *
          </label>
          <textarea
            value={formData.content}
            onChange={(e) =>
              setFormData({ ...formData, content: e.target.value })
            }
            disabled={!canEditMetadata}
            placeholder="What's happening?"
            className="flex-1 bg-[var(--admin-input-bg)] border border-theme-base rounded-2xl px-4 py-4 md:px-5 md:py-5 text-sm text-theme-primary focus:outline-none focus:border-theme-accent/40 resize-none custom-scrollbar leading-relaxed disabled:opacity-50"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 pt-4 border-t border-white/[0.06]  flex gap-3">
        <button
          type="button"
          onClick={onCancel || (() => navigate(-1))}
          disabled={saving || extracting}
          className="flex-[0.4] px-3 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-[13px] font-semibold transition-colors disabled:opacity-50 disabled:pointer-events-none cursor-pointer">
          Cancel
        </button>
        {canEditMetadata && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-3 rounded-2xl bg-[var(--accent)] text-black hover:scale-[1.02] active:scale-95 text-[13px] font-bold disabled:opacity-50 transition-all shadow-[0_0_20px_rgba(var(--accent-rgb),0.15)]">
            {saving ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}
            {saving
              ? "Saving..."
              : isEditing
                ? "Save Changes"
                : "Publish Update"}
          </button>
        )}
      </div>
    </div>
  );
};

export default UpdateFormSection;
