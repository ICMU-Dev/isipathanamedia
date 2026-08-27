import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Download,
  X,
  Smartphone,
  Monitor,
  CheckCircle2,
  Share,
} from "lucide-react";
import { usePWAInstall } from "../../hooks/usePWAInstall";
import { useAuth } from "../../context/AuthContext";
import MainLogos from "../../assets/main-logos.png";

const PWAInstallModal = () => {
  const { user } = useAuth();
  const { isInstallable, isStandalone, isIOS, isAndroid, promptInstall } = usePWAInstall();
  const [isOpen, setIsOpen] = useState(false);
  const [installing, setInstalling] = useState(false);

  const role = user?.role?.toLowerCase();
  const isAuthorized =
    role === "admin" ||
    role === "super-admin" ||
    role === "superadmin" ||
    role === "super_admin" ||
    role === "writer";

  useEffect(() => {
    // Show one-time prompt modal after 2 seconds if user is logged in, app is installable, and not dismissed
    if (!user || !isAuthorized || isStandalone) return;

    try {
      const dismissed = sessionStorage.getItem("icmu_pwa_dismissed") === "true";
      if (!dismissed && (isInstallable || isIOS || isAndroid)) {
        const timer = setTimeout(() => setIsOpen(true), 2500);
        return () => clearTimeout(timer);
      }
    } catch (e) {}
  }, [user, isAuthorized, isInstallable, isIOS, isAndroid, isStandalone]);

  const handleDismiss = () => {
    try {
      sessionStorage.setItem("icmu_pwa_dismissed", "true");
    } catch (e) {}
    setIsOpen(false);
  };

  const handleInstall = async () => {
    setInstalling(true);
    const success = await promptInstall();
    setInstalling(false);
    if (success) {
      setIsOpen(false);
    }
  };

  if (!isOpen || !user || !isAuthorized || isStandalone) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/75 backdrop-blur-sm"
          onClick={handleDismiss}
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ type: "spring", damping: 24, stiffness: 300 }}
          className="relative w-full max-w-md bg-[var(--admin-card-bg)]   border border-white/[0.12] rounded-3xl shadow-2xl overflow-hidden p-6 z-10 text-center"
          onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-2 text-white/40 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors">
            <X size={16} />
          </button>

          {/* App Logo */}
          <img
            src="/favicon-96x96.png"
            alt="ICMU Admin Logo"
            className="w-16 h-16 rounded-2xl p-2 bg-white object-cover mx-auto mb-4 border border-white/5shadow-xl"
          />

          <h3 className="text-lg font-bold text-white tracking-tight">
            Install ICMU Admin App
          </h3>
          <p className="text-xs text-white/50 mt-1.5 leading-relaxed max-w-xs mx-auto">
            Add the Isipathana Media Admin to your home screen for fast 1-tap
            launch, fullscreen workspace, and mobile optimization.
          </p>

          {/* iOS Instructions or Install Button */}
          {isIOS && !isInstallable ? (
            <div className="mt-5 p-3.5 bg-white/[0.03] border border-white/[0.07] rounded-2xl text-left text-xs text-white/70 space-y-1.5">
              <p className="font-semibold text-white flex items-center gap-1.5">
                <Share size={14} className="text-[var(--accent)]" /> How to
                install on iOS Safari:
              </p>
              <p className="text-[11px] text-white/50 leading-relaxed">
                1. Tap the <strong className="text-white">Share</strong> icon at
                bottom of Safari.
                <br />
                2. Scroll down and tap{" "}
                <strong className="text-white">Add to Home Screen</strong> ➕.
              </p>
            </div>
          ) : (
            <div className="mt-6 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={handleInstall}
                disabled={installing}
                className="w-full py-3.5 rounded-2xl btn-theme-primary text-xs font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform disabled:opacity-50">
                {installing ? (
                  <span>Installing...</span>
                ) : (
                  <>
                    <Download size={15} />
                    Install Admin App
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDismiss}
                className="w-full py-2.5 text-xs text-white/40 hover:text-white/70 font-medium transition-colors">
                Maybe Later
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PWAInstallModal;
