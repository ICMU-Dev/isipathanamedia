import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import Lenis from "lenis";
import { gsap } from "gsap";
import { useDeviceCapability } from "../hooks/useDeviceCapability";

const SmoothScroll = ({ children }) => {
  const lenisRef = useRef(null);
  const { isLowEnd, prefersReducedMotion } = useDeviceCapability();
  const location = useLocation();

  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.resize();
      if (!location.hash) {
        lenisRef.current.scrollTo(0, { immediate: true });
      }
    }
  }, [location.pathname, location.hash]);

  useEffect(() => {
    // Skip smooth scrolling entirely on low-end devices or reduced-motion preference
    if (isLowEnd || prefersReducedMotion) return;

    // Initialize Lenis
    const lenis = new Lenis({
      duration: 2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    lenisRef.current = lenis;
    window.lenis = lenis;

    // Synchronize Lenis with GSAP Ticker
    function update(time) {
      lenis.raf(time * 1000);
    }

    gsap.ticker.add(update);

    return () => {
      gsap.ticker.remove(update);
      lenis.destroy();
      if (window.lenis === lenis) {
        window.lenis = null;
      }
    };
  }, [isLowEnd, prefersReducedMotion]);

  return <>{children}</>;
};

export default SmoothScroll;
