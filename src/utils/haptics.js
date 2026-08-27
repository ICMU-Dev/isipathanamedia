/**
 * Haptic feedback utility for mobile devices.
 * Uses the Vibration API (supported on Android Chrome, some iOS Safari).
 * Fails silently on unsupported browsers.
 */

// Light tap — buttons, card taps
export const hapticLight = () => {
  if (navigator?.vibrate) navigator.vibrate(8);
};

// Medium pulse — section reveals, scrambled text interaction
export const hapticMedium = () => {
  if (navigator?.vibrate) navigator.vibrate(30);
};

// Subtle double-tap — special moments like CTA press
export const hapticDouble = () => {
  if (navigator?.vibrate) navigator.vibrate([10, 30, 10]);
};

// Soft pattern — scrambled text decoding feel
export const hapticScramble = () => {
  if (navigator?.vibrate) navigator.vibrate([5, 20, 5, 20, 5]);
};
