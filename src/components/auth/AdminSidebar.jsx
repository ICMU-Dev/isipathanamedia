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
  Bell,
  Wrench,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useData } from "../../context/DataContext";
import { useNotification } from "../../context/NotificationContext";
import MainLogos from "../../assets/main-logos.png";
import ActiveAdmins from "../layout/ActiveAdmins";
import NotificationDropdown from "../layout/NotificationDropdown";
import { UserAvatar } from "../ui/avatar";
// eslint-disable-next-line no-unused-vars -- motion components are used in JSX.
import { motion, AnimatePresence } from "framer-motion";
import {
  isAdmin,
  isSuperAdmin,
  isWriter,
  canAccessBroadcastDashboard,
  getBroadcasterAdminUrl,
} from "../../utils/roles";

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
  const { notifications, unreadFeedbacksCount, unreadMessagesCount } = useNotification();

  const role = user?.role;
  const isSuper = isSuperAdmin(role);
  const isAdm = isAdmin(role);
  const isWrit = isWriter(role) && !isAdm;
  const hasBroadcasterAccess = canAccessBroadcastDashboard(role);
  const basePath = `/${adminPath}`;
  const toolsActive = location.pathname.startsWith(`${basePath}/dashboard/tools`);

  const pendingCount = news?.filter((n) => n.status === "pending").length || 0;
  const showAttentionBadge = isAdm && pendingCount > 0;

  const unreadFeedbacks =
    unreadFeedbacksCount ??
    (notifications?.filter((n) => (n.isFeedback || n.category === "feedback") && !n.read).length || 0);
  const unreadMessages =
    unreadMessagesCount ??
    (notifications?.filter((n) => (n.isInbox || n.category === "inbox") && !n.read).length || 0);

  const showSettingsBadge = isAdm && unreadFeedbacks > 0;
  const showMessagesBadge = isAdm && unreadMessages > 0;


  const isActive = (path) => location.pathname === path || (path === `${basePath}/dashboard/tools` && toolsActive);

  // On mobile (isOpen), always show full sidebar regardless of isCollapsed
  const collapsed = isCollapsed && !isOpen;

  // Dynamic Navigation Items based on verified clearance
  const allNavItems = [
    {
      name: "Overview",
      path: `${basePath}/dashboard`,
      icon: <LayoutDashboard size={18} />,
      roles: ["admin", "super_admin", "writer"],
    },
    {
      name: "Newsroom",
      path: `${basePath}/dashboard/news`,
      icon: <Newspaper size={18} />,
      roles: ["admin", "super_admin", "writer"],
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
    ...(hasBroadcasterAccess
      ? [
          {
            name: "Broadcast Hub",
            path: getBroadcasterAdminUrl(adminPath || user?.indexNumber, user),
            icon: <Radio size={18} className="text-red-400" />,
            roles: ["admin", "super_admin"],
            external: true,
          },
        ]
      : []),
    {
      name: "Tools",
      path: `${basePath}/dashboard/tools`,
      icon: <Wrench size={18} />,
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
  const normalizedRole = isSuper
    ? "super_admin"
    : isWrit
      ? "writer"
      : "admin";
  const navItems = allNavItems.filter((item) =>
    item.roles.includes(normalizedRole),
  );
  const navGroups = [
    { name: 'Workspace', items: ['Overview', 'Newsroom', 'Team'] },
    { name: 'Communication', items: ['Messages', 'Live Stream', 'Broadcast Hub'] },
    { name: 'Utilities & account', items: ['Tools', 'Profile', 'Settings'] },
  ].map(group => ({ ...group, items: navItems.filter(item => group.items.includes(item.name)) }))
    .filter(group => group.items.length > 0);

  return (
    <aside
      className={`fixed top-0 left-0 z-50 flex flex-col h-[100dvh] pt-5 pb-5 lg:py-4 transition-all duration-300 ease-out border-r lg:translate-x-0 bg-[var(--admin-card-bg,#111)] border-[var(--admin-border,rgba(255,255,255,0.08))] text-[var(--admin-text-primary,#fff)] ${
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
      <div className="px-4 mb-5 lg:mb-4 relative group">
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
              className="hidden lg:flex items-center justify-center p-1.5 rounded-2xl text-theme-primary opacity-25 hover:text-theme-primary hover:bg-white/[0.05] group-hover:opacity-100 transition-all duration-200 cursor-pointer"
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
      <div className="mx-4 border-t border-theme-base mb-3" />

      {/* Navigation */}
      <div className="min-h-0 flex-1 px-3 overflow-y-auto scrollbar-hide">
        <nav aria-label="Admin navigation">
          {navGroups.map((group, index) => <div key={group.name} className={index ? 'mt-3 border-t border-theme-base pt-3' : ''}>
            {!collapsed && <p className="mb-1.5 px-3 text-[9px] font-semibold uppercase tracking-[0.14em] text-theme-primary opacity-35">{group.name}</p>}
            <div className="space-y-0.5">
          {group.items.map((item) => {
            const isExternal = item.external || (typeof item.path === 'string' && item.path.startsWith('http'));
            const active = !isExternal && isActive(item.path);

            const content = (
              <>
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
                      className="text-[13px] lg:text-xs whitespace-nowrap overflow-hidden flex-1 flex items-center justify-between">
                      <span>{item.name}</span>
                      {isExternal && (
                        <ExternalLink size={12} className="opacity-40 group-hover:opacity-80 ml-1.5 shrink-0" />
                      )}
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
              </>
            );

            const className = `group flex min-h-11 lg:min-h-9 items-center gap-3 lg:gap-2.5 px-3 py-2.5 lg:py-2 rounded-xl transition-all duration-150 relative focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)] ${
              collapsed ? "justify-center" : ""
            } ${
              active
                ? item.name === "Live Stream"
                  ? "bg-red-600/10 text-theme-primary font-medium"
                  : "bg-[color:var(--accent)]/10 text-theme-primary font-medium"
                : "text-theme-primary opacity-55 hover:bg-[var(--admin-border)] hover:opacity-100"
            }`;

            if (isExternal) {
              return (
                <a
                  key={item.path}
                  href={item.path}
                  onClick={(e) => {
                    e.preventDefault();
                    if (onClose) onClose();
                    window.location.replace(item.path);
                  }}
                  title={collapsed ? item.name : undefined}
                  className={className}>
                  {content}
                </a>
              );
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                aria-current={active ? 'page' : undefined}
                onClick={onClose}
                title={collapsed ? item.name : undefined}
                className={className}>
                {content}
              </Link>
            );
          })}
            </div>
          </div>)}
        </nav>

      </div>

      {/* Notifications & Activity */}
      <div className="px-4 mb-2 mt-3 lg:mt-2 shrink-0">
        <NotificationDropdown isCollapsed={collapsed} />
      </div>

      {/* Active Admins */}
      <div className="px-4 mb-2 lg:mb-1 shrink-0">
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
                <div className="flex items-center gap-3 px-2 py-2 mb-2 lg:mb-1">
                  <UserAvatar
                    user={user}
                    size="default"
                    className="bg-white/[0.08] border border-white/5 shrink-0"
                    fallbackClassName="text-[11px] font-semibold text-theme-primary opacity-70"
                  />
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
