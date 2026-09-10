import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import {
  Search,
  X,
  Link as LinkIcon,
  Check,
  BookOpen,
  Copy,
  Layers,
  Sparkles,
  ExternalLink,
  Shield,
  FileText,
  Radio,
  FolderTree,
  Terminal,
  ArrowRight,
  ArrowLeft,
  Globe,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { ScrollProgress } from "../../components/motion/scroll-progress";
import { documentationSections } from "./documentationContent";

// Icon mapping for categories
const CATEGORY_ICONS = {
  General: Sparkles,
  System: Layers,
  Security: Shield,
  Public: ExternalLink,
  Editorial: FileText,
  "Super Admin": Terminal,
  Media: Radio,
  Development: FolderTree,
};

const SystemDocumentation = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [copiedSlug, setCopiedSlug] = useState(null);
  const searchInputRef = useRef(null);

  // Parse current topic from window.location.hash
  // Expected formats: #docs, #docs/roles, #roles, etc.
  const parseTopicFromHash = useCallback((hashStr) => {
    const raw = (hashStr || window.location.hash || "").replace("#", "").trim();
    if (!raw || raw === "docs" || raw === "overview") return null;

    let targetSlug = raw;
    if (raw.startsWith("docs/")) {
      targetSlug = raw.replace("docs/", "");
    }

    const matched = documentationSections.find(
      (s) => s.slug === targetSlug || s.id === targetSlug
    );
    return matched ? matched.slug : null;
  }, []);

  const [activeTopicSlug, setActiveTopicSlug] = useState(() =>
    parseTopicFromHash(window.location.hash)
  );

  // Synchronize hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const topic = parseTopicFromHash(window.location.hash);
      setActiveTopicSlug(topic);
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [parseTopicFromHash]);

  // Navigate to topic (or back to hub)
  const navigateToTopic = (slug) => {
    if (slug) {
      window.location.hash = `docs/${slug}`;
      setActiveTopicSlug(slug);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.location.hash = "docs";
      setActiveTopicSlug(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Find active section details
  const activeSection = useMemo(() => {
    if (!activeTopicSlug) return null;
    return (
      documentationSections.find((s) => s.slug === activeTopicSlug) || null
    );
  }, [activeTopicSlug]);

  // Previous and Next section computation
  const { prevSection, nextSection } = useMemo(() => {
    if (!activeTopicSlug) return { prevSection: null, nextSection: null };
    const currentIndex = documentationSections.findIndex(
      (s) => s.slug === activeTopicSlug
    );
    if (currentIndex === -1) return { prevSection: null, nextSection: null };

    return {
      prevSection:
        currentIndex > 0 ? documentationSections[currentIndex - 1] : null,
      nextSection:
        currentIndex < documentationSections.length - 1
          ? documentationSections[currentIndex + 1]
          : null,
    };
  }, [activeTopicSlug]);

  // Categories list
  const categories = useMemo(() => {
    return ["All", ...new Set(documentationSections.map((s) => s.category))];
  }, []);

  // Filtered sections for hub
  const filteredSections = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return documentationSections.filter((sec) => {
      const matchesCategory =
        activeCategory === "All" || sec.category === activeCategory;
      if (!matchesCategory) return false;

      if (!query) return true;

      const inTitle = sec.title.toLowerCase().includes(query);
      const inSummary = sec.summary.toLowerCase().includes(query);
      const inBadge = sec.badge.toLowerCase().includes(query);
      const inContent = sec.content.toLowerCase().includes(query);
      return inTitle || inSummary || inBadge || inContent;
    });
  }, [searchQuery, activeCategory]);

  // Copy link
  const copyTopicLink = (slug) => {
    const url = `${window.location.origin}${window.location.pathname}#docs/${slug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedSlug(slug);
      toast.success(`Copied direct link to #${slug}`);
      setTimeout(() => setCopiedSlug(null), 2000);
    });
  };

  // Markdown customizations (clean styling without harsh white lines)
  const markdownComponents = {
    table: ({ node, ...props }) => (
      <div className="overflow-x-auto w-full my-5 rounded-2xl border border-white/[0.06] bg-[#070709] p-3 sm:p-4">
        <table className="w-full min-w-[540px] text-xs sm:text-sm m-0" {...props} />
      </div>
    ),
    th: ({ node, ...props }) => (
      <th
        className="text-left font-semibold text-zinc-300 uppercase tracking-wider text-[11px] pb-3 border-b border-white/[0.06] px-3"
        {...props}
      />
    ),
    td: ({ node, ...props }) => (
      <td
        className="py-2.5 px-3 border-b border-white/[0.03] text-zinc-300 text-xs sm:text-sm leading-relaxed"
        {...props}
      />
    ),
    a: ({ node, href, children, ...props }) => {
      const isInternalDoc = href?.startsWith("#");
      return (
        <a
          href={href}
          onClick={(e) => {
            if (isInternalDoc) {
              e.preventDefault();
              const target = href.replace("#", "").replace("docs/", "");
              navigateToTopic(target);
            }
          }}
          className="text-green-400 font-medium hover:text-green-300 hover:underline transition-colors inline-flex items-center gap-1"
          {...props}>
          {children}
          {!isInternalDoc && <ExternalLink size={11} className="opacity-70" />}
        </a>
      );
    },
    pre: ({ node, children, ...props }) => {
      return (
        <div className="relative group my-4 rounded-2xl overflow-hidden border border-white/[0.05] bg-[#07070a]">
          <div className="flex items-center justify-between px-3.5 py-2 bg-white/[0.02] text-[11px] text-zinc-400 font-mono">
            <span>Reference</span>
            <button
              type="button"
              onClick={() => {
                const text = node?.children?.[0]?.children?.[0]?.value || "";
                if (text) {
                  navigator.clipboard.writeText(text);
                  toast.success("Code snippet copied");
                }
              }}
              className="p-1 rounded hover:bg-white/[0.08] text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Copy snippet">
              <Copy size={12} />
            </button>
          </div>
          <pre
            className="p-3 sm:p-4 overflow-x-auto text-[11px] sm:text-xs font-mono text-zinc-300 leading-relaxed m-0 whitespace-pre-wrap sm:whitespace-pre break-words sm:break-normal max-w-full"
            {...props}>
            {children}
          </pre>
        </div>
      );
    },
  };

  // ════════════════════════════════════════════════════════════════════════════
  // 1. DEDICATED TOPIC READER VIEW (when #docs/<slug> is active)
  // ════════════════════════════════════════════════════════════════════════════
  if (activeSection) {
    const CategoryIcon = CATEGORY_ICONS[activeSection.category] || Layers;

    return (
      <div className="space-y-6 animate-fade-in pb-20 relative">
        {/* Scroll reading progress bar */}
        <ScrollProgress height={3} className="!bg-green-500 shadow-none" />

        {/* ── Top Navigation Bar ── */}
        <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-[#09090c] border border-white/[0.08]">
          <button
            type="button"
            onClick={() => navigateToTopic(null)}
            className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/[0.06] px-3 py-2 rounded-xl transition-all cursor-pointer">
            <ArrowLeft size={15} />
            <span>Back to Documentation</span>
          </button>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => copyTopicLink(activeSection.slug)}
              className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-green-400 transition-colors cursor-pointer"
              title="Copy link to this chapter">
              {copiedSlug === activeSection.slug ? (
                <Check size={15} className="text-green-400" />
              ) : (
                <LinkIcon size={15} />
              )}
            </button>
          </div>
        </div>

        {/* ── Dedicated Article Viewer Card ── */}
        <article className="rounded-3xl border border-white/[0.08] bg-[#09090c] overflow-hidden">
          {/* Article Header */}
          <div className="p-6 sm:p-8 border-b border-white/[0.06] bg-[#0c0c10]">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-zinc-400">
                {activeSection.number}
              </span>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-green-400 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20">
                <CategoryIcon size={11} />
                <span>{activeSection.category}</span>
              </span>
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">
                • {activeSection.badge}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">
              {activeSection.title}
            </h1>
            <p className="text-sm text-zinc-400 leading-relaxed max-w-3xl">
              {activeSection.summary}
            </p>
          </div>

          {/* Article Body */}
          <div className="p-6 sm:p-10 bg-[#07070a]">
            <div
              className="prose prose-sm md:prose-base prose-invert prose-green max-w-none
              prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-white
              prose-h1:hidden
              prose-h2:text-lg sm:prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b prose-h2:border-white/[0.06]
              prose-h3:text-sm sm:prose-h3:text-base prose-h3:mt-6 prose-h3:mb-2 prose-h3:text-zinc-200
              prose-p:text-zinc-300 prose-p:text-xs sm:prose-p:text-sm prose-p:leading-relaxed
              prose-li:text-zinc-300 prose-li:text-xs sm:prose-li:text-sm
              prose-strong:text-white prose-strong:font-bold
              prose-code:bg-white/[0.06] prose-code:text-green-300 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-2xl prose-code:font-mono prose-code:text-xs prose-code:before:hidden prose-code:after:hidden
            ">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={markdownComponents}>
                {activeSection.content}
              </ReactMarkdown>
            </div>
          </div>

          {/* Article Bottom Pagination */}
          <div className="p-5 sm:p-6 border-t border-white/[0.06] bg-[#09090c] flex flex-col sm:flex-row items-center justify-between gap-4">
            {prevSection ? (
              <button
                type="button"
                onClick={() => navigateToTopic(prevSection.slug)}
                className="w-full sm:w-auto text-left p-3 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] transition-all cursor-pointer group">
                <span className="text-[10px] uppercase font-mono text-zinc-500 block mb-0.5">
                  ← Previous Topic
                </span>
                <span className="text-xs font-semibold text-zinc-300 group-hover:text-green-400 transition-colors">
                  {prevSection.number} {prevSection.title}
                </span>
              </button>
            ) : (
              <div />
            )}

            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white text-xs transition-colors flex items-center gap-1.5 cursor-pointer">
              <ChevronUp size={14} />
              <span>Back to Top</span>
            </button>

            {nextSection ? (
              <button
                type="button"
                onClick={() => navigateToTopic(nextSection.slug)}
                className="w-full sm:w-auto text-right p-3 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] transition-all cursor-pointer group">
                <span className="text-[10px] uppercase font-mono text-zinc-500 block mb-0.5">
                  Next Topic →
                </span>
                <span className="text-xs font-semibold text-zinc-300 group-hover:text-green-400 transition-colors">
                  {nextSection.number} {nextSection.title}
                </span>
              </button>
            ) : (
              <div />
            )}
          </div>
        </article>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 2. DOCUMENTATION HUB VIEW (when #docs is active)
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-6 animate-fade-in pb-16 relative">
      {/* ── Minimalist Top Hero Banner ── */}
      <div className="bg-[#09090c] border border-white/[0.08] rounded-3xl p-6 sm:p-8 relative overflow-hidden backdrop-blur-xl">
        <div className="relative z-10 space-y-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold">
              <BookOpen size={13} />
              <span>Super Admin Knowledge Hub</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              System Documentation
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-2xl">
              Clean, human-readable operations and architecture manual. Select any chapter below to view full details.
            </p>
          </div>

          {/* ── Search Bar ── */}
          <div className="relative max-w-xl">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search size={14} className="text-zinc-400" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topics, roles, newsdesk, live stream, or settings..."
              className="w-full pl-9 pr-9 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-2xl text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-green-500/50 focus:bg-white/[0.06] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
                title="Clear search">
                <X size={14} />
              </button>
            )}
          </div>

          {/* ── Category Filters ── */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar pt-1">
            {categories.map((cat) => {
              const Icon = CATEGORY_ICONS[cat] || Layers;
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? "bg-green-500 text-zinc-950 font-bold"
                      : "bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-zinc-400 hover:text-white"
                  }`}>
                  <Icon size={12} />
                  <span>{cat}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Clean Topic Cards Grid (No repetitive list below!) ── */}
      {filteredSections.length === 0 ? (
        <div className="text-center py-16 bg-[#09090c] rounded-3xl border border-white/[0.08] p-8 space-y-3">
          <div className="w-12 h-12 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center mx-auto text-zinc-400">
            <Search size={20} />
          </div>
          <h3 className="text-base font-bold text-white">No topics match your search</h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            We couldn't find any documentation sections matching "<span className="text-white">{searchQuery}</span>".
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setActiveCategory("All");
            }}
            className="px-4 py-2 rounded-xl bg-green-500 text-zinc-950 font-bold text-xs hover:bg-green-400 transition-colors cursor-pointer mt-2">
            Clear Search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSections.map((sec) => {
            const Icon = CATEGORY_ICONS[sec.category] || Layers;

            return (
              <div
                key={sec.id}
                onClick={() => navigateToTopic(sec.slug)}
                className="p-5 rounded-3xl bg-[#09090c] border border-white/[0.08] hover:border-white/[0.18] transition-all cursor-pointer flex flex-col justify-between group">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="w-9 h-9 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-300 group-hover:text-green-400 transition-colors">
                      <Icon size={16} />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/[0.06] text-zinc-400">
                        {sec.number}
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-green-400 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20">
                        {sec.category}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-green-400 transition-colors mb-1.5">
                    {sec.title}
                  </h3>
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {sec.summary}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-white/[0.04] flex items-center justify-between text-xs text-zinc-400 group-hover:text-green-400 font-medium">
                  <span>View Documentation</span>
                  <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Quick Terminals Footer ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <a
          href="https://isipathanamedia.online"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between p-4 rounded-2xl bg-[#09090c] border border-white/[0.08] hover:border-white/[0.16] text-xs text-zinc-300 hover:text-white transition-all">
          <span className="flex items-center gap-2.5 font-medium">
            <Globe size={15} className="text-green-400" />
            <span>Visit Public Website</span>
          </span>
          <ExternalLink size={13} className="text-zinc-500" />
        </a>

        <a
          href="https://vibhavi.isipathanamedia.online"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between p-4 rounded-2xl bg-[#09090c] border border-white/[0.08] hover:border-white/[0.16] text-xs text-zinc-300 hover:text-white transition-all">
          <span className="flex items-center gap-2.5 font-medium">
            <Radio size={15} className="text-amber-400" />
            <span>Listen to Vibhavi FM Radio</span>
          </span>
          <ExternalLink size={13} className="text-zinc-500" />
        </a>
      </div>
    </div>
  );
};

export default SystemDocumentation;
