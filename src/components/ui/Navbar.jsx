import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import gsap from "gsap";
import { Menu, X, Radio } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Logos from "./Logos";
import mainLogo from "../../assets/main-logos.png";
import SocialIcon from "./SocialIcon";

import { useData } from "../../context/DataContext";

const Navbar = ({ shouldAnimate }) => {
  const { siteConfig } = useData();
  const location = useLocation();
  const navigate = useNavigate();

  const isHomePage = location.pathname === "/";
  const liveStream = siteConfig?.liveStream;
  const isLive = liveStream?.isLive && liveStream?.videoId;

  const dbSocialLinks = siteConfig?.socialLinks || {};
  const socialLinks = useMemo(
    () =>
      Object.entries(dbSocialLinks)
        .filter(([key, link]) => link && link.trim() !== "")
        .map(([key, link]) => ({
          icon: <SocialIcon platform={key} size={16} />,
          link,
          label: key.charAt(0).toUpperCase() + key.slice(1),
        })),
    [dbSocialLinks],
  );

  // Dynamic menu items based on stream status
  const menuItems = useMemo(() => {
    const items = [{ label: "Home", link: "/", type: "route" }];

    if (isLive) {
      items.push({
        label: "Live",
        link: "/live",
        type: "route",
        highlight: true,
      });
    }

    items.push(
      { label: "About", link: "about", type: "scroll" },
      { label: "Services", link: "services", type: "scroll" },
      { label: "News", link: "/news", type: "route" },
      { label: "Team", link: "team", type: "scroll" },
      { label: "Contact", link: "contact", type: "scroll" },
    );
    return items;
  }, [isLive]);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const navRef = useRef(null);
  const centerPillRef = useRef(null);
  const rightSectionRef = useRef(null);
  const logoRef = useRef(null);
  const menuRef = useRef(null);
  const mobileLinksRef = useRef([]);
  const lastScrollY = useRef(0);
  const scrollTicking = useRef(false);

  // Handle hash scrolling if navigating back to home with an anchor
  useEffect(() => {
    if (isHomePage && location.hash) {
      const id = location.hash.replace("#", "");
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100); // Wait for render
    }
  }, [location, isHomePage]);

  // Entrance animation
  useEffect(() => {
    if (shouldAnimate) {
      const tl = gsap.timeline({ delay: 5 });

      tl.fromTo(
        logoRef.current,
        { y: -50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power4.out" },
      )
        .fromTo(
          centerPillRef.current,
          { y: -20, opacity: 0, scale: 0.95 },
          { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: "power4.out" },
          "-=0.6",
        )
        .fromTo(
          rightSectionRef.current,
          { y: -50, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: "power4.out" },
          "-=0.6",
        );
    }
  }, [shouldAnimate]);

  // Hide navbar on scroll down, show on scroll up
  const handleScroll = useCallback(() => {
    if (scrollTicking.current) return;
    scrollTicking.current = true;

    requestAnimationFrame(() => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY.current;

      setIsScrolled(currentScrollY > 20);

      if (currentScrollY < 200) {
        setIsNavVisible(true);
      } else if (delta > 8) {
        setIsNavVisible(false);
      } else if (delta < -5) {
        setIsNavVisible(true);
      }

      lastScrollY.current = currentScrollY;
      scrollTicking.current = false;
    });
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    if (!navRef.current || isMenuOpen) return;
    gsap.to(navRef.current, {
      y: isNavVisible ? 0 : -120,
      duration: 0.4,
      ease: "power3.out",
      overwrite: true,
    });
  }, [isNavVisible, isMenuOpen]);

  const toggleMenu = () => {
    if (!isMenuOpen) {
      setIsMenuOpen(true);
      gsap.to(menuRef.current, { x: 0, duration: 0.6, ease: "power4.out" });
      gsap.fromTo(
        mobileLinksRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: "power3.out",
          delay: 0.2,
        },
      );
    } else {
      gsap.to(menuRef.current, {
        x: "100%",
        duration: 0.5,
        ease: "power4.in",
        onComplete: () => setIsMenuOpen(false),
      });
    }
  };

  const handleNavClick = (item) => {
    if (item.type === "route") {
      navigate(item.link);
      if (isMenuOpen) toggleMenu();
    } else {
      if (isHomePage) {
        const element = document.getElementById(item.link);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
        if (isMenuOpen) toggleMenu();
      } else {
        navigate(`/#${item.link}`);
        if (isMenuOpen) toggleMenu();
      }
    }
  };

  return (
    <>
      <nav
        ref={navRef}
        className={`fixed top-0 left-0 w-full z-[100] px-4 md:px-6 will-change-transform transition-all duration-300 ${
          isScrolled 
            ? "py-3 md:py-4 pointer-events-auto" 
            : "py-6 pointer-events-none"
        }`}>
        
        {/* Gradient Background Shade (Syncs with scroll) */}
        <div 
          className={`absolute top-0 left-0 right-0 w-full h-[140px] -z-10 transition-opacity duration-300 pointer-events-none ${
            isScrolled ? "opacity-100" : "opacity-0"
          }`}
          style={{
            background: "linear-gradient(to bottom, #050505 10%, rgba(5,5,5,0.8) 10%, transparent 80%)"
          }}
        />

        <div className="max-w-[1920px] mx-auto grid sm:grid-cols-[1fr_auto_1fr] grid-cols-2 items-center outline-none">
          {/* LEFT: Branding */}
          <div
            ref={logoRef}
            className="flex items-center gap-4 cursor-pointer pointer-events-auto group justify-self-start"
            onClick={() => handleNavClick({ link: "/", type: "route" })}>
            <div className="relative">
              <div className="flex items-center justify-center overflow-hidden transition-transform duration-500 group-hover:scale-110">
                <img
                  src={mainLogo}
                  alt="Isipathana College Media Unit"
                  width={48}
                  height={48}
                  className="w-12 h-12 object-contain"
                />
              </div>
              <div className="absolute inset-0 bg-green-500/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </div>
            <div className="hidden sm:block">
              <Logos />
            </div>
          </div>

          {/* CENTER: Navigation Pill */}
          <div
            ref={centerPillRef}
            className="hidden lg:flex items-center bg-white/5 border border-white/5 backdrop-blur-sm rounded-full px-2 py-2 pointer-events-auto justify-self-center">
            <div className="flex items-center gap-1">
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleNavClick(item)}
                  className={`px-5 py-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300 rounded-full hover:bg-white/10 relative overflow-hidden group flex items-center gap-1.5 ${
                    item.highlight
                      ? "text-red-400 hover:text-red-300"
                      : "text-white/80 hover:text-white"
                  }`}>
                  <span className="relative z-10 flex items-center gap-1.5">
                    {item.highlight && (
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                    )}
                    {item.label}
                  </span>
                  <div
                    className={`absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ${
                      item.highlight
                        ? "bg-gradient-to-r from-red-600/0 via-red-600/10 to-red-600/0"
                        : "bg-gradient-to-r from-green-500/0 via-green-500/10 to-green-500/0"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT: Socials & Controls */}
          <div
            ref={rightSectionRef}
            className="flex items-center gap-4 pointer-events-auto justify-self-end">
            {/* Socials - Hidden on Mobile */}
            <div className="hidden md:flex items-center justify-end bg-white/5 border border-white/5 backdrop-blur-sm rounded-full px-5 py-3 gap-5">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-green-500 transition-colors duration-300"
                  aria-label={social.label}>
                  {social.icon}
                </a>
              ))}
            </div>

            {/* Mobile/Small Screen Toggle */}
            <button
              onClick={toggleMenu}
              className="lg:hidden pointer-events-auto flex items-center justify-center w-12 h-12 rounded-full bg-white/5 border border-white/5 z-[120] text-white hover:bg-white/10 transition-colors relative">
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Visual Balance for Desktop */}
            <div className="hidden lg:block w-4" />
          </div>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      <div
        ref={menuRef}
        className="fixed h-dvh z-[110] bg-black translate-x-full w-full lg:hidden flex flex-col pt-16 px-12 top-0 left-0">
        <div className="flex flex-col gap-6">
          <button
            onClick={toggleMenu}
            className="lg:hidden pointer-events-auto flex items-center justify-center w-12 h-12 rounded-full bg-white/5 border border-white/5 z-[120] text-white hover:bg-white/10 transition-colors relative ">
            <X size={20} />
          </button>

          {menuItems.map((item, i) => (
            <button
              key={item.label}
              ref={(el) => (mobileLinksRef.current[i] = el)}
              onClick={() => handleNavClick(item)}
              className={`text-4xl font-black uppercase tracking-tighter transition-all duration-500 text-left hover:translate-x-4 flex items-center gap-4 ${
                item.highlight
                  ? "text-red-400 hover:text-red-300"
                  : "text-white/60 hover:text-white"
              }`}>
              {item.highlight && <Radio size={24} className="animate-pulse" />}
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-auto mb-12 flex flex-col gap-8">
          <div className="flex gap-6">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.link}
                className="text-white/70 hover:text-green-500 transition-colors">
                {social.icon}
              </a>
            ))}
          </div>
          <div className="opacity-20 text-[10px] tracking-[0.5em] uppercase">
            SINCE 1999 • NO SACRIFICE NO VICTORY
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
