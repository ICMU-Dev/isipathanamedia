import React, { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const SpotlightSection = () => {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const conceptRef = useRef(null);
  const quoteRef = useRef(null);
  const endorseRef = useRef(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Heading
      gsap.fromTo(headingRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1, y: 0, duration: 0.8, ease: 'power2.out',
          scrollTrigger: { trigger: headingRef.current, start: 'top 85%' },
        }
      );

      // Concept cards stagger
      const cards = conceptRef.current?.children;
      if (cards) {
        gsap.fromTo(Array.from(cards),
          { opacity: 0, y: 30, scale: 0.97 },
          {
            opacity: 1, y: 0, scale: 1,
            duration: 0.6, stagger: 0.12, ease: 'power2.out',
            scrollTrigger: { trigger: conceptRef.current, start: 'top 85%' },
          }
        );
      }

      // Quote
      gsap.fromTo(quoteRef.current,
        { opacity: 0 },
        {
          opacity: 1, duration: 1, ease: 'power1.out',
          scrollTrigger: { trigger: quoteRef.current, start: 'top 85%' },
        }
      );

      // Endorsement
      gsap.fromTo(endorseRef.current,
        { opacity: 0, y: 15 },
        {
          opacity: 1, y: 0, duration: 0.6, ease: 'power2.out',
          scrollTrigger: { trigger: endorseRef.current, start: 'top 90%' },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative z-10 py-28 md:py-36 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">

        {/* Badge */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/[0.06] bg-white/[0.02]">
            <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
            <span className="font-konexy text-[8px] md:text-[9px] tracking-[0.4em] uppercase text-white/60">
              Day Theme
            </span>
          </div>
        </div>

        {/* Heading */}
        <div ref={headingRef} className="text-center mb-16 md:mb-20">
          <h2 className="font-konexy text-2xl md:text-4xl lg:text-5xl tracking-[0.12em] uppercase text-white/85 mb-4 leading-tight">
            The Illusion of
            <br />
            the Whole Truth
          </h2>
          <p className="font-konexy text-[9px] md:text-[10px] tracking-[0.4em] uppercase text-white/25 max-w-md mx-auto">
            When perspective shapes reality
          </p>
        </div>

        {/* Concept Grid */}
        <div ref={conceptRef} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16 md:mb-20">

          {/* The 6/9 Concept */}
          <div className="group p-7 md:p-9 rounded-2xl border border-white/[0.06]  bg-white/[0.03] hover:bg-white/[0.05] hover:border-white/5 transition-all duration-500">
            <div className="flex items-center gap-3 mb-5">
              <span className="font-konexy text-3xl md:text-4xl text-white/15 leading-none">69</span>
              <div className="h-6 w-px bg-white/10" />
              <span className="font-konexy text-[9px] md:text-[10px] tracking-[0.3em] uppercase text-white/70">
                The Symbol
              </span>
            </div>
            <p className="font-konexy text-[10px] md:text-xs tracking-[0.1em] text-white/35 leading-[1.9] group-hover:text-white/80 transition-colors duration-500">
              A &apos;6&apos; inverted becomes a &apos;9&apos;. A single shape revealing two
              different truths. Media operates on the same principle — the news
              we consume is deeply influenced by the angle of observation.
            </p>
          </div>

          {/* The Perspective */}
          <div className="group p-7 md:p-9 rounded-2xl border border-white/[0.06]  bg-white/[0.03] hover:bg-white/[0.05] hover:border-white/5 transition-all duration-500">
            <div className="flex items-center gap-3 mb-5">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-white/60">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                <path d="M2 12h20" />
              </svg>
              <div className="h-6 w-px bg-white/10" />
              <span className="font-konexy text-[9px] md:text-[10px] tracking-[0.3em] uppercase text-white/70">
                The Perspective
              </span>
            </div>
            <p className="font-konexy text-[10px] md:text-xs tracking-[0.1em] text-white/35 leading-[1.9] group-hover:text-white/80 transition-colors duration-500">
              The reality we perceive is always shaped by the perspective we are
              given. At Isipathana College, we believe media must remain
              independent, raw, and uncompromised.
            </p>
          </div>
        </div>

        {/* Quote */}
        <div ref={quoteRef} className="text-center mb-16 md:mb-20 px-4">
          <div className="inline-block max-w-lg">
            <div className="w-8 h-px bg-white/10 mx-auto mb-6" />
            <p className="font-konexy text-[10px] md:text-xs tracking-[0.15em] text-white/60 leading-[2] italic">
              &ldquo;Nethinethera is our response — a space dedicated to stripping
              away the distortion and presenting the narrative as it stands.&rdquo;
            </p>
            <div className="w-8 h-px bg-white/10 mx-auto mt-6" />
          </div>
        </div>

        {/* Endorsement */}
        <div ref={endorseRef} className="flex flex-col items-center gap-4">
          <div className="px-6 py-4 rounded-2xl border border-white/[0.06]  bg-white/[0.02] flex flex-col sm:flex-row items-center gap-4 sm:gap-5">
            <span className="font-konexy text-[8px] md:text-[9px] tracking-[0.3em] uppercase text-white/60">
              Endorsed &amp; Empowered by
            </span>
            <div className="h-px sm:h-5 w-12 sm:w-px bg-white/10" />
            <span className="font-konexy text-[9px] md:text-[10px] tracking-[0.2em] text-white/80 text-center sm:text-left">
              Ministry of Health &amp; Mass Media
            </span>
          </div>
          <span className="font-konexy text-[7px] md:text-[8px] tracking-[0.4em] uppercase text-white/15">
            © Media Unit of Isipathana College
          </span>
        </div>

      </div>
    </section>
  );
};

export default SpotlightSection;
