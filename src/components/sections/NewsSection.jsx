import React, { useRef, useEffect, useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import ImageWithLoader from "../ui/ImageWithLoader";
import AnimatedBg from "../ui/AnimatedBg";
import { useData } from "../../context/DataContext";

const getExcerpt = (item) => {
  const content = item.content || item.description || "";
  return String(content).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
};

const NewsSection = () => {
  const { news, isLoadingNews } = useData();
  const carouselRef = useRef(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Show up to 12 most recent public articles or updates.
  const recentNews = useMemo(() => {
    return (
      news
        ?.filter((n) => n.status === "published" && n.visibility === "public")
        ?.sort((a, b) => new Date(b.date) - new Date(a.date))
        ?.slice(0, 12) || []
    );
  }, [news]);

  const checkScrollability = useCallback(() => {
    if (!carouselRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  }, []);

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    checkScrollability();
    el.addEventListener("scroll", checkScrollability, { passive: true });
    window.addEventListener("resize", checkScrollability);
    return () => {
      el.removeEventListener("scroll", checkScrollability);
      window.removeEventListener("resize", checkScrollability);
    };
  }, [checkScrollability, recentNews]);

  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = Math.max(carouselRef.current.clientWidth * 0.75, 340);
      carouselRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section
      id="news"
      className="relative py-24 md:py-32 text-white bg-[#010104] overflow-hidden min-h-[100dvh] flex flex-col justify-center"
    >
      <AnimatedBg variant="news" />

      <div className="container relative z-10 px-4 sm:px-6 mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 border-b border-white/[0.06] pb-8">
          <div className="space-y-3 text-center md:text-left">
            <h2 className="text-theme-accent tracking-[0.4em] uppercase text-xs font-black">
              Latest Updates
            </h2>
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tighter uppercase leading-none">
              News & Articles
            </h1>
          </div>

          <div>
            <Link
              to="/news"
              className="group flex items-center gap-3 px-6 py-3 bg-white/[0.03] hover:bg-theme-accent text-white hover:text-black rounded-full border border-white/[0.06] hover:border-theme-accent transition-all duration-300 font-bold uppercase tracking-widest text-xs"
            >
              <span>View All News</span>
              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-black/20 group-hover:translate-x-1 transition-transform">
                <ArrowRight size={12} />
              </div>
            </Link>
          </div>
        </div>

        {/* Content Section: Render posts immediately when available */}
        {recentNews.length > 0 ? (
          <div className="news-carousel-container relative group/carousel">
            {/* Left Side Floating Navigation Button */}
            {recentNews.length > 2 && (
              <button
                type="button"
                onClick={() => scrollCarousel("left")}
                aria-label="Scroll left"
                className={`flex absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/90 hover:bg-theme-accent text-white hover:text-black border border-white/15 hover:border-theme-accent items-center justify-center backdrop-blur-md shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer ${
                  !canScrollLeft ? "opacity-0 pointer-events-none" : "opacity-100"
                }`}
              >
                <ChevronLeft size={22} />
              </button>
            )}

            {/* Right Side Floating Navigation Button */}
            {recentNews.length > 2 && (
              <button
                type="button"
                onClick={() => scrollCarousel("right")}
                aria-label="Scroll right"
                className={`flex absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/90 hover:bg-theme-accent text-white hover:text-black border border-white/15 hover:border-theme-accent items-center justify-center backdrop-blur-md shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer ${
                  !canScrollRight ? "opacity-0 pointer-events-none" : "opacity-100"
                }`}
              >
                <ChevronRight size={22} />
              </button>
            )}

            {/* Horizontal Carousel Track */}
            <div
              ref={carouselRef}
              className="news-carousel flex gap-6 overflow-x-auto pb-6 pt-2 px-1 scroll-smooth snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
              {recentNews.map((item) => (
                <Link
                  to={item.type === "update" ? `/news#update-${item.id}` : `/news/${item.id}`}
                  key={item.id}
                  className="news-card group relative w-[290px] sm:w-[340px] md:w-[380px] shrink-0 snap-start rounded-3xl bg-[#09090b] border border-white/[0.06] overflow-hidden hover:border-white/[0.2] transition-all duration-300 flex flex-col hover:-translate-y-1 shadow-lg"
                >
                  {/* Image Container */}
                  <div className="relative aspect-video overflow-hidden bg-black">
                    <ImageWithLoader
                      src={item.image}
                      alt={item.title}
                      imageClassName="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {/* Category Badge */}
                    <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/5 text-[9px] font-bold uppercase tracking-widest text-white">
                      {item.type === "update" ? "Update" : item.category || "Article"}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 leading-tight group-hover:text-theme-accent transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-white/50 line-clamp-3 mb-6 font-light leading-relaxed">
                      {getExcerpt(item)}
                    </p>

                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/[0.06]">
                      <div className="flex items-center gap-2 text-white/40 text-[10px] font-bold uppercase tracking-widest">
                        <Calendar size={12} />
                        {new Date(item.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                      <div className="w-6 h-6 rounded-full bg-white/[0.05] flex items-center justify-center group-hover:bg-theme-accent group-hover:text-black transition-colors">
                        <ArrowRight size={10} />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Subtle Carousel Footer Note */}
            {recentNews.length > 3 && (
              <div className="flex items-center justify-between text-[11px] text-white/30 pt-2 px-2">
                <span className="font-mono">
                  {recentNews.length} latest publications
                </span>
                <span className="hidden sm:inline font-mono">
                  Swipe or use side arrows to navigate
                </span>
              </div>
            )}
          </div>
        ) : isLoadingNews ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-12 h-12 border-4 border-white/5 border-t-theme-accent rounded-full animate-spin" />
            <p className="text-xs uppercase tracking-widest text-theme-accent/80 font-bold animate-pulse">
              Loading Updates...
            </p>
          </div>
        ) : (
          <div className="text-center py-24 text-white/40 uppercase tracking-widest font-bold text-sm bg-white/[0.02] rounded-3xl border border-white/[0.06]">
            No recent news articles published yet.
          </div>
        )}
      </div>
    </section>
  );
};

export default NewsSection;
