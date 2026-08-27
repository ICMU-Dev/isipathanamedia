import ScrollReveal from '@/components/ScrollReveal';
import React from 'react';

const ThemeRevealSection = () => {
  return (
    <section className="py-16 sm:py-20 md:py-32 px-4 sm:px-6 max-w-7xl mx-auto border-t border-white/[0.06]  relative z-10">
      <div className="flex items-center gap-4 mb-12 opacity-60">
        <div className="w-8 h-[1px] bg-white/50" />
        <span className="font-mono text-xs tracking-[0.3em] uppercase">Theme</span>
      </div>

      <div className=" gap-16 md:gap-24 items-center">
        {/* Left: Text */}
        <div className="flex flex-col animate-fadeIn font-konexy">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl text-white/90 leading-[1.1] mb-6 sm:mb-8 tracking-tight font-konexy">
            NOT EVERYTHING<br />
            <span className="text-white/70">SEEN IS TRUE.</span>
          </h2>

          <div className="space-y-6 text-lg sm:text-xl md:text-2xl lg:text-4xl">
            <ScrollReveal
              baseOpacity={0.1}
              enableBlur
              baseRotation={0}
              blurStrength={4}
              className="font-sans text-white/60 leading-relaxed"
            >
              Perspective shapes reality. In an era where information is abundant but truth is rare, the lens through which we view the world dictates what we believe.
            </ScrollReveal>

            <ScrollReveal
              baseOpacity={0.1}
              enableBlur
              baseRotation={0}
              blurStrength={4}
              className="font-sans text-white/60 text-sm sm:text-base md:text-xl leading-relaxed "
              textClassName=' text-sm sm:text-base md:text-xl lg:text-2xl opacity-50'
            >
              At Isipathana College, we believe media must remain independent, raw, and uncompromised. Nethinethera is our response—a space dedicated to stripping away the distortion and presenting the narrative as it stands.
            </ScrollReveal>
          </div>
        </div>


      </div>
    </section>
  );
};

export default ThemeRevealSection;
