import React, { useRef, useLayoutEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ScrambledText from "@/components/ScrambledText";
import { hapticLight, hapticDouble, hapticScramble } from "@/utils/haptics";

gsap.registerPlugin(ScrollTrigger);

/* ── Inline keyframes for subtle animations ── */
const glitchKeyframes = `
@keyframes inviteGlitch {
  0%, 100% { opacity: 1; transform: translate(0); }
  20% { opacity: 0.8; transform: translate(-2px, 1px); }
  40% { opacity: 1; transform: translate(1px, -1px); }
  60% { opacity: 0.9; transform: translate(-1px, 0); }
  80% { opacity: 1; transform: translate(2px, 1px); }
}
@keyframes invitePulse {
  0%, 100% { opacity: 0.15; transform: scale(1); }
  50% { opacity: 0.35; transform: scale(1.05); }
}
@keyframes inviteFlicker {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}
@keyframes inviteScanline {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100%); }
}
@keyframes inviteSignalDot {
  0%, 100% { box-shadow: 0 0 4px rgba(255,255,255,0.3), 0 0 8px rgba(255,255,255,0.1); }
  50% { box-shadow: 0 0 8px rgba(255,255,255,0.7), 0 0 20px rgba(255,255,255,0.3); }
}
`;

/* ── Signal Indicator ── */
const SignalDot = ({ active = true }) => (
  <div className="flex items-center gap-2">
    <div
      className="w-1.5 h-1.5 rounded-full"
      style={{
        backgroundColor: active
          ? "rgba(255,255,255,0.7)"
          : "rgba(255,255,255,0.15)",
        animation: active ? "inviteSignalDot 2s ease-in-out infinite" : "none",
      }}
    />
    <span
      className="font-konexy text-[7px] tracking-[0.4em] uppercase"
      style={{
        color: active ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.15)",
      }}>
      {active ? "Signal Active" : "Standby"}
    </span>
  </div>
);

/* ══════════════════════════════════════════════════
   INVITE PREVIEW SECTION
   ══════════════════════════════════════════════════ */
