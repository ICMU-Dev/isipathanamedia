import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, Sparkles, Clock } from "lucide-react";

const ChangelogModal = ({ isOpen, onClose, log, data }) => {
  // Support both 'log' and 'data' props for flexibility
  const currentData = log || data;

  // ESC key listener to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const title = currentData?.title || "System Update";
  const subtitle =
    currentData?.subtitle || currentData?.badge || "Major Update";
  const description = currentData?.desc || currentData?.description || "";
  const date = currentData?.date || "";
  const steps = currentData?.steps || [];
  const isMajor = currentData?.isMajor ?? true;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12, ease: "easeOut" }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md"
          onClick={onClose}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="bg-[#0c0c0e]/20 backdrop-blur-sm border border-white/5 rounded-2xl sm:rounded-2xl p-4 sm:p-5 w-[90vw] max-w-md relative shadow-[0_25px_70px_-15px_rgba(0,0,0,0.95)] max-h-[70vh] sm:max-h-[78vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center text-white/40 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all z-10 active:scale-95"
              aria-label="Close modal">
              <X size={14} />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-3.5 shrink-0 pr-8">
              <div
                className={`p-2.5 rounded-2xl border shrink-0 ${
                  isMajor
                    ? "bg-theme-accent/5 border-theme-accent/20 text-[var(--accent)]"
                    : "bg-purple-500/10 border-purple-500/20 text-purple-400"
                }`}>
                {isMajor ? <Zap size={18} /> : <Sparkles size={18} />}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[9px] font-bold text-[var(--accent)] uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-theme-accent/5 border border-theme-accent/20">
                    {subtitle}
                  </span>
                  {date && (
                    <span className="text-[9px] text-white/30 flex items-center gap-1 font-mono">
                      <Clock size={10} />
                      {date}
                    </span>
                  )}
                </div>
                <h2 className="text-sm sm:text-base font-bold text-white tracking-tight mt-1 truncate">
                  {title}
                </h2>
              </div>
            </div>

            {/* Modal Content Scrollable Area */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
              {/* Main Description */}
              {description && (
                <p className="text-xs text-white/70 leading-relaxed bg-white/[0.02] border border-white/[0.06]  p-3 rounded-2xl">
                  {description}
                </p>
              )}

              {/* Highlights / Steps list */}
              {steps && steps.length > 0 && (
                <div className="space-y-2 pt-0.5">
                  <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-0.5">
                    Key Highlights & Features
                  </h3>
                  <div className="space-y-2">
                    {steps.map((step, idx) => {
                      const stepTitle =
                        typeof step === "string" ? step : step.t;
                      const stepDesc = typeof step === "string" ? "" : step.d;

                      return (
                        <div
                          key={idx}
                          className="flex items-start gap-2.5 p-2.5 bg-white/[0.025] hover:bg-white/[0.045] border-l-2 border-l-theme-accent/50 rounded-r-xl rounded-l-sm transition-colors">
                          <div className="w-4 h-4 rounded-full bg-theme-accent/15 border border-theme-accent/30 text-[var(--accent)] flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5">
                            {idx + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-semibold text-white/90">
                              {stepTitle?.replace(/^\d+\.\s*/, "")}
                            </h4>
                            {stepDesc && (
                              <p className="text-[11px] text-white/50 leading-relaxed mt-0.5">
                                {stepDesc}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 mt-2 border-t border-white/[0.06]  shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 bg-[var(--accent)] text-black rounded-2xl font-bold text-xs uppercase tracking-wider hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_4px_16px_rgba(var(--accent-rgb),0.25)]">
                Got it
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChangelogModal;
export { ChangelogModal as ArticleSystemModal };
