# 4. Public Website & Features

The public website at **[isipathanamedia.online](https://isipathanamedia.online)** is designed to be welcoming, fast, and accessible for everyone.

---

## 🏠 The Home Page Layout Flow

Visitors scroll through customizable sections that tell the story of the media unit:

<div class="my-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 not-prose">
  <div class="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
    <span class="text-[10px] font-mono text-green-400 font-bold">Section 1</span>
    <h4 class="text-white font-bold text-sm mt-0.5">🌟 Hero Banner</h4>
    <p class="text-xs text-zinc-400 mt-1">Official crest, animated slogan, and down-scroll prompt.</p>
  </div>

  <div class="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
    <span class="text-[10px] font-mono text-red-400 font-bold">Section 2</span>
    <h4 class="text-white font-bold text-sm mt-0.5">🔴 Live Stream Section</h4>
    <p class="text-xs text-zinc-400 mt-1">Live broadcast player or status banner when an event is live.</p>
  </div>

  <div class="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
    <span class="text-[10px] font-mono text-amber-400 font-bold">Section 3</span>
    <h4 class="text-white font-bold text-sm mt-0.5">📖 About & Heritage</h4>
    <p class="text-xs text-zinc-400 mt-1">Media unit legacy, history, achievements, and capabilities.</p>
  </div>

  <div class="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
    <span class="text-[10px] font-mono text-cyan-400 font-bold">Section 4</span>
    <h4 class="text-white font-bold text-sm mt-0.5">🛠️ Media Services</h4>
    <p class="text-xs text-zinc-400 mt-1">Announcing & compering, scripting & content, and technical support.</p>
  </div>

  <div class="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
    <span class="text-[10px] font-mono text-blue-400 font-bold">Section 5</span>
    <h4 class="text-white font-bold text-sm mt-0.5">📰 Newsroom</h4>
    <p class="text-xs text-zinc-400 mt-1">Featured news stories, event articles, and quick school bulletins.</p>
  </div>

  <div class="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
    <span class="text-[10px] font-mono text-purple-400 font-bold">Section 6</span>
    <h4 class="text-white font-bold text-sm mt-0.5">👥 Leadership & Crew</h4>
    <p class="text-xs text-zinc-400 mt-1">Executive board, photographers, announcers, and crew cards.</p>
  </div>

  <div class="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] sm:col-span-2 lg:col-span-3">
    <span class="text-[10px] font-mono text-emerald-400 font-bold">Section 7</span>
    <h4 class="text-white font-bold text-sm mt-0.5">📬 Get In Touch</h4>
    <p class="text-xs text-zinc-400 mt-1">Direct message contact form, school location map, and social media links.</p>
  </div>
</div>

> [!TIP]
> Administrators can rearrange the order or visibility of these sections anytime from the **Settings** tab without modifying code.

---

## 📰 Newsroom: Articles vs. Updates

The news section gives students and alumni real-time coverage of school life:

<div class="my-5 grid grid-cols-1 sm:grid-cols-2 gap-3 not-prose">
  <div class="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
    <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-3">
      📄 Full Article
    </div>
    <ul class="text-xs text-zinc-300 space-y-1.5 leading-relaxed">
      <li>• Comprehensive long-form story with rich typography</li>
      <li>• Multiple subheadings, bullet points, quotes, and links</li>
      <li>• 16:9 high-resolution cover photo cropped inside the browser</li>
      <li>• Embedded YouTube video clips and photo galleries</li>
    </ul>
  </div>

  <div class="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
    <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold mb-3">
      ⚡ Quick Update
    </div>
    <ul class="text-xs text-zinc-300 space-y-1.5 leading-relaxed">
      <li>• Fast 1-2 sentence announcement for breaking sports results</li>
      <li>• Live match score updates (cricket, rugby, athletics)</li>
      <li>• Single instant snapshot photo attachment</li>
      <li>• Takes under 30 seconds to compose and publish</li>
    </ul>
  </div>
</div>

### Social Media Cards (WhatsApp & Facebook)

When anyone copies a news link and shares it on WhatsApp, Telegram, or Facebook:

- An edge function automatically serves an OpenGraph card.
- Shows the article title, author name, and cover image directly inside the messaging app.

---

## 📻 Vibhavi FM Online Radio

- 🎙️ **Direct Link**: [vibhavi.isipathanamedia.online](https://vibhavi.isipathanamedia.online)
- **Audio Stream**: Seamless playback powered by RadioKing API integration.
- **Now Playing Tracker**: Automatically displays current song title and artist information in real time.
- **Admin Chat**: Listeners can send message dedications directly to the broadcast studio.

---

## 🎥 Live Event Player (`/live`)

- **Multi-Platform Support**: Paste any YouTube Live or Facebook Live video link into Admin Settings.
- **Live Chat Option**: Toggle real-time YouTube live chat so viewers can cheer during matches.
- **Auto Status Indicator**: Live status badge indicates when a broadcast is active.
