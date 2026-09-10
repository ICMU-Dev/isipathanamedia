# 5. Content Admin Panel

The Admin Panel at `isipathanamedia.online/:adminPath/dashboard` is the daily workshop for writing articles, managing the team, and controlling broadcasts.

---

## 🔄 The Article Lifecycle Flow

Articles move through a simple moderation pipeline from draft to publication:

<div class="my-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 not-prose">
  <div class="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
    <div class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-500/15 text-zinc-300 text-[10px] font-bold mb-2">
      Step 1
    </div>
    <h4 class="text-white font-bold text-sm">✍️ Draft</h4>
    <p class="text-xs text-zinc-400 mt-1 leading-relaxed">
      A writer creates the article story. The draft is saved privately and is only visible to the author and editors.
    </p>
  </div>

  <div class="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
    <div class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 text-[10px] font-bold mb-2">
      Step 2
    </div>
    <h4 class="text-white font-bold text-sm">⏳ Pending</h4>
    <p class="text-xs text-zinc-400 mt-1 leading-relaxed">
      The writer submits the article for editorial review. Admins receive an instant notification to inspect the content.
    </p>
  </div>

  <div class="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
    <div class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 text-[10px] font-bold mb-2">
      Step 3
    </div>
    <h4 class="text-white font-bold text-sm">🚀 Published</h4>
    <p class="text-xs text-zinc-400 mt-1 leading-relaxed">
      An admin approves the story. It immediately appears on the school newsroom and triggers social media preview cards.
    </p>
  </div>

  <div class="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
    <div class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 text-[10px] font-bold mb-2">
      Revision
    </div>
    <h4 class="text-white font-bold text-sm">⚠️ Needs Attention</h4>
    <p class="text-xs text-zinc-400 mt-1 leading-relaxed">
      If a correction is needed, the admin returns the draft with a note specifying what details or photos to fix.
    </p>
  </div>
</div>

---

## 🔗 Deep-Linking to Articles (`#view-<id>`)

You can share direct links to any article modal:

<div class="my-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] not-prose">
  <div class="font-mono text-xs text-zinc-300 flex items-center gap-1 flex-wrap">
    <span>.../dashboard/news</span>
    <span class="px-2 py-0.5 rounded-2xl bg-green-500/15 text-green-400 font-bold border border-green-500/30">#view-842</span>
  </div>
  <ul class="text-xs text-zinc-400 mt-3 space-y-1">
    <li>• <strong>Direct Opening</strong>: Navigating to this link immediately pops up the targeted article viewer modal.</li>
    <li>• <strong>Smooth Dismissal</strong>: Closing the modal restores the previous tab hash without jarring page jumps.</li>
  </ul>
</div>

---

## ✂️ The Image Cropper & WebP Compressor

To ensure the website loads in under 2 seconds on mobile data:

<div class="my-5 grid grid-cols-1 sm:grid-cols-3 gap-3 not-prose">
  <div class="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
    <div class="text-[10px] font-mono text-zinc-500 mb-1">Phase 1</div>
    <div class="text-xs font-bold text-white mb-1">📸 Photo Upload</div>
    <p class="text-[11px] text-zinc-400">Select any camera photo or event graphic directly from your device.</p>
  </div>

  <div class="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
    <div class="text-[10px] font-mono text-zinc-500 mb-1">Phase 2</div>
    <div class="text-xs font-bold text-white mb-1">✂️ 16:9 Aspect Cropper</div>
    <p class="text-[11px] text-zinc-400">Crop, zoom, and rotate to fit standard widescreen dimensions cleanly.</p>
  </div>

  <div class="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
    <div class="text-[10px] font-mono text-zinc-500 mb-1">Phase 3</div>
    <div class="text-xs font-bold text-white mb-1">⚡ WebP Compression</div>
    <p class="text-[11px] text-zinc-400">Automatic browser-side conversion to modern, lightweight WebP image format.</p>
  </div>
</div>

---

## 🎨 Changing Your Theme

The admin panel features **19 customizable themes**:

- **Green Themes**: Isipathana Green, Green Luxe, Crypto Neon
- **Dark Modes**: OLED Stealth, Midnight Slate, Ocean Sapphire
- **Retro & Creative**: Terminal Hacker (green terminal font), Neon Cyberpunk

Switch anytime under **Settings → Appearance** and your choice is saved to your account!
