import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import ScrambledText from "@/components/ScrambledText";
import SEO from "@/components/SEO";
import EasterEgg69 from "@/components/ui/EasterEgg69";

import {
  HeroSection,
  ThemeRevealSection,
  TrailerPreviewSection,
  InvitePreviewSection,
  ChampionshipPreviewSection,
  FooterCTASection,
} from "./components/home";

// Design tokens
const SAGE = "#7aab6e";
const SAGE_DIM = "rgba(122,171,110,";

const nethinetheraJsonLd = {
  "@context": "https://schema.org",
  "@type": "Event",
  "name": "Nethinethera",
  "description": "Annual media day organized by Isipathana College Media Unit, featuring inter-school competitions and the Most Popular Media Unit award.",
  "startDate": "2026-05-15T08:00:00+05:30",
  "endDate": "2026-05-15T18:00:00+05:30",
  "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
  "eventStatus": "https://schema.org/EventScheduled",
  "url": "https://isipathanamedia.online/nethinethera",
  "image": "https://isipathanamedia.online/og-image.png",
  "location": {
    "@type": "Place",
    "name": "Isipathana College",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Isipathana College, Havelock Road",
      "addressLocality": "Colombo 05",
      "postalCode": "00500",
      "addressRegion": "Western Province",
      "addressCountry": "LK"
    }
  },
  "organizer": {
    "@type": "Organization",
    "name": "Isipathana College Media Unit",
    "url": "https://isipathanamedia.online"
  },
  "performer": {
    "@type": "Organization",
    "name": "Isipathana College Media Unit"
  }
};

/* ────────────── MAIN VIEW ────────────── */
const MainView = () => {
  const [adminClickCount, setAdminClickCount] = useState(0);
  const [loadingComplete, setLoadingComplete] = useState(false);
  const navigate = useNavigate();
  const preloaderRef = useRef(null);

  // ── Scroll Restoration & Preloader Animation ──
  useLayoutEffect(() => {
    // 1. Force scroll to top instantly on mount
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    setTimeout(() => window.scrollTo(0, 0), 10);

    // Prevent body bounce while loading
    document.body.style.overflow = "hidden";

    // 2. Preloader Animation
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          setLoadingComplete(true);
          document.body.style.overflow = "";
        },
      });

      // Keep it visible for a moment, then fade out
      tl.to(preloaderRef.current, {
        opacity: 0,
        y: -20,
        filter: "blur(10px)",
        duration: 1.2,
        delay: 2.2, // Time to read scramble
        ease: "power3.inOut",
      });
    });

    return () => {
      ctx.revert();
      document.body.style.overflow = "";
    };
  }, []);

  const handleAdminTrigger = () => {
    setAdminClickCount((prev) => {
      const next = prev + 1;
      if (next >= 5) {
        navigate("/nethinethera/admin");
        return 0;
      }
      return next;
    });
  };

  return (
    <div
      className="relative min-h-[100dvh] text-white flex flex-col "
      style={{ background: "#050505" }}>
      <SEO
        title="Nethinethera – The Media Day"
        description="Nethinethera – the prestigious annual media day by Isipathana College Media Unit (ICMU). Featuring inter-school competitions, MPMU Most Popular Media Unit award, cinematic showcases, and the best of school media in Sri Lanka."
        path="/nethinethera"
        type="event"
        keywords="Nethinethera, nethinethera the media day, Isipathana media day, school media competition Sri Lanka, MPMU, Most Popular Media Unit, ICMU event, Isipathana College Media Unit"
        jsonLd={nethinetheraJsonLd}
      />

      {/* GLOBAL ATMOSPHERIC TEXTURE */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-theme-accent/5 opacity-5 blur-[100px] pointer-events-none hidden md:block"></div>
      </div>

      <EasterEgg69 />

      {/* ── FULL PAGE MINIMAL PRELOADER ── */}
      {!loadingComplete && (
        <div
          ref={preloaderRef}
          className="fixed inset-0 z-[9999] bg-[#030303] flex flex-col items-center justify-center pointer-events-auto">
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              <span className="font-konexy text-[10px] sm:text-xs tracking-[0.5em] sm:tracking-[0.8em] uppercase text-white/70">
                <ScrambledText
                  duration={1.5}
                  speed={0.08}
                  scrambleChars="XN#O!|/?0">
                  NETHINETHERA
                </ScrambledText>
              </span>
            </div>

            {/* Minimal progress line */}
            <div className="w-24 h-[1px] bg-white/10 relative overflow-hidden rounded-full">
              <div
                className="absolute inset-y-0 left-0 bg-white/60 shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                style={{
                  animation: "nethinetheraLoadBar 2s ease-in-out forwards",
                }}
              />
            </div>
            <style>{`
              @keyframes nethinetheraLoadBar {
                0% { width: 0%; opacity: 0; }
                20% { opacity: 1; }
                80% { width: 100%; opacity: 1; }
                100% { width: 100%; opacity: 0; }
              }
            `}</style>
          </div>
        </div>
      )}

      <main className="relative z-10 flex-grow flex flex-col w-full bg-gradient-to-b from-[#020508] via-[#020508] to-[#000]">
        <div
          id="home"
          className="flex-grow flex flex-col relative border-none animate-fadeIn w-full">
          <HeroSection isLoaded={loadingComplete} />

          {/* <ScrollVelocity
            texts={['When Perspective Shapes Reality', 'Nethinethera - ']}
            velocity={50}
            className="font-konexy opacity-5 tracking-[0.02em] "
          /> */}
          <div className="w-full max-w-7xl mx-auto h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div id="theme-reveal">
            <ThemeRevealSection />
          </div>

          <div className="w-full max-w-7xl mx-auto h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div id="trailer">
            <TrailerPreviewSection />
          </div>

          <div className="w-full max-w-7xl mx-auto h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <InvitePreviewSection
            onRegisterClick={() => navigate("/nethinethera")}
            onLearnMoreClick={() => navigate("/nethinethera")}
          />

          <div className="w-full max-w-7xl mx-auto h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          {/* <ChampionshipPreviewSection /> */}


          {/* <AgendaPreviewSection /> */}

          <div className="w-full max-w-7xl mx-auto h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          {/* <SponsorsSection /> */}

          <div className="w-full max-w-7xl mx-auto h-px bg-gradient-to-r from-transparent via-theme-accent/20 to-transparent" />
          <FooterCTASection onAdminClick={handleAdminTrigger} />
        </div>
      </main>
    </div>
  );
};

/* ────────────── ROOT ────────────── */
const NethinetheraPage = () => {
  return <MainView />;
};

export default NethinetheraPage;
