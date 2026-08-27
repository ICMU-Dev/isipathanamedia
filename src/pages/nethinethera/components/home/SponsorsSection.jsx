import React, { useRef, useLayoutEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const SponsorsSection = () => {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const gridRef = useRef(null);
  const cardsRef = useRef([]);

  const sponsors = [
    { name: "Brand Alpha", id: 1 },
    { name: "Global Networks", id: 2 },
    { name: "Media Corp", id: 3 },
    { name: "Visionary Tech", id: 4 },
    { name: "Studio Nexus", id: 5 },
    { name: "Creative Guild", id: 6 },
  ];

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Heading fade in
      gsap.fromTo(
        headingRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power2.out",
          scrollTrigger: { trigger: headingRef.current, start: "top 88%" },
        },
      );

      // Cards staggered reveal
      cardsRef.current.forEach((card, i) => {
        if (!card) return;
        gsap.fromTo(
          card,
          { opacity: 0, y: 30, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.5,
            delay: i * 0.07,
            ease: "power2.out",
            scrollTrigger: { trigger: gridRef.current, start: "top 85%" },
          },
        );
      });

      // Subtle parallax on the whole grid
      gsap.to(gridRef.current, {
        yPercent: -4,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.5,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative z-10 py-24 md:py-32 px-4 md:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Heading */}
        <div ref={headingRef} className="text-center mb-14 md:mb-18">
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/[0.06] bg-white/[0.02]">
              <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
              <span className="font-konexy text-[8px] md:text-[9px] tracking-[0.4em] uppercase text-white/60">
                Official Alliances
              </span>
            </div>
          </div>
          <h2 className="font-konexy text-xl md:text-3xl tracking-[0.15em] uppercase text-white/75 mb-3">
            Our Sponsors
          </h2>
          <p className="font-konexy text-[9px] md:text-[10px] tracking-[0.4em] uppercase text-white/25">
            Supporting the narrative
          </p>
        </div>

        {/* Sponsor Grid */}
        <div
          ref={gridRef}
          className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
          {sponsors.map((sponsor, i) => (
            <div
              key={sponsor.id}
              ref={(el) => (cardsRef.current[i] = el)}
              className="group relative">
              <div
                className="relative flex items-center justify-center p-6 md:p-8 rounded-2xl overflow-hidden transition-all duration-500 cursor-default"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.04)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.04)";
                }}>
                {/* Sponsor placeholder */}
                <div className="w-full aspect-[3/1.5] flex flex-col items-center justify-center gap-2">
                  {/* Logo placeholder circle */}
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/[0.04] border border-white/[0.06] group-hover:border-white/[0.06] 5 group-hover:bg-white/[0.06] transition-all duration-500 flex items-center justify-center">
                    <span className="font-konexy text-[10px] md:text-xs text-white/25 group-hover:text-white/80 transition-colors duration-500 uppercase">
                      {sponsor.name.charAt(0)}
                    </span>
                  </div>
                  {/* Name */}
                  <span className="font-konexy text-[8px] md:text-[10px] tracking-[0.2em] text-white/60 group-hover:text-white/45 transition-colors duration-500 uppercase text-center">
                    {sponsor.name}
                  </span>
                </div>

                {/* Corner accents */}
                <div className="absolute top-2.5 right-2.5 w-3 h-3 border-t border-r border-white/[0.03] rounded-tr-md group-hover:border-white/5 transition-colors duration-500" />
                <div className="absolute bottom-2.5 left-2.5 w-3 h-3 border-b border-l border-white/[0.03] rounded-bl-md group-hover:border-white/5 transition-colors duration-500" />
              </div>
            </div>
          ))}
        </div>

        {/* Become a sponsor CTA */}
        <div className="flex justify-center mt-12 md:mt-16">
          <button className="group px-8 py-3 rounded-2xl border border-white/[0.06] hover:border-white/[0.06] 5 hover:bg-white/[0.03] transition-all duration-500 hover:-translate-y-0.5">
            <span className="font-konexy text-[9px] md:text-[10px] tracking-[0.4em] uppercase text-white/60 group-hover:text-white/60 transition-colors duration-300">
              Become a Sponsor
            </span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default SponsorsSection;
