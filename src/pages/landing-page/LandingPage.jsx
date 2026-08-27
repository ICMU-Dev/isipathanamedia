import React, { useEffect, Suspense } from "react";
import HomeSection from "../../components/sections/HomeSection";
import LazySection from "../../components/ui/LazySection";
import Footer from "../../components/ui/Footer";
import SEO from "../../components/SEO";
import { TransitionContext } from "../../components/layout/MainLayout";

// Lazy load off-screen sections to save bundle size and initial render time
const AboutSection = React.lazy(() => import("../../components/sections/AboutSection"));
const NewsSection = React.lazy(() => import("../../components/sections/NewsSection"));
const TeamSection = React.lazy(() => import("../../components/sections/TeamSection"));
const ServicesSection = React.lazy(() => import("../../components/sections/ServicesSection"));
const ContactSection = React.lazy(() => import("../../components/sections/ContactSection"));
const LiveStreamSection = React.lazy(() => import("../../components/sections/LiveStreamSection"));

const sectionMap = {
  home: HomeSection,
  about: AboutSection,
  news: NewsSection,
  services: ServicesSection,
  team: TeamSection,
  contact: ContactSection,
  livestream: LiveStreamSection,
};

const LandingPage = () => {
  // PWA Standalone Redirect Logic
  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true ||
      document.referrer.includes("android-app://");

    if (isStandalone && window.location.pathname === "/") {
      const savedPath = localStorage.getItem("icmu_admin_path");
      if (savedPath) {
        window.location.replace(savedPath);
      }
    }
  }, []);

  const defaultOrder = [
    "home",
    "partnerLogos",
    "livestream",
    "about",
    "nethinethera",
    "services",
    "news",
    "team",
    "contact",
  ];

  let order = [...defaultOrder];

  if (!order.includes("partnerLogos")) {
    const homeIndex = order.indexOf("home");
    if (homeIndex !== -1) {
      order.splice(homeIndex + 1, 0, "partnerLogos");
    } else {
      order.unshift("partnerLogos");
    }
  }

  const { isWipeComplete } = React.useContext(TransitionContext);
  console.log(`[LandingPage] Rendered. isWipeComplete=${isWipeComplete}`);

  return (
    <>
      <SEO
        title="Home"
        description="Official website of Isipathana College Media Unit (ICMU). Discover Nethinethera – the media day, Sandhwani, and 25+ years of cinematic storytelling and event coverage at Isipathana College, Colombo, Sri Lanka."
        path="/"
        keywords="Isipathana College Media Unit, ICMU, isipathana media, icmu, isipathana college official website, isipathana college media unit, Nethinethera, nethinethera, nethinethera the media day, nethinethera 2025, Sandhwani, school media unit Sri Lanka, Isipathana College Colombo, isipathana collegee media unit website"
      />
      
      <main className="overflow-x-hidden min-h-[100dvh] bg-dark">
        {order.map((sectionType) => {
          const SectionComponent = sectionMap[sectionType];
          if (!SectionComponent) return null;
          
          if (sectionType === 'home' || sectionType === 'partnerLogos') {
            return <SectionComponent key={sectionType} shouldAnimate={isWipeComplete} />;
          }

          return (
            <LazySection key={sectionType}>
              <Suspense fallback={<div className="min-h-[100vh] bg-dark flex items-center justify-center">Loading...</div>}>
                <SectionComponent shouldAnimate={isWipeComplete} />
              </Suspense>
            </LazySection>
          );
        })}
        <Footer />
      </main>
    </>
  );
};

export default LandingPage;
