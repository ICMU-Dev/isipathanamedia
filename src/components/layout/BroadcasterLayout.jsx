import React, { useEffect } from "react";
import { Outlet, Link, useParams, useLocation } from "react-router-dom";
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

    return (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-[#050505] text-center px-4">
        <div className="w-20 h-20 bg-red-600/10 rounded-full flex items-center justify-center border border-red-600/20 mb-6 shadow-[0_0_40px_rgba(239,68,68,0.2)]">
          <ShieldAlert size={38} className="text-red-600 animate-pulse" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white uppercase mb-2">
          Clearance Insufficient
        </h2>
        <p className="text-zinc-400 text-xs sm:text-sm font-medium tracking-wide mb-8 max-w-md">
          Broadcasting Operations Terminal requires Broadcaster clearance. Your current clearance level does not authorize access.
        </p>
        <Link
          to={returnPath}
          className="flex items-center gap-2.5 px-6 py-3.5 bg-white text-black hover:bg-zinc-200 font-bold rounded-2xl transition-all duration-200 text-xs uppercase tracking-wider shadow-lg hover:scale-[1.02] active:scale-95">
          <ArrowLeft size={16} />
          Return to Authorized Terminal
        </Link>
      </div>
    );
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
