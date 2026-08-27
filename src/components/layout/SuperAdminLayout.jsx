import React, { useEffect } from "react";
import { Outlet, Link, useParams, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { NotificationProvider } from "../../context/NotificationContext";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import MaintenanceBanner from "./MaintenanceBanner";
import Loader from "../ui/Loader";

const SuperAdminLayout = () => {
  const { user } = useAuth();
  const { adminPath } = useParams();
  const location = useLocation();
  const role = user?.role?.toLowerCase();
  const isSuperAdmin = role === "super-admin" || role === "superadmin";

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [location.pathname]);

  if (!isSuperAdmin) {
    // Determine where to send them back based on their actual role
    const returnPath = `/${adminPath}/dashboard`;

    return (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-ambient text-center px-4">
        <ShieldAlert
          size={64}
          className="text-red-600/50 mb-6 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse"
        />
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white uppercase mb-2">
          Unauthorized Clearance
        </h2>
        <p className="text-white/70 text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] mb-8 max-w-md">
          Target destination requires Super Administrator privileges. Your
          current role [{role || "unknown"}] is insufficient.
        </p>
        <Link
          to={returnPath}
          className="flex items-center gap-3 px-6 py-4 bg-white/10 hover:bg-white text-white hover:text-dark rounded-2xl transition-all duration-300 text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 shadow-xl">
          <ArrowLeft size={16} />
          Return to Authorized Zone
        </Link>
      </div>
    );
  }

  return (
    <NotificationProvider>
      <div className="overflow-x-hidden relative min-h-[100dvh] font-sans text-white bg-ambient ">
        {/* Noise Overlay */}
        <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]"></div>

        <main className="relative z-10 w-full min-h-[100dvh] animate-fade-in">
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

export default SuperAdminLayout;
