import React, { useRef, useLayoutEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const TrailerPreviewSection = () => {
  const sectionRef = useRef(null);
  const frameRef = useRef(null);
  const contentRef = useRef(null);
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const frame = frameRef.current;
    const content = contentRef.current;
    if (!section || !frame) return;

    const ctx = gsap.context(() => {
      // Start: small oval. End: full rounded rectangle.
      gsap.set(frame, { scale: 0.7, borderRadius: "25px" });
      gsap.set(content, { scale: 1.2 });

      gsap.to(frame, {
        scale: 1,
        borderRadius: "0",
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top center",
          end: "bottom center",
          scrub: 0.5,
        },
      });

      gsap.to(content, {
        scale: 1.4,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top center",
          end: "bottom center",
          scrub: 0.5,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (playing) v.pause();
    else v.play();
    setPlaying(!playing);
  };

  return (
    <section
      ref={sectionRef}
      className="relative z-10 py-20 sm:py-28 md:py-44 px-4 md:px-6">
      {/* Heading */}
      <div className="text-center mb-16">
        <h2 className="font-konexy text-sm md:text-base tracking-[0.4em] uppercase text-white/70 mb-2">
          The Broadcast
        </h2>
        <p className="font-konexy text-[10px] md:text-xs tracking-[0.5em] uppercase text-white/60 font-bold">
          Press play. See what&apos;s coming.
        </p>
      </div>

      {/* Zoom Frame */}
      <div className="max-w-5xl mx-auto">
        <div
          ref={frameRef}
          className="relative w-full aspect-video overflow-hidden"
          style={{
            border: "1px solid rgba(255,255,255,0.06)",
            boxShadow: "0 4px 60px rgba(0,0,0,0.5)",
          }}>
          <div ref={contentRef} className="absolute inset-0">
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover"
              src="/nethinethera/nethinethera-trailer.webm"
              playsInline
              preload="metadata"
              poster="/nethinethera/nethinethera-bg.png"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none" />
          </div>

          {/* Play */}
          <button
            onClick={togglePlay}
            className={`absolute inset-0 z-10 flex items-center justify-center cursor-pointer transition-opacity duration-500 ${playing ? "opacity-0 hover:opacity-100" : ""}`}
            aria-label={playing ? "Pause" : "Play"}>
            <div className="w-14 h-14 md:w-18 md:h-18 rounded-full border border-white/[0.06] 5 bg-black/30 backdrop-blur-sm flex items-center justify-center hover:border-white/30 transition-all duration-400">
              {playing ? (
                <div className="flex gap-1">
                  <div className="w-[3px] h-4 bg-white/70 rounded-2xl " />
                  <div className="w-[3px] h-4 bg-white/70 rounded-2xl " />
                </div>
              ) : (
                <div className="w-0 h-0 ml-0.5 border-t-[6px] border-t-transparent border-l-[11px] border-l-white/70 border-b-[6px] border-b-transparent" />
              )}
            </div>
          </button>

          {/* Meta */}
          <div className="absolute bottom-3 md:bottom-4 left-4 right-4 flex justify-between z-10 pointer-events-none">
            <span className="font-konexy text-[9px] md:text-[10px] tracking-[0.3em] text-white/35 uppercase font-bold">
              Teaser 01 // Nethinethera
            </span>
            <span className="font-konexy text-[9px] md:text-[10px] tracking-[0.3em] text-white/60 font-bold">
              {playing ? "▶ Playing" : "01:45"}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrailerPreviewSection;
