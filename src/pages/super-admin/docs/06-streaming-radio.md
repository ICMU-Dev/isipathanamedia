# 8. Live Video Streaming & Vibhavi FM Radio

## 🎥 Live Video Streaming: How It Works

The platform uses a lightweight, serverless approach for live video broadcasts (such as Annual Ceremonies, Colors Awards, and Big Matches). **No dedicated media streaming servers or RTMP ingest boxes are required.**

<div class="grid grid-cols-1 md:grid-cols-3 gap-3 my-5 not-prose">
  <div class="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex flex-col justify-between">
    <div>
      <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-bold uppercase tracking-wider mb-3">
        Step 1 • Admin Input
      </div>
      <h4 class="text-white font-bold text-sm mb-1">Paste Live Stream URL</h4>
      <p class="text-zinc-400 text-xs leading-relaxed">
        The admin copies a standard <strong>YouTube Live</strong> or <strong>Facebook Live</strong> video link and pastes it into <em>Live Stream Settings</em> in the Admin Panel.
      </p>
    </div>
    <div class="mt-3 pt-3 border-t border-white/[0.06] text-[11px] text-zinc-500 font-mono">
      youtubeUtils & videoUtils
    </div>
  </div>

  <div class="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex flex-col justify-between">
    <div>
      <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold uppercase tracking-wider mb-3">
        Step 2 • Cloud Sync
      </div>
      <h4 class="text-white font-bold text-sm mb-1">Supabase Config Storage</h4>
      <p class="text-zinc-400 text-xs leading-relaxed">
        The system automatically detects the provider, validates the embed ID, and saves the stream title, status (Live/Offline), and custom chat toggles into Supabase <code>siteConfig</code>.
      </p>
    </div>
    <div class="mt-3 pt-3 border-t border-white/[0.06] text-[11px] text-zinc-500 font-mono">
      Realtime WebSocket Broadcast
    </div>
  </div>

  <div class="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex flex-col justify-between">
    <div>
      <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-bold uppercase tracking-wider mb-3">
        Step 3 • Instant Playback
      </div>
      <h4 class="text-white font-bold text-sm mb-1">Public Video Player</h4>
      <p class="text-zinc-400 text-xs leading-relaxed">
        Visitors browsing <strong>isipathanamedia.online/live</strong> or the home page receive the live embed instantly via the responsive <code>VideoEmbed</code> player with zero server maintenance.
      </p>
    </div>
    <div class="mt-3 pt-3 border-t border-white/[0.06] text-[11px] text-zinc-500 font-mono">
      isipathanamedia.online/live
    </div>
  </div>
</div>

### Key Live Stream Controls:
- **Automatic Platform Detection**: Paste any standard YouTube (`watch?v=...`, `youtu.be/...`, or live embed) or Facebook Video URL — the platform extracts the correct video ID automatically.
- **One-Click Live Switch**: Toggle stream status on or off with instantaneous updates across all connected viewers.
- **Live Chat Option**: Toggle YouTube live chat on or off according to school broadcasting policy.
- **Viewer Count & Presence**: Real-time tracking of active broadcast controllers in the admin room.

---

## 📻 Vibhavi FM Online Radio

The official college radio station broadcasts 24/7 on **[vibhavi.isipathanamedia.online](https://vibhavi.isipathanamedia.online)** using a modern cloud radio infrastructure:

<div class="grid grid-cols-1 md:grid-cols-3 gap-3 my-5 not-prose">
  <div class="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex flex-col justify-between">
    <div>
      <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-wider mb-3">
        Source
      </div>
      <h4 class="text-white font-bold text-sm mb-1">RadioKing Stream & API</h4>
      <p class="text-zinc-400 text-xs leading-relaxed">
        High-fidelity audio stream and live metadata (currently playing track, artist name, and album artwork) are served via RadioKing cloud radio APIs.
      </p>
    </div>
    <div class="mt-3 pt-3 border-t border-white/[0.06] text-[11px] text-zinc-500 font-mono">
      RadioKing Cloud API
    </div>
  </div>

  <div class="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex flex-col justify-between">
    <div>
      <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-bold uppercase tracking-wider mb-3">
        Endpoint
      </div>
      <h4 class="text-white font-bold text-sm mb-1">Vibhavi FM Player</h4>
      <p class="text-zinc-400 text-xs leading-relaxed">
        The dedicated radio site at <strong>vibhavi.isipathanamedia.online</strong> fetches the audio stream and metadata, driving the responsive web player and live visualizer.
      </p>
    </div>
    <div class="mt-3 pt-3 border-t border-white/[0.06] text-[11px] text-zinc-500 font-mono">
      vibhavi.isipathanamedia.online
    </div>
  </div>

  <div class="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex flex-col justify-between">
    <div>
      <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-wider mb-3">
        Broadcaster
      </div>
      <h4 class="text-white font-bold text-sm mb-1">Broadcast Terminal SSO</h4>
      <p class="text-zinc-400 text-xs leading-relaxed">
        Authorized station managers and announcers launch the broadcasting terminal directly from their dashboard via seamless single sign-on (SSO).
      </p>
    </div>
    <div class="mt-3 pt-3 border-t border-white/[0.06] text-[11px] text-zinc-500 font-mono">
      /broadcaster SSO handoff
    </div>
  </div>
</div>

---

## 📲 Installing as a Phone & Desktop App (PWA)

Visitors can install the website directly on iOS, Android, macOS, and Windows without going through an app store:

<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 my-5 not-prose">
  <div class="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
    <div class="text-sm font-bold text-white mb-2 flex items-center gap-2">
      <span>🍎 Apple iPhone & iPad</span>
    </div>
    <ol class="text-xs text-zinc-300 space-y-1.5 list-decimal pl-4 leading-relaxed">
      <li>Open Safari and visit <code>isipathanamedia.online</code>.</li>
      <li>Tap the <strong>Share</strong> button at the bottom of the screen.</li>
      <li>Scroll down and tap <strong>Add to Home Screen</strong>.</li>
    </ol>
  </div>

  <div class="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
    <div class="text-sm font-bold text-white mb-2 flex items-center gap-2">
      <span>🤖 Android, Windows & Mac</span>
    </div>
    <ol class="text-xs text-zinc-300 space-y-1.5 list-decimal pl-4 leading-relaxed">
      <li>Open Google Chrome, Brave, or Microsoft Edge.</li>
      <li>Tap the <strong>Install</strong> icon in the address bar or browser menu.</li>
      <li>The app installs cleanly onto your app drawer or desktop.</li>
    </ol>
  </div>
</div>

- **App Crest**: Displays the official Isipathana College Media Unit crest on your home screen.
- **Fast Startup**: Service workers pre-cache essential stylesheets, assets, and layouts for rapid launch.
