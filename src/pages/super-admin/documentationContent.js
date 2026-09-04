export const documentationMarkdown = `# ICMU Web — Complete Codebase Documentation

> **Isipathana College Media Unit (ICMU)** — Official website + admin panel + event platform  
> Tech Stack: React 19 · Vite · Tailwind CSS · Supabase · Framer Motion · GSAP · Node.js

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture & How Everything Connects](#2-architecture--how-everything-connects)
3. [Public Website — All Features](#3-public-website--all-features)
4. [Admin Panel — All Features](#4-admin-panel--all-features)
5. [Super Admin Hub](#5-super-admin-hub)
6. [Nethinethera — Event Platform](#6-nethinethera--event-platform)
7. [Design System & Theming](#7-design-system--theming)
8. [Backend & Server Infrastructure](#8-backend--server-infrastructure)
9. [Database & Realtime](#9-database--realtime)
10. [Authentication & Security](#10-authentication--security)
11. [File & Directory Map](#11-file--directory-map)

---

## 1. Project Overview

ICMU Web is a **multi-purpose platform** for the Isipathana College Media Unit, featuring:

| Layer | What It Does |
|-------|-------------|
| **Public Website** | Showcase landing page, news articles, live streaming, radio, team info, contact |
| **Admin Panel** | Content management (news, team, settings, live stream, radio) with role-based access |
| **Super Admin Hub** | Master user management (create/edit/delete/suspend users) |
| **Nethinethera Portal** | Dedicated event microsite for "Nethinethera — The Media Day" annual event |
| **FM Vibhavi  Radio** | Live radio streaming platform with admin control panel |
| **NotificationContext** | Global toasts, desktop pushes, realtime feedbacks |

### Key Technologies



---

## 2. Architecture & How Everything Connects

### High-Level Data Flow



### Context Provider Hierarchy

\`\`\`
AuthProvider (wraps everything)
└── DataProvider (wraps everything)
    └── Router
        └── Public Routes (use DataContext only)
        └── Admin Routes
            └── ThemeProvider
                └── DataProvider
                    └── Admin Pages
\`\`\`

### Routing Architecture

| Route Pattern | Layout | Access | Description |
|--------------|--------|--------|-------------|
| \`/\` | MainLayout | Public | Landing page |
| \`/about\` | MainLayout | Public | About page |
| \`/news\` | MainLayout | Public | News listing |
| \`/news/:id\` | MainLayout | Public | Article viewer |
| \`/author/:authorName\` | MainLayout | Public | Author page |
| \`/live\` | MainLayout | Public | Live streaming |
| \`/radio\`, \`/vibhawi-fm\` | MainLayout | Public | FM Vibhavi  radio |
| \`/nethinethera\` | NethinetheraLayout | Public | Event microsite |
| \`/:adminPath\` | ProtectedRoute | Login Required | Admin login gate |
| \`/:adminPath/dashboard\` | AdminLayout | Admin/Writer/Super-Admin | Main dashboard |
| \`/:adminPath/dashboard/news\` | AdminLayout | Admin/Writer | Manage news |
| \`/:adminPath/dashboard/news/create\` | AdminLayout | Admin/Writer | Create article |
| \`/:adminPath/dashboard/news/edit/:id\` | AdminLayout | Admin/Writer | Edit article |
| \`/:adminPath/dashboard/news/update\` | AdminLayout | Admin only | Create update post |
| \`/:adminPath/dashboard/team\` | AdminLayout | Admin/Super-Admin | Manage team |
| \`/:adminPath/dashboard/live\` | AdminLayout | Admin/Super-Admin | Live stream settings |
| \`/:adminPath/dashboard/radio\` | AdminLayout | Admin/Super-Admin | Radio control panel |
| \`/:adminPath/dashboard/settings\` | AdminLayout | All roles | Site settings |
| \`/:adminPath/dashboard/profile\` | AdminLayout | All roles | User profile |
| \`/share-target\` | None | Public | PWA share target handler |
| \`*\` | None | Public | 404 page |

> [!IMPORTANT]
> The admin path uses the user's **index number** as a URL segment (e.g., \`/1234/dashboard\`). The \`ProtectedRoute\` validates that the logged-in user's index matches the URL.

---

## 3. Public Website — All Features

### 3.1 Landing Page (\`/\`)

Composed of configurable sections rendered in order:

| Section | Component | Purpose |
|---------|-----------|---------|
| **Hero** | [HomeSection.jsx](file:///c:/Users/User/Documents/DEV%20PROJECTS/icmu-web/icmu-web/src/components/sections/HomeSection.jsx) | Full-screen hero with animated text, GSAP effects, and scroll indicator |
| **Partner Logos** | Marquee/Logo strip | Scrolling logo carousel of partners |
| **Live Stream** | [LiveStreamSection.jsx](file:///c:/Users/User/Documents/DEV%20PROJECTS/icmu-web/icmu-web/src/components/sections/LiveStreamSection.jsx) | Embedded YouTube/custom live stream when active |
| **About** | [AboutSection.jsx](file:///c:/Users/User/Documents/DEV%20PROJECTS/icmu-web/icmu-web/src/components/sections/AboutSection.jsx) | Media unit description and history |
| **Services** | [ServicesSection.jsx](file:///c:/Users/User/Documents/DEV%20PROJECTS/icmu-web/icmu-web/src/components/sections/ServicesSection.jsx) | Services offered (photography, videography, etc.) |
| **Nethinethera** | [NethinetheraSection.jsx](file:///c:/Users/User/Documents/DEV%20PROJECTS/icmu-web/icmu-web/src/components/sections/NethinetheraSection.jsx) | Event promotion card linking to \`/nethinethera\` |
| **Team** | [TeamSection.jsx](file:///c:/Users/User/Documents/DEV%20PROJECTS/icmu-web/icmu-web/src/components/sections/TeamSection.jsx) | Team member cards fetched from Supabase |
| **Contact** | [ContactSection.jsx](file:///c:/Users/User/Documents/DEV%20PROJECTS/icmu-web/icmu-web/src/components/sections/ContactSection.jsx) | Contact form (sends messages to DB), leadership contacts |
| **Footer** | [Footer.jsx](file:///c:/Users/User/Documents/DEV%20PROJECTS/icmu-web/icmu-web/src/components/ui/Footer.jsx) | Social links, copyright, navigation |

**Features:**
- Animated preloader with progress effect
- SEO optimized with \`react-helmet-async\`
- Section order is configurable via \`siteConfig\` stored in Supabase
- Smooth scroll with Lenis integration
- Fully responsive (mobile-first)

### 3.2 News Page (\`/news\`)

[NewsPage.jsx](file:///c:/Users/User/Documents/DEV%20PROJECTS/icmu-web/icmu-web/src/pages/landing-page/NewsPage.jsx) — **28KB**

- Lists all published articles with filters (categories, tags, search)
- Two article types: **Article** (full-length) and **Update** (short post)
- Category-based filtering
- Tag-based filtering
- Date sorting
- Video embed support for articles
- Responsive card grid layout

### 3.3 Article Viewer (\`/news/:id\`)

[ArticleViewer.jsx](file:///c:/Users/User/Documents/DEV%20PROJECTS/icmu-web/icmu-web/src/pages/landing-page/ArticleViewer.jsx) — **24KB**

- Rich HTML content rendering via \`react-markdown\` + \`rehype-raw\`
- Featured image display
- Author attribution with links
- Video embeds (YouTube/custom)
- Share functionality (PWA share target)
- Related articles suggestions
- Dynamic SEO meta tags

### 3.4 Author Page (\`/author/:authorName\`)

[AuthorPage.jsx](file:///c:/Users/User/Documents/DEV%20PROJECTS/icmu-web/icmu-web/src/pages/landing-page/AuthorPage.jsx) — **11KB**

- Author profile display
- All articles written by the author
- Filtered news grid

### 3.5 Live Page (\`/live\`)

[LivePage.jsx](file:///c:/Users/User/Documents/DEV%20PROJECTS/icmu-web/icmu-web/src/pages/landing-page/LivePage.jsx) — **16KB**

- YouTube live stream embed with chat toggle
- Custom video URL support
- Live/offline status indicator
- Title and description overlays
- Autoplay and mute controls
- Responsive video player

### 3.6 FM Vibhavi  Radio (\`/radio\`)

[VibhawiRadioPage.jsx](file:///c:/Users/User/Documents/DEV%20PROJECTS/icmu-web/icmu-web/src/pages/landing-page/VibhawiRadioPage.jsx) — **31KB**

- HLS audio streaming player
- "Now Playing" display with ICY metadata
- Live/offline status badge
- Show schedule display
- Listener count
- Feedback/request form (sends to studio)
- Equalizer visualizations
- Mobile-optimized audio player controls

### 3.7 About Page (\`/about\`)

[AboutPage.jsx](file:///c:/Users/User/Documents/DEV%20PROJECTS/icmu-web/icmu-web/src/pages/landing-page/AboutPage.jsx) — **17KB**

- Detailed about information
- History and mission content

### 3.8 Shared UI Components

| Component | File | Purpose |
|-----------|------|---------|
| **Navbar** | [Navbar.jsx](file:///c:/Users/User/Documents/DEV%20PROJECTS/icmu-web/icmu-web/src/components/ui/Navbar.jsx) | Main navigation with scroll effects |
| **Footer** | [Footer.jsx](file:///c:/Users/User/Documents/DEV%20PROJECTS/icmu-web/icmu-web/src/components/ui/Footer.jsx) | Social links, site map |
| **SEO** | [SEO.jsx](file:///c:/Users/User/Documents/DEV%20PROJECTS/icmu-web/icmu-web/src/components/SEO.jsx) | Meta tags and Open Graph |
| **VideoEmbed** | [VideoEmbed.jsx](file:///c:/Users/User/Documents/DEV%20PROJECTS/icmu-web/icmu-web/src/components/ui/VideoEmbed.jsx) | YouTube/custom video embeds |
| **SocialIcon** | [SocialIcon.jsx](file:///c:/Users/User/Documents/DEV%20PROJECTS/icmu-web/icmu-web/src/components/ui/SocialIcon.jsx) | Animated social media icons |

### 3.9 Design & Animation Components

| Component | Description |
|-----------|-------------|
| [AnimatedBg.jsx](file:///c:/Users/User/Documents/DEV%20PROJECTS/icmu-web/icmu-web/src/components/ui/AnimatedBg.jsx) | Particle/gradient animated backgrounds |
| [DotField.jsx](file:///c:/Users/User/Documents/DEV%20PROJECTS/icmu-web/icmu-web/src/components/ui/DotField.jsx) | Interactive dot field canvas effect |
| [GlassSurface.jsx](file:///c:/Users/User/Documents/DEV%20PROJECTS/icmu-web/icmu-web/src/components/ui/GlassSurface.jsx) | Glassmorphism surface component |
| [LightRays.jsx](file:///c:/Users/User/Documents/DEV%20PROJECTS/icmu-web/icmu-web/src/components/ui/LightRays.jsx) | Volumetric light ray effects |
| [Strands.jsx](file:///c:/Users/User/Documents/DEV%20PROJECTS/icmu-web/icmu-web/src/components/ui/Strands.jsx) | DNA-strand animated lines |
| [FuzzyText.jsx](file:///c:/Users/User/Documents/DEV%20PROJECTS/icmu-web/icmu-web/src/components/FuzzyText.jsx) | Glitch/fuzzy text effect (OGL/WebGL) |
| [ScrambledText.jsx](file:///c:/Users/User/Documents/DEV%20PROJECTS/icmu-web/icmu-web/src/components/ScrambledText.jsx) | Letter-scramble reveal animation |
| [ScrollReveal.jsx](file:///c:/Users/User/Documents/DEV%20PROJECTS/icmu-web/icmu-web/src/components/ScrollReveal.jsx) | Scroll-triggered reveal animations |
| [ScrollVelocity.jsx](file:///c:/Users/User/Documents/DEV%20PROJECTS/icmu-web/icmu-web/src/components/ScrollVelocity.jsx) | Scroll velocity text marquee |
| [BorderGlow.jsx](file:///c:/Users/User/Documents/DEV%20PROJECTS/icmu-web/icmu-web/src/components/BorderGlow.jsx) | Neon border glow effect |
| [EasterEgg69.jsx](file:///c:/Users/User/Documents/DEV%20PROJECTS/icmu-web/icmu-web/src/components/ui/EasterEgg69.jsx) | Hidden easter egg interaction |

---

## 4. Admin Panel — All Features

### 4.1 Authentication & Login

[AdminLogin.jsx](file:///c:/Users/User/Documents/DEV%20PROJECTS/icmu-web/icmu-web/src/pages/admin/AdminLogin.jsx) — **27KB**

- **Index Number + Password** login (custom auth, NOT Supabase Auth)
- **Google OAuth** login (for linked accounts only)
- **First-time setup flow** — set password for new users
- **"Remember Me"** toggle (8-hour vs 30-day session)
- **Device session tracking** — logs device name, browser, OS, timezone
- Animated login UI with terminal/hacker aesthetic

### 4.2 Dashboard

[Dashboard.jsx](file:///c:/Users/User/Documents/DEV%20PROJECTS/icmu-web/icmu-web/src/pages/admin/Dashboard.jsx) — **27KB**

- **Stat Cards**: Total news, team members, messages, views
- **Quick Actions**: Create article, manage news, team, settings
- **Recent Articles**: Latest published content with status badges
- **Changelog Panel**: System update history
- **Active Admins Widget**: Shows currently online admins (real-time presence)
- **Writer-specific view**: Reduced feature set for writer role
- **Article System Modal**: Explains the article vs update system

### 4.3 Manage News

[ManageNews.jsx](file:///c:/Users/User/Documents/DEV%20PROJECTS/icmu-web/icmu-web/src/pages/admin/ManageNews.jsx) — **43KB** (largest admin page)

- **Full CRUD** for articles and updates
- **Bulk operations**: Select multiple → delete, change status, change category
- **Status workflow**: Draft → Pending → Published
- **Filtering**: By status, category, type (article/update), search
- **Sorting**: By date, title, status
- **Preview**: In-line content preview
- **Author tracking**: \`submitted_by\` field is populated based on the authenticated user.
- **Category management**: Sports, Events, Achievements, etc.
- **Tag system**: Multiple tags per article

### 4.4 Create Article

[CreateArticle.jsx](file:///c:/Users/User/Documents/DEV%20PROJECTS/icmu-web/icmu-web/src/pages/admin/CreateArticle.jsx) — **38KB**

- **TipTap Rich Text Editor** with:
  - Bold, italic, headings, lists, links
  - Image insertion (from Media Library or URL)
  - Code blocks, blockquotes
- **Media Library integration** for image selection
- **Cover image** upload with crop functionality
- **Video URL** embedding (YouTube)
- **Category** and **tags** selection
- **Draft/Publish** status control
- **Edit mode**: Same page for editing existing articles

### 4.5 Create Update

[CreateUpdate.jsx](file:///c:/Users/User/Documents/DEV%20PROJECTS/icmu-web/icmu-web/src/pages/admin/CreateUpdate.jsx) — **15KB**

- Simplified article form for "Update" type posts
- Short-form content (plain text or markdown)
- Faster creation workflow
- Optional image and original link

### 4.6 Manage Team

[ManageTeam.jsx](file:///c:/Users/User/Documents/DEV%20PROJECTS/icmu-web/icmu-web/src/pages/admin/ManageTeam.jsx) — **16KB**

- **CRUD** for team member cards (name, role, photo)
- **Image upload** with crop (via \`ImageCropperModal\`)
- **Drag-and-drop** ordering
- Card-based UI with edit/delete actions

### 4.7 Live Stream Settings

[LiveStreamSettings.jsx](file:///c:/Users/User/Documents/DEV%20PROJECTS/icmu-web/icmu-web/src/pages/admin/LiveStreamSettings.jsx) — **31KB**

- **YouTube Video ID** configuration
- **Custom video URL** support
- **Go Live / Go Offline** toggle
- **Title & Description** overrides
- **Chat sidebar** toggle
- **Autoplay & Mute** defaults
- **Platform selection** (YouTube, custom)
- **Live preview** of configured stream
- Settings saved to Supabase \`assets\` table as \`site_config\`

### 4.8 Radio Control Panel

[RadioControlPanel.jsx](file:///c:/Users/User/Documents/DEV%20PROJECTS/icmu-web/icmu-web/src/pages/admin/RadioControlPanel.jsx) — **36KB**

- **Stream Key Management**: Create, activate, deactivate stream keys
- **OBS Connection Status**: Live indicator for OBS connectivity
- **Now Playing Override**: Manual title/artist override
- **Schedule Management**: CRUD for show schedule
- **Listener Stats**: Current/peak listeners, total sessions, uptime
- **Stream URL Configuration**: Base URL, active key display
- **API Integration**: Communicates with \`radio-backend.js\` Express server

### 4.9 Settings

[Settings.jsx](file:///c:/Users/User/Documents/DEV%20PROJECTS/icmu-web/icmu-web/src/pages/admin/Settings.jsx) — **23KB**

Three sub-editors:
- **Config Form Editor** ([ConfigFormEditor.jsx](file:///c:/Users/User/Documents/DEV%20PROJECTS/icmu-web/icmu-web/src/components/admin/config/ConfigFormEditor.jsx)): Visual form to edit social links, contact details, marquee items, section order, Nethinethera settings, Vibhawi Radio config
- **JSON Editor** ([ConfigJsonEditor.jsx](file:///c:/Users/User/Documents/DEV%20PROJECTS/icmu-web/icmu-web/src/components/admin/config/ConfigJsonEditor.jsx)): Raw JSON editing of \`siteConfig\`
- **Activity Log** ([ConfigActivityLog.jsx](file:///c:/Users/User/Documents/DEV%20PROJECTS/icmu-web/icmu-web/src/components/admin/config/ConfigActivityLog.jsx)): History of config changes

### 4.10 User Profile

[UserProfile.jsx](file:///c:/Users/User/Documents/DEV%20PROJECTS/icmu-web/icmu-web/src/pages/admin/UserProfile.jsx) — **28KB**

- **Profile card** with avatar, name, role, index number
- **Google Account Linking**: Connect/disconnect Google OAuth
- **Custom Avatar Upload**: Upload + crop profile picture
- **Avatar Source Management**: Choose between Google avatar or custom upload
- **Active Sessions**: View all logged-in device sessions (device name, browser, time)
- **Password Change** functionality
- **Account Details** display

### 4.11 Media Library

[MediaLibrary.jsx](file:///c:/Users/User/Documents/DEV%20PROJECTS/icmu-web/icmu-web/src/components/admin/MediaLibrary.jsx) — **22KB**

- Browse uploaded images from Supabase Storage
- Upload new images with compression (auto WebP conversion)
- Copy image URL to clipboard
- Delete uploaded images
- Grid/list view modes
- Used by article editor for image insertion

### 4.12 Admin Layout Components

| Component | File | Purpose |
|-----------|------|---------|
| **Admin Sidebar** | AdminSidebar (via auth/) | Navigation sidebar with collapsible mode |
| **Mobile Header** | [MobileHeader.jsx](file:///c:/Users/User/Documents/DEV%20PROJECTS/icmu-web/icmu-web/src/components/layout/MobileHeader.jsx) | Top header bar for mobile views |
| **Bottom Navbar** | [BottomNavbar.jsx](file:///c:/Users/User/Documents/DEV%20PROJECTS/icmu-web/icmu-web/src/components/layout/BottomNavbar.jsx) | Mobile bottom navigation bar |
| **Active Admins** | [ActiveAdmins.jsx](file:///c:/Users/User/Documents/DEV%20PROJECTS/icmu-web/icmu-web/src/components/layout/ActiveAdmins.jsx) | Real-time online admin avatars |
| **Maintenance Banner** | [MaintenanceBanner.jsx](file:///c:/Users/User/Documents/DEV%20PROJECTS/icmu-web/icmu-web/src/components/layout/MaintenanceBanner.jsx) | System maintenance notification strip |
| **Page Transition** | [PageTransition.jsx](file:///c:/Users/User/Documents/DEV%20PROJECTS/icmu-web/icmu-web/src/components/ui/PageTransition.jsx) | Framer Motion page transition wrapper |

---

## 5. Super Admin Hub

[MasterDashboard.jsx](file:///c:/Users/User/Documents/DEV%20PROJECTS/icmu-web/icmu-web/src/pages/super-admin/MasterDashboard.jsx) — **49KB** (largest single file)

> [!CAUTION]
> Only accessible by users with \`super-admin\` role. All other roles see "Access Denied."

### Features:

- **Overview Tab**: System stats, online admins, quick links
- **User Management Tab**:
  - **Create User**: Full name + index number + role assignment
  - **Edit User**: Update name and details
  - **Delete User**: Permanently remove from system
  - **Suspend/Activate**: Toggle \`is_active\` flag
  - **Reset Password**: Force password reset (via RPC \`reset_user_password\`)
  - **View Active Sessions**: See all device sessions per user
  - **Role Assignment**: Super-Admin, Admin, Writer
- **Card/List View Toggle**: Grid cards or table list of users
- Directly queries \`users\` table with full CRUD

---

## 6. Nethinethera — Event Platform

### 6.1 Public Event Page (\`/nethinethera\`)

[NethinetheraPage.jsx](file:///c:/Users/User/Documents/DEV%20PROJECTS/icmu-web/icmu-web/src/pages/nethinethera/NethinetheraPage.jsx)

A cinematic, heavily-animated microsite with these sections:

| Section | Component | Description |
|---------|-----------|-------------|
| **Hero** | [HeroSection.jsx](file:///c:/Users/User/Documents/DEV%20PROJECTS/icmu-web/icmu-web/src/pages/nethinethera/components/home/HeroSection.jsx) | Full-screen hero with GSAP animations, custom \`Konexy\` font |
| **Theme Reveal** | [ThemeRevealSection.jsx](file:///c:/Users/User/Documents/DEV%20PROJECTS/icmu-web/icmu-web/src/pages/nethinethera/components/home/ThemeRevealSection.jsx) | "Perspective Shapes Reality" theme reveal |
| **Trailer** | [TrailerPreviewSection.jsx](file:///c:/Users/User/Documents/DEV%20PROJECTS/icmu-web/icmu-web/src/pages/nethinethera/components/home/TrailerPreviewSection.jsx) | Event trailer video embed |
| **Invitations** | [InvitePreviewSection.jsx](file:///c:/Users/User/Documents/DEV%20PROJECTS/icmu-web/icmu-web/src/pages/nethinethera/components/home/InvitePreviewSection.jsx) | Event invite/registration CTA |
| **Championships** | [ChampionshipPreviewSection.jsx](file:///c:/Users/User/Documents/DEV%20PROJECTS/icmu-web/icmu-web/src/pages/nethinethera/components/home/ChampionshipPreviewSection.jsx) | Competition categories preview |
| **Footer CTA** | [FooterCTASection.jsx](file:///c:/Users/User/Documents/DEV%20PROJECTS/icmu-web/icmu-web/src/pages/nethinethera/components/home/FooterCTASection.jsx) | Final call-to-action + hidden admin trigger (5-click easter egg) |

**Design Features:**
- ScrambledText preloader
- GSAP-powered transitions
- Dark cinematic aesthetic (#050505 background)
- Custom \`Konexy\` font throughout
- Sage green (#7aab6e) accent color
- Smooth scrolling via Lenis
- Easter egg: 5 clicks on footer opens admin access

---

## 7. Design System & Theming

### 7.1 Admin Theme Engine

[ThemeContext.jsx](file:///c:/Users/User/Documents/DEV%20PROJECTS/icmu-web/icmu-web/src/context/ThemeContext.jsx) — **19 theme presets** available:

| Category | Themes |
|----------|--------|
| **Dark Mode** | Isipathana Emerald, Crypto Neon Green, Dragon Red, Dragon Green, Emerald Luxe, OLED Stealth |
| **Warm Dark** | Nordic Amber |
| **Rich Dark** | Midnight Slate, Ocean Sapphire, Navy & Gold |
| **Retro** | Terminal Hacker (VT323 monospace font) |
| **Futuristic** | Neon Cyberpunk, Vampire Orchid, Cyber Sunset |
| **Light Mode** | Minimalist White, High Contrast Light, Warm Editorial, Nordic Frost |

Each theme defines: \`bg\`, \`cardBg\`, \`inputBg\`, \`border\`, \`textPrimary\`, \`textSecondary\`, \`accent\`, \`accentRgb\`, \`fontFamily\`, \`description\`

Themes are applied via **CSS custom properties** on \`:root\`:
\`css
--admin-bg, --admin-card-bg, --admin-input-bg, --admin-border,
--admin-text-primary, --admin-text-secondary, --accent, --accent-rgb, --admin-font
\`\`\`

### 7.2 CSS Architecture

- [index.css](file:///c:/Users/User/Documents/DEV%20PROJECTS/icmu-web/icmu-web/src/index.css) — **16KB** of global styles
- [tailwind.config.cjs](file:///c:/Users/User/Documents/DEV%20PROJECTS/icmu-web/icmu-web/tailwind.config.cjs) — **6KB** extended config with custom animations
- Component-level CSS: \`GlassSurface.css\`, \`DotField.css\`, \`Strands.css\`

---

## 8. Backend & Server Infrastructure

### 8.1 Radio Backend Server

[radio-backend.js](file:///c:/Users/User/Documents/DEV%20PROJECTS/icmu-web/icmu-web/server/radio-backend.js) — Express.js server (Port 5000)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| \`/api/get-stream\` | GET | Returns current stream URL, status, now playing |
| \`/api/admin/update-key\` | POST | Admin updates active stream key |
| \`/api/now-playing\` | GET | ICY metadata proxy parser |
| \`/api/feedback\` | POST | Submit listener feedback |
| \`/api/admin/schedule\` | GET/POST | Manage show schedule |
| \`/api/admin/stats\` | GET | Listener analytics |

### 8.2 Node Media Server

[node-media-server.js](file:///c:/Users/User/Documents/DEV%20PROJECTS/icmu-web/icmu-web/server/node-media-server.js) — Integrated media server

- **RTMP Server** (Port 1935): Accepts OBS Studio streams
- **HLS Server** (Port 8000): Serves \`m3u8\` playlists for web playback
- **Stream Key Authentication**: \`prePublish\` hook validates stream keys
- **Express API** (Port 5000): Combined with REST endpoints

### 8.3 Netlify Edge Functions

| Function | File | Purpose |
|----------|------|---------|
| **OG News** | [og-news.js](file:///c:/Users/User/Documents/DEV%20PROJECTS/icmu-web/icmu-web/netlify/edge-functions/og-news.js) | Dynamic Open Graph images for news articles |
| **Extract OG** | [extract-og.js](file:///c:/Users/User/Documents/DEV%20PROJECTS/icmu-web/icmu-web/netlify/edge-functions/extract-og.js) | Extract OG metadata from external URLs |

---

## 10. Database & Realtime

### 10.1 Supabase Tables

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| \`users\` | Admin user accounts | \`id\`, \`full_name\`, \`index_number\`, \`email\`, \`role\`, \`avatar_url\`, \`is_active\`, \`active_sessions\`, \`last_login\` |
| \`news\` | Articles and updates | \`id\`, \`title\`, \`content\`, \`image\`, \`date\`, \`category\`, \`author\`, \`tags\`, \`type\`, \`status\`, \`submitted_by\` |
| \`team\` | Public team member cards | \`id\`, \`name\`, \`role\`, \`image\` |
| \`messages\` | Contact form submissions | \`id\`, \`name\`, \`email\`, \`message\`, \`created_at\` |
| \`assets\` | Key-value asset store | \`key\`, \`url\` (stores \`site_config\` as JSON) |
| \`schools\` | MPMU school registry | \`id\`, \`school_name\`, \`province\`, \`district\`, \`school_id\`, \`is_active\` |
| \`mpmu_registration\` | MPMU registrations | \`id\`, \`president_name\`, \`president_mobile\`, \`media_unit\`, \`media_unit_logo\`, \`registered_school\`, \`is_selected\` |

### 10.2 Supabase RPCs (Stored Procedures)

| RPC | Purpose |
|-----|---------|
| \`get_user_by_index\` | Look up user by index number |
| \`verify_user_login\` | Authenticate with index + password hash |
| \`set_user_password\` | First-time password setup |
| \`reset_user_password\` | Force password reset (super-admin) |

### 10.3 Realtime Subscriptions

[DataContext.jsx](file:///c:/Users/User/Documents/DEV%20PROJECTS/icmu-web/icmu-web/src/context/DataContext.jsx) subscribes to Postgres changes on:

| Table | Events | Auto-Syncs |
|-------|--------|------------|
| \`assets\` (filter: \`site_config\`) | INSERT, UPDATE, DELETE | Site configuration changes |
| \`news\` | INSERT, UPDATE, DELETE | Article/update changes |
| \`team\` | INSERT, UPDATE, DELETE | Team member changes |
| \`messages\` | INSERT, UPDATE, DELETE | Contact messages |
| \`users\` | INSERT, UPDATE, DELETE | User list updates |

**Zero-polling architecture**: All data syncs via WebSocket-based Supabase Realtime channels.

### 10.4 Supabase Storage Buckets

| Bucket | Purpose |
|--------|---------|
| \`assets\` | General image uploads |
| \`news_images\` | Article cover images |
| \`profiles\` | User avatar uploads |
| \`mpmu-logos\` | MPMU candidate logos |

### 10.5 Real-time Presence

[useAdminPresence.js](file:///c:/Users/User/Documents/DEV%20PROJECTS/icmu-web/icmu-web/src/hooks/useAdminPresence.js) uses Supabase Presence channel (\`admin_presence_global\`) to:
- Track which admins are currently online
- Display green online indicators
- Show avatar + name in Active Admins widget
- Singleton channel pattern (shared across all components)

---

## 11. Authentication & Security

### 11.1 Custom Auth System

[AuthContext.jsx](file:///c:/Users/User/Documents/DEV%20PROJECTS/icmu-web/icmu-web/src/context/AuthContext.jsx) implements a **custom session system** (NOT using Supabase Auth sessions directly):

### 11.2 Session Management

- **Short session**: 8 hours (sessionStorage — closes with browser)
- **Long session**: 30 days (localStorage — "Remember Me")
- **Session refresh**: On each page load, syncs with latest DB record
- **Session structure**: \`{ id, name, role, indexNumber, email, avatarUrl, expiresAt, rememberMe }\`

### 11.3 Role-Based Access Control & Security Matrix

The system implements a multi-role clearance architecture defined in \`src/utils/roles.js\`. Roles can be assigned as single clearances or authorized combinations (such as \`admin,broadcaster\`).

#### 1. The 4 Operational Dashboards

| Dashboard Panel | Route Path | Authorized Roles | Access Scope |
|-----------------|------------|-------------------|--------------|
| **Super Admin Hub** | \`/:adminPath\` | \`super-admin\` | Unrestricted master terminal for user management, system database telemetry, and documentation. |
| **Main Admin Dashboard** | \`/:adminPath/dashboard\` | \`admin\`, \`admin,broadcaster\`, \`super-admin\` | Global content administration (newsroom, messages, team management, site configurations). |
| **Broadcaster Terminal** | \`/:adminPath/broadcast\` | \`broadcaster\`, \`admin,broadcaster\`, \`super-admin\` | Live broadcasting operations terminal, stream telemetry, encoder ingest controls. |
| **Writer Newsroom** | \`/:adminPath/dashboard/news\` | \`writer\`, \`admin\`, \`super-admin\` | Restricted authoring environment for articles and publication drafts. |

#### 2. Clearance Tiers & Combination Rules

| Clearance Level | Stored Value | Combination Allowed? | Rule Enforcement |
|-----------------|--------------|----------------------|------------------|
| **Super Admin** | \`"super-admin"\` | ❌ None (Solo) | Master clearance across all 4 dashboards. Selecting Super Admin disables all other role selections. |
| **Admin** | \`"admin"\` | ✅ \`+ Broadcaster\` | Portal administration. Can optionally be granted dual clearance with Broadcaster (\`"admin,broadcaster"\`). |
| **Broadcaster** | \`"broadcaster"\` | ✅ \`+ Admin\` | Broadcasting operations panel. Can optionally be granted dual clearance with Admin (\`"admin,broadcaster"\`). |
| **Admin + Broadcaster** | \`"admin,broadcaster"\` | Dual Clearance | Simultaneous access to both the Main Admin Dashboard and the Broadcasting Terminal. |
| **Writer** | \`"writer"\` | ❌ None (Solo) | Isolated strictly to Newsroom and Article drafts. Selecting Writer disables all other selections. |

#### 3. Security Guidelines & Leak Prevention

- **Single Column Storage**: Multi-role assignments are stored as comma-separated values in the existing \`users.role\` column, avoiding breaking database schema changes.
- **Hierarchical Layout Guards**:
  - \`ProtectedRoute.jsx\`: Validates session validity and ensures \`user.indexNumber === URL adminPath\`.
  - \`SuperAdminLayout.jsx\`: Verifies \`canAccessHub(role)\`. Non-super-admins with dual clearance see the 2-card launcher. Unauthorized users are safely redirected.
  - \`AdminLayout.jsx\`: Verifies \`canAccessAdminDashboard(role)\` and strictly restricts standalone writers from accessing system settings, live stream controls, team management, and messages.
  - \`BroadcasterLayout.jsx\`: Verifies \`canAccessBroadcastDashboard(role)\` with explicit access denial and return paths.
- **Dynamic Post-Login Redirection**: \`getDefaultDashboardPath(role, index)\` routes each identity to their primary terminal (\`/\` for Super Admin and Dual Operators, \`/dashboard\` for Admin/Writer, \`/broadcast\` for Broadcaster).
- **Developer Lock System**: Hardcoded developer accounts (\`24929\`, \`25473\`) are locked from privilege modifications in both the UI and management APIs.


### 11.4 Route-Level Protection

- [ProtectedRoute.jsx](file:///c:/Users/User/Documents/DEV%20PROJECTS/icmu-web/icmu-web/src/components/auth/ProtectedRoute.jsx): Validates \`user.indexNumber === URL adminPath\`
- [AdminLayout.jsx](file:///c:/Users/User/Documents/DEV%20PROJECTS/icmu-web/icmu-web/src/components/layout/AdminLayout.jsx): Writer-specific path whitelist enforcement

### 11.5 Google OAuth Integration

[GoogleCallbackHandler.jsx](file:///c:/Users/User/Documents/DEV%20PROJECTS/icmu-web/icmu-web/src/pages/admin/GoogleCallbackHandler.jsx) — **7KB**

- Handles OAuth redirect callback
- Links Google identity to existing ICMU user (must already have account)
- Supports both "Login with Google" and "Link Google Account"

### 11.6 RLS (Row Level Security)

[supabaseClient.js](file:///c:/Users/User/Documents/DEV%20PROJECTS/icmu-web/icmu-web/src/lib/supabaseClient.js) injects \`x-user-index\` header via custom fetch for Supabase RLS policies.

---

## 12. File & Directory Map

\`\`\`
icmu-web/
├── src/
│   ├── App.jsx                    # Root router + provider tree
│   ├── main.jsx                   # React DOM entry point
│   ├── index.css                  # Global styles (16KB)
│   │
│   ├── context/                   # Global state management
│   │   ├── AuthContext.jsx        # Authentication (574 lines)
│   │   ├── DataContext.jsx        # Data CRUD + Realtime (639 lines)
│   │   ├── AuthContext.jsx
│   │   ├── ThemeContext.jsx       # 20-theme engine (359 lines)
│   │   └── NotificationContext.jsx # Push notifications (180 lines)
│   │
│   ├── pages/
│   │   ├── landing-page/          # Public website pages
│   │   │   ├── LandingPage.jsx    # Home page orchestrator
│   │   │   ├── NewsPage.jsx       # News listing (28KB)
│   │   │   ├── ArticleViewer.jsx  # Article reader (24KB)
│   │   │   ├── AuthorPage.jsx     # Author profile (11KB)
│   │   │   ├── LivePage.jsx       # Live stream (16KB)
│   │   │   ├── VibhawiRadioPage.jsx # Radio player (31KB)
│   │   │   └── AboutPage.jsx      # About (17KB)
│   │   │
│   │   ├── admin/                 # Admin panel pages
│   │   │   ├── AdminLogin.jsx     # Login + setup (27KB)
│   │   │   ├── Dashboard.jsx      # Main dashboard (27KB)
│   │   │   ├── ManageNews.jsx     # News CRUD (43KB)
│   │   │   ├── CreateArticle.jsx  # TipTap editor (38KB)
│   │   │   ├── CreateUpdate.jsx   # Quick updates (15KB)
│   │   │   ├── ManageTeam.jsx     # Team CRUD (16KB)
│   │   │   ├── LiveStreamSettings.jsx # Stream config (31KB)
│   │   │   ├── RadioControlPanel.jsx  # Radio admin (36KB)
│   │   │   ├── Settings.jsx       # Site config (23KB)
│   │   │   ├── UserProfile.jsx    # Profile + OAuth (28KB)
│   │   │   └── GoogleCallbackHandler.jsx # OAuth redirect (7KB)
│   │   │
│   │   ├── super-admin/
│   │   │   └── MasterDashboard.jsx # User management (49KB)
│   │   │
│   │   ├── nethinethera/          # Event public portal
│   │   │   ├── NethinetheraPage.jsx # Event microsite
│   │   │   └── components/        # 13+ section components
│   │   │
│   │   ├── nethinethera-admin/    # Event management
│   │   │   ├── NethinetheraOverview.jsx (9KB)
│   │   │   ├── NethinetheraRegistration.jsx (31KB)
│   │   │   ├── NethinetheraVotingAnalysis.jsx (41KB)
│   │   │   ├── NethinetheraFingerprintCheck.jsx (20KB)
│   │   │   └── NethinetheraIPRecords.jsx (45KB)
│   │   │
│   │   ├── NotFoundPage.jsx       # 404 page
│   │   └── ShareTargetHandler.jsx # PWA share handler
│   │
│   ├── components/
│   │   ├── sections/              # Landing page sections (8 files)
│   │   ├── ui/                    # Shared UI (23 components)
│   │   ├── admin/                 # Admin-specific components
│   │   │   ├── dashboard/         # Dashboard sub-components
│   │   │   ├── config/            # Settings editors
│   │   │   ├── MediaLibrary.jsx   # Image manager
│   │   │   └── ImageCropperModal.jsx # Image crop tool
│   │   ├── auth/                  # Auth components
│   │   ├── layout/                # Layouts (10 components)
│   │   └── mpmu/                  # MPMU voting components
│   │
│   ├── lib/                       # Core services
│   │   ├── supabaseClient.js      # DB client + custom fetch
│   │   ├── mpmuService.js         # MPMU operations (31KB)
│   │   ├── radioService.js        # Radio API client
│   │   ├── roles.js               # RBAC definitions
│   │   ├── mpmuConstants.js       # Voting deadlines
│   │   ├── videoUtils.js          # Video URL parsing
│   │   └── youtubeUtils.js        # YouTube API helpers
│   │
│   ├── hooks/                     # Custom React hooks
│   │   ├── useAdminPresence.js    # Real-time presence
│   │   ├── useDeviceCapability.js # Device feature detection
│   │   └── usePhaseCountdown.js   # Event countdown timer
│   │
│   └── utils/                     # Utility functions
│       ├── fingerprint.js         # Triple-gate device fingerprinting
│       ├── haptics.js             # Device haptic feedback
│       ├── stringUtils.js         # String helpers
│       ├── themeColors.js         # Theme hex helpers
│       └── uploadImage.js         # Image upload servicers
│
├── server/                        # Backend servers
│   ├── radio-backend.js           # Express API (22KB)
│   ├── node-media-server.js       # RTMP/HLS server (11KB)
│   └── php/                       # Legacy PHP files
│
├── netlify/
│   └── edge-functions/            # Serverless OG image generators
│       ├── og-news.js
│       ├── og-candidate.js
│       ├── og-mpmu-main.js
│       └── extract-og.js
│
├── supabase/
│   ├── config.toml                # Supabase local config
│   ├── functions/                 # Deno edge functions
│   │   ├── submit-vote/           # Vote processing
│   │   └── sync-registrations/    # Registration sync
│   └── migrations/                # DB migrations
│
├── public/                        # Static assets
├── index.html                     # SPA entry (with PWA manifest)
├── vite.config.js                 # Vite build config
├── tailwind.config.cjs            # Extended Tailwind config
├── netlify.toml                   # Netlify deployment config
└── package.json                   # Dependencies
\`\`\`

---

> [!TIP]
> **How to navigate this codebase**: Start from [App.jsx](file:///c:/Users/User/Documents/DEV%20PROJECTS/icmu-web/icmu-web/src/App.jsx) to understand routing, then explore [DataContext.jsx](file:///c:/Users/User/Documents/DEV%20PROJECTS/icmu-web/icmu-web/src/context/DataContext.jsx) for data flow, and [AuthContext.jsx](file:///c:/Users/User/Documents/DEV%20PROJECTS/icmu-web/icmu-web/src/context/AuthContext.jsx) for authentication. Every admin page lives in \`src/pages/admin/\` and every public page in \`src/pages/landing-page/\`.
`;
