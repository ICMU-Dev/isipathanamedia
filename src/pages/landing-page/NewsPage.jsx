import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";
import {
  ArrowLeft,
  Calendar,
  Tag,
  ArrowRight,
  Clock,
  Share2,
  Check,
  BadgeCheck,
  Hash,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import AnimatedBg from "../../components/ui/AnimatedBg";
import SEO from "../../components/SEO";
import iconLogo from "../../assets/image.png";
import {  AnimatePresence } from "framer-motion";
import { motion } from "framer-motion";
import ImageWithLoader from "../../components/ui/ImageWithLoader";
import { getPublicAuthorName, isInstitutionAuthor } from "../../utils/authorUtils";

const SITE_URL = "https://isipathanamedia.online";

// ─── Pure Helper Functions ──────────────────────────────────────────
const getReadingTime = (content) => {
  if (!content) return 1;
  const text = content.replace(/<[^>]*>/g, "");
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
};

const getPreview = (content) => {
  if (!content) return "";
  const temp = document.createElement("div");
  temp.innerHTML = content;
  const text = temp.textContent || temp.innerText || "";
  return text.substring(0, 140) + "...";
};

// ─── Quick Share Button Component ──────────────────────────────────
const QuickShare = React.memo(({ article }) => {
  const [copied, setCopied] = useState(false);

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${SITE_URL}/news/${article.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: article.title, url });
      } catch {
        /* User cancelled */
      }
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleShare}
      title="Share"
      className="w-8 h-8 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white/40 hover:text-theme-accent hover:bg-theme-accent/10 hover:border-theme-accent/20 transition-all shrink-0"
    >
      {copied ? (
        <Check size={12} className="text-theme-accent" />
      ) : (
        <Share2 size={12} />
      )}
    </button>
  );
});

