import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

/**
 * DiscardChangesModal
 * Displays a confirmation dialog when a user attempts to close or click outside
 * an article or update that has unsaved changes / is half written.
 */
const DiscardChangesModal = ({
  isOpen,
  onDiscard,
  onKeepEditing,
  title = "Discard Changes?",
  description = "You have unsaved changes that will be lost if you leave. Are you sure you want to discard them?",
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onKeepEditing}
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 12 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
          className="relative w-full max-w-sm bg-[var(--admin-card-bg,#0e0e11)] border border-white/10 rounded-3xl p-5 shadow-2xl z-10 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-sm">
              <AlertTriangle size={18} />
            </div>
            <button
              type="button"
              onClick={onKeepEditing}
              className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>

          <h3 className="text-base font-bold text-white mt-3.5 tracking-tight">
            {title}
          </h3>
          <p className="text-xs text-white/50 mt-1 leading-relaxed">
            {description}
          </p>

          <div className="flex gap-2.5 mt-5">
            <button
              type="button"
              onClick={onKeepEditing}
              className="flex-1 py-2.5 px-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] text-xs font-semibold text-white/80 hover:text-white transition-all cursor-pointer"
            >
              Keep Editing
            </button>
            <button
              type="button"
              onClick={onDiscard}
              className="flex-1 py-2.5 px-3 rounded-xl bg-red-600/90 hover:bg-red-500 text-xs font-bold text-white shadow-lg shadow-red-600/20 transition-all cursor-pointer"
            >
              Discard Changes
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DiscardChangesModal;
