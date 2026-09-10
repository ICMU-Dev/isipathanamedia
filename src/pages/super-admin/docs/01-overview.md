# 1. Project Overview & Platform Map

The **Isipathana College Media Unit (ICMU)** platform is the official digital broadcasting and news publishing home for Isipathana College.

- 🌐 **Official Domain**: [isipathanamedia.online](https://isipathanamedia.online)
- 📻 **Vibhavi FM Radio**: [vibhavi.isipathanamedia.online](https://vibhavi.isipathanamedia.online)

---

## 📱 Platform Map at a Glance

Here is how the platform is structured for visitors and media unit members:

<div class="my-5 space-y-4 not-prose">
  <div class="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
    <div class="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-white/[0.06]">
      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-green-500"></span>
        <span class="text-white font-bold text-sm tracking-tight">Public Website (isipathanamedia.online)</span>
      </div>
      <span class="text-[10px] font-mono text-zinc-500">Visitor Facing</span>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div class="p-3 rounded-xl bg-black/40 border border-white/[0.06]">
        <div class="text-xs font-bold text-white mb-1">📰 Newsroom</div>
        <p class="text-[11px] text-zinc-400">School articles, match reports, high-res photos & quick announcements.</p>
      </div>
      <div class="p-3 rounded-xl bg-black/40 border border-white/[0.06]">
        <div class="text-xs font-bold text-white mb-1">🎥 Live Stream</div>
        <p class="text-[11px] text-zinc-400">Embedded YouTube / Facebook live player for big matches and assemblies.</p>
      </div>
      <div class="p-3 rounded-xl bg-black/40 border border-white/[0.06]">
        <div class="text-xs font-bold text-white mb-1">📻 Vibhavi FM</div>
        <p class="text-[11px] text-zinc-400">24/7 online student radio stream powered by RadioKing cloud broadcast.</p>
      </div>
    </div>
  </div>

  <div class="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
    <div class="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-white/[0.06]">
      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
        <span class="text-white font-bold text-sm tracking-tight">Secure Management Portals (/:adminPath)</span>
      </div>
      <span class="text-[10px] font-mono text-zinc-500">Member Access</span>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <div class="p-3 rounded-xl bg-black/40 border border-white/[0.06]">
        <div class="text-xs font-bold text-purple-400 mb-1">✍️ Writers</div>
        <p class="text-[11px] text-zinc-400">Draft stories, upload photos, and submit articles for review.</p>
      </div>
      <div class="p-3 rounded-xl bg-black/40 border border-white/[0.06]">
        <div class="text-xs font-bold text-green-400 mb-1">🛡️ Admins</div>
        <p class="text-[11px] text-zinc-400">Approve news, paste live stream links, and manage content.</p>
      </div>
      <div class="p-3 rounded-xl bg-black/40 border border-white/[0.06]">
        <div class="text-xs font-bold text-amber-400 mb-1">📡 Broadcasters</div>
        <p class="text-[11px] text-zinc-400">Manage live stream settings and access the Vibhavi FM terminal.</p>
      </div>
      <div class="p-3 rounded-xl bg-black/40 border border-white/[0.06]">
        <div class="text-xs font-bold text-red-400 mb-1">👑 Super Admin</div>
        <p class="text-[11px] text-zinc-400">Master user accounts, permission matrix, and database stats.</p>
      </div>
    </div>
  </div>
</div>

---

## 🌟 Core Features

| Area | What it does | Live Address |
| :--- | :--- | :--- |
| **Public Showcase** | Flagship home page, about history, leadership team, and contact form | `isipathanamedia.online/` |
| **School Newsroom** | Full articles and quick updates with photos, tags, and category filters | `isipathanamedia.online/news` |
| **Live Stream** | Video broadcast player for school cricket matches, athletic meets, and events | `isipathanamedia.online/live` |
| **Vibhavi FM** | Live student radio with live track details, visualizer, and message box | `vibhavi.isipathanamedia.online` |
| **Content Admin** | Editorial dashboard for drafting, approving, and scheduling articles | `isipathanamedia.online/:adminPath/dashboard` |
| **Super Admin Hub** | Master user control, database stats, role guidelines, and docs | `isipathanamedia.online/:adminPath` |

---

## ⚡ Tech Stack (Simplified)

- **React 19 & Vite**: Ultra-fast page transitions on mobile phones and computers.
- **Supabase Cloud**: Real-time database where changes appear instantly without refreshing.
- **Installable App (PWA)**: Add to your iPhone or Android home screen for instant access.
- **19 Visual Themes**: Custom theme engine with dark mode, OLED stealth, and signature green styles.
