import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useData } from "../../context/DataContext";
import { getYouTubeChatUrl } from "../../lib/youtubeUtils";
import VideoEmbed from "../../components/ui/VideoEmbed";
import SEO from "../../components/SEO";
import {
  ArrowLeft,
  Tv,
  MessageCircle,
  Radio,
  ChevronDown,
  Share2,
  Info,
  Youtube,
  Heart,
  Github,
  PlusCircle,
} from "lucide-react";

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

const LivePage = () => {
  const { siteConfig, fetchConfig } = useData();
  const [chatOpen, setChatOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Force fetch latest configuration on load to prevent stale title/description cache
  useEffect(() => {
    fetchConfig(true);
  }, [fetchConfig]);

  // Visibility-aware background polling (smart auto-refresh backup)
  useEffect(() => {
    // Poll every 15 seconds, but only when the tab is currently in focus
    const intervalId = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchConfig(true);
      }
    }, 15000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchConfig(true); // Refetch instantly upon switching back to the tab
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchConfig]);

  const ls = siteConfig?.liveStream;
  const platform = ls?.platform || "youtube";
  const hasVideo =
    (platform === "youtube" && ls?.videoId) ||
    (platform === "facebook" && ls?.videoUrl);
  const isActive = ls?.isLive && hasVideo;
  const showChat = platform === "youtube" && ls?.showChat && ls?.videoId;

  const displayTitle = ls?.title || "Live Broadcast";
  const displayDesc =
    ls?.description || "Streaming live from the Isipathana College Media Unit.";

  // Fetch social links from database config
  const socialLinks = siteConfig?.socialLinks || {};

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* ─── OFFLINE STATE ─── */
  if (!isActive) {
    return (
      <div className="min-h-[100dvh] bg-black text-white font-sans flex flex-col justify-between">
        <SEO
          title="Live Broadcast"
          description="Tune in to live broadcasts and event coverage by the Isipathana College Media Unit."
          path="/live"
        />
        <nav className="border-b border-white/[0.06] ">
          <div className="max-w-5xl mx-auto flex items-center px-4 sm:px-6 h-14">
            <Link
              to="/"
              className="flex items-center gap-2 text-white/40 hover:text-white text-xs font-medium transition-colors">
              <ArrowLeft size={15} />{" "}
              <span className="hidden sm:inline">Home</span>
            </Link>
          </div>
        </nav>

        <div className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="flex flex-col items-center text-center max-w-sm">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-5">
              <Tv size={28} className="text-white/[0.08]" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white/60 mb-2">
              No Active Stream
            </h1>
            <p className="text-sm text-white/30 leading-relaxed mb-6">
              There's no live broadcast right now. Check back during our next
              event.
            </p>
            <Link
              to="/"
              className="px-5 py-2 bg-white/[0.06] hover:bg-white/[0.1] borderborder-white/[0.06]  rounded-2xl text-xs font-semibold text-white/60 transition-colors">
              Return Home
            </Link>
          </div>
        </div>

        {/* Developer Credits Footer (Matching Main Site Footer) */}
        <footer className="border-t border-white/[0.06]  bg-white/[0.01] py-8 text-center relative z-10">
          <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/30">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white/40">
                Isipathana College Media Unit
              </span>
              <span className="text-white/10">|</span>
              <span>Broadcast Portal</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[8px] sm:text-[9px] font-bold tracking-[0.2em] uppercase text-white/40">
                Developed by
              </span>
              <div className="flex items-center gap-3">
                <a
                  href="https://github.com/t-24929"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-white/40 hover:text-white/80 transition-colors duration-300">
                  <Github size={12} />
                  <span className="text-[9px] sm:text-[10px] tracking-widest font-sans font-bold">
                    t-24929
                  </span>
                </a>
                <span className="text-[10px] text-white/20">|</span>
                <a
                  href="https://github.com/rusaths"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-white/40 hover:text-white/80 transition-colors duration-300">
                  <Github size={12} />
                  <span className="text-[9px] sm:text-[10px] tracking-widest font-sans font-bold">
                    rusaths
                  </span>
                </a>
              </div>
            </div>
            <p className="text-[10px] text-white/20">
              © {new Date().getFullYear()} ICMU. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    );
  }

  /* ─── ACTIVE LIVE STATE ─── */
  return (
    <div className="min-h-[100dvh] bg-[#0c0c0c] text-white font-sans flex flex-col justify-between relative overflow-hidden">
      <SEO
        title={`Live: ${displayTitle}`}
        description={
          displayDesc ||
          "Tune in to live broadcasts and event coverage by the Isipathana College Media Unit."
        }
        path="/live"
      />

      {/* Subtle background gradient glow decorations */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-red-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div>
        {/* Generous spacer to clear sticky website navbar completely */}
        <div className="pt-28 sm:pt-32 md:pt-36 lg:pt-40" />

        <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
          {/* Immersive side-by-side grid layout on desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* RIGHT side (cols 6-12) - Video Player: Rendered FIRST on mobile via order-1 */}
            <div className="lg:col-span-7 order-1 lg:order-2 lg:pt-4">
              <div className="w-full shadow-[0_0_50px_rgba(0,0,0,0.8)] rounded-2xl overflow-hidden border border-white/[0.06] 0 bg-black">
                <VideoEmbed
                  platform={platform}
                  videoId={ls.videoId || ""}
                  videoUrl={ls.videoUrl || ""}
                  autoplay={ls.autoplay !== undefined ? ls.autoplay : true}
                  muted={ls.muted !== undefined ? ls.muted : true}
                  title={displayTitle}
                  size="md"
                />
              </div>
            </div>

            {/* LEFT side (cols 1-5) - Metadata & description: Rendered SECOND on mobile via order-2 */}
            <div className="lg:col-span-5 order-2 lg:order-1 space-y-5 lg:sticky lg:top-36">
              {/* Live indicator badge */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-red-600 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  Live
                </div>
                <span className="text-[10px] text-white/40 uppercase tracking-widest font-semibold flex items-center gap-1">
                  via{" "}
                  {platform === "facebook" ? (
                    <>
                      <FacebookIcon size={10} className="text-blue-400" />{" "}
                      Facebook
                    </>
                  ) : (
                    <>
                      <Youtube size={11} className="text-red-400" /> YouTube
                    </>
                  )}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-snug">
                {displayTitle}
              </h1>

              {/* Meta context info */}
              <div className="text-[11px] text-white/35 space-y-1">
                <p className="font-semibold text-white/50">
                  Isipathana College Media Unit (ICMU)
                </p>
                <p className="opacity-75">Real-time event coverage broadcast</p>
              </div>

              {/* Embedded Subscribe / Follow callout card (Moved up for mobile visibility) */}
              {platform === "youtube" ? (
                <div className="bg-red-600/[0.02] border border-red-600/10 rounded-2xl p-4 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Youtube
                        size={15}
                        className="text-red-600 animate-pulse"
                      />
                      <span className="text-[10px] font-extrabold uppercase text-red-400 tracking-wider">
                        YouTube Channel
                      </span>
                    </div>
                    <p className="text-[11px] text-white/40 leading-snug">
                      Subscribe to Isipathana Media Unit for more events!
                    </p>
                  </div>
                  <a
                    href={socialLinks.youtube || "https://www.youtube.com"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 inline-flex items-center gap-1 px-3.5 py-2 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold uppercase tracking-wider transition-colors shadow-md">
                    <span>Subscribe</span>
                  </a>
                </div>
              ) : (
                <div className="bg-blue-500/[0.02] border border-blue-500/10 rounded-2xl p-4 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <FacebookIcon
                        size={14}
                        className="text-blue-500 animate-pulse"
                      />
                      <span className="text-[10px] font-extrabold uppercase text-blue-400 tracking-wider">
                        Facebook Page
                      </span>
                    </div>
                    <p className="text-[11px] text-white/40 leading-snug">
                      Follow our Facebook page for live post updates!
                    </p>
                  </div>
                  <a
                    href={socialLinks.facebook || "https://www.facebook.com"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 inline-flex items-center gap-1 px-3.5 py-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold uppercase tracking-wider transition-colors shadow-md">
                    <PlusCircle size={12} />
                    <span>Follow</span>
                  </a>
                </div>
              )}

              {/* Description */}
              {displayDesc && (
                <p className="text-xs text-white/40 leading-relaxed pt-3.5 border-t border-white/[0.06]">
                  {displayDesc}
                </p>
              )}

              {/* Share and Action buttons */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleShare}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-white/50 hover:text-white hover:bg-white/[0.06] text-xs font-semibold transition-colors">
                  <Share2 size={13} />
                  {copied ? "Link Copied!" : "Share Stream"}
                </button>
              </div>

              {/* Collapsible live chat (YouTube only) */}
              {showChat && (
                <div className="border border-white/[0.06] rounded-2xl overflow-hidden bg-white/[0.01]">
                  <button
                    onClick={() => setChatOpen(!chatOpen)}
                    className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-white/[0.03] transition-colors">
                    <div className="flex items-center gap-2">
                      <MessageCircle size={13} className="text-white/30" />
                      <span className="text-[11px] font-semibold text-white/45">
                        Live Chat Discussion
                      </span>
                    </div>
                    <ChevronDown
                      size={14}
                      className={`text-white/20 transition-transform duration-200 ${chatOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {chatOpen && (
                    <div className="border-t border-white/[0.06] ">
                      <iframe
                        src={getYouTubeChatUrl(ls.videoId)}
                        title="YouTube Live Chat"
                        className="w-full bg-[var(--admin-input-bg)]  "
                        style={{ height: "240px" }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Developer Credits Footer (Matching Main Site Footer) */}
      <footer className="border-t border-white/[0.06]  bg-white/[0.01] py-8 mt-10 text-center relative z-10">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/30">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white/40">
              Isipathana College Media Unit
            </span>
            <span className="text-white/10">|</span>
            <span>Broadcast Portal</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[8px] sm:text-[9px] font-bold tracking-[0.2em] uppercase text-white/40">
              Developed by
            </span>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/t-24929"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-white/40 hover:text-white/80 transition-colors duration-300">
                <Github size={12} />
                <span className="text-[9px] sm:text-[10px] tracking-widest font-sans font-bold">
                  t-24929
                </span>
              </a>
              <span className="text-[10px] text-white/20">|</span>
              <a
                href="https://github.com/rusaths"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-white/40 hover:text-white/80 transition-colors duration-300">
                <Github size={12} />
                <span className="text-[9px] sm:text-[10px] tracking-widest font-sans font-bold">
                  rusaths
                </span>
              </a>
            </div>
          </div>
          <p className="text-[10px] text-white/20">
            © {new Date().getFullYear()} ICMU. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LivePage;
