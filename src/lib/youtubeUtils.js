/**
 * Extracts a YouTube video ID from various URL formats.
 *
 * Supported formats:
 *   - https://www.youtube.com/watch?v=VIDEO_ID
 *   - https://youtu.be/VIDEO_ID
 *   - https://www.youtube.com/live/VIDEO_ID
 *   - https://www.youtube.com/embed/VIDEO_ID
 *   - https://www.youtube.com/v/VIDEO_ID
 *   - https://www.youtube.com/shorts/VIDEO_ID
 *   - Raw 11-character video ID string
 *
 * @param {string} input - A YouTube URL or raw video ID.
 * @returns {string|null} The 11-character video ID, or null if invalid.
 */
export const extractYouTubeId = (input) => {
  if (!input || typeof input !== "string") return null;

  const trimmed = input.trim();

  // If it's already an 11-char alphanumeric ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Try URL parsing
  try {
    const url = new URL(trimmed);

    // youtube.com/watch?v=VIDEO_ID
    if (
      (url.hostname === "www.youtube.com" || url.hostname === "youtube.com") &&
      url.searchParams.has("v")
    ) {
      const id = url.searchParams.get("v");
      return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
    }

    // youtu.be/VIDEO_ID
    if (url.hostname === "youtu.be") {
      const id = url.pathname.slice(1).split("/")[0];
      return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
    }

    // youtube.com/live/VIDEO_ID or /embed/VIDEO_ID or /v/VIDEO_ID or /shorts/VIDEO_ID
    if (
      url.hostname === "www.youtube.com" ||
      url.hostname === "youtube.com"
    ) {
      const pathMatch = url.pathname.match(
        /^\/(live|embed|v|shorts)\/([a-zA-Z0-9_-]{11})/
      );
      if (pathMatch) return pathMatch[2];
    }
  } catch {
    // Not a valid URL — fall through
  }

  // Last resort: regex scan for an 11-char ID in the string
  const fallback = trimmed.match(/[a-zA-Z0-9_-]{11}/);
  return fallback ? fallback[0] : null;
};

/**
 * Returns a YouTube embed URL for a given video ID.
 * Uses youtube-nocookie.com (privacy-enhanced mode) to reduce
 * "content blocked" errors and improve embed compatibility.
 *
 * @param {string} videoId - The 11-character video ID.
 * @param {object} [options] - Embed options.
 * @param {boolean} [options.autoplay=true] - Whether to autoplay.
 * @param {boolean} [options.muted=true] - Whether to start muted.
 * @returns {string} The embed URL.
 */
export const getYouTubeEmbedUrl = (videoId, options = {}) => {
  const { autoplay = true, muted = true } = options;
  const params = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
  });
  if (autoplay) params.set("autoplay", "1");
  if (muted) params.set("mute", "1");
  // Removing explicit origin parameter as it can cause "content blocked" 
  // errors in some production environments if the domain isn't whitelisted.
  // YouTube will fallback to the Referer header automatically.
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
};

/**
 * Returns a YouTube live chat embed URL.
 * @param {string} videoId - The 11-character video ID.
 * @returns {string} The live chat embed URL.
 */
export const getYouTubeChatUrl = (videoId) => {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `https://www.youtube.com/live_chat?v=${videoId}&embed_domain=${encodeURIComponent(origin.replace(/^https?:\/\//, ""))}`;
};

/**
 * Returns the direct YouTube watch URL for a video ID.
 * Used as a fallback when embedding is blocked.
 * @param {string} videoId
 * @returns {string}
 */
export const getYouTubeWatchUrl = (videoId) => {
  return `https://www.youtube.com/watch?v=${videoId}`;
};