// ─── Update Modal Component (Instagram / Modern Style - 3:4 Ratio) ──────
const UpdateModal = ({ update, onClose }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!update) return null;

  const isFb =
    update.original_link?.includes("facebook.com") ||
    update.original_link?.includes("fb.watch");
  const isYt =
    update.original_link?.includes("youtube.com") ||
    update.original_link?.includes("youtu.be");

  const authorName = "isipathanamedia";

  const handleShare = async () => {
    const url = `${SITE_URL}/news/${update.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: update.title || "ICMU Update", url });
      } catch {
        /* Cancelled */
      }
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 lg:p-8 overflow-y-auto"
      onClick={onClose}
    >
      {/* Background Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.16, ease: "easeInOut" }}
        className="fixed inset-0 bg-black/85"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-[440px] lg:max-w-[860px] max-h-[90vh] lg:h-[580px] bg-[#0c0c0e] border border-white/[0.08] rounded-3xl flex flex-col lg:flex-row shadow-2xl overflow-hidden z-10 my-auto transform-gpu will-change-transform"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-3.5 right-3.5 w-8 h-8 bg-black/80 hover:bg-white/10 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-all z-50 backdrop-blur-sm border border-white/[0.08] shadow-lg active:scale-95"
        >
          <X size={16} />
        </button>

        {/* 3:4 Aspect Ratio Image Section */}
        <div className="w-full lg:w-[465px] lg:h-[580px] aspect-[3/4]  lg:max-h-none bg-black relative flex items-center justify-center shrink-0 overflow-hidden">
          <ImageWithLoader
            src={update.image}
            alt={update.title || "Update image"}
            imageClassName="w-full h-full object-cover sm:object-contain bg-black"
          />
        </div>

        {/* Content Section (Right on desktop, Bottom on phone) */}
        <div className="flex flex-col flex-1 min-w-0 min-h-0 bg-[#0c0c0e] border-t lg:border-t-0 lg:border-l border-white/[0.08]">
          {/* Header */}
          <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-white/[0.06] shrink-0 bg-[#0c0c0e] pr-12">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                <img
                  src={iconLogo}
                  alt="ICMU"
                  className="w-full h-full object-cover opacity-95"
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-white flex items-center gap-1.5 leading-tight truncate">
                  {authorName}
                  <BadgeCheck
                    size={14}
                    className="text-[#050505] fill-theme-accent shrink-0"
                  />
                </span>
                <span className="text-[10px] text-white/50 mt-0.5 leading-none truncate">
                  {update.category || "Official Update"}
                </span>
              </div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="p-4 sm:p-5 flex-1 overflow-y-auto custom-scrollbar bg-[#09090b]">
            <div className="flex flex-col gap-3">
              {update.title && (
                <h4 className="text-sm sm:text-base font-bold text-white leading-snug">
                  {update.title}
                </h4>
              )}

              <div className="text-xs sm:text-[13px] text-white/75 leading-relaxed font-light whitespace-pre-wrap">
                {update.content}
              </div>

              <div className="pt-2 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                {new Date(update.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
            </div>
          </div>

          {/* Footer Actions - Balanced 50 / 50 or full width */}
          <div className="p-3.5 sm:p-4 border-t border-white/[0.06] shrink-0 bg-[#08080a]">
            {update.original_link ? (
              <div className="flex items-center gap-2.5 w-full">
                {/* 50% Share Button */}
                <button
                  onClick={handleShare}
                  className="w-1/2 h-11 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 flex items-center justify-center gap-2 text-white/80 hover:text-white transition-all text-xs font-bold shadow-sm active:scale-[0.98]"
                >
                  {copied ? (
                    <>
                      <Check size={14} className="text-theme-accent" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 size={14} />
                      <span>Share</span>
                    </>
                  )}
                </button>

                {/* 50% View Link Button */}
                <a
                  href={update.original_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-1/2 h-11 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] ${
                    isFb
                      ? "bg-[#1877F2] text-white hover:bg-[#1877F2]/90 shadow-[#1877F2]/20"
                      : isYt
                      ? "bg-[#FF0000] text-white hover:bg-[#FF0000]/90 shadow-[#FF0000]/20"
                      : "bg-[var(--accent)] text-black hover:opacity-90 shadow-[var(--accent)]/20"
                  }`}
                >
                  <span className="truncate">
                    {isFb ? "Facebook" : isYt ? "YouTube" : "View Link"}
                  </span>
                  <ExternalLink size={14} className="shrink-0" />
                </a>
              </div>
            ) : (
              <button
                onClick={handleShare}
                className="w-full h-11 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 flex items-center justify-center gap-2 text-white/80 hover:text-white transition-all text-xs font-bold shadow-sm active:scale-[0.98]"
              >
                {copied ? (
                  <>
                    <Check size={14} className="text-theme-accent" />
                    <span>Link Copied to Clipboard</span>
                  </>
                ) : (
                  <>
                    <Share2 size={14} />
                    <span>Share Update</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Component: Modern 2-Column Card for Updates (3rd View Type) ─────────
const UpdateCard = React.memo(({ update, onSelect }) => (
  <button
    type="button"
    onClick={() => onSelect(update)}
    className="group  relative flex flex-col w-[160px] sm:w-[200px] md:w-[220px] lg:w-[240px] shrink-0 snap-start aspect-[3/4] rounded-2xl overflow-hidden bg-[#0c0c0e] border border-white/[0.08] text-left transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-lg "
  >
    <ImageWithLoader
      src={update.image}
      alt={update.title}
      fallbackIconClassName="w-10 h-10 opacity-20 object-contain grayscale"
      imageClassName="w-full opacity-100 transition-opacity  hover:opacity-50 h-full aspect-[3/4] object-cover bg-black transition-transform duration-500 group-hover:scale-105"
    />

    {/* Overlay Gradient */}
    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/90 pointer-events-none" />

    {/* Admin Badges */}
    <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 flex flex-col gap-1 z-20">
      {update.status === "draft" && (
        <span className="bg-yellow-500/90 text-black text-[8px] sm:text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full backdrop-blur-md shadow-lg">
          Draft
        </span>
      )}
      {update.status === "pending" && (
        <span className="bg-blue-500/90 text-white text-[8px] sm:text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full backdrop-blur-md shadow-lg">
          Pending
        </span>
      )}
      {update.visibility === "private" && (
        <span className="bg-red-500/90 text-white text-[8px] sm:text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full backdrop-blur-md shadow-lg">
          Private
        </span>
      )}
      {update.visibility === "unlisted" && (
        <span className="bg-purple-500/90 text-white text-[8px] sm:text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full backdrop-blur-md shadow-lg">
          Unlisted
        </span>
      )}
    </div>

    {/* Content overlay */}
    <div className="absolute bottom-0 left-0 right-0 p-2.5 sm:p-3.5 z-10 flex flex-col justify-end">
      <h4 className="text-xs sm:text-sm font-bold text-white leading-snug line-clamp-2 drop-shadow-md group-hover:text-theme-accent transition-colors">
        {update.title}
      </h4>
      <span className="text-[9px] sm:text-[10px] text-white/40 font-medium mt-1">
        {new Date(update.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })}
      </span>
    </div>
  </button>
));

// ─── Component: Sleek Editorial Feed Card for Articles ─────────────
const ArticleCard = React.memo(({ item, featured, compact, sidebar, onNavigate }) => {
  const isICMU = isInstitutionAuthor(item.author);
  const authorName = getPublicAuthorName(item.author);

  if (sidebar) {
    return (
      <div
        onClick={() => onNavigate(`/news/${item.id}`)}
        className="group cursor-pointer flex gap-4 items-start"
      >
        <div className="relative w-28 h-28 rounded-2xl overflow-hidden bg-[var(--admin-input-bg)] border border-white/[0.06] shrink-0 mt-1">
          <ImageWithLoader
            src={item.image}
            alt={item.title}
            imageClassName="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-80 group-hover:opacity-100"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[8px] font-bold tracking-widest text-theme-accent uppercase bg-theme-accent/10 px-1.5 py-0.5 rounded-2xl">
              {item.category || "News"}
            </span>
            <span className="text-[8px] text-white/40 uppercase tracking-widest">
              {new Date(item.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
          
          <h3 className="text-sm font-bold text-white leading-snug line-clamp-2 group-hover:text-theme-accent transition-colors mb-1.5">
            {item.title}
          </h3>

      

          <p className="text-[10px] text-white/40 line-clamp-2 leading-relaxed mb-2">
            {getPreview(item.content)}
          </p>

          <div className="text-[9px] font-bold text-white/20 group-hover:text-theme-accent transition-colors uppercase tracking-widest flex items-center gap-1">
            See more <ArrowRight size={10} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => onNavigate(`/news/${item.id}`)}
      className={`group w-full mx-auto cursor-pointer block ${featured ? "mb-8" : ""}`}
    >
      {/* Header info (Author, Date) - Only for featured/regular */}
      <div
        className={`flex items-center justify-between mb-4 px-2 ${compact ? "hidden" : ""}`}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[var(--admin-input-bg)] border border-white/[0.06] flex items-center justify-center text-white/70 font-bold text-xs shadow-sm overflow-hidden shrink-0">
            {isICMU ? (
              <img
                src={iconLogo}
                alt="ICMU"
                className="w-full h-full object-cover opacity-90"
              />
            ) : (
              authorName.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <p className="text-sm font-bold text-white group-hover:text-theme-accent transition-colors flex items-center gap-1.5">
              {authorName}
              {isICMU && (
                <BadgeCheck
                  size={14}
                  className="text-[#050505] fill-theme-accent"
                />
              )}
            </p>
            <p className="text-[9px] text-white/40 font-medium uppercase tracking-widest mt-0.5">
              {new Date(item.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
        <QuickShare article={item} />
      </div>

      {/* Image Cover */}
      <div
        className={`relative w-full ${
          featured ? "aspect-video rounded-2xl md:rounded-2xl" : "aspect-video rounded-2xl"
        } overflow-hidden bg-[var(--admin-input-bg)] mb-5 border border-white/[0.06] shadow-xl`}
      >
        <ImageWithLoader
          src={item.image}
          alt={item.title}
          imageClassName="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
        />
      </div>

      {/* Title and Preview */}
      <div className="px-2">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span
            className={`font-bold tracking-widest text-theme-accent uppercase bg-theme-accent/10 rounded-2xl ${
              featured ? "text-[10px] px-2.5 py-1" : "text-[9px] px-2 py-0.5"
            }`}
          >
            {item.category || "News"}
          </span>

          {/* Admin Badges */}
          {item.status === "draft" && (
            <span
              className={`font-bold tracking-widest text-black uppercase bg-yellow-500/90 rounded-2xl ${
                featured ? "text-[10px] px-2.5 py-1" : "text-[9px] px-2 py-0.5"
              }`}
            >
              Draft
            </span>
          )}
          {item.status === "pending" && (
            <span
              className={`font-bold tracking-widest text-white uppercase bg-blue-500/90 rounded-2xl ${
                featured ? "text-[10px] px-2.5 py-1" : "text-[9px] px-2 py-0.5"
              }`}
            >
              Pending
            </span>
          )}
          {item.visibility === "private" && (
            <span
              className={`font-bold tracking-widest text-white uppercase bg-red-500/90 rounded-2xl ${
                featured ? "text-[10px] px-2.5 py-1" : "text-[9px] px-2 py-0.5"
              }`}
            >
              Private
            </span>
          )}
          {item.visibility === "unlisted" && (
            <span
              className={`font-bold tracking-widest text-white uppercase bg-purple-500/90 rounded-2xl ${
                featured ? "text-[10px] px-2.5 py-1" : "text-[9px] px-2 py-0.5"
              }`}
            >
              Unlisted
            </span>
          )}

          {compact && (
            <span className="text-[9px] text-white/40 uppercase tracking-widest">
              {new Date(item.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          )}
        </div>
        <h2
          className={`${
            featured ? "text-2xl md:text-4xl" : "text-lg md:text-xl"
          } font-black text-white leading-[1.2] mb-3 line-clamp-2 tracking-tight group-hover:text-white/90 transition-colors`}
        >
          {item.title}
        </h2>
        {!compact && (
          <p className="text-xs md:text-sm text-white/50 line-clamp-2 md:line-clamp-3 font-light leading-relaxed mb-5">
            {getPreview(item.content)}
          </p>
        )}

        {/* Footer details */}
        <div className="flex items-center justify-between text-[9px] md:text-[10px] text-white/40 font-bold uppercase tracking-widest">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Clock size={12} className="text-white/20" />{" "}
              {getReadingTime(item.content)} min read
            </span>
            {!compact && item.tags?.length > 0 && (
              <span className="flex items-center gap-1.5">
                <Hash size={12} className="text-white/20" /> {item.tags[0]}
              </span>
            )}
          </div>
          <span className="text-theme-accent flex items-center gap-1.5 group-hover:gap-2 transition-all">
            Read <ArrowRight size={10} />
          </span>
        </div>
      </div>
    </div>
  );
});

// ─── Main NewsPage Component ────────────────────────────────────────
const NewsPage = () => {
  const { news, fetchNews, webUsers, fetchWebUsers, isFetching, loading, hasMoreNews } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();

  const role = user?.role?.toLowerCase();
  const isAdmin =
    role === "admin" ||
    role === "super_admin" ||
    role === "super-admin" ||
    role === "superadmin";

  const [searchParams, setSearchParams] = useSearchParams();
  const isLoadingNews = (isFetching || loading) && (!news || news.length === 0);
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeTag, setActiveTag] = useState(null);
  const [activeAuthor, setActiveAuthor] = useState(null);
  const [selectedUpdate, setSelectedUpdate] = useState(null);
  const [visibleCount, setVisibleCount] = useState(10);
  
  const carouselRef = useRef(null);

  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = 300;
      carouselRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    Promise.all([fetchNews(), fetchWebUsers()]);
  }, [fetchNews, fetchWebUsers]);

  useEffect(() => {
    const legacyId = searchParams.get("id");
    if (legacyId && /^\d+$/.test(legacyId)) {
      navigate(`/news/${legacyId}`, { replace: true });
    }
  }, [navigate, searchParams]);

  // Restore tag/author filter from URL
  useEffect(() => {
    const tagParam = searchParams.get("tag");
    const authorParam = searchParams.get("author");
    if (tagParam) setActiveTag(tagParam);
    if (authorParam) setActiveAuthor(authorParam);
  }, [searchParams]);

  // Deduplicate and filter news items (Admins see all; Public sees published only)
  const sortedNews = useMemo(() => {
    const map = new Map();
    (news || []).forEach((item) => {
      if (item && item.id && !map.has(item.id)) {
        if (
          isAdmin || 
          item.submitted_by === user?.id ||
          (item.status === "published" && item.visibility === "public")
        ) {
          map.set(item.id, item);
        }
      }
    });
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.date) - new Date(a.date),
    );
  }, [news, isAdmin]);

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set(sortedNews.map((n) => n.category).filter(Boolean));
    return ["All", ...Array.from(cats)];
  }, [sortedNews]);

  // Filter
  const filteredNews = useMemo(() => {
    let filtered = sortedNews;
    if (activeCategory !== "All") {
      filtered = filtered.filter((n) => n.category === activeCategory);
    }
    if (activeTag) {
      filtered = filtered.filter((n) => (n.tags || []).includes(activeTag));
    }
    if (activeAuthor) {
      filtered = filtered.filter((n) => n.author === activeAuthor);
    }
    return filtered;
  }, [sortedNews, activeCategory, activeTag, activeAuthor]);

  const updates = useMemo(
    () => filteredNews.filter((n) => n.type === "update"),
    [filteredNews],
  );
  const articles = useMemo(
    () => filteredNews.filter((n) => n.type !== "update"),
    [filteredNews],
  );

  const featuredArticle = articles.length > 0 ? articles[0] : null;
  const regularArticles = useMemo(
    () => (articles.length > 1 ? articles.slice(1) : []),
    [articles],
  );

  const handleSelectUpdate = useCallback((update) => {
    setSelectedUpdate(update);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedUpdate(null);
  }, []);

  const handleNavigate = useCallback((path) => {
    navigate(path);
  }, [navigate]);

  const clearFilters = useCallback(() => {
    setActiveCategory("All");
    setActiveTag(null);
    setActiveAuthor(null);
    setSearchParams({});
  }, [setSearchParams]);

  return (
    <div className="min-h-[100dvh] bg-[#050505] text-white font-sans relative pt-20 md:pt-28 pb-24 overflow-hidden">
      <SEO
        title="News & Updates"
        description="Stay updated with the latest news, articles, and announcements from the Isipathana College Media Unit (ICMU)."
        path="/news"
      />
      <AnimatedBg variant="landing" />

      <div className="container mx-auto max-w-6xl relative z-10 px-4">
        {/* Minimal Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 md:mb-12 border-b border-white/[0.06] pb-6">
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-white/40 hover:text-theme-accent text-[9px] uppercase tracking-[0.3em] font-bold transition-colors mb-4"
            >
              <ArrowLeft size={12} /> Home
            </Link>
            <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white">
              {activeAuthor ? (
                `Articles by ${activeAuthor}`
              ) : (
                <>
                  The <span className="text-theme-accent">News</span>
                </>
              )}
            </h1>
          </div>

          {/* Sleek Filters */}
          {sortedNews.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat);
                    if (cat !== "All") setActiveTag(null);
                  }}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${
                    activeCategory === cat
                      ? "bg-theme-accent text-black shadow-lg shadow-theme-accent/20"
                      : "bg-white/[0.03] text-white/50 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </header>

        {isLoadingNews ? (
          <div className="space-y-8 animate-pulse pt-10">
            {/* Skeleton Stories Strip */}
            <div className="flex gap-4 md:gap-5 overflow-hidden pb-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-44 md:w-52 aspect-[3/4] bg-white/[0.03] rounded-2xl border border-white/[0.02]"
                />
              ))}
            </div>

            {/* Skeleton Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 border-t border-white/[0.06] pt-8 md:pt-12">
              <div className="lg:col-span-2 space-y-8">
                <div className="w-full aspect-video rounded-2xl bg-white/[0.03] border border-white/[0.02]" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-full aspect-video rounded-2xl bg-white/[0.03] border border-white/[0.02]"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-white/[0.02] border border-white/[0.06] flex items-center justify-center mb-6">
              <Tag size={24} className="text-white/20" />
            </div>
            <h3 className="text-lg font-bold text-white/80 mb-2">
              No items found
            </h3>
            <p className="text-white/40 text-sm max-w-xs mb-6">
              Try adjusting your filters to see more content.
            </p>
            {(activeTag || activeCategory !== "All" || activeAuthor) && (
              <button
                onClick={clearFilters}
                className="text-theme-accent text-xs font-bold uppercase tracking-widest hover:underline"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-8">
              {/* Stories Grid (Updates - 3rd View Type) */}
              {updates.length > 0 && (
                <div className="mb-10 md:mb-14">
                  <div className="flex items-center gap-2 mb-4 px-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-theme-accent animate-pulse" />
                    <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">
                      Latest Updates
                    </span>
                  </div>
                  <div className="flex overflow-x-auto gap-4 md:gap-5 pb-6 pt-2 -mx-4 px-4 md:px-0 md:mx-0 custom-scrollbar snap-x snap-mandatory">
                    <div className="w-2 shrink-0 md:hidden"></div>
                    {updates.map((update) => (
                      <UpdateCard
                        key={update.id}
                        update={update}
                        onSelect={handleSelectUpdate}
                      />
                    ))}
                    <div className="w-2 shrink-0 md:hidden"></div>
                  </div>
                </div>
              )}

              {/* Articles Feed (Restored Sidebar Layout) */}
              {articles.length > 0 && (() => {
                const featuredArticle = articles.length > 0 ? articles[0] : null;
                const regularArticles = articles.length > 1 ? articles.slice(1) : [];
                
                return (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 border-t border-white/[0.06] pt-8 md:pt-12">
                    {/* Main Content (Featured + Grid) */}
                    <div className="lg:col-span-2 space-y-8">
                      {featuredArticle && (
                        <div className="mb-12">
                          <ArticleCard 
                            item={featuredArticle} 
                            featured={true} 
                            onNavigate={handleNavigate} 
                          />
                        </div>
                      )}

                      {/* Secondary Grid */}
                      {regularArticles.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                          {regularArticles.slice(0, 4).map((article) => (
                            <ArticleCard
                              key={article.id}
                              item={article}
                              compact={true}
                              onNavigate={handleNavigate}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Sidebar (List) */}
                    {(regularArticles.length > 4 || featuredArticle) && (
                      <div className="lg:col-span-1 border-t lg:border-t-0 lg:border-l border-white/[0.06] pt-8 lg:pt-0 lg:pl-8">
                        <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-widest flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-theme-accent"></span>{" "}
                          More Articles
                        </h3>
                        <div className="flex flex-col gap-6">
                          {regularArticles.slice(4, 4 + visibleCount).map((article) => (
                            <ArticleCard
                              key={article.id}
                              item={article}
                              sidebar={true}
                              onNavigate={handleNavigate}
                            />
                          ))}
                        </div>

                        {/* Load More Button */}
                        {regularArticles.length > 4 + visibleCount ? (
                          <div className="flex justify-center mt-10">
                            <button
                              onClick={() => setVisibleCount((prev) => prev + 10)}
                              className="w-full py-3 px-8 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] text-white/70 hover:text-white transition-all text-xs font-bold tracking-widest uppercase border border-white/[0.06]"
                            >
                              Show More
                            </button>
                          </div>
                        ) : hasMoreNews ? (
                          <div className="flex justify-center mt-10">
                            <button
                              onClick={() => {
                                setVisibleCount((prev) => prev + 10);
                                fetchNews(false, Math.ceil(news.length / 30));
                              }}
                              className="w-full py-3 px-8 rounded-2xl bg-theme-accent/10 hover:bg-theme-accent/20 text-theme-accent/70 hover:text-theme-accent transition-all text-xs font-bold tracking-widest uppercase border border-theme-accent/10"
                            >
                              Load More Articles
                            </button>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* If only updates exist, no articles to show */}
              {articles.length === 0 && updates.length > 0 && (
              <div className="py-12 text-center text-white/30 text-sm font-light">
                You're all caught up on articles. Tap the stories above for quick updates!
              </div>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedUpdate && (
          <UpdateModal
            update={selectedUpdate}
            onClose={handleCloseModal}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default React.memo(NewsPage);
