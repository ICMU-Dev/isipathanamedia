import React, { useEffect } from "react";
import { CheckCircle2, AlertTriangle, Info } from "lucide-react";

/**
 * Reusable Toast Component
 *
 * @param {Object} toast - Toast object containing { type, message, detail, duration }
 * @param {Function} onDismiss - Callback fired when toast is closed or expires
 */
const Toast = ({ toast, onDismiss }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => onDismiss(), toast.duration || 5000);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  const styles = {
    success: {
      class: "bg-green-500/10 border-green-500/30 text-green-400",
      icon: <CheckCircle2 size={20} />,
    },
    error: {
      class: "bg-red-600/10 border-red-600/30 text-red-400",
      icon: <AlertTriangle size={20} />,
    },
    warning: {
      class: "bg-amber-500/10 border-amber-500/30 text-amber-400",
      icon: <AlertTriangle size={20} />,
    },
    info: {
      class: "bg-blue-500/10 border-blue-500/30 text-blue-400",
      icon: <Info size={20} />,
    },
  };

  const currentStyle = styles[toast.type] || styles.info;

  return (
    <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] w-max max-w-[90vw] animate-fade-in-up transition-all duration-300">
      <div
        className={`relative flex items-center gap-3 px-6 py-4 rounded-full border shadow-2xl backdrop-blur-sm ${currentStyle.class}`}>
        <div className="shrink-0">{currentStyle.icon}</div>
        <div className="flex flex-col pr-8">
          <p className="font-sans text-xs md:text-sm font-semibold tracking-wide whitespace-nowrap">
            {toast.message}
          </p>
          {toast.detail && (
            <p className="font-sans text-[10px] mt-1 opacity-70 whitespace-nowrap">
              {toast.detail}
            </p>
          )}
        </div>
        <button
          onClick={onDismiss}
          className="absolute right-4 text-white/30 hover:text-white/80 transition-colors text-lg leading-none"
          aria-label="Dismiss notification">
          ×
        </button>
      </div>
    </div>
  );
};

export default Toast;
