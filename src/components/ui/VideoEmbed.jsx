import React, { useState, useCallback } from "react";
import { getYouTubeEmbedUrl, getYouTubeWatchUrl } from "../../lib/youtubeUtils";
import { getFacebookEmbedUrl, getFacebookWatchUrl } from "../../lib/videoUtils";
import { AlertTriangle, ExternalLink, Youtube, Tv } from "lucide-react";

// Facebook SVG icon (lucide doesn't have one)
const FacebookIcon = ({ size = 20, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="currentColor"
    className={className}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

/**
 * Reusable video embed component supporting YouTube and Facebook.
 * Includes error handling with a graceful fallback UI.
 *
 * @param {object} props
 * @param {"youtube"|"facebook"} props.platform
 * @param {string} [props.videoId] - YouTube video ID
 * @param {string} [props.videoUrl] - Facebook video URL (or raw URL)
 * @param {boolean} [props.autoplay=true]
 * @param {boolean} [props.muted=true]
 * @param {string} [props.title]
 * @param {string} [props.className] - Extra classes on the outer container
 * @param {"sm"|"md"|"lg"} [props.size="lg"] - Controls corner rounding
 */
const VideoEmbed = ({
  platform = "youtube",
  videoId = "",
  videoUrl = "",
  autoplay = true,
  muted = true,
  title = "",
  className = "",
  size = "lg",
}) => {
  const [hasError, setHasError] = useState(false);

  const handleIframeError = useCallback(() => {
    setHasError(true);
  }, []);

  // Build the embed URL based on platform
  let embedSrc = "";
  let directLink = "";
  let PlatformIcon = Tv;
  let platformLabel = "Video";
  let platformColor = "white";

  if (platform === "youtube" && videoId) {
    embedSrc = getYouTubeEmbedUrl(videoId, { autoplay, muted });
    directLink = getYouTubeWatchUrl(videoId);
    PlatformIcon = Youtube;
    platformLabel = "YouTube";
    platformColor = "red";
  } else if (platform === "facebook" && videoUrl) {
    embedSrc = getFacebookEmbedUrl(videoUrl, { autoplay, muted });
    directLink = getFacebookWatchUrl(videoUrl);
    PlatformIcon = FacebookIcon;
    platformLabel = "Facebook";
    platformColor = "blue";
  }

  const roundingClass =
    size === "sm"
      ? "rounded-2xl"
      : size === "md"
        ? "rounded-2xl"
        : "rounded-2xl md:rounded-3xl";

  // No video source
  if (!embedSrc) {
    return (
      <div
        className={`relative aspect-video w-full ${roundingClass} overflow-hidden border border-white/[0.06] bg-[var(--admin-input-bg)]   flex items-center justify-center ${className}`}>
        <div className="flex flex-col items-center text-center space-y-3 p-6">
          <Tv size={40} className="text-white/10" />
          <p className="text-sm text-white/40 font-medium">No video source</p>
          <p className="text-xs text-white/25 max-w-xs">
            Enter a valid YouTube or Facebook URL to start streaming
          </p>
        </div>
      </div>
    );
  }

  // Error fallback
  if (hasError) {
    const colorMap = {
      red: {
        bg: "bg-red-600/5",
        border: "border-red-600/20",
        text: "text-red-400",
        hoverBg: "hover:bg-red-600/20",
      },
      blue: {
        bg: "bg-blue-500/5",
        border: "border-blue-500/20",
        text: "text-blue-400",
        hoverBg: "hover:bg-blue-500/20",
      },
      white: {
        bg: "bg-white/5",
        border: "border-white/20",
        text: "text-white/60",
        hoverBg: "hover:bg-white/10",
      },
    };
    const c = colorMap[platformColor] || colorMap.white;

    return (
      <div
        className={`relative aspect-video w-full ${roundingClass} overflow-hidden border border-white/[0.06] bg-[var(--admin-input-bg)]   flex items-center justify-center ${className}`}>
        <div className="flex flex-col items-center text-center space-y-4 p-6 max-w-sm">
          <div className={`p-4 rounded-2xl ${c.bg} border ${c.border}`}>
            <AlertTriangle size={28} className={c.text} />
          </div>
          <div>
            <p className="text-sm text-white/70 font-semibold mb-1">
              Content Unavailable
            </p>
            <p className="text-xs text-white/40 leading-relaxed">
              This video can't be embedded here. It may have embedding
              restrictions or regional limitations.
            </p>
          </div>
          <a
            href={directLink}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl ${c.bg} border ${c.border} ${c.text} text-xs font-bold uppercase tracking-wider ${c.hoverBg} transition-all duration-300`}>
            <ExternalLink size={14} />
            Watch on {platformLabel}
          </a>
          <button
            onClick={() => setHasError(false)}
            className="text-[10px] text-white/30 hover:text-white/50 transition-colors underline underline-offset-2">
            Try embedding again
          </button>
        </div>
      </div>
    );
  }

  // Normal embed
  return (
    <div
      className={`relative aspect-video w-full ${roundingClass} overflow-hidden border border-white/5 bg-[var(--admin-input-bg)]   shadow-2xl shadow-black/50 ${className}`}>
      <iframe
        src={embedSrc}
        title={title || `${platformLabel} Video`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="w-full h-full bg-black"
        onError={handleIframeError}
        onLoad={(e) => {
          // Additional check: try to detect blocked content via load event
          try {
            // If the iframe loaded but has no content accessible, it may be blocked
            // We can't access cross-origin content, but we rely on the error event
          } catch {
            // Silent catch — cross-origin restrictions
          }
        }}
      />
    </div>
  );
};

export default VideoEmbed;
