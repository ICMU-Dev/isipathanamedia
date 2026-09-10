import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

/**
 * Universal ScrollManager for ICMU Web
 * 
 * - When navigating to pages without a hash (e.g. /, /news, /news/:id, /author/:name, /about):
 *   Resets scroll position immediately to 0 for both Lenis smooth scroll and native window.
 * - When navigating with a hash (e.g. /#news, /#about, /news#update-123, /#contact):
 *   Locates the section anchor element and smoothly scrolls to it with multi-stage retry.
 */
const ScrollManager = () => {
  const { pathname, hash } = useLocation();
  const prevPathRef = useRef(pathname);

  // Disable browser automatic scroll restoration so it doesn't fight programmatic navigation
  useEffect(() => {
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    const isPathChange = prevPathRef.current !== pathname;
    prevPathRef.current = pathname;

    if (!hash) {
      // 1. Page navigation WITHOUT hash:
      // Instantly reset scroll position to 0 (top of page)
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });

      if (window.lenis) {
        window.lenis.scrollTo(0, { immediate: true });
        window.lenis.resize();
      }

      // Re-apply after a short tick to accommodate React.lazy chunks and dynamic DOM mounting
      const timer = setTimeout(() => {
        if (window.lenis) {
          window.lenis.resize();
          window.lenis.scrollTo(0, { immediate: true });
        }
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      }, 60);

      return () => clearTimeout(timer);
    } else {
      // 2. Hash-based navigation:
      const cleanId = hash.replace(/^#/, "");
      if (cleanId === "hero" || cleanId === "home" || cleanId === "top") {
        if (window.lenis) {
          window.lenis.resize();
          window.lenis.scrollTo(0, { duration: 1.2 });
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
        return;
      }

      const scrollToTarget = () => {
        const element =
          document.getElementById(cleanId) ||
          document.querySelector(`[name="${cleanId}"]`) ||
          document.querySelector(hash);

        if (element) {
          if (window.lenis) {
            window.lenis.resize();
            window.lenis.scrollTo(element, { offset: -70, duration: 1.2 });
          } else {
            element.scrollIntoView({ behavior: "smooth" });
          }
          return true;
        }
        return false;
      };

      // Attempt immediate scroll
      if (!scrollToTarget()) {
        // Multi-stage retry in case the target section or modal is lazy-loading
        const delays = [60, 150, 350, 650, 1000];
        const timers = delays.map((delay) =>
          setTimeout(() => {
            scrollToTarget();
          }, delay)
        );

        return () => {
          timers.forEach(clearTimeout);
        };
      }
    }
  }, [pathname, hash]);

  return null;
};

export default ScrollManager;
