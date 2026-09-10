/* global __APP_VERSION__, __COMMIT_HASH__ */
import React, { useState } from "react";
import { motion } from "framer-motion";
import packageJson from "../../../../package.json";
import { useTheme } from "../../../context/ThemeContext";
import { usePWAInstall } from "../../../hooks/usePWAInstall";
import {
  Download,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.05,
    },
  },
};

const textFadeUpVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const logoVariants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.45,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const AboutTab = () => {
  const { theme } = useTheme();
  const { isInstallable, isStandalone, promptInstall } = usePWAInstall();
  const [installing, setInstalling] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);
  const [animKey, setAnimKey] = useState(() => Date.now());

  const handleInstallClick = async () => {
    if (isInstallable) {
      setInstalling(true);
      const success = await promptInstall();
      setInstalling(false);
      if (success) {
        setInstalledSuccess(true);
        return;
      }
    }
    // When install guide is clicked or install prompt needs manual instructions, open the PWA install modal with device logic
    window.dispatchEvent(new CustomEvent("open_pwa_install"));
  };

  const triggerFeedback = () => {
    window.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "F",
        ctrlKey: true,
        shiftKey: true,
        bubbles: true,
      })
    );
  };

  const rawVersion =
    packageJson?.version ||
    (typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "2.0.0");
  const version = rawVersion.startsWith("v") ? rawVersion.slice(1) : rawVersion;
  const buildHash = typeof __COMMIT_HASH__ !== "undefined" ? __COMMIT_HASH__ : "4ed1f29";

  return (
    <motion.div
      key={animKey}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full flex flex-col items-center py-4 sm:py-6 px-4 select-none"
    >
      {/* ── Center Identity Section ── */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-lg mx-auto">
        <motion.div variants={logoVariants} className="relative group">
          <img
            key={animKey}
            src={`/outlined-logo.svg?t=${animKey}`}
            alt="ICMU Logo"
            onClick={() => setAnimKey(Date.now())}
            title="Click to replay animation"
            style={{
              filter: `drop-shadow(0 0 18px rgba(var(--accent-rgb, 0, 255, 0), 0.35))`,
            }}
            className="w-24 h-24 sm:w-28 sm:h-28 object-contain mx-auto transition-transform duration-500 group-hover:scale-105 cursor-pointer active:scale-95"
          />
        </motion.div>

        <motion.h2
          variants={textFadeUpVariants}
          className="text-base sm:text-lg font-black tracking-wider text-white uppercase text-center mt-5 leading-tight"
        >
          ISIPATHANA COLLEGE
        </motion.h2>

        <motion.h3
          variants={textFadeUpVariants}
          className="text-xs sm:text-sm font-medium tracking-[0.25em] text-white/80 uppercase text-center mt-1"
        >
          MEDIA UNIT
        </motion.h3>

        {/* Badges */}
        <motion.div
          variants={textFadeUpVariants}
          className="flex items-center justify-center gap-2.5 mt-3.5 flex-wrap"
        >
          <span
            style={{
              backgroundColor: "rgba(var(--accent-rgb, 0, 255, 0), 0.08)",
              borderColor: "rgba(var(--accent-rgb, 0, 255, 0), 0.5)",
              color: "var(--accent, #00ff00)",
            }}
            className="px-3 py-0.5 border rounded-full text-xs font-mono font-medium tracking-wide transition-all"
          >
            v{version}
          </span>
          <span
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.06)",
              borderColor: "rgba(255, 255, 255, 0.12)",
            }}
            className="px-3 py-0.5 border rounded-full text-xs font-mono font-medium text-white/80 tracking-wide"
          >
            Build: {buildHash}
          </span>
        </motion.div>
      </div>

      {/* ── Cards Section ── */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 max-w-2xl mx-auto mt-6 sm:mt-8 w-full">
        {/* Card 1: PWA Install App */}
        <motion.div
          variants={cardVariants}
          style={{
            backgroundColor: "var(--admin-card-bg, #0e0e10)",
            borderColor: "var(--admin-border, rgba(255, 255, 255, 0.05))",
          }}
          className="rounded-2xl border p-5 sm:p-6 shadow-xl flex flex-col justify-between transition-all hover:border-[var(--accent)]/30 hover:shadow-2xl"
        >
          <div>
            <motion.h4
              variants={textFadeUpVariants}
              className="text-xs sm:text-[13px] font-black tracking-wider text-white uppercase"
            >
              INSTALL ICMU ADMIN APP
            </motion.h4>
            <motion.p
              variants={textFadeUpVariants}
              style={{ color: "var(--admin-text-secondary, #a1a1aa)" }}
              className="text-xs text-white/50 mt-2.5 leading-relaxed"
            >
              {isStandalone || installedSuccess
                ? "Running in standalone app mode with 1-tap launcher and fullscreen UI."
                : "Install the ICMU Admin Portal as a standalone app on your phone or desktop."}
            </motion.p>
          </div>

          <div className="mt-4 pt-1">
            {isStandalone || installedSuccess ? (
              <span
                style={{
                  backgroundColor: "rgba(var(--accent-rgb, 0, 255, 0), 0.08)",
                  borderColor: "rgba(var(--accent-rgb, 0, 255, 0), 0.4)",
                  color: "var(--accent, #00ff00)",
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-medium"
              >
                <CheckCircle2 size={11} /> Active Application
              </span>
            ) : isInstallable ? (
              <button
                type="button"
                onClick={handleInstallClick}
                disabled={installing}
                style={{
                  backgroundColor: "rgba(var(--accent-rgb, 0, 255, 0), 0.08)",
                  borderColor: "rgba(var(--accent-rgb, 0, 255, 0), 0.4)",
                  color: "var(--accent, #00ff00)",
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-medium transition-all hover:brightness-125 cursor-pointer disabled:opacity-50 active:scale-95"
              >
                <Download size={11} />
                <span>{installing ? "Installing..." : "Install App"}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleInstallClick}
                style={{
                  backgroundColor: "rgba(var(--accent-rgb, 0, 255, 0), 0.08)",
                  borderColor: "rgba(var(--accent-rgb, 0, 255, 0), 0.4)",
                  color: "var(--accent, #00ff00)",
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-medium hover:brightness-125 transition-all cursor-pointer"
              >
                <Download size={11} />
                <span>Install Guide</span>
                <HelpCircle size={10} className="opacity-50 ml-0.5 text-white/60" />
              </button>
            )}
          </div>
        </motion.div>

        {/* Card 2: Suggestion or Bug */}
        <motion.div
          variants={cardVariants}
          onClick={triggerFeedback}
          style={{
            backgroundColor: "var(--admin-card-bg, #0e0e10)",
            borderColor: "var(--admin-border, rgba(255, 255, 255, 0.05))",
          }}
          className="rounded-2xl border p-5 sm:p-6 shadow-xl flex flex-col justify-between transition-all hover:border-[var(--accent)]/30 hover:shadow-2xl cursor-pointer group"
        >
          <div>
            <motion.h4
              variants={textFadeUpVariants}
              className="text-xs sm:text-[13px] font-black tracking-wider text-white uppercase transition-colors group-hover:text-[var(--accent)]"
            >
              HAVE A SUGGESTION OR FOUND A BUG?
            </motion.h4>
            <motion.p
              variants={textFadeUpVariants}
              style={{ color: "var(--admin-text-secondary, #a1a1aa)" }}
              className="text-xs text-white/50 mt-2.5 leading-relaxed"
            >
              Use the feedback button bottom-right corner on any admin page, or press Ctrl+Shift+F to open the feedback form instantly.
            </motion.p>
          </div>
        </motion.div>
      </div>

      {/* ── Footer ── */}
      <motion.div
        variants={textFadeUpVariants}
        className="relative z-10 mt-8 sm:mt-10 text-center select-none pb-2"
      >
        <motion.p
          variants={textFadeUpVariants}
          className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40"
        >
          NO SACRIFICE, NO VICTORY
        </motion.p>
        <motion.p
          variants={textFadeUpVariants}
          className="text-[8px] sm:text-[9px] font-medium uppercase tracking-[0.2em] text-white/20 mt-1"
        >
          ISIPATHANA COLLEGE MEDIA UNIT 2026
        </motion.p>
      </motion.div>
    </motion.div>
  );
};

export default AboutTab;
