import React, { useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { Heart, Mail, MapPin, Github } from 'lucide-react';
import SocialIcon from './SocialIcon';

const Footer = () => {
    const { siteConfig } = useData();

    const socialLinks = useMemo(() => siteConfig?.socialLinks || {}, [siteConfig?.socialLinks]);
    const contact = useMemo(() => siteConfig?.contactDetails || {}, [siteConfig?.contactDetails]);

    return (
        <footer className="bg-black border-t border-white/[0.06]  py-10 sm:py-12 px-4 sm:px-6 relative overflow-hidden">
            {/* Ambient background hint */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary-neon/20 to-transparent"></div>

            <div className="container mx-auto max-w-6xl z-10 relative">
                {/* Main row: stacks on mobile, side-by-side on md+ */}
                <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8 md:gap-12">

                    {/* Branding — centered on mobile, left-aligned on md+ */}
                    <div className="text-center md:text-left space-y-3">
                        <div className="flex flex-col">
                            <span className="text-[9px] sm:text-[10px] font-black tracking-[0.4em] sm:tracking-[0.5em] uppercase text-white/70">Media Unit of</span>
                            <span className="text-lg sm:text-xl font-bold tracking-tight text-white uppercase">Isipathana College</span>
                        </div>
                        <p className="text-white/60 text-[10px] sm:text-xs tracking-widest uppercase font-medium">Since 1999 • No Sacrifice, No Victory</p>
                    </div>

                    {/* Socials + Contact — centered on mobile, right-aligned on md+ */}
                    <div className="flex flex-col items-center md:items-end gap-4">
                        <div className="flex gap-4 sm:gap-5 flex-wrap justify-center md:justify-end">
                            {Object.entries(socialLinks)
                                .filter(([key, link]) => link && link.trim() !== '')
                                .map(([key, link]) => (
                                    <SocialLink 
                                        key={key}
                                        icon={<SocialIcon platform={key} size={16} />} 
                                        href={link} 
                                        label={key.charAt(0).toUpperCase() + key.slice(1)} 
                                    />
                                ))}
                        </div>
                        <div className="flex flex-col items-center md:items-end gap-1.5 sm:gap-2 mt-1">
                            <div className="flex items-center gap-2 text-white/60 text-[9px] sm:text-[10px] font-medium tracking-wider">
                                <Mail size={10} className="text-primary-neon/60 shrink-0" />
                                <span className="truncate max-w-[220px] sm:max-w-none">{contact.email || 'icmediaunit@gmail.com'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-white/60 text-[9px] sm:text-[10px] font-medium tracking-wider">
                                <MapPin size={10} className="text-primary-neon/60 shrink-0" />
                                <span className="text-center md:text-right">{contact.address || 'Isipathana College, Colpetty, Colombo 03'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="mt-8 sm:mt-10 pt-5 sm:pt-6 border-t border-white/[0.03] flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6">
                    <p className="text-[9px] sm:text-[10px] font-bold tracking-[0.15em] sm:tracking-[0.2em] text-white/60 uppercase text-center sm:text-left">
                        © {new Date().getFullYear()} ICMU. All Rights Reserved.
                    </p>
                    
                    {/* Developer Credits (Matching Nethinethera) */}
                    <div className="flex items-center gap-3">
                        <span className="text-[8px] sm:text-[9px] font-bold tracking-[0.2em] uppercase text-white/40">Developed by</span>
                        <div className="flex items-center gap-3">
                            <a href="https://github.com/t-24929" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-white/40 hover:text-white/80 transition-colors duration-300">
                                <Github size={12} />
                                <span className="text-[9px] sm:text-[10px] tracking-widest font-sans font-bold">t-24929</span>
                            </a>
                            <span className="text-[10px] text-white/20">|</span>
                            <a href="https://github.com/rusaths" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-white/40 hover:text-white/80 transition-colors duration-300">
                                <Github size={12} />
                                <span className="text-[9px] sm:text-[10px] tracking-widest font-sans font-bold">rusaths</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

const SocialLink = ({ icon, href, label }) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/5 flex items-center justify-center text-white/70 hover:bg-primary-neon hover:text-dark transition-all duration-300 border border-white/[0.06] "
    >
        {icon}
    </a>
);

export default Footer;
