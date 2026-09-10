# 3. User Roles & Permission Matrix

Every member of the media unit receives a role tailored to their responsibilities. The system gives everyone the exact tools they need without confusing clutter.

---

## 👥 The 5 Roles at a Glance

<div class="my-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 not-prose">
  <div class="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
    <div class="flex items-center gap-2 mb-2">
      <span class="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
      <h4 class="text-white font-bold text-sm">✍️ Writer</h4>
    </div>
    <ul class="text-xs text-zinc-400 space-y-1">
      <li>• Draft articles and write event stories</li>
      <li>• Upload and crop cover photos</li>
      <li>• Submit drafts for admin editorial review</li>
    </ul>
  </div>

  <div class="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
    <div class="flex items-center gap-2 mb-2">
      <span class="w-2.5 h-2.5 rounded-full bg-green-400"></span>
      <h4 class="text-white font-bold text-sm">🛡️ Admin</h4>
    </div>
    <ul class="text-xs text-zinc-400 space-y-1">
      <li>• Review, edit, and publish articles</li>
      <li>• Manage team member roster</li>
      <li>• Update live stream status and site settings</li>
    </ul>
  </div>

  <div class="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
    <div class="flex items-center gap-2 mb-2">
      <span class="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
      <h4 class="text-white font-bold text-sm">📡 Broadcaster</h4>
    </div>
    <ul class="text-xs text-zinc-400 space-y-1">
      <li>• Paste YouTube / Facebook live links</li>
      <li>• Toggle live stream status & live chat</li>
      <li>• Launch the Vibhavi FM terminal</li>
    </ul>
  </div>

  <div class="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
    <div class="flex items-center gap-2 mb-2">
      <span class="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
      <h4 class="text-white font-bold text-sm">⚡ Admin + Broadcaster</h4>
    </div>
    <p class="text-xs text-zinc-400 leading-relaxed">
      Dual operator mode with access to both Content Admin and Broadcaster dashboards via a 2-in-1 launcher.
    </p>
  </div>

  <div class="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] sm:col-span-2">
    <div class="flex items-center gap-2 mb-2">
      <span class="w-2.5 h-2.5 rounded-full bg-red-400"></span>
      <h4 class="text-white font-bold text-sm">👑 Super Admin</h4>
    </div>
    <p class="text-xs text-zinc-400 leading-relaxed">
      Master authority across the entire platform. Can provision new users, reset passwords, inspect active sessions, manage roles, and review system telemetry.
    </p>
  </div>
</div>

---

## 📋 What Each Role Can Access

| Feature Area              | Writer | Admin | Broadcaster | Admin + Broadcaster | Super Admin |
| :------------------------ | :----: | :---: | :---------: | :-----------------: | :---------: |
| **Write Article Drafts**  |   ✅   |  ✅   |     ❌      |         ✅          |     ✅      |
| **Publish Articles Live** |   ❌   |  ✅   |     ❌      |         ✅          |     ✅      |
| **Delete Articles**       |   ❌   |  ✅   |     ❌      |         ✅          |     ✅      |
| **Manage Team Roster**    |   ❌   |  ✅   |     ❌      |         ✅          |     ✅      |
| **Change Color Themes**   |   ❌   |  ✅   |     ❌      |         ✅          |     ✅      |
| **Live Stream Controls**  |   ❌   |  ✅   |     ✅      |         ✅          |     ✅      |
| **Radio Terminal SSO**    |   ❌   |  ❌   |     ✅      |         ✅          |     ✅      |
| **Create/Delete Users**   |   ❌   |  ❌   |     ❌      |         ❌          |     ✅      |
| **Reset User Passwords**  |   ❌   |  ❌   |     ❌      |         ❌          |     ✅      |
| **View Active Sessions**  |   ❌   |  ❌   |     ❌      |         ❌          |     ✅      |

---

## 🔑 Key Rules to Remember

### 1. Dual Operator (Admin + Broadcaster)

Senior media team members who manage both website content and live streaming can have both **Admin** and **Broadcaster** checked on their account. When logging in, they receive a convenient two-card launcher to choose which panel to open.

### 2. Super Admin Isolation

A Super Admin already has master access to every corner of the platform. Checking other roles is unnecessary.

### 3. Login Sessions

- **Local Index Logins**: Active for **8 hours** (convenient for school computer lab sessions).
- **Google SSO Logins**: Trusted session persists for **30 days** on your private mobile phone or personal laptop.
