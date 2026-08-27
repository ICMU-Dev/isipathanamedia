import React, { useState, useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MaintenanceBanner = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    // Set target to tomorrow at 12:00 PM
    const now = new Date();
    const tomorrow = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      12,
      0,
      0,
    );

    const calculateTimeLeft = () => {
      const difference = tomorrow - new Date();
      let tl = { hours: 0, minutes: 0, seconds: 0 };

      if (difference > 0) {
        tl = {
          hours:
            Math.floor((difference / (1000 * 60 * 60)) % 24) +
            Math.floor(difference / (1000 * 60 * 60 * 24)) * 24,
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
      return tl;
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return null; // Disabled as per request

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        className="mb-4 sm:mb-6 overflow-hidden rounded-2xl border border-amber-500/20 bg-amber-500/10 backdrop-blur-sm shadow-sm">
        <div className="px-3 py-2 sm:px-4 sm:py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0 p-1.5 sm:p-2 bg-amber-500/20 rounded-2xl">
              <AlertTriangle size={18} className="text-amber-500" />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2 text-[11px] sm:text-xs text-amber-500/90 font-medium truncate">
              <span className="truncate">
                Admin Dashboard under maintenance & optimizing.
              </span>
              <span className="hidden sm:inline text-amber-500/50">•</span>
              <span className="opacity-80 truncate">Issues may occur.</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-[11px] sm:text-xs font-mono text-amber-500 font-semibold bg-amber-500/10 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-2xl border border-amber-500/20 shadow-inner">
              <span className="w-4 sm:w-5 text-center">
                {String(timeLeft.hours).padStart(2, "0")}
              </span>
              :
              <span className="w-4 sm:w-5 text-center">
                {String(timeLeft.minutes).padStart(2, "0")}
              </span>
              :
              <span className="w-4 sm:w-5 text-center">
                {String(timeLeft.seconds).padStart(2, "0")}
              </span>
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="p-1 sm:p-1.5 hover:bg-amber-500/20 rounded-2xl transition-colors text-amber-500/70 hover:text-amber-500"
              aria-label="Close banner">
              <X size={16} className="sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MaintenanceBanner;
