import React from "react";
import { CheckCircle2, Layers } from "lucide-react";

const ArticlePublishStep = ({
  formData,
  isAnonymous,
  setIsAnonymous,
  id,
  user,
}) => {
  return (
    <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="p-4 md:p-8 border-b border-theme-base bg-[#050505]/50 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-theme-accent/5 flex items-center justify-center text-theme-accent shrink-0">
          <CheckCircle2 size={18} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-theme-primary">Final Review</h2>
          <p className="text-theme-primary opacity-40 text-xs font-medium">
            Verify details before publishing or submitting for review.
          </p>
        </div>
      </div>

      <div className="p-4 md:p-8 flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-center max-w-6xl mx-auto w-full">
        {/* Preview Card */}
        <div className="bg-[#050505] rounded-3xl border border-theme-base overflow-hidden shadow-2xl relative w-full max-w-sm mx-auto group">
          <div className="w-full aspect-video bg-theme-card overflow-hidden border-b border-white/[0.06] ">
            <img
              src={formData.image}
              className="w-full h-full object-cover opacity-80"
              alt="Preview"
            />
          </div>
          <div className="p-6">
            <div className="text-[10px] font-bold tracking-widest text-theme-accent uppercase mb-2">
              {formData.category}
            </div>
            <h3 className="text-xl font-bold text-theme-primary leading-tight mb-2 line-clamp-2">
              {formData.title}
            </h3>
            <p className="text-xs text-theme-primary opacity-50 mb-4 line-clamp-2">
              {formData.content.replace(/<[^>]*>?/gm, "")}
            </p>
            <div className="flex items-center justify-between border-t border-theme-base pt-4">
              <span className="text-[10px] font-bold text-theme-primary opacity-40 uppercase tracking-widest">
                {formData.date}
              </span>
              <span className="text-[10px] font-bold text-theme-primary opacity-40 uppercase tracking-widest text-right">
                By{" "}
                {isAnonymous
                  ? "Isipathana College Media Unit"
                  : id
                    ? formData.author || "Isipathana College Media Unit"
                    : user?.username ||
                      user?.full_name ||
                      user?.name ||
                      "Admin"}
              </span>
            </div>
          </div>
        </div>

        {/* Publish Settings */}
        <div className="space-y-8 max-w-md mx-auto w-full">
          <div className="bg-[#050505] p-6 rounded-3xl border border-theme-base">
            <h3 className="text-sm font-bold text-theme-primary uppercase tracking-widest mb-6 flex items-center gap-2">
              <Layers size={14} className="text-theme-accent" /> Author Settings
            </h3>
            <label className="flex items-start gap-4 cursor-pointer group">
              <div className="relative flex items-center mt-0.5 shrink-0">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="w-12 h-6 bg-[var(--admin-border)] opacity-80 rounded-full peer-checked:bg-[var(--accent)] transition-colors border border-theme-base peer-checked:border-theme-accent/50"></div>
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-6 transition-transform shadow-sm"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold text-theme-primary group-hover:text-theme-accent transition-colors">
                  Post Anonymously
                </span>
                <span className="text-xs text-theme-primary opacity-40 mt-1 leading-relaxed">
                  Hide your personal identity. The article will be published
                  under the generic "Isipathana College Media Unit" name.
                </span>
              </div>
            </label>
            <div className="mt-6 p-4 bg-theme-accent/5  border border-theme-accent/10 rounded-2xl flex items-center gap-3 transition-all duration-300">
              <div className="w-8 h-8 rounded-full bg-theme-accent/20 flex items-center justify-center text-theme-accent font-bold text-xs shrink-0">
                {isAnonymous
                  ? "I"
                  : String(
                      id
                        ? formData.author || "Isipathana College Media Unit"
                        : user?.username ||
                            user?.full_name ||
                            user?.name ||
                            "A",
                    )
                      .charAt(0)
                      .toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-theme-primary opacity-60 uppercase tracking-widest truncate">
                  Publishing As
                </div>
                <div className="text-sm font-bold text-theme-accent truncate">
                  {isAnonymous
                    ? "Isipathana College Media Unit"
                    : id
                      ? formData.author || "Isipathana College Media Unit"
                      : user?.username ||
                        user?.full_name ||
                        user?.name ||
                        user?.index_number ||
                        "Admin"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticlePublishStep;
