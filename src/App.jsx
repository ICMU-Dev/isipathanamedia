import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { DataProvider } from "./context/DataContext";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "sonner";

// Shared layouts — keep eager (small, always needed)
import MainLayout from "./components/layout/MainLayout";

// Minimal loading fallback
const PageLoader = () => (
  <div className="min-h-[100dvh] bg-black flex items-center justify-center">
    <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

// Public pages
const LandingPage = React.lazy(() => import("./pages/landing-page/LandingPage"));
const AboutPage = React.lazy(() => import("./pages/landing-page/AboutPage"));
const NotificationRedirect = React.lazy(() => import("./pages/admin/NotificationRedirect"));
const NewsPage = React.lazy(() => import("./pages/landing-page/NewsPage"));
const ArticleViewer = React.lazy(() => import("./pages/landing-page/ArticleViewer"));
const AuthorPage = React.lazy(() => import("./pages/landing-page/AuthorPage"));
const LivePage = React.lazy(() => import("./pages/landing-page/LivePage"));
const ShareTargetHandler = React.lazy(() => import("./pages/ShareTargetHandler"));

// Nethinethera (heavy — OGL, FuzzyText, canvas effects)
const NethinetheraPage = React.lazy(
  () => import("./pages/nethinethera/NethinetheraPage"),
);

const NethinetheraLayout = React.lazy(
  () => import("./components/layout/NethinetheraLayout"),
);

//ROLES-ADMIN PANELS
const SuperAdminLayout = React.lazy(
  () => import("./components/layout/SuperAdminLayout"),
);
const MasterDashboard = React.lazy(
  () => import("./pages/super-admin/MasterDashboard"),
);
const BroadcasterLayout = React.lazy(
  () => import("./components/layout/BroadcasterLayout"),
);
const BroadcasterDashboard = React.lazy(
  () => import("./pages/broadcaster/BroadcasterDashboard"),
);

// Admin pages
const AdminLayout = React.lazy(() => import("./components/layout/AdminLayout"));
const Dashboard = React.lazy(() => import("./pages/admin/Dashboard"));
const ManageNews = React.lazy(() => import("./pages/admin/ManageNews"));
const CreateArticle = React.lazy(() => import("./pages/admin/CreateArticle"));
const CreateUpdate = React.lazy(() => import("./pages/admin/CreateUpdate"));
const ManageTeam = React.lazy(() => import("./pages/admin/ManageTeam"));
const AdminMessages = React.lazy(() => import("./pages/admin/AdminMessages"));
const Settings = React.lazy(() => import("./pages/admin/Settings"));
const LiveStreamSettings = React.lazy(() => import("./pages/admin/LiveStreamSettings"));
const UserProfile = React.lazy(() => import("./pages/admin/UserProfile"));
const GoogleCallbackHandler = React.lazy(() => import("./pages/admin/GoogleCallbackHandler"));
const NotFoundPage = React.lazy(() => import("./pages/NotFoundPage"));
const ProtectedRoute = React.lazy(
  () => import("./components/auth/ProtectedRoute"),
);

const FeedbackWidget = React.lazy(
  () => import("./components/admin/FeedbackWidget"),
);

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <Suspense fallback={<PageLoader />}>
            <FeedbackWidget />
            <Routes>
              {/* Direct Routes */}
              <Route path="/auth/google/callback" element={<GoogleCallbackHandler />} />
              <Route path="/share-target" element={<ShareTargetHandler />} />

              {/* Nethinethera Public Portal (Smooth Scrolling) */}
              <Route element={<NethinetheraLayout />}>
                <Route path="/nethinethera" element={<NethinetheraPage />} />
              </Route>

              {/* Public Website Routes (Shared Layout) */}
              <Route element={<MainLayout />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/admin-redirect" element={<NotificationRedirect />} />
                <Route path="/news" element={<NewsPage />} />
                <Route path="/news/:id" element={<ArticleViewer />} />
                <Route path="/author/:authorName" element={<AuthorPage />} />
                <Route path="/author" element={<AuthorPage />} />
                <Route path="/live" element={<LivePage />} />
                                              </Route>

              {/* Protected Admin Panel Routes with inline Login handling */}
              <Route path="*" element={<NotFoundPage />} />
              <Route path="/:adminPath" element={<ProtectedRoute />}>
                {/* 1. Super Admin Hub (No Sidebar) */}
                <Route element={<SuperAdminLayout />}>
                  <Route index element={<MasterDashboard />} />
                </Route>
                {/* 2. Main Admin Branch (With Sidebar) */}
                <Route path="dashboard" element={<AdminLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="news" element={<ManageNews />} />
                  <Route path="news/create" element={<CreateArticle />} />
                  <Route path="news/edit/:id" element={<CreateArticle />} />
                  <Route path="news/update" element={<CreateUpdate />} />
                  <Route path="news/edit-update/:id" element={<CreateUpdate />} />
                  <Route path="team" element={<ManageTeam />} />
                  <Route path="messages" element={<AdminMessages />} />
                  <Route path="live" element={<LiveStreamSettings />} />
                                                      <Route path="settings" element={<Settings />} />
                  <Route path="profile" element={<UserProfile />} />
                </Route>
                {/* 3. Broadcaster Operations Branch */}
                <Route path="broadcast" element={<BroadcasterLayout />}>
                  <Route index element={<BroadcasterDashboard />} />
                </Route>

              </Route>
            </Routes>
          </Suspense>
        </Router>
        <div className="fixed inset-0 z-[99999] pointer-events-none">
          <Toaster theme="dark" position="top-center" className="pointer-events-auto" />
        </div>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;

