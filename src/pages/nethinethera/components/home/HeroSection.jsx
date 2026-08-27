import React, { useLayoutEffect, useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import themeElement from "/nethinethera/69.png";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AnimatePresence } from "framer-motion";
import whiteLogos from "/nethinethera/logos-white.png";
import nethinetheraBg from "/nethinethera/nethinethera-bg.png";
import endorsment from "/nethinethera/endorsment.png";


gsap.registerPlugin(ScrollTrigger);

const HeroSection = ({ onTrailerClick, isLoaded }) => {
  const navigate = useNavigate();
  const sectionRef = useRef(null);
  const leftImgRef = useRef(null);
  const rightImgRef = useRef(null);

  // Refs for intro animation
  const preloaderRef = useRef(null);
  const introContentRef = useRef(null);

  // Parallax Effect Hook
  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.refresh();

      let mm = gsap.matchMedia();
      mm.add("(min-width: 768px)", () => {
        gsap.to(leftImgRef.current, {
          yPercent: -30,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });

        gsap.to(rightImgRef.current, {
          yPercent: 30,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Intro Animation Hook (Triggers when isLoaded becomes true)
  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section || !introContentRef.current) return;

    const ctx = gsap.context(() => {
      const children = introContentRef.current.children;

      if (!isLoaded) {
        // Prepare state while preloader covers screen
        gsap.set(children, {
          opacity: 0,
          y: 60,
          scale: 0.95,
        });
      } else {
        // Trigger reveal when isLoaded turns true
        gsap.fromTo(
          children,
          {
            opacity: 0,
            y: 60,
            scale: 0.95,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1.5,
            stagger: 0.15,
            ease: "power4.out",
            clearProps: "all",
          },
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [isLoaded]);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100dvh] w-full flex flex-col items-center justify-center text-center px-4 overflow-hidden z-10 !m-0 !p-0 border-none outline-none bg-[#050505]">
      {/* --- BACKGROUND ELEMENTS --- */}
      <img
        src={nethinetheraBg}
        alt=""
        className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none opacity-50"
      />

      <img
        ref={leftImgRef}
        src={themeElement}
        alt=""
        className="w-auto h-[60vh] md:h-[100vh] -left-20 md:-left-20 -top-20 md:-top-64 absolute opacity-20 md:opacity-50 pointer-events-none z-10"
      />
      <img
        ref={rightImgRef}
        src={themeElement}
        alt=""
        className="w-auto h-[60vh] md:h-[100vh] -right-20 md:-right-20 -bottom-20 md:-bottom-64 absolute rotate-180 opacity-20 md:opacity-50 pointer-events-none z-10"
      />

      {/* --- HERO CONTENT (Animated on Load) --- */}
      <div
        className="relative z-20 py-24 max-w-5xl mx-auto flex flex-col items-center w-full"
        ref={introContentRef}>
        {/* Child 1 */}
        <img
          src={whiteLogos}
          alt=""
          className="w-20 sm:w-28 md:w-32 mt-4 sm:mb-6"
        />

        {/* Child 2 */}
        <div className="text-[8px] sm:text-xs font-konexy mt-4 tracking-[0.2em] sm:tracking-[0.4em] uppercase text-white/90 px-4 ">
          When Perspective Shapes Reality
        </div>

        {/* Child 3 */}
        <h1 className="font-palingu2 font-black text-7xl sm:text-6xl md:text-7xl lg:text-[8rem] tracking-[0.02em] bg-gradient-to-br from-white/40 via-white/90 to-white/40 bg-clip-text text-transparent ">
          fk;sfkf;r
        </h1>

        {/* Child 4 */}
        <div className="text-[8px] sm:text-xs font-konexy tracking-[0.2em] sm:tracking-[0.4em] uppercase text-white/90 px-4 ">
          THE MEDIA DAY AND ANNIVERSARY
        </div>

        {/* EVENT DETAILS & COUNTDOWN */}
        <div className="flex flex-col items-center mt-8 sm:mt-10 text-center relative z-20">
          <h3 className="font-konexy text-lg sm:text-xl md:text-2xl tracking-[0.3em] uppercase text-white/90 drop-shadow-sm">
            Nelum Pokuna
          </h3>
          <p className="font-sans text-[10px] sm:text-xs tracking-[0.2em] text-white/50 uppercase mt-2">
            Mahinda Rajapaksa Theatre
          </p>
          <div className="mt-5 font-sans font-medium text-[10px] sm:text-xs tracking-[0.3em] uppercase text-white/80 bg-white/[0.03] px-5 py-2.5 border border-white/[0.06]  rounded-full flex items-center gap-3 backdrop-blur-sm">
            <span>
              5<sup className="text-[7px]">TH</sup> MAY
            </span>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <span>2.00 PM</span>
          </div>
        </div>

        <img
          src={endorsment}
          alt=""
          className="w-40 sm:w-52 md:w-64 pointer-events-none z-10 mt-16 mb-16"
        />
      </div>

      {/* --- SCROLL INDICATOR --- */}
      <div className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 opacity-50">
        <div className="w-[1px] h-8 sm:h-12 bg-white/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1/2 bg-white/60 animate-[scroll-down_2s_infinite]" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
