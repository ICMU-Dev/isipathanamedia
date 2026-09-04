import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Radio, LogOut, ShieldCheck, Layers, ExternalLink, ArrowRight, ArrowLeft } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { AnimatedBadge } from "../../components/motion/animated-badge";
import {
  canAccessAdminDashboard,
  canAccessSuperAdminDashboard,
  getRoleLabel,
  getBroadcasterAdminUrl,
  getBroadcasterBaseUrl,
} from "../../utils/roles";

const BroadcasterDashboard = () => {
  const { adminPath } = useParams();
  const { user, logout } = useAuth();
  const [countdown, setCountdown] = useState(2);

  const basePath = `/${adminPath}`;
  const hasAdminAccess = canAccessAdminDashboard(user?.role);
  const hasSuperAdminAccess = canAccessSuperAdminDashboard(user?.role);

  const targetUrl = getBroadcasterAdminUrl(adminPath || user?.indexNumber, user);

  useEffect(() => {
    // Auto-redirect timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.replace(targetUrl);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [targetUrl]);

  return (
    <div className="min-h-screen bg-[#000000] w-full text-zinc-100 font-sans relative">
      <div className="w-full max-w-5xl mx-auto px-6 sm:px-8 py-10 space-y-8 animate-fade-in pb-32">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 mb-2">
              <Radio size={16} className="text-red-500 animate-pulse" />
              <span className="text-[10px] sm:text-xs uppercase tracking-widest text-zinc-400 font-bold select-none">
                Broadcaster Terminal
              </span>
              <AnimatedBadge
                status="neutral"
                size="sm"
                className="uppercase tracking-widest text-[9px] font-mono">
                {getRoleLabel(user?.role)}
              </AnimatedBadge>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Broadcasting Dispatch
            </h2>
            <p className="text-zinc-500 font-medium text-xs sm:text-sm max-w-md">
              Logged in as {user?.name || "Operator"} ({user?.indexNumber || adminPath})
            </p>
          </div>

          <div className="flex items-center gap-3">
            {hasSuperAdminAccess && (
              <Link
                to={basePath}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-xs font-bold transition-all border border-white/10">
                <ShieldCheck size={14} />
                <span className="hidden sm:inline">Super Admin</span>
              </Link>
            )}

            {hasAdminAccess && (
              <Link
                to={`${basePath}/dashboard`}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-xs font-bold transition-all border border-white/10">
                <Layers size={14} />
                <span className="hidden sm:inline">Admin Dashboard</span>
              </Link>
            )}

            <button
              onClick={logout}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-zinc-950 border border-white/5 flex items-center justify-center text-red-600 hover:bg-red-600/10 hover:border-red-600/50 transition-all shadow-lg shrink-0"
              title="Log Out">
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* Dynamic Redirect Card */}
        <div className="min-h-[380px] rounded-3xl border border-white/10 bg-zinc-950/80 p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-[90px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

          <div className="w-20 h-20 rounded-full bg-red-600/10 border border-red-600/30 flex items-center justify-center text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
            <Radio size={36} className="text-red-500 animate-pulse" />
          </div>

          <div className="space-y-2 max-w-lg">
            <h3 className="text-2xl font-bold text-white tracking-tight">
              Redirecting to FM Vibhavi Terminal
            </h3>
            <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
              Dispatching operator session to the external broadcasting engineering console at{" "}
              <span className="font-mono text-white bg-white/10 px-2 py-0.5 rounded text-xs">
                {getBroadcasterBaseUrl()}/{adminPath || user?.indexNumber || "000000"}
              </span>
            </p>
            {countdown > 0 ? (
              <p className="text-[11px] uppercase tracking-widest text-zinc-500 font-mono pt-2">
                Automated redirection in {countdown}s...
              </p>
            ) : (
              <p className="text-[11px] uppercase tracking-widest text-red-400 font-mono pt-2 animate-pulse">
                Redirecting now...
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => window.location.replace(targetUrl)}
              className="flex items-center gap-2.5 px-7 py-3.5 bg-white text-black hover:bg-zinc-200 font-bold rounded-2xl transition-all duration-200 text-xs uppercase tracking-wider shadow-lg hover:scale-[1.02] active:scale-95 cursor-pointer">
              <span>Launch Terminal Now</span>
              <ArrowRight size={15} />
            </button>

            <Link
              to={hasSuperAdminAccess ? basePath : hasAdminAccess ? `${basePath}/dashboard` : "/"}
              className="flex items-center gap-2 px-5 py-3.5 bg-white/5 hover:bg-white/10 text-zinc-300 font-medium rounded-2xl transition-all duration-200 text-xs uppercase tracking-wider border border-white/5">
              <ArrowLeft size={14} />
              <span>Stay on ICMU Web</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BroadcasterDashboard;
