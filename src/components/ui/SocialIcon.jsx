import React from 'react';
import { Facebook, Instagram, Youtube, Linkedin, Twitter, Link } from 'lucide-react';

const SocialIcon = ({ platform, size = 16, className = "" }) => {
  if (!platform) return <Link size={size} className={className} />;
  
  const p = platform.toLowerCase().trim();

  switch (p) {
    case 'facebook':
      return <Facebook size={size} className={className} />;
    case 'instagram':
      return <Instagram size={size} className={className} />;
    case 'youtube':
      return <Youtube size={size} className={className} />;
    case 'linkedin':
      return <Linkedin size={size} className={className} />;
    case 'twitter':
    case 'x':
      return <Twitter size={size} className={className} />;
    case 'tiktok':
      return (
        <svg 
          width={size} 
          height={size} 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className={className}
        >
          <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
        </svg>
      );
    case 'whatsapp':
      return (
        <svg 
          width={size} 
          height={size} 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className={className}
        >
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          <path d="M15.5 14.5c-.5.5-1.5.5-2-.5s-2-2-2-2-1.5-1.5-2.5-2 .5-1.5.5-2 .5-1.5 0-2-.5-1.5-1-1.5-1.5.5-1.5 1.5c0 2.5 1.5 4.5 3.5 6.5s4 3.5 6.5 3.5c1 0 1.5-1 1.5-1.5s-1-1-1.5-1.5-1.5-.5-2 0z" />
        </svg>
      );
    default:
      return <Link size={size} className={className} />;
  }
};

export default SocialIcon;
