import React, { useMemo, useState, useRef } from 'react';
import { useData } from '../../../../context/DataContext';
import { Facebook, Instagram, Youtube, Mail, MapPin, Github } from 'lucide-react';
import StorageInspector from '../../../../components/ui/StorageInspector';
import whiteLogos from '/nethinethera/logos-white.png';
import endorsment from '/nethinethera/endorsment.png';

const FooterCTASection = ({ onAdminClick }) => {
  const { siteConfig } = useData();

  const [tapCount, setTapCount] = useState(0);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const tapTimerRef = useRef(null);

  const handleLogoClick = () => {
    const nextCount = tapCount + 1;
    setTapCount(nextCount);
    
    if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
    
    tapTimerRef.current = setTimeout(() => {
      setTapCount(0);
    }, 2000);

    if (nextCount >= 5) {
      setIsInspectorOpen(true);
      setTapCount(0);
      if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
    }
  };

  const socialLinks = useMemo(() => siteConfig?.socialLinks || {}, [siteConfig?.socialLinks]);
  const contact = useMemo(() => siteConfig?.contactDetails || {}, [siteConfig?.contactDetails]);

  const socials = useMemo(() => [
    { icon: <Facebook size={15} />, href: socialLinks.facebook || '#', label: 'Facebook' },
    { icon: <Instagram size={15} />, href: socialLinks.instagram || '#', label: 'Instagram' },
    { icon: <Youtube size={15} />, href: socialLinks.youtube || '#', label: 'YouTube' },
  ], [socialLinks]);

  return (
    <>
    <footer className="relative z-10 border-t border-white/[0.06] bg-[#030303]">

      {/* ── Top Gradient Line ── */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* ═══════════════════════════════════════
          MAIN FOOTER CONTENT
          ═══════════════════════════════════════ */}
      <div className="max-w-6xl mx-auto px-6 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-8 justify-center">

          {/* ── Column 1: Branding ── */}
          <div className="flex flex-col items-center md:items-start gap-5">
            {/* Logo */}
            <img
              src={whiteLogos}
              alt="Nethinethera"
              className="w-20 opacity-70 hover:opacity-100 transition-opacity duration-500 cursor-pointer active:scale-95 touch-none"
              onClick={handleLogoClick}
            />

            {/* Title with admin trigger */}
            <div
              className="font-palingu2 text-2xl sm:text-4xl text-white/60 cursor-pointer hover:text-white/80 transition-colors duration-300"
              onClick={onAdminClick}
            >
              fk;sfkf;r
            </div>

            <p className="font-sans text-xs text-white/60 leading-relaxed text-center md:text-left max-w-xs">
              The official Media Day & Anniversary of Isipathana College Media Unit.
              Where perspective shapes reality.
            </p>

            <div className="font-konexy text-[7px] tracking-[0.5em] uppercase text-white/15">
              When Perspective Shapes Reality
            </div>
          </div>



          {/* ── Column 3: Social & Contact ── */}
          <div className="flex flex-col items-center md:items-end gap-5">
            {/* ── Column 2: Quick Links ── */}
            <div className="flex flex-col items-center gap-5 justify-between ">

              <nav className="flex  gap-3">
                {[
                  { label: 'Home', id: 'home' },
                  { label: 'Theme', id: 'theme-reveal' },
                  { label: 'Trailer', id: 'trailer' },
                ].map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="font-konexy text-[9px] tracking-[0.3em] uppercase text-white/25 hover:text-white/70 transition-colors duration-300"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>


            {/* Social Icons */}
            <div className="flex items-center gap-3">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="group w-9 h-9 rounded-full border border-white/[0.06] 0 bg-white/[0.02] flex items-center justify-center text-white/60 hover:text-white hover:border-white/25 hover:bg-white/[0.06] transition-all duration-400 hover:-translate-y-0.5"
                >
                  {social.icon}
                </a>
              ))}
            </div>

            {/* Contact Details */}
            <div className="flex flex-col items-center md:items-end gap-2 mt-2">
              <div className="flex items-center gap-2 text-white/60 group hover:text-white/80 transition-colors duration-300">
                <Mail size={10} className="text-white/15 group-hover:text-white/70 transition-colors" />
                <span className="font-konexy text-[7px] tracking-[0.3em]">
                  {contact.email || 'icmediaunit@gmail.com'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-white/60 group hover:text-white/80 transition-colors duration-300">
                <MapPin size={10} className="text-white/15 group-hover:text-white/70 transition-colors" />
                <span className="font-konexy text-[7px] tracking-[0.3em]">
                  {contact.address || 'Isipathana College, Colombo 05'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          ENDORSEMENT BAR
          ═══════════════════════════════════════ */}
      <div className="border-t border-white/[0.06] ">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col items-center gap-4">
          <img
            src={endorsment}
            alt="Endorsed by Ministry of Health & Mass Media"
            className="w-48 opacity-40 hover:opacity-60 transition-opacity duration-500"
          />

        </div>
      </div>

      {/* ═══════════════════════════════════════
          COPYRIGHT BAR
          ═══════════════════════════════════════ */}
      <div className="border-t border-white/[0.03]">
        <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-3 text-white/80">
          <span className=" text-[6px] tracking-[0.25em] uppercase text-white/12 text-center sm:text-left">
            © {new Date().getFullYear()} Media Unit of Isipathana College. All rights reserved.
          </span>
          
          {/* Developer Credits */}
          <div className="flex items-center gap-3">
            <span className="text-[6px] tracking-[0.2em] uppercase text-white/20">Developed by</span>
            <div className="flex items-center gap-3">
              <a href="https://github.com/t-24929" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-white/20 hover:text-white/60 transition-colors duration-300">
                <Github size={10} />
                <span className="text-[7px] tracking-wider font-sans">t-24929</span>
              </a>
              <span className="text-[6px] text-white/10">|</span>
              <a href="https://github.com/rusaths" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-white/20 hover:text-white/60 transition-colors duration-300">
                <Github size={10} />
                <span className="text-[7px] tracking-wider font-sans">rusaths</span>
              </a>
            </div>
          </div>

          <span className="font-konexy text-[6px] tracking-[0.4em] uppercase text-white/10 text-center sm:text-right hidden md:block">
            Nethinethera — The Media Day &amp; Anniversary
          </span>
        </div>
      </div>
    </footer>
      
      <StorageInspector 
        isOpen={isInspectorOpen} 
        onClose={() => setIsInspectorOpen(false)} 
      />
    </>
  );
};

export default FooterCTASection;
