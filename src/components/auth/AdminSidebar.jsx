import React from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  LayoutDashboard,
  Newspaper,
  Users,
  MessageSquare,
  LogOut,
  ExternalLink,
  X,
  User as UserIcon,
  Radio,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useData } from "../../context/DataContext";
import { useNotification } from "../../context/NotificationContext";
import MainLogos from "../../assets/main-logos.png";
import ActiveAdmins from "../layout/ActiveAdmins";
import { motion, AnimatePresence } from "framer-motion";

const AdminSidebar = ({
  isOpen,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const location = useLocation();
  const { adminPath } = useParams();
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const { news, siteConfig } = useData();
  const { notifications } = useNotification();

  const role = user?.role?.toLowerCase();
  const isSuperAdmin =
    role === "super-admin" || role === "superadmin" || role === "super_admin";
  const isAdmin = role === "admin" || isSuperAdmin;
  const isWriter = role === "writer";

  const pendingCount = news?.filter((n) => n.status === "pending").length || 0;
  const showAttentionBadge = isAdmin && pendingCount > 0;

  const unreadFeedbacks =
    notifications?.filter((n) => n.isFeedback && !n.read).length || 0;
  const unreadMessages =
    notifications?.filter((n) => !n.isFeedback && !n.read).length || 0;

  const showSettingsBadge = isAdmin && unreadFeedbacks > 0;
  const showMessagesBadge = isAdmin && unreadMessages > 0;

  const basePath = `/${adminPath}`;
  const isActive = (path) => location.pathname === path;

  // On mobile (isOpen), always show full sidebar regardless of isCollapsed
  const collapsed = isCollapsed && !isOpen;

  // Role-based navigation items
  const allNavItems = [
    {
      name: "Dashboard",
      path: `${basePath}/dashboard`,
      icon: <LayoutDashboard size={18} />,
      roles: ["writer", "admin", "super_admin"],
    },
    {
      name: isWriter ? "My Articles" : "Newsroom",
      path: `${basePath}/dashboard/news`,
      icon: <Newspaper size={18} />,
      roles: ["writer", "admin", "super_admin"],
    },
    {
      name: "Team",
      path: `${basePath}/dashboard/team`,
      icon: <Users size={18} />,
      roles: ["admin", "super_admin"],
    },
    {
      name: "Messages",
      path: `${basePath}/dashboard/messages`,
      icon: <MessageSquare size={18} />,
      roles: ["admin", "super_admin"],
    },
    {
      name: "Live Stream",
      path: `${basePath}/dashboard/live`,
      icon: <Radio size={18} />,
      roles: ["admin", "super_admin"],
    },

    {
      name: "Profile",
      path: `${basePath}/dashboard/profile`,
      icon: <UserIcon size={18} />,
      roles: ["writer", "admin", "super_admin"],
    },
    {
      name: "Settings",
      path: `${basePath}/dashboard/settings`,
      icon: <Settings size={18} />,
      roles: ["super_admin", "admin", "writer"],
    },
  ];

  // Normalize role for matching
  const normalizedRole = isSuperAdmin
    ? "super_admin"
    : isWriter
      ? "writer"
      : "admin";
  const navItems = allNavItems.filter((item) =>
    item.roles.includes(normalizedRole),
  );

  return (
    <aside
      className={`fixed top-0 left-0 z-50 flex flex-col h-[100dvh] pt-5 pb-5 transition-all duration-300 ease-out border-r lg:translate-x-0 bg-[var(--admin-card-bg,#111)] border-[var(--admin-border,rgba(255,255,255,0.08))] text-[var(--admin-text-primary,#fff)] ${
        collapsed ? "lg:w-20" : "lg:w-64"
      } ${isOpen ? "translate-x-0 w-64" : "-translate-x-full w-64 lg:translate-x-0"}`}>
      {/* Mobile Close Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="lg:hidden absolute top-4 right-4 z-10 p-2 transition-colors rounded-2xl opacity-60 hover:opacity-100 active:scale-95 text-[var(--admin-text-primary)]"
        aria-label="Close Sidebar">
        <X size={16} />
      </button>

      {/* Sidebar Header */}
      <div className="px-4 mb-5 relative group">
        <div
          className={`flex items-center ${collapsed ? "justify-center" : "justify-between"}`}>
          <Link
            to={basePath}
            className="flex items-center gap-3 overflow-hidden">
            <img
              src={MainLogos}
              alt="Logo"
              width={53}
              height={36}
              className="h-9 w-auto shrink-0 object-contain transition-all duration-300"
              style={{
                filter:
                  theme?.category === "Light Mode"
                    ? "invert(1) brightness(0.5)"
                    : "none",
              }}
            />
            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="flex flex-col whitespace-nowrap overflow-hidden">
                  <span className="text-theme-primary font-semibold text-[13px] tracking-wide">
                    Admin Portal
                  </span>
                  <span className="text-theme-primary opacity-30 text-[11px]">
                    Isipathana Media
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>

          {/* Desktop Collapse Toggle */}
          {!collapsed && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="hidden lg:flex items-center justify-center p-1.5 rounded-2xl text-theme-primary opacity-25 hover:text-theme-primary hover:bg-white/[0.05] group-hover:opacity-100 transition-all duration-200"
              title="Collapse">
              <PanelLeftClose size={16} />
            </button>
          )}
        </div>

        {/* Collapsed Expand Button */}
        {collapsed && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden lg:flex absolute inset-0 items-center justify-center admin-card bg-opacity-90 rounded-2xl text-theme-primary opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
            title="Expand">
            <PanelLeftOpen
              size={18}
              className="opacity-50 group-hover:opacity-100"
            />
          </button>
        )}
      </div>

      {/* Divider */}
      <div className="mx-4 border-t border-theme-base mb-4" />

      {/* Navigation */}
      <div className="flex-1 px-3 overflow-y-auto scrollbar-hide">
        {!collapsed && (
          <p className="text-[10px] font-medium uppercase tracking-widest text-theme-primary opacity-25 px-3 mb-3">
            Menu
          </p>
        )}

        <nav className="space-y-0.5">
          {navItems.map((item) => {
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                title={collapsed ? item.name : undefined}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all duration-150 relative ${
                  collapsed ? "justify-center" : ""
                } ${
                  active
                    ? item.name === "Live Stream"
                      ? "bg-red-600/10 text-theme-primary font-medium"
                      : "bg-[color:var(--accent)]/10 text-theme-primary font-medium"
                    : "text-theme-primary opacity-45 hover:bg-white/[0.03] hover:text-theme-primary"
                }`}>
                {/* Subtle left accent for active */}
                {active && (
                  <motion.div
                    layoutId="sidebar-active-pill"
                    layout="position"
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    style={{ borderRadius: "0 999px 999px 0" }}
                    className={`absolute left-0 inset-y-0 my-auto w-[3px] h-4 opacity-70 ${
                      item.name === "Live Stream"
                        ? "bg-red-600 shadow-[0_0_8px_rgba(239,68,68,0.6)]"
                        : "bg-[var(--accent)]"
                    }`}
                  />
                )}

                <span
                  className={`shrink-0 transition-colors duration-150 ${
                    active
                      ? item.name === "Live Stream"
                        ? "opacity-80 text-red-600"
                        : "opacity-80 text-[var(--accent)]"
                      : "text-theme-primary opacity-35 group-hover:text-theme-primary"
                  }`}>
                  {item.icon}
                </span>

                <AnimatePresence initial={false}>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      className="text-[13px] tracking-wide whitespace-nowrap overflow-hidden flex-1">
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
                {item.name === "Newsroom" && showAttentionBadge && (
                  <span
                    className={`bg-red-600 rounded-full border border-[var(--admin-card-bg)] shadow-[0_0_8px_rgba(239,68,68,0.6)] ${
                      collapsed
                        ? "absolute -top-0.5 -right-0.5 w-2.5 h-2.5"
                        : "ml-auto w-2 h-2"
                    }`}
                  />
                )}
                {item.name === "Messages" && showMessagesBadge && (
                  <span
                    className={`bg-theme-accent rounded-full border border-[var(--admin-card-bg)] ${
                      collapsed
                        ? "absolute -top-0.5 -right-0.5 w-2.5 h-2.5"
                        : "ml-auto w-2 h-2"
                    }`}
                  />
                )}
                {item.name === "Live Stream" &&
                  siteConfig?.liveStream?.isLive && (
                    <span
                      className={`bg-red-600 rounded-full border border-[var(--admin-card-bg)] shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse ${
                        collapsed
                          ? "absolute -top-0.5 -right-0.5 w-2.5 h-2.5"
                          : "ml-auto w-2 h-2"
                      }`}
                    />
                  )}
                {item.name === "Settings" && showSettingsBadge && (
                  <span
                    className={`bg-red-600 rounded-full border border-[var(--admin-card-bg)] shadow-[0_0_8px_rgba(239,68,68,0.6)] ${
                      collapsed
                        ? "absolute -top-0.5 -right-0.5 w-2.5 h-2.5"
                        : "ml-auto w-2 h-2"
                    }`}
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Active Admins */}
      <div className="px-4 mt-2 mb-2">
        <ActiveAdmins isCollapsed={collapsed} />
      </div>

      {/* Footer / Profile */}
      <div className="px-3 mt-1">
        <div className="border-t border-theme-base pt-3" />
        <div
          className={`rounded-2xl transition-all duration-200 ${
            collapsed ? "flex flex-col items-center gap-1.5 px-1" : "px-1"
          }`}>
          <AnimatePresence mode="wait" initial={false}>
            {!collapsed ? (
              <motion.div
                key="expanded"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, display: "none" }}
                transition={{ duration: 0.15 }}>
                {/* User Info */}
                <div className="flex items-center gap-3 px-2 py-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-white/[0.08] flex items-center justify-center text-[11px] font-semibold text-theme-primary opacity-70 shrink-0 overflow-hidden border border-white/5 relative">
                    <span className="absolute flex items-center justify-center w-full h-full">
                      {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
                    </span>
                    {user?.avatarUrl && (
                      <img
                        src={user.avatarUrl}
                        alt={user.name || "User Avatar"}
                        className="w-full h-full object-cover relative z-10"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-theme-primary opacity-80 truncate">
                      {user?.name || "Administrator"}
                    </p>
                    <p className="text-[10px] text-theme-primary opacity-30 capitalize">
                      {user?.role || "Operator"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  <Link
                    to="/"
                    className="flex items-center justify-center gap-1.5 py-2 bg-white/[0.03] hover:bg-white/[0.06] text-theme-primary opacity-50 hover:text-theme-primary rounded-2xl transition-colors text-[11px] font-medium">
                    <ExternalLink size={12} />
                    Website
                  </Link>
                  <button
                    type="button"
                    onClick={logout}
                    className="flex items-center justify-center gap-1.5 py-2 bg-white/[0.03] hover:bg-red-600/10 text-theme-primary opacity-50 hover:text-red-400 rounded-2xl transition-colors text-[11px] font-medium">
                    <LogOut size={12} />
                    Logout
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="collapsed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, display: "none" }}
                transition={{ duration: 0.15 }}
                className="flex flex-col gap-1.5">
                <Link
                  to="/"
                  title="Website"
                  className="w-9 h-9 flex items-center justify-center rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] text-theme-primary opacity-40 hover:text-theme-primary transition-colors">
                  <ExternalLink size={15} />
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  title="Logout"
                  className="w-9 h-9 flex items-center justify-center rounded-2xl bg-white/[0.03] hover:bg-red-600/10 text-theme-primary opacity-40 hover:text-red-400 transition-colors">
                  <LogOut size={15} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
