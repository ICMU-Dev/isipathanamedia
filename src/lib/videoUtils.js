/**
 * Video utilities for multi-platform support (YouTube + Facebook).
 * Re-exports YouTube utils and adds Facebook + platform detection.
 */

export {
  extractYouTubeId,
  getYouTubeEmbedUrl,
  getYouTubeChatUrl,
  getYouTubeWatchUrl,
} from "./youtubeUtils";

/**
 * Extracts a usable Facebook video URL from various input formats.
 *
 * Supported formats:
 *   - https://www.facebook.com/watch/?v=VIDEO_ID
 *   - https://www.facebook.com/PAGE/videos/VIDEO_ID
 *   - https://www.facebook.com/reel/VIDEO_ID
 *   - https://www.facebook.com/watch/live/?v=VIDEO_ID
 *   - https://fb.watch/SHORT_CODE
 *   - https://www.facebook.com/video.php?v=VIDEO_ID
 *   - https://www.facebook.com/PAGE/posts/POST_ID (video posts)
 *   - https://www.facebook.com/permalink.php?story_fbid=...
 *   - Direct facebook.com/live/* URLs
 *
 * @param {string} input - A Facebook video URL.
 * @returns {string|null} The cleaned Facebook video URL, or null if invalid.
 */
export const extractFacebookVideoUrl = (input) => {
  if (!input || typeof input !== "string") return null;
  const trimmed = input.trim();

  try {
    const url = new URL(trimmed);
    const host = url.hostname.replace(/^www\./, "").replace(/^m\./, "");

    // facebook.com URLs
    if (host === "facebook.com" || host === "fb.com") {
      // /watch/?v=ID or /watch/live/?v=ID
      if (url.pathname.startsWith("/watch") && url.searchParams.has("v")) {
        return trimmed;
      }
      // /PAGE/videos/ID
      if (/\/videos\/\d+/.test(url.pathname)) {
        return trimmed;
      }
      // /reel/ID
      if (/\/reel\/\d+/.test(url.pathname)) {
        return trimmed;
      }
      // /video.php?v=ID
      if (url.pathname === "/video.php" && url.searchParams.has("v")) {
        return trimmed;
      }
      // /live/* URLs
      if (url.pathname.startsWith("/live")) {
        return trimmed;
      }
      // /PAGE/posts/ID (could be video post)
      if (/\/posts\//.test(url.pathname)) {
        return trimmed;
      }
      // permalink.php
      if (url.pathname === "/permalink.php") {
        return trimmed;
      }
      // Generic facebook URL — accept if it looks like a content page
      if (url.pathname.length > 1 && url.pathname !== "/") {
        return trimmed;
      }
    }

    // fb.watch short URLs
    if (host === "fb.watch") {
      return trimmed;
    }
  } catch {
    // Not a valid URL
  }

  return null;
};

/**
 * Returns a Facebook video embed URL using the plugins API.
 * @param {string} videoUrl - The full Facebook video URL.
 * @param {object} [options] - Embed options.
 * @param {boolean} [options.autoplay=true] - Whether to autoplay.
 * @param {boolean} [options.muted=true] - Whether to start muted.
 * @returns {string} The Facebook embed URL.
 */
export const getFacebookEmbedUrl = (videoUrl, options = {}) => {
  const { autoplay = true, muted = true } = options;
  const params = new URLSearchParams({
    href: videoUrl,
    show_text: "false",
    autoplay: autoplay ? "true" : "false",
    mute: muted ? "true" : "false",
    width: "734",
    allowfullscreen: "true",
  });
  return `https://www.facebook.com/plugins/video.php?${params.toString()}`;
};

/**
 * Returns the direct Facebook video URL for use as a fallback link.
 * @param {string} videoUrl - The Facebook video URL.
 * @returns {string}
 */
export const getFacebookWatchUrl = (videoUrl) => {
  return videoUrl || "https://www.facebook.com";
};

/**
 * Auto-detects the platform from a URL string.
 * @param {string} input - A URL or video ID.
 * @returns {"youtube"|"facebook"|null} The detected platform, or null.
 */
export const detectPlatform = (input) => {
  if (!input || typeof input !== "string") return null;
  const trimmed = input.trim();

  // Check for raw YouTube ID (11 chars)
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return "youtube";
  }

  try {
    const url = new URL(trimmed);
    const host = url.hostname.replace(/^www\./, "").replace(/^m\./, "");

    // YouTube domains
    if (
      host === "youtube.com" ||
      host === "youtu.be" ||
      host === "youtube-nocookie.com"
    ) {
      return "youtube";
    }

    // Facebook domains
    if (
      host === "facebook.com" ||
      host === "fb.com" ||
      host === "fb.watch"
    ) {
      return "facebook";
    }
  } catch {
    // Not a valid URL
  }

  return null;
};
