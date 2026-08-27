import React from "react";
import { Tag as TagIcon, AlertCircle } from "lucide-react";
import TagInput from "./TagInput";

const ArticleCategoryStep = ({
  formData,
  setFormData,
  errors,
  setErrors,
  canEditMetadata,
}) => {
  return (
    <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="p-4 md:p-8 border-b border-theme-base bg-[#050505]/50 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-theme-accent/5 flex items-center justify-center text-theme-accent shrink-0">
          <TagIcon size={18} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-theme-primary">
            Categorization
          </h2>
          <p className="text-theme-primary opacity-40 text-xs font-medium">
            Add metadata so readers can discover your article.
          </p>
        </div>
      </div>
      <div className="p-4 md:p-8 flex-1 flex flex-col justify-center items-center">
        <div className="w-full max-w-lg space-y-6 md:space-y-8 bg-[#050505] p-6 md:p-8 rounded-3xl border border-white/[0.06] ">
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-theme-primary opacity-50 uppercase tracking-widest ml-1">
              Category *
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => {
                setFormData({ ...formData, category: e.target.value });
                if (errors.category)
                  setErrors((p) => ({ ...p, category: null }));
              }}
              disabled={!canEditMetadata}
              placeholder="e.g. Events, Sports, Tech"
              className={`w-full bg-theme-card border ${errors.category ? "border-red-600/50" : "border-theme-base"} rounded-2xl px-5 py-4 text-sm text-theme-primary focus:outline-none focus:border-theme-accent/40 transition-all shadow-inner disabled:opacity-50 disabled:cursor-not-allowed`}
            />
            {errors.category && (
              <p className="text-red-400 text-xs ml-1 flex items-center gap-1 mt-1">
                <AlertCircle size={12} />
                {errors.category}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-theme-primary opacity-50 uppercase tracking-widest ml-1">
              Social Media Upload Date (FB / IG) *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              disabled={!canEditMetadata}
              className="w-full bg-theme-card border border-theme-base rounded-2xl px-5 py-4 text-sm text-theme-primary focus:outline-none focus:border-theme-accent/40 transition-all shadow-inner [color-scheme:dark] disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          <div className="space-y-2">
            <TagInput
              tags={formData.tags || []}
              setTags={(tags) => setFormData((p) => ({ ...p, tags }))}
              disabled={!canEditMetadata}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleCategoryStep;
