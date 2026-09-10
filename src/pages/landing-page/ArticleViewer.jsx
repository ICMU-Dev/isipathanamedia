import Loader from "../../components/ui/Loader";
import React, { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";
import {
  ArrowLeft,
  Calendar,
  Tag,
  Clock,
  Facebook,
  Twitter,
  Linkedin,
  Copy,
  Check,
  Share2,
  UserPen,
  Hash,
  Play,
  ArrowRight,
  BadgeCheck,
  X,
} from "lucide-react";
import iconLogo from "../../assets/image.png";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import DOMPurify from "dompurify";
import AnimatedBg from "../../components/ui/AnimatedBg";
import SEO from "../../components/SEO";
import ImageWithLoader from "../../components/ui/ImageWithLoader";
import { getPublicAuthorName, isInstitutionAuthor } from "../../utils/authorUtils";

const SITE_URL = import.meta.env.VITE_SITE_URL || (typeof window !== "undefined" ? window.location.origin : "");



// ─── Share Button Component ──────────────────────────────────────
const ShareButton = ({ article }) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${SITE_URL}/news/${article.id}`;
  const shareText = article.title;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: shareText, url: shareUrl });
      } catch {
        /* User cancelled */
      }
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareFb = () =>
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      "_blank",
      "width=600,height=400",
    );
  const shareTw = () =>
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      "_blank",
      "width=600,height=400",
    );
  const shareLi = () =>
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      "_blank",
      "width=600,height=400",
    );

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-white/30 [writing-mode:vertical-lr] rotate-180 mb-2">
        Share
      </p>
      <div className="w-px h-8 bg-white/10" />
      <div className="flex flex-col gap-4">
        {navigator.share && (
          <button
            onClick={handleNativeShare}
            className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white/50 hover:text-theme-accent  hover:bg-theme-accent/10 hover:border-theme-accent/20 transition-all"
            title="Share">
            <Share2 size={16} />
          </button>
        )}
        <button
          onClick={shareFb}
          className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white/50 hover:text-[#1877F2] hover:bg-[#1877F2]/10 hover:border-[#1877F2]/20 transition-all"
          title="Facebook">
          <Facebook size={16} />
        </button>
        <button
          onClick={shareTw}
          className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white/50 hover:text-[#1DA1F2] hover:bg-[#1DA1F2]/10 hover:border-[#1DA1F2]/20 transition-all"
          title="Twitter / X">
          <Twitter size={16} />
        </button>
        <button
          onClick={shareLi}
          className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white/50 hover:text-[#0A66C2] hover:bg-[#0A66C2]/10 hover:border-[#0A66C2]/20 transition-all"
          title="LinkedIn">
          <Linkedin size={16} />
        </button>
        <button
          onClick={handleCopy}
          className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all"
          title="Copy link">
          {copied ? (
            <Check size={16} className="text-theme-accent " />
          ) : (
            <Copy size={16} />
          )}
        </button>
      </div>
    </div>
  );
};

// ─── Mobile Share Bar ────────────────────────────────────────────
const MobileShareBar = ({ article }) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${SITE_URL}/news/${article.id}`;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: article.title, url: shareUrl });
      } catch {
        /* User cancelled */
      }
    }
  };
  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const shareFb = () =>
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      "_blank",
    );

  return (
    <div className="md:hidden flex items-center justify-center gap-4 py-4 mb-8 border-y border-white/[0.06]">
      {navigator.share && (
        <button
          onClick={handleNativeShare}
          className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white/50 hover:text-theme-accent  transition-colors">
          <Share2 size={16} />
        </button>
      )}
      <button
        onClick={shareFb}
        className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white/50 hover:text-[#1877F2] transition-colors">
        <Facebook size={16} />
      </button>
      <button
        onClick={handleCopy}
        className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white/50 hover:text-white transition-colors">
        {copied ? (
          <Check size={16} className="text-theme-accent " />
        ) : (
          <Copy size={16} />
        )}
      </button>
    </div>
  );
};

