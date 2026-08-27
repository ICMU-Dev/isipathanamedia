import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useData } from "../../context/DataContext";
import ImageWithLoader from "../ui/ImageWithLoader";
import AnimatedBg from "../ui/AnimatedBg";
import { User, ChevronLeft, ChevronRight } from "lucide-react";

const TeamMemberCard = React.memo(({ member, idx }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="relative flex-shrink-0 w-full group/card snap-center">
      {/* Aspect Ratio Box */}
      <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-white/5 bg-white/5 group-hover/card:border-primary-neon/30 transition-all duration-700">
        {/* Profile Image or Fallback */}
        <ImageWithLoader
          src={member.image}
          alt={member.name}
          imageClassName="object-cover object-top w-full h-full transition-transform [transition-duration:1.5s] grayscale group-hover/card:grayscale-0 group-hover/card:scale-110 opacity-70 group-hover/card:opacity-100"
        />

        {/* Overlay Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark/95 via-dark/40 to-transparent opacity-70 group-hover/card:opacity-90 transition-opacity duration-700"></div>

        {/* Shine Effect */}
        <div className="absolute inset-0 z-10 translate-x-[-100%] group-hover/card:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-20deg]"></div>
        
        {/* Info Overlay (Moved inside to fix alignment) */}
        <div className="absolute right-0 bottom-0 left-0 p-6 z-20 transition-transform duration-500 group-hover/card:-translate-y-2">
          <h3 className="mb-1 text-lg font-bold tracking-tight text-white uppercase transition-colors group-hover/card:text-primary-neon drop-shadow-lg leading-tight">
            {member.name}
          </h3>
          <div className="flex gap-3 items-center mt-2">
            <div className="w-5 h-px transition-all duration-500 bg-primary-neon group-hover/card:w-8"></div>
            <p className="text-[10px] font-black tracking-[0.2em] text-primary-neon/80 uppercase">
              {member.role}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

const TeamSection = () => {
  const { team: contextTeam, fetchTeam } = useData();
  const scrollRef = useRef(null);
  const scrollTimeout = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Fetch team data on mount if not already available
  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  // Memoize and format team array
  const team = useMemo(() => contextTeam || [], [contextTeam]);

  const content = useMemo(() => ({
    subtitle: "Executive Committee",
    title: "Meet Our Board",
  }), []);

  // Calculate pages based on container and scroll width
  useEffect(() => {
    const updatePages = () => {
      if (scrollRef.current) {
        const container = scrollRef.current;
        const { scrollWidth, clientWidth } = container;
        // If there's no overflow, we only have 1 page.
        if (scrollWidth <= clientWidth) {
          setTotalPages(1);
          return;
        }
        
        const gap = parseFloat(window.getComputedStyle(container).gap) || 0;
        
        // Calculate exactly how many "snaps" or full widths fit.
        const pages = Math.ceil((scrollWidth + gap) / (clientWidth + gap));
        setTotalPages(pages);
      }
    };

    updatePages();
    window.addEventListener('resize', updatePages);

    // Additional timeout to handle late image loads affecting scroll width
    setTimeout(updatePages, 500);

    return () => window.removeEventListener('resize', updatePages);
  }, [team]);

  const scrollToPage = useCallback((pageIndex) => {
    if (!scrollRef.current || pageIndex < 0 || pageIndex >= totalPages) return;
    const container = scrollRef.current;
    
    const gap = parseFloat(window.getComputedStyle(container).gap) || 0;

    // Scroll by full viewport width chunks plus gap
    const targetScroll = pageIndex * (container.clientWidth + gap);

    container.scrollTo({
      left: targetScroll,
      behavior: "smooth",
    });
    setActiveIndex(pageIndex);
  }, [totalPages]);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;

    // Throttle scroll execution
    if (scrollTimeout.current) {
      cancelAnimationFrame(scrollTimeout.current);
    }

    scrollTimeout.current = requestAnimationFrame(() => {
      const container = scrollRef.current;
      const gap = parseFloat(window.getComputedStyle(container).gap) || 0;
      // Determine the current "page" based on scroll position relative to container width plus gap
      const scrollFraction = container.scrollLeft / (container.clientWidth + gap);

      // Use Math.round to snap to the closest dot/page index
      let newIndex = Math.round(scrollFraction);

      // Ensure last page is active if scrolled to the end
      const isAtEnd = Math.abs(container.scrollWidth - container.scrollLeft - container.clientWidth) < 10;

      if (isAtEnd) {
        newIndex = totalPages - 1;
      } else {
        // Ensure index bounds are respected
        newIndex = Math.max(0, Math.min(newIndex, totalPages - 1));
      }

      if (newIndex !== activeIndex) {
        setActiveIndex(newIndex);
      }
    });

  }, [activeIndex, totalPages]);

  // Clean up animation frame on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeout.current) {
        cancelAnimationFrame(scrollTimeout.current);
      }
    };
  }, []);

  return (
    <section
      id="team"
      className="relative py-24 md:px-24 text-white bg-[#010104] overflow-hidden"
    >
      <div className="container relative z-10 mx-auto max-w-7xl">
        {/* Section Header - Specifically requested to keep original layout */}
        <div className="mb-12 space-y-4 text-center">
          <div className="flex flex-col gap-3 items-center">
            <h2 className="text-primary-neon tracking-[0.8em] uppercase text-[10px] font-black opacity-60">
              {content.subtitle}
            </h2>
            <div className="w-12 h-px bg-primary-neon/40"></div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tighter uppercase leading-[0.9]">
            {content.title}
          </h1>
        </div>

        {/* Carousel Container */}
        <div className="relative group/carousel mx-auto w-full">
          {/* Navigation Arrows */}
          <div className="absolute -left-2 md:-left-12 top-1/2 -translate-y-1/2 z-30 opacity-0 md:group-hover/carousel:opacity-100 transition-opacity duration-300">
            <button
              onClick={() => scrollToPage(activeIndex - 1)}
              disabled={activeIndex === 0}
              className="p-3 bg-dark/80 backdrop-blur-sm border border-white/[0.06] rounded-full text-white hover:bg-primary-neon hover:text-black hover:border-primary-neon transition-all disabled:opacity-20 disabled:cursor-not-allowed group/btn shadow-xl hidden md:block"
              aria-label="Previous Page"
            >
              <ChevronLeft
                size={24}
                className="group-hover/btn:scale-110 transition-transform"
              />
            </button>
          </div>

          <div className="absolute -right-2 md:-right-12 top-1/2 -translate-y-1/2 z-30 opacity-0 md:group-hover/carousel:opacity-100 transition-opacity duration-300">
            <button
              onClick={() => scrollToPage(activeIndex + 1)}
              disabled={activeIndex === totalPages - 1}
              className="p-3 bg-dark/80 backdrop-blur-sm border border-white/[0.06] rounded-full text-white hover:bg-primary-neon hover:text-black hover:border-primary-neon transition-all disabled:opacity-20 disabled:cursor-not-allowed group/btn shadow-xl hidden md:block"
              aria-label="Next Page"
            >
              <ChevronRight
                size={24}
                className="group-hover/btn:scale-110 transition-transform"
              />
            </button>
          </div>

          {/* Scrollable Area */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex gap-4 md:gap-6 my-10 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-8 transition-all px-4 scroll-pl-4 md:px-0 md:scroll-pl-0 cursor-grab active:cursor-grabbing"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {team.map((member, idx) => (
              <div
                key={`${member.id || idx}`}
                className="w-[85vw] sm:w-[calc(50%-12px)] md:w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)] flex-shrink-0 snap-start"
              >
                <TeamMemberCard member={member} idx={idx} />
              </div>
            ))}
            
            {/* Spacer to allow the very last item to snap to the start of the container */}
            <div 
              className="flex-shrink-0 pointer-events-none w-[calc(100%-85vw)] sm:w-[calc(100%-(50%-12px))] md:w-[calc(100%-(33.333%-16px))] lg:w-[calc(100%-(25%-18px))]" 
              aria-hidden="true"
            />
          </div>

          {/* Grouped Dot Navigation */}
          {totalPages > 1 && (
            <div className="md:flex flex-wrap justify-center gap-3 mt-4 max-w-md mx-auto px-4 hidden">
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => scrollToPage(idx)}
                  className={`h-2 transition-all duration-300 rounded-full ${activeIndex === idx ?
                    "w-2 bg-primary-neon shadow-[0_0_12px_rgba(0,255,0,0.6)]"
                    : "w-2 bg-white/20 hover:bg-white/50"
                    }`}
                  aria-label={`Go to page ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
};

export default TeamSection;
