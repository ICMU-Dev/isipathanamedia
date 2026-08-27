import { useMemo } from "react";

/**
 * Detects device capability to gate heavy visual effects.
 *
 * Returns:
 *  - isLowEnd: true when the device has limited CPU/RAM
 *  - prefersReducedMotion: true when the OS accessibility setting is enabled
 *  - effectiveFps: recommended FPS cap for canvas/WebGL (60, 30, or 15)
 *  - dpr: recommended device pixel ratio (capped lower on weak devices)
 */
export function useDeviceCapability() {
  return useMemo(() => {
    const cores = navigator.hardwareConcurrency || 2;
    const memory = navigator.deviceMemory || 4; // default 4 if API unavailable
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // Connection quality
    const connection =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection;
    const slowNetwork =
      connection?.effectiveType === "2g" ||
      connection?.effectiveType === "slow-2g";

    // Simple scoring
    const isLowEnd = cores <= 2 || memory <= 2 || slowNetwork;
    const isVeryLowEnd = (cores <= 2 && memory <= 2) || prefersReducedMotion;

    // Adaptive settings
    let effectiveFps = 60;
    if (isVeryLowEnd) effectiveFps = 15;
    else if (isLowEnd) effectiveFps = 30;

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (isLowEnd) dpr = 1;

    return {
      isLowEnd,
      isVeryLowEnd,
      prefersReducedMotion,
      effectiveFps,
      dpr,
      cores,
      memory,
    };
  }, []);
}
