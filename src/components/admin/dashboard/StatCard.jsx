import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { AnimatedNumber } from "../../../components/motion/animated-number";

const StatCard = ({
  icon,
  title,
  value,
  subtext,
  href,
  colorScheme = "accent", // "accent" | "green" | "yellow" | "blue"
}) => {
  const schemeStyles = {
    accent: {
      iconBg: "bg-theme-accent/ text-[var(--accent)]",
      glowBg: "bg-theme-accent/",
      hoverBorder: "hover:border-theme-accent/",
      accentText: "text-[var(--accent)]",
    },
    green: {
      iconBg: "bg-emerald-500/10 text-emerald-400",
      glowBg: "bg-emerald-500/15",
      hoverBorder: "hover:border-emerald-500/40",
      accentText: "text-emerald-400",
    },
    yellow: {
      iconBg: "bg-amber-500/10 text-amber-400",
      glowBg: "bg-amber-500/15",
      hoverBorder: "hover:border-amber-500/40",
      accentText: "text-amber-400",
    },
    blue: {
      iconBg: "bg-cyan-500/10 text-cyan-400",
      glowBg: "bg-cyan-500/15",
      hoverBorder: "hover:border-cyan-500/40",
      accentText: "text-cyan-400",
    },
  };

  const scheme = schemeStyles[colorScheme] || schemeStyles.accent;

  const content = (
    <div
      className={`relative overflow-hidden rounded-2xl p-5 bg-[var(--admin-card-bg)] border border-[var(--admin-border)] flex flex-col justify-between min-h-[130px] transition-all duration-200 group ${scheme.hoverBorder} hover:shadow-[0_4px_20px_rgba(0,0,0,0.2)]`}
    >
      {/* Subtle ambient hover glow */}
      <div
        className={`absolute -top-12 -right-12 w-28 h-28  blur-[32px] rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
      />

      <div className="flex items-start justify-between relative z-10">
        <div
          className={`w-9 h-9 rounded-2xl flex items-center justify-center  transition-transform group-hover:scale-105 duration-200`}
        >
          {icon}
        </div>

      </div>

      <div className="relative z-10 mt-3">
        <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--admin-text-secondary)] mb-1">
          {title}
        </p>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--admin-text-primary)] leading-none">
            {typeof value === "number" ? <AnimatedNumber value={value} /> : value}
          </span>
        </div>
        {subtext && (
          <p className="text-[11px] text-[var(--admin-text-secondary)] mt-1.5 flex items-center gap-1 font-medium">
            {subtext}
          </p>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link to={href} className="block group">
        {content}
      </Link>
    );
  }

  return content;
};

export default StatCard;