/**
 * Automatically groups consecutive article images into a responsive Tailwind masonry gallery.
 */
const groupConsecutiveImagesToMasonry = (htmlContent) => {
  if (!htmlContent || typeof window === "undefined" || !window.DOMParser) {
    return htmlContent || "";
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div>${htmlContent}</div>`, "text/html");
    const container = doc.body.firstElementChild;
    if (!container) return htmlContent;

    const isImageBlock = (el) => {
      if (!el || el.nodeType !== 1) return false;
      const tag = el.tagName.toLowerCase();
      if (tag === "img") return true;
      if (["p", "figure", "div"].includes(tag)) {
        const imgs = el.querySelectorAll("img");
        if (imgs.length > 0) {
          const text = el.textContent.trim();
          if (text === "") return true;
        }
      }
      return false;
    };

    const extractImages = (el) => {
      if (!el || el.nodeType !== 1) return [];
      if (el.tagName.toLowerCase() === "img") return [el];
      return Array.from(el.querySelectorAll("img"));
    };

    const children = Array.from(container.children);
    let i = 0;
    while (i < children.length) {
      const child = children[i];
      if (isImageBlock(child)) {
        const streak = [child];
        let j = i + 1;
        while (j < children.length && isImageBlock(children[j])) {
          streak.push(children[j]);
          j++;
        }

        const allImgs = streak.flatMap(extractImages);
        if (allImgs.length >= 2) {
          // Build masonry gallery container
          const gallery = doc.createElement("div");
          
          if (allImgs.length === 2) {
            // Exactly 2 images: 2-column grid side-by-side even on mobile (no 1-by-1 stack)
            gallery.className = "not-prose my-6 grid grid-cols-2 gap-2 sm:gap-3.5 items-start";
          } else {
            // 3+ images: keep multi-column masonry on mobile (columns-2), scaled down proportionally
            const colClass =
              allImgs.length >= 7
                ? "columns-2 sm:columns-3 lg:columns-4"
                : "columns-2 sm:columns-3";
            gallery.className = `not-prose my-6 sm:my-8 ${colClass} gap-2 sm:gap-3.5`;
          }

          allImgs.forEach((img) => {
            const item = doc.createElement("div");
            // mb-2 sm:mb-3.5 provides exact vertical gap matching the horizontal gap, NO space-y-*
            item.className =
              "break-inside-avoid mb-2 sm:mb-3.5 overflow-hidden rounded-xl sm:rounded-2xl border border-white/10 bg-white/[0.02] shadow-md group relative cursor-zoom-in transition-all duration-300 hover:border-white/25 hover:scale-[1.01]";

            const newImg = doc.createElement("img");
            newImg.src = img.src;
            newImg.alt = img.alt || "Article gallery image";
            newImg.loading = "lazy";
            newImg.decoding = "async";
            newImg.className =
              "w-full h-auto object-cover rounded-xl sm:rounded-2xl block transition-transform duration-300";

            item.appendChild(newImg);
            gallery.appendChild(item);
          });

          container.replaceChild(gallery, streak[0]);
          for (let k = 1; k < streak.length; k++) {
            container.removeChild(streak[k]);
          }
          i = j;
          continue;
        }
      }
      i++;
    }

    return container.innerHTML;
  } catch (err) {
    console.error("Gallery masonry transform error:", err);
    return htmlContent;
  }
};

// ─── Main Component ──────────────────────────────────────────────
const ArticleViewer = () => {
  const { id } = useParams();
  const { news, fetchNews, fetchArticleById } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [fetchComplete, setFetchComplete] = useState(false);
  const [article, setArticle] = useState(null);

  const loading = !fetchComplete;

  useEffect(() => {
    // Scroll instantly when ID changes, before fetch
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    
    let active = true;
    
    setFetchComplete(false);
    // Check if already in news cache and is an update
    const cached = (news || []).find((n) => String(n.id) === String(id));
    if (cached?.type === 'update') {
      navigate(`/news#update-${cached.id}`, { replace: true });
      return;
    }

    // Immediately fetch the requested article to maximize LCP and render speed
    fetchArticleById(id, user).then((fetchedArticle) => {
      if (!active) return;
      if (fetchedArticle?.type === 'update') {
        navigate(`/news#update-${fetchedArticle.id}`, { replace: true });
        return;
      }
      setArticle(fetchedArticle);
      setFetchComplete(true);
    });

    // Background fetch general news for related articles if not already loaded
    if (!news || news.length === 0) {
      fetchNews();
    }
    
    return () => { active = false; };
  }, [id, user, fetchArticleById, fetchNews, news?.length]);

  useEffect(() => {
    if (fetchComplete) {
      // Track article view in GA4
      if (article && article.type !== 'update') {
        window.gtag?.('event', 'article_view', {
          article_id: article.id,
          article_title: article.title,
          article_category: article.category || 'General',
          page_path: `/news/${article.id}`,
        });
      }
    }
  }, [fetchComplete, article]);

  const [activeLightboxImage, setActiveLightboxImage] = useState(null);

  useEffect(() => {
    if (!activeLightboxImage) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setActiveLightboxImage(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeLightboxImage]);

  const handleArticleImageClick = (e) => {
    const img = e.target.closest("img");
    if (img && img.src && !img.classList.contains("no-lightbox") && !img.closest("header")) {
      setActiveLightboxImage({
        src: img.src,
        alt: img.alt || article?.title || "Article image",
      });
    }
  };

  // Group consecutive images into masonry gallery (must be declared before conditional returns)
  const processedContent = useMemo(() => {
    const raw = article?.content || "";
    const sanitized = DOMPurify.sanitize(raw);
    return groupConsecutiveImagesToMasonry(sanitized);
  }, [article?.content]);

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-[#050505] pt-32 px-4 md:px-8">
        <div className="container mx-auto max-w-4xl space-y-8 animate-pulse">
          <div className="flex gap-4">
            <div className="w-16 h-6 bg-white/[0.03] rounded-2xl"></div>
            <div className="w-24 h-6 bg-white/[0.03] rounded-2xl"></div>
          </div>
          <div className="space-y-4">
            <div className="h-12 md:h-16 bg-white/[0.03] rounded-2xl w-3/4"></div>
            <div className="h-12 md:h-16 bg-white/[0.03] rounded-2xl w-1/2"></div>
          </div>
          <div className="flex items-center gap-4 pt-4">
            <div className="w-12 h-12 rounded-full bg-white/[0.03]"></div>
            <div className="space-y-2">
              <div className="h-4 bg-white/[0.03] rounded w-32"></div>
              <div className="h-3 bg-white/[0.03] rounded w-24"></div>
            </div>
          </div>
          <div className="w-full aspect-video md:aspect-[21/9] bg-white/[0.03] rounded-2xl mt-8"></div>
          <div className="space-y-4 pt-12">
            <div className="h-4 bg-white/[0.03] rounded w-full"></div>
            <div className="h-4 bg-white/[0.03] rounded w-full"></div>
            <div className="h-4 bg-white/[0.03] rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-[100dvh] bg-[#050505] text-white flex flex-col items-center justify-center p-4 text-center">
        <div className="w-24 h-24 rounded-full bg-white/[0.02] border border-white/[0.06]  flex items-center justify-center mb-8">
          <Tag size={32} className="text-white/10" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-4 text-white/90">
          Article Not Found
        </h1>
        <p className="text-white/40 mb-10 max-w-md text-sm leading-relaxed">
          The requested article has been moved, deleted, or restricted. Private and unlisted articles are only accessible to their author or administrators.
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => navigate("/news")}
            className="px-8 py-3.5 border border-white/5 bg-white/[0.02] rounded-full text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all duration-300">
            Return to News
          </button>
        
        </div>
      </div>
    );
  }

 
  // Reading time
  const plainText = article.content
    ? article.content.replace(/<[^>]*>/g, "")
    : "";
  const wordCount = plainText.split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  // Author
  const authorName = getPublicAuthorName(article.author);

  const authorInitials = authorName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
  const isDefaultAuthor = isInstitutionAuthor(article.author);

  // SEO description
  const seoDescription =
    plainText.substring(0, 160).trim() + (plainText.length > 160 ? "..." : "");

  // Related articles (same category, excluding current)
  const relatedArticles = (news || [])
    .filter(
      (n) =>
        n.id !== article.id &&
        (n.category === article.category ||
          (article.tags || []).some((t) => (n.tags || []).includes(t))),
    )
    .slice(0, 3);

  return (
    <div className="min-h-[100dvh] bg-[#050505] text-white font-sans relative pt-24 md:pt-32 pb-24 overflow-hidden">
      <SEO
        title={article.title}
        description={seoDescription}
        path={`/news/${article.id}`}
        image={article.image}
        type="article"
        keywords={article.tags?.length ? article.tags.join(", ") : undefined}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          headline: article.title,
          image: article.image ? [article.image] : [],
          datePublished: article.date,
          author: { "@type": "Organization", name: authorName },
          publisher: {
            "@type": "Organization",
            name: "Isipathana College Media Unit",
            url: SITE_URL,
          },
          description: seoDescription,
        }}
      />
      <AnimatedBg variant="landing" />

      <article className="relative z-10">
        {/* Navigation */}
        <div className="container mx-auto max-w-6xl px-4 md:px-8 mb-8 md:mb-12">
          <Link
            to="/news"
            className="inline-flex items-center gap-2 text-white/50 hover:text-theme-accent  text-[10px] uppercase tracking-[0.3em] font-bold transition-colors">
            <ArrowLeft size={14} /> All Articles
          </Link>
        </div>

        {/* Article Header */}
        <header className="container mx-auto max-w-6xl px-4 md:px-8 mb-6 md:mb-16">
          <div className="max-w-4xl">
            <div className="flex flex-wrap items-center gap-2 md:gap-3 text-[9px] md:text-xs font-bold uppercase tracking-widest mb-4 md:mb-6">
              <span className="text-theme-accent  bg-theme-accent/10 px-2 md:px-3 py-1 md:py-1.5 rounded-2xl ">
                {article.category || "News"}
              </span>

              {/* Admin Badges */}
              {article.status === 'draft' && (
                <span className="text-black bg-yellow-500/90 px-2 md:px-3 py-1 md:py-1.5 rounded-2xl">Draft</span>
              )}
              {article.status === 'pending' && (
                <span className="text-white bg-blue-500/90 px-2 md:px-3 py-1 md:py-1.5 rounded-2xl">Pending</span>
              )}
              {article.visibility === 'private' && (
                <span className="text-white bg-red-500/90 px-2 md:px-3 py-1 md:py-1.5 rounded-2xl">Private</span>
              )}
              {article.visibility === 'unlisted' && (
                <span className="text-white bg-purple-500/90 px-2 md:px-3 py-1 md:py-1.5 rounded-2xl">Unlisted</span>
              )}

              <span className="text-white/40 flex items-center gap-1 md:gap-1.5">
                {new Date(article.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              <span className="text-white/20 hidden sm:inline">•</span>
              <span className="text-white/40 flex items-center gap-1 md:gap-1.5">
                {readingTime} MIN READ
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-6xl font-black tracking-tight mb-6 md:mb-8 leading-[1.1] text-white">
              {article.title}
            </h1>

            <div className="flex items-center gap-3 md:gap-4">
              <Link
                to={`/author/${encodeURIComponent(authorName)}`}
                className="w-12 h-12 rounded-full bg-[var(--admin-input-bg)]   border border-white/[0.06] flex items-center justify-center text-white/70 font-bold text-sm shadow-sm overflow-hidden shrink-0 hover:border-theme-accent/50 transition-colors">
                {isDefaultAuthor ? (
                  <img
                    src={iconLogo}
                    alt="ICMU Logo"
                    className="w-full h-full object-cover opacity-90"
                  />
                ) : (
                  authorInitials
                )}
              </Link>
              <div className="flex flex-col">
                <Link
                  to={`/author/${encodeURIComponent(authorName)}`}
                  className="text-sm md:text-base font-bold text-white hover:text-theme-accent  transition-colors flex items-center gap-1.5">
                  {authorName}
                  {isDefaultAuthor && (
                    <BadgeCheck
                      size={14}
                      className="text-[#050505] fill-theme-accent"
                    />
                  )}
                </Link>
                <p className="text-[10px] text-white/40 uppercase tracking-widest mt-0.5">
                  {article.author ? "Author" : "Isipathana College Media Unit"}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Share Bar */}
        <div className="container mx-auto max-w-6xl px-4 md:px-8">
          <MobileShareBar article={article} />
        </div>

        {/* Feature Image */}
        {article.image && (
          <div className="container mx-auto max-w-6xl px-4 md:px-8 mb-8 md:mb-20">
            <div className="w-full aspect-video md:aspect-[16/9] rounded-2xl md:rounded-2xl overflow-hidden border border-white/[0.06] bg-[#09090b] shadow-xl md:shadow-2xl relative">
              <ImageWithLoader
                src={article.image}
                alt={article.title}
                priority={true}
                imageClassName="w-full h-full object-contain aspect-video relative z-10"
              />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="container mx-auto max-w-6xl px-4 md:px-8 flex flex-col md:flex-row gap-12 lg:gap-24 relative">
          {/* Share Sidebar (Desktop) */}
          <aside className="hidden md:block w-16 shrink-0 border-r border-white/[0.06] pr-8">
            <div className="sticky top-40">
              <ShareButton article={article} />
            </div>
          </aside>

          {/* Article Body */}
          <main className="flex-1 min-w-0 max-w-3xl">
            <div
              onClick={handleArticleImageClick}
              className="prose prose-invert prose-sm sm:prose-base md:prose-lg font-light leading-relaxed
                            prose-p:text-white/80 prose-p:mb-4 sm:prose-p:mb-8
                            prose-headings:font-black prose-headings:tracking-tight prose-headings:text-white
                            prose-h2:text-xl sm:prose-h2:text-3xl prose-h2:mt-8 sm:prose-h2:mt-16 prose-h2:mb-4 sm:prose-h2:mb-6
                            prose-h3:text-lg sm:prose-h3:text-2xl prose-h3:mt-6 sm:prose-h3:mt-12 prose-h3:mb-3 sm:prose-h3:mb-4
                            prose-a:text-theme-accent  prose-a:no-underline hover:prose-a:underline
                            prose-img:rounded-2xl md:prose-img:rounded-2xl prose-img:border prose-img:border-white/[0.06]  prose-img:shadow-lg md:prose-img:shadow-2xl prose-img:my-6 sm:prose-img:my-10 prose-img:w-full
                            prose-hr:border-white/[0.06] prose-hr:my-8 sm:prose-hr:my-12
                            prose-blockquote:border-l-2 sm:prose-blockquote:border-l-4 prose-blockquote:border-theme-accent prose-blockquote:bg-[var(--admin-card-bg)]   prose-blockquote:py-2 sm:prose-blockquote:py-4 prose-blockquote:px-4 sm:prose-blockquote:px-8 prose-blockquote:rounded-r-xl sm:prose-blockquote:rounded-r-2xl prose-blockquote:italic prose-blockquote:text-white/90 prose-blockquote:shadow-md
                            marker:text-theme-accent 
                            prose-video:rounded-2xl sm:prose-video:rounded-2xl prose-video:border prose-video:border-white/[0.06] 
                            [&_iframe]:rounded-2xl sm:[&_iframe]:rounded-2xl [&_iframe]:border [&_iframe]:border-white/[0.06]  [&_iframe]:shadow-xl sm:[&_iframe]:shadow-2xl [&_iframe]:my-6 sm:[&_iframe]:my-10 [&_iframe]:w-full [&_iframe]:aspect-video">
              <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                {processedContent}
              </ReactMarkdown>
            </div>

            {/* Footer Meta */}
            <div className="mt-10 sm:mt-24 pt-8 sm:pt-12 border-t border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[var(--admin-input-bg)]   border border-white/[0.06] flex items-center justify-center font-bold text-white/70 overflow-hidden shadow-sm">
                  {isDefaultAuthor ? (
                    <img
                      src={iconLogo}
                      alt="ICMU Logo"
                      className="w-full h-full object-cover opacity-90"
                    />
                  ) : (
                    authorInitials
                  )}
                </div>
                <div>
                  <p className="text-base font-bold text-white flex items-center gap-1.5">
                    {authorName}
                    {isDefaultAuthor && (
                      <BadgeCheck
                        size={14}
                        className="text-[#050505] fill-theme-accent"
                      />
                    )}
                  </p>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">
                    {article.author
                      ? "Author"
                      : "Isipathana College Media Unit"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="px-6 py-3 bg-[var(--admin-card-bg)]   hover:bg-[#222] border border-white/[0.06]  rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] transition-colors flex items-center gap-2 shadow-sm">
                Back to Top <ArrowLeft size={12} className="rotate-90" />
              </button>
            </div>

            {/* Related Articles */}
            {relatedArticles.length > 0 && (
              <div className="mt-20 sm:mt-24 border-t border-white/[0.06] pt-16">
                <h2 className="text-2xl font-black tracking-tight text-white mb-8">
                  You might also like
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {relatedArticles.map((item) => (
                    <Link
                      to={`/news/${item.id}`}
                      key={item.id}
                      className="group w-full mx-auto cursor-pointer block"
                    >
                      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-[#0c0c0e] mb-4 border border-white/[0.06] shadow-xl">
                        <ImageWithLoader
                          src={item.image}
                          alt={item.title}
                          imageClassName="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                        />
                      </div>
                      <div className="px-2">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="font-bold tracking-widest text-theme-accent uppercase bg-theme-accent/10 rounded-2xl text-[9px] px-2 py-0.5">
                            {item.category || "News"}
                          </span>
                          <span className="text-[9px] text-white/40 uppercase tracking-widest">
                            {new Date(item.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <h3 className="text-sm md:text-base font-bold text-white leading-snug group-hover:text-theme-accent transition-colors">
                          {item.title}
                        </h3>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </main>
        </div>
      </article>

      {/* Fullscreen Lightbox Modal */}
      {activeLightboxImage && createPortal(
        <div
          className="fixed inset-0 z-[400] bg-black/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150"
          onClick={() => setActiveLightboxImage(null)}
        >
          <button
            type="button"
            onClick={() => setActiveLightboxImage(null)}
            aria-label="Close image viewer"
            className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shadow-lg"
          >
            <X size={20} />
          </button>
          <div
            className="relative max-w-5xl max-h-[90vh] w-full flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={activeLightboxImage.src}
              alt={activeLightboxImage.alt}
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-white/10 select-none"
            />
            {activeLightboxImage.alt && activeLightboxImage.alt !== "Article gallery image" && (
              <p className="mt-3 text-xs sm:text-sm text-white/60 text-center max-w-2xl px-4 line-clamp-2">
                {activeLightboxImage.alt}
              </p>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default ArticleViewer;
