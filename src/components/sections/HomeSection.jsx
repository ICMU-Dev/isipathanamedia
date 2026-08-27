import React, { useLayoutEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import {  useScroll, useTransform } from "framer-motion";
import { motion } from "framer-motion";
import mainLogo from "../../assets/main-logos.png";

gsap.registerPlugin(SplitText);

const HomeSection = ({ shouldAnimate }) => {
  const navigate = useNavigate();
  const sectionRef = useRef(null);

  const content = {
    title: "Media Unit",
    subtitle: "Isipathana College",
    slogan: "NO SACRIFICE, NO VICTORY",
    since: "SINCE 1999",
    description: `The voice of the Pathanians, capturing the spirit of Isipathana College through cinematic precision and modern storytelling.`,
  };

  // --- FRAMER MOTION SCROLL ZOOM ---
  const { scrollY } = useScroll();
  const scale = useTransform(scrollY, [0, 1000], [1, 0.85]);
  const opacity = useTransform(scrollY, [0, 800], [0.8, 0.3]);
  const borderRadius = useTransform(scrollY, [0, 800], ["0px", "40px"]);

  const [hasAnimated, setHasAnimated] = React.useState(false);
  const animInitialized = useRef(false);
  const ctxRef = useRef(null);

  useLayoutEffect(() => {
    // Only cleanup on UNMOUNT
    return () => {
      if (ctxRef.current) ctxRef.current.revert();
    };
  }, []);

  useLayoutEffect(() => {
    if (!shouldAnimate || animInitialized.current) return;
    animInitialized.current = true;
    setHasAnimated(true);

    ctxRef.current = gsap.context((self) => {
      const q = self.selector;
      const tl = gsap.timeline({
        defaults: { ease: "power4.out", duration: 1 },
      });

      // --- TEXT SPLITTING AND ENTRANCE ---
      const titleElements = q(".title-split");
      const descElements = q(".description-split");
      
      if (titleElements.length === 0 || descElements.length === 0) return;

      const titleSplit = new SplitText(titleElements, {
        type: "lines,words",
        linesClass: "line-wrapper",
      });
      const descriptionSplit = new SplitText(descElements, {
        type: "lines",
        linesClass: "line-wrapper",
      });

      titleSplit.lines.forEach((line) => {
        const wrapper = document.createElement("div");
        wrapper.className = "line-mask";
        line.parentNode.insertBefore(wrapper, line);
        wrapper.appendChild(line);
      });

      descriptionSplit.lines.forEach((line) => {
        const wrapper = document.createElement("div");
        wrapper.className = "line-mask";
        line.parentNode.insertBefore(wrapper, line);
        wrapper.appendChild(line);
      });

      tl.from(titleSplit.lines, { yPercent: 120, stagger: 0.1 }, 0.4)
        .from(descriptionSplit.lines, { yPercent: 120, stagger: 0.05 }, 0.6)
        .from(
          q(".hero-fade-in"),
          { opacity: 0, y: 20, stagger: 0.1, duration: 1 },
          1,
        );
    }, sectionRef);
  }, [shouldAnimate]);

  return (
    <section
      id="home"
      ref={sectionRef}
      className="flex overflow-hidden relative flex-col justify-center items-center px-6 h-[100dvh] pt-24 pb-16 text-white bg-[#010104] font-montserrat">
      <style>{`
        .line-mask {
          overflow: hidden;
          margin-bottom: -0.1em;
          padding-bottom: 0.1em;
        }
        .line-wrapper {
          display: block;
        }
      `}</style>

      {/* BACKGROUND: SCROLL ZOOM HERO */}
      <motion.div
        style={{ scale, opacity, borderRadius }}
        className="overflow-hidden fixed inset-0 z-0 origin-center">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          className="object-cover w-full h-full pointer-events-none"
          disablePictureInPicture
          controlsList="nodownload nofullscreen noremoteplayback">
          <source src="/bg-vid.mp4" type="video/mp4" />
        </video>
      </motion.div>

      {/* MAIN BRANDING CONTENT */}
      <div
        className={`parallax-depth flex relative z-10 flex-col items-center text-center ${hasAnimated ? "opacity-100" : "opacity-0"} transition-opacity duration-300`}>
        
        <div className="hero-fade-in flex justify-center items-center">
          <img
            src={mainLogo}
            alt="Logos"
            className="w-[100px] md:w-[120px] object-contain opacity-90"
          />
        </div>

        <div className="flex flex-col items-center z-10 w-full max-w-5xl mx-auto mt-4">
          <p className="px-10 py-3 hero-fade-in text-[10px] md:text-xs font-bold tracking-[0.25em] uppercase text-white/80 font-inter">
            ISIPATHANA COLLEGE
          </p>
          <h1 className="title-split text-4xl sm:text-6xl md:text-[80px] lg:text-[100px] uppercase font-bold tracking-tight leading-[1.1]">
            {content.title}
          </h1>
        </div>

        <div className="flex flex-col items-center text-center space-y-3 mt-6 mb-4 z-10">
          <p className="hero-fade-in text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase text-white/80 font-inter">
            {content.slogan}
          </p>
          <p className="hero-fade-in text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase text-white/60 font-inter">
            {content.since}
          </p>
        </div>

        <div className="hero-fade-in flex flex-col items-center z-10 mt-2">
          <p className="description-split text-sm md:text-base text-white/80 max-w-[280px] md:max-w-xl text-center leading-relaxed tracking-wide font-inter">
            {content.description}
          </p>
        </div>

        <div className="hero-fade-in flex flex-col sm:flex-row items-center gap-4 md:gap-6 mt-10 z-10">
          <button
            onClick={() =>
              document
                .getElementById("contact")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="px-8 py-3.5 rounded-full bg-white/5 backdrop-blur-sm border border-white/[0.06] hover:bg-white/10 hover:border-white/20 transition-all duration-300 font-bold uppercase tracking-[0.2em] text-xs shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] text-white"
          >
            Contact Us
          </button>
        </div>
      </div>
    </section>
  );
};

export default HomeSection;
