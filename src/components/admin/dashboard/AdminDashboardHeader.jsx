import React from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import MainLogos from "../../../assets/main-logos.png";
import ActiveAdmins from "../../layout/ActiveAdmins";

const AdminDashboardHeader = ({ user, basePath }) => {
  return (
    <>
      {/* Top Header Section - Desktop */}
      <div className="hidden md:flex items-center justify-between pb-1">
        <div className="space-y-1">
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-[var(--admin-text-primary)]">
            Dashboard
          </h1>
          <p className="text-xs lg:text-sm text-[var(--admin-text-secondary)] max-w-lg">
            Manage your platform's content, team members, and live streams from
            your central command center.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={`${basePath}/dashboard/news/create`}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[var(--accent)] text-black font-semibold text-xs lg:text-sm shadow-[0_2px_12px_rgba(var(--accent-rgb),0.25)] hover:opacity-95 hover:shadow-[0_4px_16px_rgba(var(--accent-rgb),0.35)] active:scale-95 transition-all duration-200"
          >
            <Plus size={16} />
            <span>New Article</span>
          </Link>
        </div>
      </div>

      {/* Mobile-Only Hero Banner (App Style) */}
      <div className="md:hidden relative p-4 rounded-2xl bg-[var(--admin-card-bg)] border border-[var(--admin-border)] overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent)] rounded-full blur-[80px] opacity-15 -translate-y-1/2 translate-x-1/3 -z-10 pointer-events-none" />

        <div className="flex flex-col items-start justify-between gap-1">
          {user?.role?.toLowerCase().includes("super") ? (
            <Link to={basePath}>
              <img
                src={MainLogos}
                alt="ICMU"
                width={60}
                height={41}
                className="w-10 h-auto drop-shadow-md mb-2 hover:scale-105 active:scale-95 transition-transform"
              />
            </Link>
          ) : (
            <img
              src={MainLogos}
              alt="ICMU"
              width={60}
              height={41}
              className="w-10 h-auto drop-shadow-md mb-2"
            />
          )}
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--accent)]">Welcome Back</span>
          <h1 className="text-xl font-bold text-[var(--admin-text-primary)] capitalize">
            {user?.name || "Admin"}
          </h1>
          <p className="text-xs text-[var(--admin-text-secondary)] mt-0.5 mb-3 max-w-xs">
            Manage your platform's content, team members, and live streams from
            your command center.
          </p>
          
          <div className="w-full flex items-center justify-between pt-2 border-t border-[var(--admin-border)]">
            <Link
              to={`${basePath}/dashboard/news/create`}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[var(--accent)] text-black rounded-2xl shadow-[0_4px_14px_rgba(var(--accent-rgb),0.2)] hover:opacity-95 active:scale-95 transition-all text-xs font-bold"
            >
              <Plus size={15} />
              <span>Create</span>
            </Link>

            <div className="flex items-center gap-2 text-xs text-[var(--admin-text-secondary)]">
              <ActiveAdmins
                isCollapsed={false}
                isMobile={true}
                disablePopup={true}
              />{" "}
              <span>Active <br/>Admins</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboardHeader;


