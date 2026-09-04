import React, { useState, useEffect } from "react";
import { Outlet, Link, useParams, useLocation } from "react-router-dom";
import AdminSidebar from "../auth/AdminSidebar";
import { useAuth } from "../../context/AuthContext";
import { ThemeProvider } from "../../context/ThemeContext";
import { NotificationProvider } from "../../context/NotificationContext";
import { ShieldAlert, ArrowLeft, Menu } from "lucide-react";
import ActiveAdmins from "./ActiveAdmins";
import BottomNavbar from "./BottomNavbar";
import MobileHeader from "./MobileHeader";
import { AnimatePresence } from "framer-motion";
import PageTransition from "../ui/PageTransition";
import MaintenanceBanner from "./MaintenanceBanner";
import FeedbackWidget from "../admin/FeedbackWidget";
import PWAInstallModal from "../admin/PWAInstallModal";
import Loader from "../ui/Loader";
import {
  canAccessAdminDashboard,
  isAdmin as checkIsAdmin,
  isWriter as checkIsWriter,
  getDefaultDashboardPath,
} from "../../utils/roles";

const AdminLayout = () => {
  const { user } = useAuth();
  const { adminPath } = useParams();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      const stored = localStorage.getItem("icmu_admin_sidebar_collapsed");
      return stored ? JSON.parse(stored) : false;
    } catch {
      return false;
    }
  });

  const role = user?.role;
  const hasAdminDashboardAccess = canAccessAdminDashboard(role);
  const isWriterOnly = checkIsWriter(role) && !checkIsAdmin(role);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [location.pathname]);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(
          "icmu_admin_sidebar_collapsed",
          JSON.stringify(next),
        );
      } catch (e) {
        console.error("Failed to store collapse preference", e);
      }
      return next;
    });
  };

  // Restrict access if not authorized for admin dashboard
  if (!hasAdminDashboardAccess) {
    const returnPath = getDefaultDashboardPath(role, adminPath);
    return (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-[color:var(--admin-bg)] text-center px-4 animate-fade-in">
        <ShieldAlert
          size={48}
          className="text-[color:var(--accent)] mb-6 animate-pulse"
        />
        <h2 className="text-2xl font-semibold tracking-tight text-theme-primary mb-2">
          Area Restricted
        </h2>
        <p className="text-sm text-theme-primary opacity-70 mb-8 max-w-md">
          Your clearance [{role || "unknown"}] is restricted. Access to the Main
          Admin Dashboard is denied.
        </p>
        <Link
          to={returnPath}
          className="flex items-center justify-center gap-3 px-6 min-h-[44px] admin-card border-theme hover:bg-[var(--admin-border)] opacity-80 text-theme-primary rounded-2xl transition-all duration-200 text-sm font-medium hover:scale-[1.02] active:scale-95">
          <ArrowLeft size={18} />
          Return to Authorized Zone
        </Link>
      </div>
    );
  }

  // Strict Route Guard for Writers
  if (isWriterOnly) {
    const allowedWriterPaths = [
      `/${adminPath}/dashboard`,
      `/${adminPath}/dashboard/news`,
      `/${adminPath}/dashboard/news/create`,
      `/${adminPath}/dashboard/settings`,
      `/${adminPath}/dashboard/profile`,
    ];
    // Writers can also access edit pages: /admin/dashboard/news/edit/:id and edit-update/:id
    const isEditPage =
      location.pathname.startsWith(`/${adminPath}/dashboard/news/edit/`) ||
      location.pathname.startsWith(`/${adminPath}/dashboard/news/edit-update/`);

    // Explicitly deny these specific paths
    const deniedPaths = [
      `/${adminPath}/dashboard/news/update`,
      `/${adminPath}/dashboard/team`,
      `/${adminPath}/dashboard/messages`,
      `/${adminPath}/dashboard/live`,
    ];

    if (
      deniedPaths.some((p) => location.pathname === p) ||
      (!allowedWriterPaths.includes(location.pathname) && !isEditPage)
    ) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-[color:var(--admin-bg)] text-center px-4 animate-fade-in">
          <ShieldAlert
            size={48}
            className="text-[color:var(--accent)] mb-6 animate-pulse"
          />
          <h2 className="text-2xl font-semibold tracking-tight text-theme-primary mb-2">
            Access Denied
          </h2>
          <p className="text-sm text-theme-primary opacity-70 mb-8 max-w-md">
            Writers do not have permission to view or modify this section.
          </p>
          <Link
            to={`/${adminPath}/dashboard`}
            className="flex items-center justify-center gap-3 px-6 min-h-[44px] admin-card border-theme hover:bg-[var(--admin-border)] opacity-80 text-theme-primary rounded-2xl transition-all duration-200 text-sm font-medium hover:scale-[1.02] active:scale-95">
            <ArrowLeft size={18} />
            Back to Dashboard
          </Link>
        </div>
      );
    }
  }

  return (
    <ThemeProvider>
      <NotificationProvider>
        <div className="min-h-[100dvh] overflow-x-hidden transition-colors duration-200 relative bg-[var(--admin-bg,#000)] text-[var(--admin-text-primary,#ffffff)] font-[var(--admin-font,'Montserrat',sans-serif)]">
          <PWAInstallModal />
          <MobileHeader />

          {/* Mobile Sidebar Backdrop */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-40 backdrop-blur-sm lg:hidden transition-opacity duration-300 ease-out"
              style={{ backgroundColor: "color-mix(in srgb, var(--admin-bg) 80%, transparent)" }}
              onClick={(e) => {
                e.stopPropagation();
                setSidebarOpen(false);
              }}
            />
          )}

          {/* Admin Sidebar */}
          <div className="z-50">
            <AdminSidebar
              isOpen={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
              isCollapsed={isCollapsed}
              onToggleCollapse={toggleCollapse}
            />
          </div>

          {/* Main Content Area */}
          <main
            className={`relative z-10 lg:px-8  sm:py-6 lg:py-8 p-4 pb-20 md:pb-8 transition-all duration-300 ease-out ${
              isCollapsed ? "lg:ml-20" : "lg:ml-64"
            }`}>
            <div className="max-w-[1600px] mx-auto" style={{ contentVisibility: 'auto', containIntrinsicSize: '1000px' }}>
              <MaintenanceBanner />
              <AnimatePresence mode="wait">
                <PageTransition key={location.pathname}>
                  <React.Suspense fallback={<Loader />}>
                    <Outlet />
                  </React.Suspense>
                </PageTransition>
              </AnimatePresence>
            </div>
          </main>

          <BottomNavbar />
          <FeedbackWidget />

          {/* bottom navnar shade */}
          <div 
            className="md:hidden h-[120px] fixed bottom-0 left-0 right-0 z-50 pointer-events-none"
            style={{
              background: "linear-gradient(to bottom, transparent 0%, color-mix(in srgb, var(--admin-bg) 90%, transparent) 100%)"
            }}
          ></div>
        </div>
      </NotificationProvider>
    </ThemeProvider>
  );
};

export default AdminLayout;
