import React, { useEffect } from "react";
import { Outlet, Link, useParams, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { NotificationProvider } from "../../context/NotificationContext";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import MaintenanceBanner from "./MaintenanceBanner";
import Loader from "../ui/Loader";
import { canAccessBroadcastDashboard, getDefaultDashboardPath } from "../../utils/roles";

const BroadcasterLayout = () => {
  const { user } = useAuth();
  const { adminPath } = useParams();
  const location = useLocation();
  const role = user?.role;
  const isAuthorized = canAccessBroadcastDashboard(role);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [location.pathname]);

  if (!isAuthorized) {
    const returnPath = getDefaultDashboardPath(role, adminPath);
    return <Navigate to={returnPath} replace />;
  }

  return (
    <NotificationProvider>
      <div className="overflow-x-hidden relative min-h-[100dvh] font-sans text-white bg-[#000000]">
        <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>

        <main className="relative z-10 w-full min-h-[100dvh]">
          <div className="max-w-[1600px] mx-auto px-4 pt-4 sm:px-6 lg:px-8">
            <MaintenanceBanner />
          </div>
          <React.Suspense fallback={<Loader />}>
            <Outlet />
          </React.Suspense>
        </main>
      </div>
    </NotificationProvider>
  );
};

export default BroadcasterLayout;
