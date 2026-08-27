import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useParams, useLocation } from "react-router-dom";
import MainLogos from "../../assets/main-logos.png";
import ActiveAdmins from "./ActiveAdmins";
import { useAuth } from "../../context/AuthContext";

const MobileHeader = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { adminPath } = useParams();
  const { user } = useAuth();

  const location = useLocation();
  const basePath = `/${adminPath}`;
  const isDashboard =
    location.pathname === basePath ||
    location.pathname === `${basePath}/dashboard`;

  useEffect(() => {
    const handleScroll = () => {
      const threshold = isDashboard ? 280 : 20;
      setIsScrolled(window.scrollY > threshold);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <div className="md:hidden fixed top-0 left-0 right-0 z-[90] pointer-events-none">
        <AnimatePresence>
          {/* Full Width Header (Only on non-dashboard) */}
          {!isDashboard && !isScrolled && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="absolute top-0 left-0 right-0 w-full backdrop-blur-sm border-b border-[var(--admin-border)] shadow-lg pointer-events-auto"
              style={{ backgroundColor: "color-mix(in srgb, var(--admin-bg) 80%, transparent)" }}>
              <div className="flex items-center justify-between px-4 h-[64px]">
                <Link to={basePath} className="flex items-center gap-3">
                  <img
                    src={MainLogos}
                    alt="ICMU"
                    width={60}
                    height={41}
                    className="w-12 h-auto drop-shadow-md p-1"
                  />
                  <div className="flex flex-col text-[10px] uppercase tracking-widest text-[var(--admin-text-secondary)] leading-[1.3]">
                    <span className="font-normal text-[var(--admin-text-primary)]">
                      Isipathana College
                    </span>
                    <span className="font-normal text-[var(--admin-text-secondary)]">
                      Media Unit
                    </span>
                  </div>
                </Link>
                <div className="flex items-center justify-end">
                  <ActiveAdmins isCollapsed={true} isMobile={true} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {/* Shadow gradient behind pills */}
          {isScrolled && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute top-0 left-0 right-0 h-[60px] pointer-events-none -z-10"
              style={{
                background: "linear-gradient(to bottom, color-mix(in srgb, var(--admin-bg) 95%, transparent) 0%, color-mix(in srgb, var(--admin-bg) 50%, transparent) 50%, transparent 100%)"
              }}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {/* Split Pills Header (On all pages when scrolled) */}
          {isScrolled && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="absolute top-0 left-0 right-0 w-[90%] mx-auto flex items-center justify-between pt-4 h-[64px] pointer-events-auto">
              {/* Left Pill (Logo + Text) */}
              <Link
                to={basePath}
                className="relative flex items-center pl-1.5 pr-4 py-1 h-[48px] rounded-full shadow-[0_8px_32px_0_rgba(0,0,0,0.95)] border border-[var(--admin-border)] group backdrop-blur-sm overflow-hidden"
                style={{ backgroundColor: "color-mix(in srgb, var(--admin-bg) 80%, transparent)" }}>
                <div 
                  className="absolute inset-0 -z-10" 
                  style={{ background: "linear-gradient(to bottom, color-mix(in srgb, var(--admin-card-bg) 10%, color-mix(in srgb, var(--admin-bg) 20%, transparent))" }} 
                />

                <div className="relative z-10 flex items-center gap-3">
                  <img
                    src={MainLogos}
                    alt="ICMU"
                    width={60}
                    height={41}
                    className="w-12 h-auto drop-shadow-md p-1"
                  />

                  <div className="flex flex-col text-[9px] uppercase tracking-widest text-[var(--admin-text-secondary)] leading-[1.4]">
                    <span className="font-normal text-[var(--admin-text-primary)]">
                      Isipathana College
                    </span>
                    <span className="font-normal">Media Unit</span>
                  </div>
                </div>
              </Link>

              {/* Right Pill (Active Admins) */}
              <div 
                className="relative rounded-full shadow-[0_8px_32px_0_rgba(0,0,0,0.95)] overflow-visible border border-[var(--admin-border)] px-2 h-[48px] flex items-center justify-center min-w-[48px] backdrop-blur-sm"
                style={{ backgroundColor: "color-mix(in srgb, var(--admin-bg) 40%, transparent)" }}>
                <div className="relative z-10 flex items-center justify-center h-full">
                  <ActiveAdmins isCollapsed={true} isMobile={true} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Spacer to push content down on non-dashboard pages */}
      {!isDashboard && (
        <div className="md:hidden h-[64px] w-full shrink-0 pointer-events-none" />
      )}
    </>
  );
};

export default MobileHeader;
