import React, { useState } from "react";
import {
  Download,
  Smartphone,
  CheckCircle2,
  Share,
  HelpCircle,
  X,
  Monitor,
} from "lucide-react";
import { usePWAInstall } from "../../hooks/usePWAInstall";

const PWAInstallCard = () => {
  const { isInstallable, isStandalone, isIOS, promptInstall } = usePWAInstall();
  const [installing, setInstalling] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const handleInstallClick = async () => {
    if (isInstallable) {
      setInstalling(true);
      const success = await promptInstall();
      setInstalling(false);
      if (success) {
        setInstalledSuccess(true);
      }
    } else {
      setShowGuide((prev) => !prev);
    }
  };

  return (
    <div className="p-4 sm:p-5 bg-white/[0.02] border border-white/[0.06] rounded-2xl flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left: App Icon & Info */}
        <div className="flex items-center gap-3.5 min-w-0 ">
          <div className="p-3 bg-white rounded-2xl border border-white/5 shrink-0">
            <img
              src="/favicon-96x96.png"
              alt="ICMU Web App"
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-contain"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-xs sm:text-sm font-semibold text-white">
                Install ICMU Admin App
              </h4>
              {isStandalone || installedSuccess ? (
                <span className="px-2 py-0.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={10} /> Installed
                </span>
              ) : null}
            </div>
            <p className="text-[11px] sm:text-xs text-white/40 leading-relaxed mt-0.5 max-w-xl">
              {isStandalone || installedSuccess
                ? "Running in standalone app mode with 1-tap launcher and fullscreen UI."
                : "Install the ICMU Admin Portal as a standalone app on your phone or desktop."}
            </p>
          </div>
        </div>

        {/* Right: Action Button */}
        <div className="w-full sm:w-auto shrink-0">
          {isStandalone || installedSuccess ? (
            <div className="flex items-center justify-center gap-1.5 text-emerald-400 text-xs font-semibold px-3 py-2 bg-emerald-500/5 rounded-2xl border border-emerald-500/15">
              <CheckCircle2 size={14} /> Active Application
            </div>
          ) : isInstallable ? (
            <button
              type="button"
              onClick={handleInstallClick}
              disabled={installing}
              className="w-full sm:w-auto min-h-[38px] px-4 py-2 text-xs font-bold rounded-2xl btn-theme-primary flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50">
              <Download size={14} />
              {installing ? "Installing..." : "Install App"}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleInstallClick}
              className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-white/80 bg-white/[0.06] hover:bg-white/[0.1] borderborder-white/[0.06]  rounded-2xl flex items-center justify-center gap-1.5 transition-colors">
              <Download size={13} className="text-[var(--accent)]" />
              <span>Install Guide</span>
              <HelpCircle size={12} className="text-white/40 ml-0.5" />
            </button>
          )}
        </div>
      </div>

      {/* Manual Install Guide Popup / Drawer */}
      {showGuide && !isStandalone && !installedSuccess && (
        <div className="p-4 bg-white/[0.03] borderborder-white/[0.06]  rounded-2xl text-xs space-y-3 animate-fade-in relative">
          <button
            type="button"
            onClick={() => setShowGuide(false)}
            className="absolute top-3 right-3 text-white/30 hover:text-white transition-colors">
            <X size={14} />
          </button>

          <h5 className="font-semibold text-white flex items-center gap-1.5 text-xs">
            <HelpCircle size={14} className="text-[var(--accent)]" />
            How to Install Manually:
          </h5>

          {isIOS ? (
            <div className="space-y-1.5 text-white/70 text-[11px]">
              <p className="flex items-center gap-1.5 font-medium text-white">
                <Share size={12} className="text-[var(--accent)]" /> Safari (iOS
                / iPadOS):
              </p>
              <ol className="list-decimal list-inside space-y-1 text-white/50 pl-1">
                <li>
                  Tap the <strong className="text-white">Share</strong> button ⎋
                  at bottom of Safari.
                </li>
                <li>
                  Scroll down and tap{" "}
                  <strong className="text-white">Add to Home Screen</strong> ➕.
                </li>
                <li>
                  Tap <strong className="text-white">Add</strong> in top right.
                </li>
              </ol>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] text-white/70">
              <div className="space-y-1 p-2.5 bg-black/30 rounded-2xl border border-white/[0.06] ">
                <p className="font-medium text-white flex items-center gap-1.5">
                  <Monitor size={12} className="text-[var(--accent)]" /> Chrome
                  / Edge (Desktop):
                </p>
                <ol className="list-decimal list-inside space-y-1 text-white/50">
                  <li>
                    Look for the{" "}
                    <strong className="text-white">Install icon ⊕</strong> on
                    right side of address bar.
                  </li>
                  <li>
                    OR click browser menu{" "}
                    <strong className="text-white">(⋮)</strong> →{" "}
                    <strong className="text-white">
                      Install Isipathana Media
                    </strong>
                    .
                  </li>
                </ol>
              </div>

              <div className="space-y-1 p-2.5 bg-black/30 rounded-2xl border border-white/[0.06] ">
                <p className="font-medium text-white flex items-center gap-1.5">
                  <Smartphone size={12} className="text-[var(--accent)]" />{" "}
                  Chrome / Android:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-white/50">
                  <li>
                    Tap the browser menu{" "}
                    <strong className="text-white">(⋮)</strong> at top right.
                  </li>
                  <li>
                    Tap <strong className="text-white">Install app</strong> or{" "}
                    <strong className="text-white">Add to Home screen</strong>.
                  </li>
                </ol>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PWAInstallCard;
