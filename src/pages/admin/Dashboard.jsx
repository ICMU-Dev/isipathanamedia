import React, { useMemo } from "react";
import ActiveAdmins from "../../components/layout/ActiveAdmins";
import MainLogos from "../../assets/main-logos.png";
import { useData } from "../../context/DataContext";
import AdminDashboardHeader from "../../components/admin/dashboard/AdminDashboardHeader";
import AdminWriterQuickActions from "../../components/admin/dashboard/AdminWriterQuickActions";
import {
  Users,
  FileText,
  MessageSquare,
  Newspaper,
  ArrowRight,
  Calendar,
  Plus,
  Clock,
  Zap,
  PenSquare,
  FileCheck,
  FileClock,
  FileX,
  Radio,
  TrendingUp,
  ArrowUpRight,
  PieChart,
  BarChart3,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Link, useParams } from "react-router-dom";
import ChangelogPanel from "../../components/admin/dashboard/ChangelogPanel";
import { ArticleSystemModal } from "../../components/admin/dashboard/ChangelogModal";
import StatCard from "../../components/admin/dashboard/StatCard";
import DashboardSkeleton from "../../components/admin/DashboardSkeleton";
import { AnimatedNumber } from "../../components/motion/animated-number";


const Dashboard = () => {
  const { stats, news = [], messages = [], team = [], siteConfig = {}, isFetching } = useData();
  const { adminPath } = useParams();
  const { user } = useAuth();

  const basePath = `/${adminPath}`;

  const isWriter = user?.role?.toLowerCase() === "writer";

  const [showUpdateModal, setShowUpdateModal] = React.useState(false);
  const [selectedLog, setSelectedLog] = React.useState(null);

  const changelogs = [
    {
      id: "ui-visual-polish",
      title: "UI Enhancements & Visual Polish",
      subtitle: "UI & Aesthetics",
      desc: "Fixed systemic visual bugs related to thick white outlines and improved layout consistency across the admin panel.",
      date: "Just now",
      isMajor: false,
      badge: "BUG FIXES",
      steps: [
        {
          t: "Visual Accent Fixes",
          d: "Resolved an issue where semi-transparent accent borders were rendering as solid white outlines.",
        },
        {
          t: "Tailwind Optimization",
          d: "Optimized the Tailwind CSS configuration to properly support dynamic alpha values for theme accents.",
        },
      ],
    },
    {
      id: "auth-notifications-update",
      title: "MAJOR UPDATE: Google Login & Linked Devices",
      subtitle: "Authentication & Security",
      desc: "Fixed Google login integration, introduced linked device management, and deployed a new notification system.",
      date: "Recent",
      isMajor: true,
      badge: "FEATURE RELEASE",
      steps: [
        {
          t: "Google Login Integration",
          d: "Resolved authentication issues with Google login, ensuring a seamless and secure sign-in experience.",
        },
        {
          t: "Linked Devices",
          d: "Added the ability to view and manage active sessions across different devices directly from your profile settings.",
        },
        {
          t: "Push Notification System",
          d: "Implemented a robust push notification system for real-time alerts and admin events.",
        },
        {
          t: "Splash Screen Optimization",
          d: "Fixed visual glitches and optimized the loading sequence of the application splash screen for a smoother initial load.",
        },
      ],
    },
    {
      id: "latest-updates-admin",
      title: "Admin Panel Enhancements",
      subtitle: "UI, Haptics & Notifications",
      desc: "Subtle haptics for mobile nav, super admin notifications, and faster changelog modal.",
      date: "Recent",
      isMajor: false,
      badge: "SYSTEM UPDATE",
      steps: [
        {
          t: "Mobile Nav Haptics",
          d: "Subtle vibration feedback when interacting with bottom navigation items on mobile.",
        },
        {
          t: "Super Admin Push Notifications",
          d: "Real-time web push notifications when new feedbacks or bugs are submitted.",
        },
        {
          t: "Optimized Changelog Modal",
          d: "Faster, subtle fade animations replacing the slower staggered bounce animations for a snappier feel.",
        },
        {
          t: "Dashboard PWA Integration",
          d: "Install App prompt card now accessible directly in Settings to install the dashboard as a PWA.",
        },
      ],
    },
    {
      id: 0,
      title: "Feedback & Bug Reporting System",
      subtitle: "Admin Experience & Quality",
      desc: "New subtle floating widget (Ctrl+Shift+F) to report bugs, suggest features, and track status in Settings.",
      date: "Recent",
      isMajor: false,
      badge: "FEATURE RELEASE",
      steps: [
        {
          t: "Subtle Floating Trigger",
          d: "Subtle icon button fixed on every admin page (or press Ctrl+Shift+F) to report bugs or suggest enhancements.",
        },
        {
          t: "Auto Context Detection",
          d: "Automatically includes reporter name, role, device type (desktop/mobile/tablet), and page URL in the report.",
        },
        {
          t: "Feedbacks Management Panel",
          d: "Settings page includes a filterable Feedbacks tab for admins and super-admins to track open issues.",
        },
        {
          t: "Super-Admin Controls",
          d: "Super-admins can update status (Open -> In Progress -> Resolved -> Won't Fix), post official replies, and manage reports.",
        },
        {
          t: "About Section",
          d: "New About tab in Settings detailing app version, tech stack, and shortcut keys.",
        },
      ],
    },
    {
      id: 1,
      title: "Database Optimization & Security",
      subtitle: "Backend & RLS Updates",
      desc: "Under-maintenance optimization fixing security permissions, row-level security headers, and session TTLs.",
      date: "Recent",
      isMajor: false,
      badge: "SECURITY PATCH",
      steps: [
        {
          t: "Row-Level Security (RLS)",
          d: "Custom fetch wrapper injects user index headers for exact row-level security enforcement.",
        },
        {
          t: "Session Persistence",
          d: "Support for remember-me session persistence (30 days) and automatic token refreshes.",
        },
        {
          t: "Real-time Subscriptions",
          d: "Optimized WebSocket channel listeners for real-time presence and database updates.",
        },
      ],
    },
    {
      id: 2,
      title: "Mobile UI Redesign",
      subtitle: "Admin Interface UX Overhaul",
      desc: "Complete redesign of the admin dashboard with advanced glassmorphism, dynamic headers, and optimized mobile layouts.",
      date: "Recent",
      isMajor: false,
      badge: "UI OVERHAUL",
      steps: [
        {
          t: "Dynamic Mobile Header",
          d: "Sleek glassmorphism header with active role badges and quick navigation drawer.",
        },
        {
          t: "Collapsible Sidebar",
          d: "Persistent collapsed icon mode for desktop to maximize workspace area.",
        },
        {
          t: "Responsive Stats",
          d: "Swipeable & compact stat cards optimized for smaller screen viewports.",
        },
      ],
    },
    {
      id: 3,
      title: "Profile & Access Management",
      subtitle: "User Security & Customization",
      desc: "Premium, mobile-first rebuild of profile and access management with real-time avatar tracking.",
      date: "Recent",
      isMajor: false,
      badge: "USER PROFILES",
      steps: [
        {
          t: "Avatar Cropping Modal",
          d: "Integrated image cropping modal for crisp user profile avatars.",
        },
        {
          t: "Device Session Tracking",
          d: "Parses user-agent to monitor active devices and operating system sessions.",
        },
      ],
    },
    {
      id: 4,
      title: "Modern Theme Selector",
      subtitle: "Appearance & Personalization",
      desc: "New swipeable carousel for theme selection featuring smooth transitions and ambient glow effects.",
      date: "Recent",
      isMajor: false,
      badge: "THEMING",
      steps: [
        {
          t: "Theme Architectures",
          d: "Choose between default dark mode, glassmorphism, or sleek minimal skins.",
        },
        {
          t: "Accent Palette",
          d: "Instant accent color switching with real-time theme context propagation.",
        },
      ],
    },
  ];

  const handleOpenLogModal = (logItem) => {
    setSelectedLog(logItem || changelogs[0]);
    setShowUpdateModal(true);
  };

  const writerData = useMemo(() => {
    if (!isWriter) return { statsWriter: {}, recentMyArticles: [] };
    const myArticles = (news || []).filter(
      (item) => item.submitted_by === user?.id
    );

    const statsWriter = {
      total: myArticles.length,
      published: myArticles.filter((a) => a.status === "published").length,
      pending: myArticles.filter((a) => a.status === "pending").length,
      draft: myArticles.filter((a) => a.status === "draft").length,
    };

    const recentMyArticles = [...myArticles]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 8);

    return { statsWriter, recentMyArticles };
  }, [news, isWriter, user?.name, user?.indexNumber, user?.full_name, user?.username, user?.index_number]);

  const dashboardData = useMemo(() => {
    if (isWriter)
      return {
        allArticles: [],
        allUpdates: [],
        pendingCount: 0,
        recentArticles: [],
        recentUpdates: [],
        recentMessages: [],
      };
    const allArticles = (news || []).filter(
      (a) => a.type?.toLowerCase() !== "update",
    );
    const allUpdates = (news || []).filter(
      (a) => a.type?.toLowerCase() === "update",
    );
    const pendingCount = (news || []).filter(
      (a) => a.status?.toLowerCase() === "pending",
    ).length;

    const recentArticles = [...allArticles]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 4);

    const recentUpdates = [...allUpdates]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 4);

    const recentMessages = [...(messages || [])]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 3);

    return {
      allArticles,
      allUpdates,
      pendingCount,
      recentArticles,
      recentUpdates,
      recentMessages,
    };
  }, [news, messages, isWriter]);

  // weeklyBars depends on dashboardData — computed via useMemo so it
  // is called unconditionally (before any early return) per React rules-of-hooks.
  const weeklyBars = useMemo(() => {
    const daysArr = [];
    const articleCounts = Array(7).fill(0);
    const updateCounts = Array(7).fill(0);

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      daysArr.push({
        label: d.toLocaleDateString("en-US", { weekday: "short" }),
        dateLabel: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        dateStr: d.toDateString(),
      });
    }

    const countByUploadDate = (items, counts) => {
      items.forEach((item) => {
        const uploadDate = item.created_at || item.date;
        if (!uploadDate) return;

        const uploadDateValue = new Date(uploadDate);
        if (Number.isNaN(uploadDateValue.getTime())) return;

        const index = daysArr.findIndex(
          (day) => day.dateStr === uploadDateValue.toDateString(),
        );
        if (index !== -1) counts[index]++;
      });
    };

    countByUploadDate(dashboardData?.allArticles || [], articleCounts);
    countByUploadDate(dashboardData?.allUpdates || [], updateCounts);

    const max = Math.max(
      ...articleCounts.map((count, index) => count + updateCounts[index]),
      1,
    );
    return daysArr.map((day, i) => ({
      label: day.label,
      dateLabel: day.dateLabel,
      articles: articleCounts[i],
      updates: updateCounts[i],
      total: articleCounts[i] + updateCounts[i],
      articlePct: ((articleCounts[i] + updateCounts[i]) > 0
        ? (articleCounts[i] / (articleCounts[i] + updateCounts[i])) * 100
        : 0),
      updatePct: ((articleCounts[i] + updateCounts[i]) > 0
        ? (updateCounts[i] / (articleCounts[i] + updateCounts[i])) * 100
        : 0),
      barPct: ((articleCounts[i] + updateCounts[i]) / max) * 100,
    }));
  }, [dashboardData]);

  if (isFetching && (!stats || news.length === 0)) {
    return <DashboardSkeleton />;
  }

  if (isWriter) {
    const { statsWriter, recentMyArticles } = writerData;

    return (
      <div className="space-y-4 animate-fade-in relative max-w-[1500px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Main Left Content (approx 70%) */}
          <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-4 min-w-0">
            {/* HERO CARD */}
            <div className="relative overflow-hidden bg-[var(--admin-card-bg)] border border-[var(--admin-border)] rounded-2xl p-6 md:p-8 shadow-sm flex items-center justify-between group">
              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-theme-accent/ blur-[60px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/3" />
              <div className="relative z-10 max-w-xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-theme-accent/ text-[var(--accent)] text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-3 border border-theme-accent/">
                  <Sparkles size={13} /> Welcome Back
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-[var(--admin-text-primary)] tracking-tight mb-2">
                  Hello, {user?.name || "Writer"}
                </h1>
                <p className="text-xs md:text-sm text-[var(--admin-text-secondary)] max-w-md leading-relaxed">
                  Your creative workspace is ready. Track your recent articles,
                  check publication status, and start writing your next piece.
                </p>
                <div className="mt-5 flex items-center gap-3">
                  <Link
                    to={`${basePath}/dashboard/news/create`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--accent)] text-black text-xs font-bold rounded-2xl shadow-[0_2px_12px_rgba(var(--accent-rgb),0.2)] hover:opacity-95 active:scale-95 transition-all"
                  >
                    <Plus size={15} /> Write New Article
                  </Link>
                </div>
              </div>

              {/* Decorative Element */}
              <div className="hidden md:flex relative z-10 w-36 h-36 items-center justify-center">
                <div className="absolute inset-0 bg-theme-accent/ rounded-full" />
                <PenSquare
                  size={64}
                  className="text-[var(--accent)] opacity-20"
                />
              </div>
            </div>

            {/* CATEGORIES / STATS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard
                icon={<PenSquare size={17} />}
                title="My Work"
                value={statsWriter.total}
                subtext="Total submissions"
                colorScheme="accent"
                href={`${basePath}/dashboard/news`}
              />
              <StatCard
                icon={<FileCheck size={17} />}
                title="Published"
                value={statsWriter.published}
                subtext="Live articles"
                colorScheme="green"
                href={`${basePath}/dashboard/news`}
              />
              <StatCard
                icon={<FileClock size={17} />}
                title="Pending"
                value={statsWriter.pending}
                subtext="In review"
                colorScheme="yellow"
                href={`${basePath}/dashboard/news`}
              />
              <StatCard
                icon={<FileX size={17} />}
                title="Drafts"
                value={statsWriter.draft}
                subtext="Saved drafts"
                colorScheme="blue"
                href={`${basePath}/dashboard/news`}
              />
            </div>

            {/* RECENT SUBMISSIONS */}
            <div className="bg-[var(--admin-card-bg)] border border-[var(--admin-border)] rounded-2xl p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-2xl bg-theme-accent/ text-[var(--accent)] flex items-center justify-center shrink-0">
                    <Newspaper size={16} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-[var(--admin-text-primary)]">
                      Recent Submissions
                    </h2>
                    <p className="text-[10px] text-[var(--admin-text-secondary)]">
                      Your recent articles and drafts
                    </p>
                  </div>
                </div>
                <Link
                  to={`${basePath}/dashboard/news`}
                  className="text-xs font-semibold text-[var(--admin-text-secondary)] hover:text-[var(--accent)] transition-colors inline-flex items-center gap-1"
                >
                  View All <ArrowRight size={12} />
                </Link>
              </div>

              {isFetching && news.length === 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="bg-[var(--admin-input-bg)] rounded-2xl border border-[var(--admin-border)] p-4 h-48 animate-pulse flex flex-col justify-end"
                    >
                      <div className="w-2/3 h-4 bg-[var(--admin-border)] rounded mb-2" />
                      <div className="w-1/3 h-3 bg-[var(--admin-border)] rounded" />
                    </div>
                  ))}
                </div>
              ) : recentMyArticles.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  {recentMyArticles.map((article) => {
                    const status = article.status?.toLowerCase() || "pending";
                    const isPublished = status === "published";
                    const isRejected = status === "rejected";

                    const statusClasses = isPublished
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                      : isRejected
                        ? "bg-red-500/20 text-red-400 border-red-500/30"
                        : "bg-amber-500/20 text-amber-400 border-amber-500/30";

                    const statusLabel = isPublished
                      ? "Published"
                      : isRejected
                        ? "Changes Req"
                        : "In Review";

                    const isUpdate = article.type?.toLowerCase() === "update";

                    return (
                      <Link
                        key={article.id}
                        to={
                          isUpdate
                            ? `/${adminPath}/dashboard/news/edit-update/${article.id}`
                            : `/${adminPath}/dashboard/news/edit/${article.id}`
                        }
                        className="group relative h-48 rounded-2xl overflow-hidden border border-[var(--admin-border)] bg-[var(--admin-input-bg)] transition-all hover:border-theme-accent/ hover:-translate-y-0.5 flex flex-col"
                      >
                        {/* Background Image */}
                        {article.image ? (
                          <img
                            src={article.image}
                            alt=""
                            className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-[var(--admin-input-bg)] to-[var(--admin-card-bg)] flex items-center justify-center">
                            <FileText
                              size={40}
                              className="text-[var(--admin-text-secondary)] opacity-20"
                            />
                          </div>
                        )}

                        {/* Gradient Overlay for text readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                        {/* Content */}
                        <div className="relative h-full p-4 flex flex-col justify-between z-10">
                          {/* Top row: Status Badge */}
                          <div className="flex justify-between items-start">
                            <div
                              className={`px-2.5 py-0.5 rounded-2xl text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md ${statusClasses}`}
                            >
                              {statusLabel}
                            </div>
                            {isUpdate && (
                              <div className="px-2 py-0.5 rounded-3xl  bg-white/15 backdrop-blur-md text-white text-[9px] font-bold uppercase">
                                Update
                              </div>
                            )}
                          </div>

                          {/* Bottom row: Title & Date */}
                          <div className="space-y-1">
                            <h4 className="text-white font-semibold text-xs sm:text-sm leading-tight line-clamp-2">
                              {article.title || "Untitled"}
                            </h4>
                            <div className="flex items-center gap-1.5 text-[10px] text-white/70">
                              <Calendar size={10} />
                              {new Date(article.date).toLocaleDateString(
                                "en-US",
                                { month: "short", day: "numeric" },
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-[var(--admin-input-bg)] border border-[var(--admin-border)] rounded-2xl p-8 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 rounded-2xl bg-theme-accent/ text-[var(--accent)] flex items-center justify-center mb-3">
                    <Newspaper size={24} />
                  </div>
                  <h3 className="text-sm font-bold text-[var(--admin-text-primary)] mb-1">
                    No Articles Yet
                  </h3>
                  <p className="text-xs text-[var(--admin-text-secondary)] mb-4 max-w-xs">
                    Your article submissions will appear here. Ready to share
                    your thoughts with the community?
                  </p>
                  <Link
                    to={`${basePath}/dashboard/news/create`}
                    className="px-4 py-2 bg-[var(--accent)] text-black text-xs font-bold rounded-2xl hover:opacity-95 transition-all shadow-[0_2px_10px_rgba(var(--accent-rgb),0.2)]"
                  >
                    Start Writing Now
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar (approx 30%) */}
          <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-4">
            <AdminWriterQuickActions basePath={basePath} />
            <ChangelogPanel
              changelogs={changelogs}
              onMajorClick={handleOpenLogModal}
              onLogClick={handleOpenLogModal}
            />
          </div>
        </div>

        <ArticleSystemModal
          isOpen={showUpdateModal}
          onClose={() => setShowUpdateModal(false)}
          log={selectedLog}
          role={user?.role}
        />
      </div>
    );
  }




  const {
    allArticles,
    pendingCount,
    recentArticles,
    recentMessages,
  } = dashboardData;

  // ─── bento helpers ─────────────────────────────────────────────────────────

  // Published / pending / draft counts for donut ring
  const publishedCount = (news || []).filter(
    (n) => n.status?.toLowerCase() === "published",
  ).length;
  const draftCount = (news || []).filter(
    (n) => n.status?.toLowerCase() === "draft",
  ).length;
  const totalNewsCount = (news || []).length;
  // weeklyBars is declared above (before early returns) per hooks rules

  // Status badge helper
  const statusBadge = (status = "") => {
    const s = status.toLowerCase();
    if (s === "published")
      return {
        cls: "bg-green-500/20 text-green-400 border border-green-500/20",
        label: "Published",
      };
    if (s === "draft")
      return {
        cls: "bg-red-500/20 text-red-400 border border-red-500/30",
        label: "Draft",
      };
    return {
      cls: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/20",
      label: "Pending",
    };
  };

  // Avatar initials fallback
  const initials = (name = "") =>
    name
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();

  // SVG donut ring values
  const RING_R = 60;
  const RING_C = 2 * Math.PI * RING_R;
  const pubPct = totalNewsCount > 0 ? publishedCount / totalNewsCount : 0;
  const pendPct = totalNewsCount > 0 ? pendingCount / totalNewsCount : 0;
  const draftPct = totalNewsCount > 0 ? draftCount / totalNewsCount : 0;
  const pubDash = pubPct * RING_C;
  const pendDash = pendPct * RING_C;
  const draftDash = draftPct * RING_C;

  const liveStream = siteConfig?.liveStream ?? {};

  return (
    <div className="animate-fade-in space-y-4 relative">
      <AdminDashboardHeader user={user} stats={stats} basePath={basePath} />

      {/* ── ROW 1: Stat Cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={<FileText size={18} />}
          title="Total Articles"
          value={totalNewsCount}
          subtext="All time submissions"
          colorScheme="accent"
          href={`${basePath}/dashboard/news`}
        />

        <StatCard
          icon={<FileCheck size={18} />}
          title="Published"
          value={publishedCount}
          subtext="Live articles"
          colorScheme="green"
          href={`${basePath}/dashboard/news`}
        />

        <StatCard
          icon={<FileClock size={18} />}
          title="Pending"
          value={pendingCount}
          subtext="Awaiting review"
          colorScheme="yellow"
          href={`${basePath}/dashboard/news`}
        />

        <StatCard
          icon={<Users size={18} />}
          title="Team Members"
          value={stats?.totalMembers ?? 0}
          subtext="Active members"
          colorScheme="blue"
          href={`${basePath}/dashboard/team`}
        />
      </div>

      {/* ── ROW 2: Recent Articles + Right Panel ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Recent Articles (col-span-2) */}
        <div className="lg:col-span-2 rounded-2xl p-5 bg-[var(--admin-card-bg)] border border-[var(--admin-border)] flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-2xl bg-theme-accent/ text-[var(--accent)] flex items-center justify-center shrink-0">
                <Newspaper size={16} />
              </div>
              <div>
                <h3 className="font-bold text-[var(--admin-text-primary)] text-sm">
                  Recent Articles
                </h3>
                <p className="text-[10px] text-[var(--admin-text-secondary)]">
                  Latest platform submissions
                </p>
              </div>
            </div>
            <Link
              to={`${basePath}/dashboard/news`}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--admin-text-secondary)] hover:text-[var(--accent)] transition-colors"
            >
              <span>View all</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          {/* List */}
          <div className="flex flex-col gap-2">
            {recentArticles.length > 0 ? (
              recentArticles.map((article) => {
                const badge = statusBadge(article.status);
                return (
                  <Link
                    key={article.id}
                    to={`${basePath}/dashboard/news/edit/${article.id}`}
                    className="flex items-center gap-3 p-3 bg-[var(--admin-input-bg)] rounded-2xl hover:border-theme-accent/ border border-[var(--admin-border)] hover:shadow-[0_2px_12px_rgba(0,0,0,0.15)] transition-all group/item"
                  >
                    {/* Thumbnail */}
                    <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-[var(--admin-card-bg)] border border-[var(--admin-border)] flex items-center justify-center">
                      {article.image ? (
                        <img
                          src={article.image}
                          alt=""
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <FileText size={15} className="text-[var(--admin-text-secondary)] opacity-40" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[13px] font-semibold text-[var(--admin-text-primary)] truncate group-hover/item:text-[var(--accent)] transition-colors">
                        {article.title || "Untitled"}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1 text-[10px] text-[var(--admin-text-secondary)]">
                          <Calendar size={10} />
                          {new Date(article.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Status badge */}
                    <span
                      className={`shrink-0 rounded-2xl px-2 py-0.5 text-[10px] font-bold ${badge.cls}`}
                    >
                      {badge.label}
                    </span>
                  </Link>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-8 opacity-60">
                <div className="w-10 h-10 rounded-2xl bg-theme-accent/ text-[var(--accent)] flex items-center justify-center mb-2">
                  <FileText size={18} />
                </div>
                <p className="text-xs text-[var(--admin-text-secondary)] font-medium">
                  No articles published yet
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Live Status + Recent Messages */}
        <div className="flex flex-col gap-4">

          {/* Live Status Card */}
          <div className="rounded-2xl p-5 bg-[var(--admin-card-bg)] border border-[var(--admin-border)] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-2xl flex items-center justify-center shrink-0 ${liveStream.isLive ? "bg-red-500/10 text-red-400" : "bg-theme-accent/ text-[var(--accent)]"}`}>
                  <Radio size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-[var(--admin-text-primary)] text-sm">
                    Live Stream
                  </h3>
                  <p className="text-[10px] text-[var(--admin-text-secondary)]">
                    Broadcast status
                  </p>
                </div>
              </div>
              {liveStream.isLive ? (
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-[10px] font-bold text-red-400 uppercase tracking-wider">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                  </span>
                  Live
                </span>
              ) : (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--admin-input-bg)] border border-[var(--admin-border)] text-[var(--admin-text-secondary)]">
                  Offline
                </span>
              )}
            </div>

            {liveStream.isLive ? (
              <div className="flex flex-col gap-2.5 pt-1">
                <p className="text-[13px] font-semibold text-[var(--admin-text-primary)] line-clamp-2 leading-snug">
                  {liveStream.title || "Untitled Stream"}
                </p>
                <p className="text-[11px] text-[var(--admin-text-secondary)] capitalize">
                  via {liveStream.platform || "YouTube"}
                </p>
                <a
                  href={`${basePath}/dashboard/live`}
                 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-2 rounded-2xl bg-[var(--accent)] text-black text-xs font-bold hover:opacity-95 transition-opacity"
                >
                  <Radio size={13} /> Watch Stream
                </a>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-1">
                <p className="text-xs text-[var(--admin-text-secondary)] leading-relaxed">
                  No active stream. Configure your stream settings to go live.
                </p>
                <Link
                  to={`${basePath}/dashboard/settings`}
                  className="text-xs font-semibold text-[var(--accent)] hover:underline inline-flex items-center gap-1"
                >
                  <span>Go to Live Settings</span>
                  <ArrowRight size={11} />
                </Link>
              </div>
            )}
          </div>

          {/* Recent Messages */}
          <div className="rounded-2xl p-5 bg-[var(--admin-card-bg)] border border-[var(--admin-border)] flex flex-col gap-3 flex-1 justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-2xl bg-theme-accent/ text-[var(--accent)] flex items-center justify-center shrink-0">
                    <MessageSquare size={16} />
                  </div>
                  <div>
                    <h3 className="font-bold text-[var(--admin-text-primary)] text-sm">
                      Messages
                    </h3>
                    <p className="text-[10px] text-[var(--admin-text-secondary)]">
                      Recent inquiries
                    </p>
                  </div>
                </div>
                <Link
                  to={`${basePath}/dashboard/messages`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--admin-text-secondary)] hover:text-[var(--accent)] transition-colors"
                >
                  <span>View all</span>
                  <ArrowRight size={12} />
                </Link>
              </div>

              <div className="flex flex-col gap-2">
                {recentMessages.length > 0 ? (
                  recentMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className="p-3 bg-[var(--admin-input-bg)] rounded-2xl border border-[var(--admin-border)] hover:border-theme-accent/ transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-[var(--admin-text-primary)] truncate max-w-[130px]">
                          {msg.name}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-[var(--admin-text-secondary)] shrink-0">
                          <Clock size={10} />
                          {new Date(msg.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--admin-text-secondary)] line-clamp-2 leading-relaxed">
                        {msg.message || "No message content"}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-5 opacity-60">
                    <div className="w-9 h-9 rounded-2xl bg-theme-accent/ text-[var(--accent)] flex items-center justify-center mb-1.5">
                      <MessageSquare size={16} />
                    </div>
                    <p className="text-xs text-[var(--admin-text-secondary)]">No new messages</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── ROW 3: Bar Chart + Donut Ring + Team Members ─────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

        {/* Weekly Activity Bar Chart */}
        <div className="rounded-2xl p-5 bg-[var(--admin-card-bg)] border border-[var(--admin-border)] flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-2xl bg-theme-accent/ text-[var(--accent)] flex items-center justify-center shrink-0">
                <BarChart3 size={16} />
              </div>
              <div>
                <h3 className="font-bold text-[var(--admin-text-primary)] text-sm leading-none">
                  7-Day Activity
                </h3>
                <p className="text-[10px] text-[var(--admin-text-secondary)] mt-1">
                  Articles and updates by day
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-4 text-[10px] font-semibold text-[var(--admin-text-secondary)]">
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: "color-mix(in srgb, var(--accent) 42%, var(--admin-text-primary))" }}
                />
                Articles
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
                Updates
              </span>
            </div>

            <div className="flex items-end gap-1.5 sm:gap-2 h-48 mt-4 px-1 pb-1">
              {weeklyBars.map((bar) => (
                <div
                  key={bar.dateLabel}
                  className="min-w-0 flex-1 flex flex-col items-center justify-end gap-1.5 group/bar h-full"
                  title={`${bar.dateLabel}: ${bar.articles} article${bar.articles === 1 ? "" : "s"}, ${bar.updates} update${bar.updates === 1 ? "" : "s"}`}
                  aria-label={`${bar.dateLabel}: ${bar.articles} articles, ${bar.updates} updates`}
                >
                  <div
                    className="w-full h-full flex flex-col justify-end overflow-hidden rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-input-bg)]"
                    style={{ height: `${Math.max(bar.barPct, bar.total > 0 ? 10 : 3)}%` }}
                  >
                    <div
                      className="w-full transition-all duration-300 group-hover/bar:brightness-90"
                      style={{
                        height: `${bar.articlePct}%`,
                        backgroundColor: "color-mix(in srgb, var(--accent) 42%, var(--admin-text-primary))",
                      }}
                    />
                    <div
                      className="w-full bg-[var(--accent)] transition-all duration-300 group-hover/bar:brightness-100"
                      style={{ height: `${bar.updatePct}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-[var(--admin-text-secondary)]">
                    {bar.label}
                  </span>
                  <span className="text-[9px] text-[var(--admin-text-secondary)] -mt-1">
                    {bar.dateLabel}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-[var(--admin-border)] flex items-center justify-between">
            <span className="text-xs text-[var(--admin-text-secondary)]">
              {weeklyBars.reduce((total, bar) => total + bar.total, 0)} uploads in 7 days
            </span>
            <Link
              to={`${basePath}/dashboard/news`}
              className="text-xs font-semibold text-[var(--accent)] hover:underline inline-flex items-center gap-1"
            >
              <span>Manage</span>
              <ArrowRight size={11} />
            </Link>
          </div>
        </div>

        {/* Content Spread Donut / Arc Meter */}
        <div className="rounded-2xl p-5 bg-[var(--admin-card-bg)] border border-[var(--admin-border)] flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-2xl bg-theme-accent/ text-[var(--accent)] flex items-center justify-center shrink-0">
                  <PieChart size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-[var(--admin-text-primary)] text-sm leading-none">
                    Content Spread
                  </h3>
                  <p className="text-[10px] text-[var(--admin-text-secondary)] mt-1">
                    Distribution by article status
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-[var(--accent)] bg-theme-accent/ border border-white/[0.06] px-2 py-0.5 rounded-full">
                {totalNewsCount} total
              </span>
            </div>

            {/* Centered Bigger Circular Meter / Arc */}
            <div className="flex flex-col items-center justify-center mt-3">
              <div className="relative w-36 h-36 sm:w-40 sm:h-40 flex items-center justify-center">
                <svg
                  viewBox="0 0 140 140"
                  className="w-full h-full -rotate-90"
                >
                  {/* Background Track */}
                  <circle
                    cx="70"
                    cy="70"
                    r={RING_R}
                    fill="none"
                    strokeWidth="11"
                    stroke="var(--admin-border)"
                  />
                  {/* Draft (red) */}
                  <circle
                    cx="70"
                    cy="70"
                    r={RING_R}
                    fill="none"
                    strokeWidth="11"
                    stroke="rgba(239,68,68,0.85)"
                    strokeDasharray={`${draftDash} ${RING_C}`}
                    strokeDashoffset={0}
                    strokeLinecap="round"
                  />
                  {/* Pending (yellow) */}
                  <circle
                    cx="70"
                    cy="70"
                    r={RING_R}
                    fill="none"
                    strokeWidth="11"
                    stroke="rgba(234,179,8,0.95)"
                    strokeDasharray={`${pendDash} ${RING_C}`}
                    strokeDashoffset={-draftDash}
                    strokeLinecap="round"
                  />
                  {/* Published (accent) */}
                  <circle
                    cx="70"
                    cy="70"
                    r={RING_R}
                    fill="none"
                    strokeWidth="11"
                    stroke="var(--accent)"
                    strokeDasharray={`${pubDash} ${RING_C}`}
                    strokeDashoffset={-(draftDash + pendDash)}
                    strokeLinecap="round"
                  />
                </svg>

                {/* Inner Content Label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
                  <span className="text-2xl sm:text-3xl font-extrabold text-[var(--admin-text-primary)] tracking-tight leading-none">
                    {totalNewsCount > 0 ? Math.round(pubPct * 100) : 0}%
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--accent)] mt-0.5">
                    LIVE
                  </span>
                  <span className="text-[10px] text-[var(--admin-text-secondary)] mt-0.5">
                    {publishedCount} of {totalNewsCount}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Chips Legend (Mobile Friendly) */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mt-2 pt-3 border-t border-[var(--admin-border)]">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-theme-accent/ border border-white/[0.06] text-[11px] font-medium text-[var(--admin-text-primary)]">
                <span className="w-2 h-2 rounded-full bg-[var(--accent)] shrink-0 shadow-[0_0_6px_var(--accent)]" />
                <span>Published</span>
                <span className="font-bold text-[var(--accent)] ml-0.5">{publishedCount}</span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[11px] font-medium text-[var(--admin-text-primary)]">
                <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                <span>Pending</span>
                <span className="font-bold text-amber-400 ml-0.5">{pendingCount}</span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-[11px] font-medium text-[var(--admin-text-primary)]">
                <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                <span>Draft</span>
                <span className="font-bold text-red-400 ml-0.5">{draftCount}</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-[var(--admin-border)] flex items-center justify-between">
            <span className="text-xs text-[var(--admin-text-secondary)]">
              {totalNewsCount} total items
            </span>
            <Link
              to={`${basePath}/dashboard/news`}
              className="text-xs font-semibold text-[var(--accent)] hover:underline inline-flex items-center gap-1"
            >
              <span>Manage</span>
              <ArrowRight size={11} />
            </Link>
          </div>
        </div>

        {/* Team Members */}
        <div className="rounded-2xl p-5 bg-[var(--admin-card-bg)] border border-[var(--admin-border)] flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-2xl bg-theme-accent/ text-[var(--accent)] flex items-center justify-center shrink-0">
                  <Users size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-[var(--admin-text-primary)] text-sm">
                    Team Members
                  </h3>
                  <p className="text-[10px] text-[var(--admin-text-secondary)]">
                    Active staff
                  </p>
                </div>
              </div>
              <Link
                to={`${basePath}/dashboard/team`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--admin-text-secondary)] hover:text-[var(--accent)] transition-colors"
              >
                <span>View all</span>
                <ArrowRight size={12} />
              </Link>
            </div>

            <div className="flex flex-col gap-1.5">
              {(team || []).slice(0, 4).map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-[var(--admin-input-bg)] transition-colors"
                >
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-xl overflow-hidden shrink-0 bg-[var(--admin-input-bg)] border border-[var(--admin-border)] flex items-center justify-center relative">
                    {member.image ? (
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          const fallback = e.currentTarget.parentElement?.querySelector(".member-initials");
                          if (fallback) fallback.classList.remove("hidden");
                        }}
                      />
                    ) : null}
                    <span className={`member-initials text-[10px] font-bold text-[var(--accent)] ${member.image ? "hidden" : ""}`}>
                      {initials(member.name)}
                    </span>
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[var(--admin-text-primary)] truncate">
                      {member.name}
                    </p>
                    <p className="text-[10px] text-[var(--admin-text-secondary)] truncate">
                      {member.role}
                    </p>
                  </div>
                </div>
              ))}

              {(team || []).length === 0 && (
                <div className="flex flex-col items-center justify-center py-4 opacity-60">
                  <Users size={18} className="text-[var(--admin-text-secondary)] mb-1" />
                  <p className="text-xs text-[var(--admin-text-secondary)]">No team members</p>
                </div>
              )}
            </div>
          </div>

          <Link
            to={`${basePath}/dashboard/team`}
            className="flex items-center justify-center gap-1.5 py-2 rounded-2xl border border-[var(--admin-border)] hover:border-theme-accent/ hover:bg-theme-accent/ text-xs font-semibold text-[var(--admin-text-secondary)] hover:text-[var(--accent)] transition-all"
          >
            <Plus size={13} />
            <span>Add Member</span>
          </Link>
        </div>
      </div>

      {/* ── ROW 4: Changelog Panel (full-width) ──────────────────────────── */}
      <ChangelogPanel
        changelogs={changelogs}
        onMajorClick={handleOpenLogModal}
        onLogClick={handleOpenLogModal}
      />

      <ArticleSystemModal
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        log={selectedLog}
        role={user?.role}
      />
    </div>
  );


};

export default Dashboard;

