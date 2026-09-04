import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, X, Share } from "lucide-react";
import { usePWAInstall } from "../../hooks/usePWAInstall";
import { useAuth } from "../../context/AuthContext";
import { isAdmin, isWriter, isBroadcaster } from "../../utils/roles";

const PWAInstallModal = () => {
  const { user } = useAuth();
  const { isInstallable, isStandalone, isIOS, isAndroid, promptInstall } =
    usePWAInstall();
  const [isOpen, setIsOpen] = useState(false);
  const [installing, setInstalling] = useState(false);

  const role = user?.role;
  const isAuthorized = isAdmin(role) || isWriter(role) || isBroadcaster(role);

  // Allow opening via global custom event from any navbar or button
  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
    };
    window.addEventListener("open_pwa_install", handleOpen);
    return () => window.removeEventListener("open_pwa_install", handleOpen);
  }, []);

  useEffect(() => {
    // Show one-time prompt modal after 2.5 seconds if user is logged in, app is installable, and not dismissed
    if (!user || !isAuthorized || isStandalone) return;

    try {
      const dismissed =
        sessionStorage.getItem("icmu_pwa_dismissed") === "true";
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
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
          onClick={handleDismiss}
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ type: "spring", damping: 24, stiffness: 300 }}
          className="relative w-full max-w-md bg-[#0c0c0f] border border-white/[0.1] rounded-3xl shadow-2xl overflow-hidden p-6 z-10 text-center"
          onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors cursor-pointer">
            <X size={16} />
          </button>

          {/* App Logo */}
          <div className="w-16 h-16 rounded-2xl p-2 bg-white/10 border border-white/10 mx-auto mb-3.5 flex items-center justify-center shadow-lg">
            <img
              src="/favicon-96x96.png"
              alt="ICMU Admin Logo"
              className="w-12 h-12 object-contain"
            />
          </div>

          <h3 className="text-lg font-bold text-white tracking-tight">
            Install ICMU Admin App
          </h3>
          <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed max-w-xs mx-auto">
            Install for fast 1-tap launch, fullscreen workspace, and smoother
            mobile navigation.
          </p>

          {/* iOS Instructions or Fallback or Native Install Button */}
          {isIOS && !isInstallable ? (
            <div className="mt-5 p-3.5 bg-white/[0.03] border border-white/[0.07] rounded-2xl text-left text-xs text-white/70 space-y-1.5">
              <p className="font-semibold text-white flex items-center gap-1.5">
                <Share size={14} className="text-[var(--accent)]" /> How to install on iOS Safari:
              </p>
              <p className="text-[11px] text-white/50 leading-relaxed">
                1. Tap the <strong className="text-white">Share</strong> icon at bottom of Safari.
                <br />
                2. Scroll down and tap <strong className="text-white">Add to Home Screen</strong> ➕.
              </p>
            </div>
          ) : !isInstallable ? (
            <div className="mt-5 p-3.5 bg-white/[0.03] border border-white/[0.07] rounded-2xl text-left text-xs text-white/70 space-y-1.5">
              <p className="font-semibold text-white flex items-center gap-1.5">
                <Download size={14} className="text-[var(--accent)]" /> App Installation:
              </p>
              <p className="text-[11px] text-white/50 leading-relaxed">
                Direct installation is not supported by this browser. You can install via your browser menu (<strong className="text-white">Install App</strong> or <strong className="text-white">Add to Home screen</strong>) or open this page in Google Chrome.
              </p>
            </div>
          ) : (
            <div className="mt-6 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={handleInstall}
                disabled={installing}
                className="w-full py-3.5 rounded-2xl btn-theme-primary text-xs font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform disabled:opacity-50 cursor-pointer">
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
                className="w-full py-2.5 text-xs text-white/40 hover:text-white/70 font-medium transition-colors cursor-pointer">
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
