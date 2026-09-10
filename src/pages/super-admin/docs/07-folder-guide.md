# 9. File & Folder Guide

A simple roadmap of where key features and files live in the project:

<div class="my-5 grid grid-cols-1 sm:grid-cols-2 gap-3 not-prose">
  <div class="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
    <div class="text-xs font-bold text-green-400 mb-1">📂 src/pages/landing-page/</div>
    <p class="text-xs text-zinc-400 leading-relaxed">
      Public visitor views: Landing Page, Newsroom, Article Viewer modal, and the <code>/live</code> player.
    </p>
  </div>

  <div class="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
    <div class="text-xs font-bold text-cyan-400 mb-1">📂 src/pages/admin/</div>
    <p class="text-xs text-zinc-400 leading-relaxed">
      Editorial workspace: Dashboard stats, News Manager, Article Wizard, Settings, and Team Roster.
    </p>
  </div>

  <div class="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
    <div class="text-xs font-bold text-red-400 mb-1">📂 src/pages/super-admin/</div>
    <p class="text-xs text-zinc-400 leading-relaxed">
      Master administration hub: User Clearance Table, Database Telemetry, and System Documentation.
    </p>
  </div>

  <div class="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
    <div class="text-xs font-bold text-purple-400 mb-1">📂 src/components/motion/</div>
    <p class="text-xs text-zinc-400 leading-relaxed">
      Motion physics: Smooth Scroll, Reading Progress, Parallax, Reveal on Scroll, and Morphing Modals.
    </p>
  </div>

  <div class="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
    <div class="text-xs font-bold text-amber-400 mb-1">📂 src/context/</div>
    <p class="text-xs text-zinc-400 leading-relaxed">
      Application brain: AuthContext (login sessions), DataContext (realtime Supabase), and ThemeContext (19 themes).
    </p>
  </div>

  <div class="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
    <div class="text-xs font-bold text-blue-400 mb-1">📂 src/lib/ & utils/</div>
    <p class="text-xs text-zinc-400 leading-relaxed">
      Shared utilities: <code>roles.js</code> (access matrix), <code>supabaseClient.js</code> (cloud sync), and <code>videoUtils.js</code>.
    </p>
  </div>
</div>

---

## 🧭 Quick Navigation Tips
- To modify **News Articles & Editing**, check `src/pages/admin/ManageNews.jsx`.
- To modify the **Public Home Page**, check `src/pages/landing-page/LandingPage.jsx`.
- To update **User Role Boundaries**, check `src/utils/roles.js`.
- To customize **Appearance & Colors**, check `src/context/ThemeContext.jsx`.
