import React, { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const hiddenSchools = [
  { id: 1, label: "CONTENDER 01" },
  { id: 2, label: "CONTENDER 02" },
  { id: 3, label: "CONTENDER 03" },
];

const ChampionshipPreviewSection = () => {
  const sectionRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.champ-card', 
        { opacity: 0, y: 50 }, 
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.8, 
          stagger: 0.2, 
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%'
          }
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative w-full py-20 px-4 flex flex-col items-center justify-center text-center bg-[#050505] overflow-hidden z-10 border-t border-white/[0.02]">
      
      {/* Background flare */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/[0.02] via-[#050505] to-[#050505] pointer-events-none" />

      {/* Header */}
      <div className="mb-12 relative z-10 max-w-3xl mx-auto">
        <span className="font-sans text-[10px] md:text-xs tracking-[0.4em] uppercase text-white/40 block mb-4">
          Nethinethera Championship
        </span>
        <h2 className="font-konexy text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white/90 tracking-tight leading-[1.1]">
          Who Will Claim
          <br />
          <span className="bg-gradient-to-r from-white/50 via-white to-white/50 bg-clip-text text-transparent">
            The Crown?
          </span>
        </h2>
        <p className="font-sans text-sm md:text-base text-white/60 max-w-xl mx-auto mt-6 leading-relaxed">
          Out of hundreds of schools, only three remain in the shadows as the ultimate contenders for the overall championship.
        </p>
      </div>

      {/* Contenders Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 w-full max-w-5xl mx-auto relative z-10">
        {hiddenSchools.map((school) => (
          <div key={school.id} className="champ-card group relative p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06]  flex flex-col items-center justify-center overflow-hidden hover:bg-white/[0.04] transition-colors duration-500 min-h-[300px]">
            {/* Silhouette / Glitch overlay */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-overlay pointer-events-none" />
            
            <div className="w-24 h-24 rounded-full bg-white/[0.03] border border-white/5 mb-6 flex items-center justify-center relative shadow-[0_0_30px_rgba(255,255,255,0.02)]">
                <span className="font-konexy text-4xl text-white/20 font-bold group-hover:scale-110 transition-transform duration-500">?</span>
            </div>
            
            <h3 className="font-konexy text-lg md:text-xl tracking-[0.2em] uppercase text-white/80 mb-2">
              {school.label}
            </h3>
            
            <div className="w-12 h-px bg-white/20 my-4" />
            
            <span className="font-sans text-[10px] tracking-[0.3em] uppercase text-white/40">
              Identity Hidden
            </span>
          </div>
        ))}
      </div>

    </section>
  );
};

export default ChampionshipPreviewSection;
