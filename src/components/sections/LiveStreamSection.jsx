import React from "react";
import { Link } from "react-router-dom";
import { useData } from "../../context/DataContext";
import VideoEmbed from "../ui/VideoEmbed";
import { Radio, Youtube, Monitor, ExternalLink, Play } from "lucide-react";

// ─── Facebook icon ───
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

const LiveStreamSection = () => {
  const { siteConfig } = useData();
  const liveStream = siteConfig?.liveStream;

  // Backward compat: support old configs without platform field
  const platform = liveStream?.platform || "youtube";
  const hasVideo =
    (platform === "youtube" && liveStream?.videoId) ||
    (platform === "facebook" && liveStream?.videoUrl);
  const isActive = liveStream?.isLive && hasVideo;

  if (!isActive) return null;

  const displayTitle =
    liveStream?.useCustomTitle && liveStream?.title
      ? liveStream.title
      : `Live Broadcast (${platform === "youtube" ? "YouTube" : "Facebook"})`;

  const displayDescription =
    liveStream?.useCustomDescription && liveStream?.description
      ? liveStream.description
      : "Streaming live coverage from the Isipathana College Media Unit.";

  return (
    <section
      id="livestream"
      className="relative bg-black py-16 sm:py-20 px-4 sm:px-6 md:px-8 overflow-hidden scroll-mt-24 sm:scroll-mt-28 border-b border-white/[0.03]">
      {/* Subtle top divider line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Decorative background ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-red-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto max-w-4xl relative z-10">
        {/* Live Header */}
        <div className="flex flex-col items-center text-center mb-6 sm:mb-8 md:mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full border border-red-600/20 bg-red-600/5 select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
            <span className="text-[9px] font-extrabold tracking-[0.2em] uppercase text-red-400">
              Live Now
            </span>
          </div>

          <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-white uppercase px-2 max-w-2xl leading-snug">
            {displayTitle}
          </h2>

          <p className="text-xs text-white/40 max-w-md font-medium mt-1">
            {displayDescription}
          </p>
        </div>

        {/* Video Player */}
        <div className="relative w-full max-w-3xl mx-auto shadow-[0_0_50px_rgba(0,0,0,0.8)] rounded-2xl overflow-hidden border border-white/[0.06] group">
          <VideoEmbed
            platform={platform}
            videoId={liveStream.videoId || ""}
            videoUrl={liveStream.videoUrl || ""}
            autoplay={
              liveStream.autoplay !== undefined ? liveStream.autoplay : true
            }
            muted={liveStream.muted !== undefined ? liveStream.muted : true}
            title={displayTitle}
            size="md"
          />

          {/* Decorative hover link overlay to redirect to live page */}
          <Link
            to="/live"
            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px] z-20 cursor-pointer pointer-events-none group-hover:pointer-events-auto"
            title="Open immersive stream view">
            <div className="px-5 py-2.5 rounded-2xl bg-black/85 border border-white/5 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 shadow-xl">
              <span>Watch Live</span>
              <ExternalLink size={12} className="opacity-55" />
            </div>
          </Link>
        </div>

        {/* Redirect Action Button below player */}
        <div className="flex justify-center mt-6">
          <Link
            to="/live"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] text-white/50 hover:text-white text-xs font-semibold tracking-wide transition-all duration-300 hover:scale-[1.02] shadow-lg">
            <Play
              size={14}
              className={
                platform === "youtube" ? "text-red-400" : "text-blue-400"
              }
            />
            <span>Watch in Boardcasting Mode</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default LiveStreamSection;