const InvitePreviewSection = ({ onRegisterClick, onLearnMoreClick }) => {
  const sectionRef = useRef(null);
  const contentRef = useRef(null);

  // Scroll-triggered reveal
  useLayoutEffect(() => {
    const section = sectionRef.current;
    const content = contentRef.current;
    if (!section || !content) return;

    const children = content.children;

    const ctx = gsap.context(() => {
      gsap.set(children, { opacity: 0, y: 40 });

      gsap.to(children, {
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
          end: "top 30%",
          toggleActions: "play none none reverse",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <>
      <style>{glitchKeyframes}</style>

      <section
        ref={sectionRef}
        className="relative z-10 py-20 sm:py-28 md:py-32 px-4 md:px-6 overflow-hidden">
        {/* Background atmospheric glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(255,255,255,0.02) 0%, transparent 70%)",
              animation: "invitePulse 6s ease-in-out infinite",
            }}
          />
        </div>

        <div
          ref={contentRef}
          className="relative max-w-4xl mx-auto flex flex-col items-center text-center">
          {/* ── Overline Tag ── */}
          <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-white/[0.03] border border-white/[0.06] rounded-full mb-8 backdrop-blur-sm">
            <div
              className="w-1 h-1 rounded-full bg-white/60"
              style={{ animation: "inviteFlicker 1.5s ease-in-out infinite" }}
            />
            <span className="font-konexy text-[8px] tracking-[0.5em] uppercase text-white/70">
              Transmission Live
            </span>
          </div>

          {/* ── Main Headline ── */}
          <h2 className="font-konexy text-2xl sm:text-3xl md:text-5xl lg:text-6xl text-white/90 tracking-tight leading-[1.1] mb-4">
            Nethinethera Is
            <br />
            <span className="bg-gradient-to-r from-white/50 via-white to-white/50 bg-clip-text text-transparent">
              Officially Here
            </span>
          </h2>

          {/* ── Subtext ── */}
          <p className="font-sans text-xs sm:text-sm md:text-base text-white/60 max-w-2xl leading-relaxed mb-8 sm:mb-12 px-2">
            Prepare to witness the Biggest Trilingual School Media Day in Sri
            Lanka, a historic milestone where legacy and creativity unfolds on
            the nation’s grandest stage.
            <br />
            <span className="text-white font-medium mt-2 inline-block">
              We aren&apos;t just reporting history, we are making it.
            </span>
          </p>

          {/* ── Revealed Details Grid ── */}
          <div className="w-full max-w-xl mx-auto mb-10 sm:mb-14">
            <div className="grid grid-cols-3 gap-3 sm:gap-6 p-4 sm:p-6 md:p-8 border border-white/[0.06] rounded-2xl bg-white/[0.01] backdrop-blur-sm relative overflow-hidden">
              {/* Subtle sweep animation */}
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[scroll-down_4s_infinite_ease-in-out]" />

              {/* Date */}
              <div className="flex flex-col items-center gap-3 relative z-10">
                <span className="font-konexy text-[9px] sm:text-[10px] tracking-[0.5em] uppercase text-white/60">
                  Date
                </span>
                <div className="relative">
                  <span className="font-konexy text-lg sm:text-xl md:text-3xl text-white/90 tracking-wider">
                    05.05.26
                  </span>
                </div>
                <span className="font-konexy text-[7px] sm:text-[9px] tracking-[0.3em] uppercase text-white/30">
                  Confirmed
                </span>
              </div>

              {/* Time */}
              <div className="flex flex-col items-center gap-3 border-x border-white/[0.06]  px-2 sm:px-4 relative z-10">
                <span className="font-konexy text-[9px] sm:text-[10px] tracking-[0.5em] uppercase text-white/60">
                  Time
                </span>
                <div className="relative">
                  <span className="font-konexy text-lg sm:text-xl md:text-3xl text-white/90 tracking-wider">
                    14:00
                  </span>
                </div>
                <span className="font-konexy text-[7px] sm:text-[9px] tracking-[0.3em] uppercase text-white/30">
                  Confirmed
                </span>
              </div>

              {/* Venue */}
              <div className="flex flex-col items-center gap-3 relative z-10">
                <span className="font-konexy text-[9px] sm:text-[10px] tracking-[0.5em] uppercase text-white/60">
                  Venue
                </span>
                <div className="relative">
                  <span className="font-konexy text-sm sm:text-lg md:text-xl text-white/90 tracking-wider text-center leading-tight mt-0.5">
                    NELUM
                    <br />
                    POKUNA
                  </span>
                </div>
                <span className="font-konexy text-[7px] sm:text-[9px] tracking-[0.3em] uppercase text-white/30 mt-auto">
                  Confirmed
                </span>
              </div>
            </div>

            {/* Subtle hint bar */}
            <div className="mt-4 flex items-center justify-center gap-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
              <span className="font-konexy text-[7px] tracking-[0.4em] uppercase text-white/30 whitespace-nowrap">
                All details verified
              </span>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
            </div>
          </div>

          {/* ── Emotional Copy ── */}
          <div className="mb-10 max-w-2xl px-4">
            <p className="font-konexy text-[10px] md:text-sm tracking-[0.3em] uppercase text-white/80 leading-relaxed">
              Join us as we redefine the boundaries of perspective.
            </p>
          </div>

          {/* ── Bottom Footnote ── */}
          <div className="mt-14 flex items-center gap-4">
            <div className="h-px w-8 bg-white/10" />
            <span className="font-konexy text-[7px] tracking-[0.5em] uppercase text-white/15">
              Nethinethera — The Media Day
            </span>
            <div className="h-px w-8 bg-white/10" />
          </div>
          <div onTouchStart={hapticScramble}>
            <ScrambledText
              className="mt-8 cursor-help font-sans text-[11px] md:text-sm text-white/60 leading-relaxed text-center tracking-wide max-w-none sm:max-w-md"
              radius={40}
              duration={1}
              speed={0.1}
              scrambleChars=".9,'..6:">
              What you see is only what they chose to show you. Every headline
              carries a perspective. Every frame hides a truth. The lens never
              lies — but the hand behind it decides what stays in focus. When
              the broadcast begins, will you see the story, or the illusion
              wrapped around it?
            </ScrambledText>
          </div>
        </div>
      </section>
    </>
  );
};

export default InvitePreviewSection;
