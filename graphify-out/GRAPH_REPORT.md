# Graph Report - icmu-web  (2026-09-04)

## Corpus Check
- 261 files · ~409,342 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 841 nodes · 1667 edges · 82 communities (31 shown, 36 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 21 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Feedbackwidget Pwainstallmodal
- Profileskeleton Badge
- Wizard Articlestepper
- Notificationcontextsimulator Test
- Autoprefixer Eslint
- Easteregg69 Scrambledtext
- Colorpicker Config
- App Src
- Protectedroute Borderglow
- Admin Contentskeleton
- Videoembed Liveskeleton
- Aliases Components
- Articleviewer Seo
- Authcontext Context
- Sections Aboutsection
- M3palette Lib
- Manifest Params
- Servicessection Livestreamsection
- Dashboard Admindashboardheader
- News Bot
- Aboutpage Footer
- Newssection Teamsection
- Clsx Dependencies
- Deno Compileroptions
- Mainlayout Logos
- Index Metrics
- Scrollvelocity Velocitytext
- Globalerrorboundary Componentdidcatch
- Compileroptions Jsconfig
- Script Cjs
- Script Data
- Roles Lib
- Draft Isolation
- Index Push
- Analytics Integration
- News Feed
- Nethinethera Modules
- Dompurify Dependencies
- News Fix
- Framer Motion
- Gsap Dependencies
- Lenis Dependencies
- Lucide React
- Motion Dependencies
- Ogl Dependencies
- React Switch
- React Tabs
- React Dependencies
- React Dom
- Helmet Async
- Image Crop
- React Markdown
- Router Dom
- Rehype Raw
- Remark Gfm
- Sonner Dependencies
- Tailwind Merge
- Tailwindcss Animate
- Extension Link
- Tiptap
- Tiptap React
- Starter Kit
- Utils Uiconstants
- Index Sandhwani
- Attention Workflow
- Admin Routes
- Media Unit

## God Nodes (most connected - your core abstractions)
1. `useAuth()` - 66 edges
2. `useData()` - 45 edges
3. `cn()` - 25 edges
4. `isAdmin()` - 19 edges
5. `isSuperAdmin()` - 18 edges
6. `getDefaultDashboardPath()` - 17 edges
7. `supabase` - 15 edges
8. `parseRoles()` - 15 edges
9. `isWriter()` - 14 edges
10. `getBroadcasterAdminUrl()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `GA4 Admin Analytics Integration` --semantically_similar_to--> `Analytics Integration`  [INFERRED] [semantically similar]
  CHANGELOG.md → README.md
- `Instagram-Style News Feed` --semantically_similar_to--> `Public News Feed`  [INFERRED] [semantically similar]
  CHANGELOG.md → README.md
- `MPMU & Nethinethera Modules` --semantically_similar_to--> `Nethinethera`  [INFERRED] [semantically similar]
  CHANGELOG.md → index.html
- `ProtectedRoute()` --calls--> `useAuth()`  [EXTRACTED]
  src/components/auth/ProtectedRoute.jsx → src/context/AuthContext.jsx
- `ContactSection()` --calls--> `useData()`  [EXTRACTED]
  src/components/sections/ContactSection.jsx → src/context/DataContext.jsx

## Import Cycles
- None detected.

## Communities (82 total, 36 thin omitted)

### Community 0 - "Feedbackwidget Pwainstallmodal"
Cohesion: 0.07
Nodes (57): FeedbackWidget, detectDevice(), FEEDBACK_TYPES, FeedbackWidget(), PRIORITIES, PWAInstallModal(), AdminSidebar(), ActiveAdmins() (+49 more)

### Community 1 - "Profileskeleton Badge"
Cohesion: 0.05
Nodes (54): ProfileSkeleton(), AnimatedBadge(), ICON_CLASS, ICON_ROLL_VARIANTS, ICONS, SIZE_CLASS, STATUS_CLASS, TEXT_ROLL_VARIANTS (+46 more)

### Community 2 - "Wizard Articlestepper"
Cohesion: 0.05
Nodes (30): CreateArticle, CreateUpdate, ArticleStepper(), steps, MenuBar(), TagInput(), FeedbackCard, FeedbackPanel() (+22 more)

### Community 3 - "Notificationcontextsimulator Test"
Cohesion: 0.07
Nodes (14): testCases, NotificationContextSimulator, testCases, testCases, SimulatedEdgeFunctionDispatcher, SimulatedPushSubscriptionsDB, testCases, main() (+6 more)

### Community 4 - "Autoprefixer Eslint"
Cohesion: 0.05
Nodes (40): autoprefixer, daisyui, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, devDependencies (+32 more)

### Community 5 - "Easteregg69 Scrambledtext"
Cohesion: 0.07
Nodes (15): NethinetheraPage, ScrambledText(), ScrollReveal(), EasterEgg69(), QUOTES, ChampionshipPreviewSection(), hiddenSchools, HeroSection() (+7 more)

### Community 6 - "Colorpicker Config"
Cohesion: 0.09
Nodes (27): Settings, ColorPicker(), isValidHex(), PALETTE, ConfigActivityLog(), ConfigFormEditor(), ConfigJsonEditor(), PWAInstallCard() (+19 more)

### Community 7 - "App Src"
Cohesion: 0.07
Nodes (25): AdminLayout, AdminMessages, App(), ArticleViewer, AuthorPage, BroadcasterDashboard, BroadcasterLayout, GoogleCallbackHandler (+17 more)

### Community 8 - "Protectedroute Borderglow"
Cohesion: 0.11
Nodes (20): NotFoundPage, ProtectedRoute, AdminLogin, ProtectedRoute(), staggerVariants, animateValue(), tick(), BorderGlow() (+12 more)

### Community 9 - "Admin Contentskeleton"
Cohesion: 0.20
Nodes (16): ContentSkeleton(), NewsBoardView(), NewsCalendarView(), NewsGridView(), NewsListView(), getCategoryColor(), getRelativeDateLabel(), getSourcePlatform() (+8 more)

### Community 10 - "Videoembed Liveskeleton"
Cohesion: 0.19
Nodes (15): LivePage, LiveStreamSettings, LiveSkeleton(), VideoEmbed(), detectPlatform(), extractFacebookVideoUrl(), getFacebookEmbedUrl(), getFacebookWatchUrl() (+7 more)

### Community 11 - "Aliases Components"
Cohesion: 0.09
Nodes (22): aliases, components, hooks, lib, ui, utils, iconLibrary, registries (+14 more)

### Community 12 - "Articleviewer Seo"
Cohesion: 0.18
Nodes (14): SEO(), ARTICLE_LIMITS, useArticleForm(), ArticleViewer(), AuthorPage(), ArticleCard, getPreview(), getReadingTime() (+6 more)

### Community 13 - "Authcontext Context"
Cohesion: 0.16
Nodes (19): AuthContext, AuthProvider(), clearSession(), getDeviceId(), getDeviceName(), loadSession(), saveSession(), trackDeviceSession() (+11 more)

### Community 14 - "Sections Aboutsection"
Cohesion: 0.14
Nodes (10): LandingPage, ContactSection(), HomeSection(), LazySection(), PrimaryButton(), SocialIcon(), AboutSection, ContactSection (+2 more)

### Community 15 - "M3palette Lib"
Cohesion: 0.19
Nodes (17): generateAllPalettes(), generateTonalPalette(), hexToOklch(), hexToRgbNorm(), linearToSrgb(), linRgbToOklab(), M3_TONES, oklabToLinRgb() (+9 more)

### Community 16 - "Manifest Params"
Cohesion: 0.12
Nodes (16): background_color, description, display, icons, name, text, title, url (+8 more)

### Community 17 - "Servicessection Livestreamsection"
Cohesion: 0.17
Nodes (10): LiveStreamSection(), permanentServices, ServicesSection(), StorageInspector(), DataContext, DataProvider(), useData(), ManageTeam() (+2 more)

### Community 18 - "Dashboard Admindashboardheader"
Cohesion: 0.20
Nodes (8): Dashboard, AdminDashboardHeader(), AdminWriterQuickActions(), ChangelogModal(), ChangelogPanel(), StatCard(), DashboardSkeleton(), AnimatedNumber()

### Community 19 - "News Bot"
Cohesion: 0.26
Nodes (11): BOT_PATTERNS, buildOGPage(), config, escapeHtml(), extractArticleId(), fetchArticle(), handler(), isBot() (+3 more)

### Community 20 - "Aboutpage Footer"
Cohesion: 0.20
Nodes (6): AboutPage, Footer(), aboutImages, nethinetheraImages, sandhwaniImages, stats

### Community 21 - "Newssection Teamsection"
Cohesion: 0.27
Nodes (7): getExcerpt(), NewsSection(), TeamMemberCard, TeamSection(), AnimatedBg(), NewsSection, TeamSection

### Community 22 - "Clsx Dependencies"
Cohesion: 0.22
Nodes (9): clsx, dependencies, clsx, @supabase/supabase-js, @tailwindcss/typography, @tiptap/extension-image, @supabase/supabase-js, @tailwindcss/typography (+1 more)

### Community 23 - "Deno Compileroptions"
Cohesion: 0.25
Nodes (7): deno.ns, deno.window, compilerOptions, allowJs, lib, strict, importMap

### Community 24 - "Mainlayout Logos"
Cohesion: 0.32
Nodes (4): MainLayout(), TransitionContext, Logos(), Navbar()

### Community 25 - "Index Metrics"
Cohesion: 0.48
Nodes (6): base64UrlEncode(), createJwt(), getAccessToken(), getCorsHeaders(), jsonResponse(), pemToArrayBuffer()

### Community 26 - "Scrollvelocity Velocitytext"
Cohesion: 0.40
Nodes (3): ScrollVelocity(), VelocityText(), useElementWidth()

### Community 28 - "Compileroptions Jsconfig"
Cohesion: 0.50
Nodes (3): compilerOptions, baseUrl, paths

### Community 29 - "Script Cjs"
Cohesion: 0.50
Nodes (3): data, fs, lines

### Community 30 - "Script Data"
Cohesion: 0.50
Nodes (3): data, fs, lines

### Community 32 - "Draft Isolation"
Cohesion: 0.67
Nodes (3): Draft Isolation, Newsroom Overhaul, submitted_by UUID Migration

## Knowledge Gaps
- **183 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+178 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 290 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **36 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useAuth()` connect `Feedbackwidget Pwainstallmodal` to `Profileskeleton Badge`, `Wizard Articlestepper`, `Colorpicker Config`, `App Src`, `Protectedroute Borderglow`, `Admin Contentskeleton`, `Videoembed Liveskeleton`, `Articleviewer Seo`, `Authcontext Context`, `Servicessection Livestreamsection`, `Dashboard Admindashboardheader`?**
  _High betweenness centrality (0.060) - this node is a cross-community bridge._
- **Why does `useData()` connect `Servicessection Livestreamsection` to `Feedbackwidget Pwainstallmodal`, `Profileskeleton Badge`, `Wizard Articlestepper`, `Colorpicker Config`, `App Src`, `Admin Contentskeleton`, `Videoembed Liveskeleton`, `Articleviewer Seo`, `Sections Aboutsection`, `Dashboard Admindashboardheader`, `Aboutpage Footer`, `Newssection Teamsection`, `Mainlayout Logos`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **Why does `cn()` connect `Profileskeleton Badge` to `Dashboard Admindashboardheader`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _183 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Feedbackwidget Pwainstallmodal` be split into smaller, more focused modules?**
  _Cohesion score 0.0702247191011236 - nodes in this community are weakly interconnected._
- **Should `Profileskeleton Badge` be split into smaller, more focused modules?**
  _Cohesion score 0.05328218243819267 - nodes in this community are weakly interconnected._
- **Should `Wizard Articlestepper` be split into smaller, more focused modules?**
  _Cohesion score 0.05200501253132832 - nodes in this community are weakly interconnected._