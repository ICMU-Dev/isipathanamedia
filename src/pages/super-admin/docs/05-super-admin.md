# 6. Super Admin Controls

The **Super Admin Hub** is the master cockpit of the platform. Accessible only at `isipathanamedia.online/:adminPath` by verified Super Administrators.

---

## 🛠️ User Account Provisioning Workflow

Super Admins can create and manage all staff credentials:

<div class="my-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 not-prose">
  <div class="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
    <div class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 text-[10px] font-bold mb-2">
      Step 1
    </div>
    <h4 class="text-white font-bold text-sm">➕ Click Add User</h4>
    <p class="text-xs text-zinc-400 mt-1 leading-relaxed">
      Open the user management tab and tap the prominent "Add User" button to launch the provisioning modal.
    </p>
  </div>

  <div class="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
    <div class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 text-[10px] font-bold mb-2">
      Step 2
    </div>
    <h4 class="text-white font-bold text-sm">📝 Fill Basic Info</h4>
    <p class="text-xs text-zinc-400 mt-1 leading-relaxed">
      Enter member full name and their official school index number (e.g. <code>24929</code>).
    </p>
  </div>

  <div class="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
    <div class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 text-[10px] font-bold mb-2">
      Step 3
    </div>
    <h4 class="text-white font-bold text-sm">🛡️ Assign Clearance</h4>
    <p class="text-xs text-zinc-400 mt-1 leading-relaxed">
      Choose their role tier: Writer, Admin, Broadcaster, Dual Operator, or Super Admin.
    </p>
  </div>

  <div class="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
    <div class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 text-[10px] font-bold mb-2">
      Step 4
    </div>
    <h4 class="text-white font-bold text-sm">🚀 Ready to Use</h4>
    <p class="text-xs text-zinc-400 mt-1 leading-relaxed">
      The user is provisioned instantly. The member creates their personal password on first login.
    </p>
  </div>
</div>

---

## 🎛️ Account Actions Menu (`...`)

Clicking the three dots on any user row provides quick access to account management tools:

<div class="my-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 not-prose">
  <div class="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
    <div class="text-xs font-bold text-amber-400 mb-1">🔑 Reset Password</div>
    <p class="text-xs text-zinc-400 leading-relaxed">Override forgotten passwords instantly without complex email verification links.</p>
  </div>

  <div class="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
    <div class="text-xs font-bold text-yellow-400 mb-1">⏸️ Freeze Access</div>
    <p class="text-xs text-zinc-400 leading-relaxed">Toggle account status to suspend access immediately when a member takes a leave of absence.</p>
  </div>

  <div class="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
    <div class="text-xs font-bold text-cyan-400 mb-1">📱 Audit Sessions</div>
    <p class="text-xs text-zinc-400 leading-relaxed">Inspect logged-in devices (browsers, phones, labs) and disconnect any stale sessions.</p>
  </div>

  <div class="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
    <div class="text-xs font-bold text-blue-400 mb-1">✏️ Edit Details</div>
    <p class="text-xs text-zinc-400 leading-relaxed">Update display names or fix typographical errors in member records.</p>
  </div>

  <div class="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
    <div class="text-xs font-bold text-red-400 mb-1">🗑️ Delete Record</div>
    <p class="text-xs text-zinc-400 leading-relaxed">Permanently delete graduating member records while preserving their published news articles.</p>
  </div>
</div>

---

## 📊 Database & Storage Telemetry

The **Database & Storage** tab gives a real-time health check:

<div class="my-5 grid grid-cols-1 sm:grid-cols-3 gap-3 not-prose">
  <div class="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
    <span class="text-[10px] font-mono text-zinc-500">Live Metric</span>
    <h4 class="text-white font-bold text-sm mt-1">📰 News Storage</h4>
    <p class="text-xs text-zinc-400 mt-1">Total articles, breaking alerts, and published draft tallies.</p>
  </div>

  <div class="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
    <span class="text-[10px] font-mono text-zinc-500">Live Metric</span>
    <h4 class="text-white font-bold text-sm mt-1">👥 Registered Accounts</h4>
    <p class="text-xs text-zinc-400 mt-1">Active staff, writers, and administrative clearance counts.</p>
  </div>

  <div class="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
    <span class="text-[10px] font-mono text-zinc-500">Live Metric</span>
    <h4 class="text-white font-bold text-sm mt-1">⚡ Cloud Database Health</h4>
    <p class="text-xs text-zinc-400 mt-1">Real-time round-trip latency and active WebSocket channel status.</p>
  </div>
</div>
