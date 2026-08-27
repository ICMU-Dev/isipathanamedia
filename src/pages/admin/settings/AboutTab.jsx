/* global __APP_VERSION__, __COMMIT_HASH__ */
import React from "react";
import PWAInstallCard from "../../../components/admin/PWAInstallCard";
import { MessageSquarePlus, Globe, Palette, ShieldCheck } from "lucide-react";

const AboutTab = () => {
  return (
    <div className="space-y-8 ">
      {/* App Installation Card */}
      <PWAInstallCard />

      {/* App identity */}
      <div className="flex items-start gap-5 p-6 bg-[var(--admin-input-bg)] border border-[var(--admin-border)] rounded-2xl">
        <div>
          <h3 className="text-[15px] font-bold text-white">ICMU Web</h3>
          <p className="text-[12px] text-[var(--admin-text-secondary)] mt-1 leading-relaxed">
            The official admin portal for Isipathana College Media Unit. Built
            to manage news articles, team rosters, live streams, and site
            configuration in one unified interface.
          </p>
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <span className="px-2.5 py-1 bg-white/[0.05] borderborder-white/[0.06]  rounded-2xl text-[11px] text-[var(--admin-text-secondary)] font-mono">
              v{typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '1.0.0'}
            </span>
            <span className="px-2.5 py-1 bg-white/[0.05] borderborder-white/[0.06]  rounded-2xl text-[11px] text-[var(--admin-text-secondary)] font-mono">
              Build: {typeof __COMMIT_HASH__ !== 'undefined' ? __COMMIT_HASH__ : 'unknown'}
            </span>
            <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-[11px] text-emerald-400 font-medium">
              Production
            </span>
          </div>
        </div>
      </div>

      {/* Tech stack */}
      <div>
        <h4 className="font-bold text-[var(--admin-text-primary)] mb-4 uppercase tracking-widest text-[11px]">
          Tech Stack
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            {
              name: "React 19",
              desc: "UI Framework",
              color: "text-cyan-400",
            },
            {
              name: "Vite",
              desc: "Build Tool",
              color: "text-violet-400",
            },
            {
              name: "Supabase",
              desc: "Backend & Auth",
              color: "text-emerald-400",
            },
            {
              name: "Tailwind CSS",
              desc: "Styling",
              color: "text-sky-400",
            },
            {
              name: "Framer Motion",
              desc: "Animations",
              color: "text-pink-400",
            },
            {
              name: "React Router",
              desc: "Routing",
              color: "text-orange-400",
            },
          ].map((t) => (
            <div
              key={t.name}
              className="p-3 bg-[var(--admin-input-bg)] border border-white/[0.06]  rounded-2xl">
              <p className={`text-[13px] font-semibold ${t.color}`}>{t.name}</p>
              <p className="text-[11px] text-white/30 mt-0.5">{t.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Feedback tip */}
      <div className="flex items-start gap-3 p-4 bg-theme-accent/5  border border-theme-accent/15 rounded-2xl">
        <MessageSquarePlus
          size={18}
          className="text-[var(--accent)] shrink-0 mt-0.5"
        />
        <div>
          <p className="text-[13px] font-medium text-[var(--admin-text-primary)]">
            Have a suggestion or found a bug?
          </p>
          <p className="text-[12px] text-[var(--admin-text-secondary)] mt-1 leading-relaxed">
            Use the feedback button{" "}
            <kbd className="px-1 py-0.5 rounded bg-white/[0.08] text-[var(--admin-text-secondary)] font-mono text-[10px]">
              bottom-right corner
            </kbd>{" "}
            on any admin page, or press{" "}
            <kbd className="px-1 py-0.5 rounded bg-white/[0.08] text-[var(--admin-text-secondary)] font-mono text-[10px]">
              Ctrl+Shift+F
            </kbd>{" "}
            to open the feedback form instantly.
          </p>
        </div>
      </div>

      {/* Credits */}
      <div>
        <h4 className="text-[11px] font-bold text-white/30 uppercase tracking-widest mb-4">
          Credits
        </h4>
        <div className="space-y-3">
          {[
            {
              label: "Development",
              value: "Isipathana College Media Unit",
              icon: <Globe size={13} />,
            },
            {
              label: "Design System",
              value: "Custom — Glassmorphism + Dark UI",
              icon: <Palette size={13} />,
            },
            {
              label: "Hosting",
              value: "Netlify",
              icon: <ShieldCheck size={13} />,
            },
          ].map((c) => (
            <div
              key={c.label}
              className="flex items-center gap-3 py-2.5 border-b border-white/[0.06] ">
              <span className="text-white/25">{c.icon}</span>
              <span className="text-[12px] text-white/30 w-28 shrink-0">
                {c.label}
              </span>
              <span className="text-[12px] text-[var(--admin-text-secondary)]">{c.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AboutTab;
