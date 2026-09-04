import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useParams, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Newspaper,
  Users,
  MessageSquare,
  Settings,
  User as UserIcon,
  Radio,
  GripHorizontal,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { useNotification } from "../../context/NotificationContext";
import GlassSurface from "../ui/GlassSurface";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { MorphingModal } from "../motion/morphing-modal";
import {
  isAdmin,
  isSuperAdmin,
  isWriter,
  canAccessBroadcastDashboard,
  getBroadcasterAdminUrl,
} from "../../utils/roles";

const BottomNavbar = () => {
  const location = useLocation();
  const { adminPath } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showMore, setShowMore] = useState(false);

  // Drag-to-navigate state
  const [pressedPath, setPressedPath] = useState(null);
  const [optimisticPath, setOptimisticPath] = useState(location.pathname);
  const navRef = useRef(null);
  const navRectsRef = useRef([]); // Cache rects for snappy performance

  const basePath = `/${adminPath}`;

  // Sync optimistic path with actual route changes
  useEffect(() => {
    setOptimisticPath(location.pathname);
  }, [location.pathname]);

  const isActive = (path) => optimisticPath === path;

  const role = user?.role;
  const isSuper = isSuperAdmin(role);
  const isAdm = isAdmin(role);
  const isWrit = isWriter(role) && !isAdm;
  const hasBroadcasterAccess = canAccessBroadcastDashboard(role);

  const { news } = useData();
  const { notifications, markAllMessagesAsRead } = useNotification();

  const pendingCount = news?.filter((n) => n.status === "pending").length || 0;
  const showNewsBadge = isAdm && pendingCount > 0;

  const unreadFeedbacks =
    notifications?.filter((n) => n.isFeedback && !n.read).length || 0;
  const unreadMessages =
    notifications?.filter((n) => !n.isFeedback && !n.read).length || 0;

  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true;
  const showSettingsBadge = isAdm && unreadFeedbacks > 0;
  // Auto-clear message notifications when visiting the Chat tab
  useEffect(() => {
    if (location.pathname === `${basePath}/dashboard/messages`) {
      if (unreadMessages > 0 && notifications?.length > 0) {
        if (markAllMessagesAsRead) markAllMessagesAsRead();
      }
    }
  }, [
    location.pathname,
    basePath,
    unreadMessages,
    notifications,
    markAllMessagesAsRead,
  ]);

  const allNavItems = [
    {
      name: "Home",
      path: `${basePath}/dashboard`,
      icon: <LayoutDashboard size={18} />,
      roles: ["writer", "admin", "super_admin"],
    },
    {
      name: isWrit ? "Articles" : "News",
      path: `${basePath}/dashboard/news`,
      icon: <Newspaper size={18} />,
      roles: ["writer", "admin", "super_admin"],
      hasNotification: showNewsBadge,
    },
    {
      name: "Live",
      path: `${basePath}/dashboard/live`,
      icon: <Radio size={18} className="text-red-400" />,
      roles: ["admin", "super_admin"],
    },
    {
      name: "Profile",
      path: `${basePath}/dashboard/profile`,
      icon:
        user?.avatarUrl || user?.user_metadata?.avatar_url ? (
          <img
            src={user.avatarUrl || user?.user_metadata?.avatar_url}
            alt="Profile"
            className="w-[18px] h-[18px] rounded-full object-cover border-2 border-white/40 shadow-sm"
          />
        ) : (
          <UserIcon size={18} />
        ),
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
      hasNotification: unreadMessages > 0,
    },
    ...(hasBroadcasterAccess
      ? [
          {
            name: "Broadcast",
            path: getBroadcasterAdminUrl(adminPath || user?.indexNumber, user),
            icon: <Radio size={18} className="text-red-400" />,
            roles: ["admin", "super_admin"],
            external: true,
          },
        ]
      : []),
    {
      name: "Settings",
      path: `${basePath}/dashboard/settings`,
      icon: <Settings size={18} />,
      roles: ["writer", "admin", "super_admin"],
      hasNotification: showSettingsBadge,
    },
  ];

  const allowedNavItems = allNavItems.filter((item) => {
    if (isSuper)
      return item.roles.includes("super_admin") || item.roles.includes("admin");
    if (isAdm) return item.roles.includes("admin");
    if (isWrit) return item.roles.includes("writer");
    return false;
  });

  const primaryPaths = [
    `${basePath}/dashboard`,
    `${basePath}/dashboard/news`,
    `${basePath}/dashboard/live`,
    `${basePath}/dashboard/profile`,
  ];
  const primaryItems = allowedNavItems.filter((item) =>
    primaryPaths.includes(item.path),
  );
  const overflowItems = allowedNavItems.filter(
    (item) => !primaryPaths.includes(item.path),
  );

  const touchStartPos = useRef(null);
  const hasDraggedRef = useRef(false);

  // --- Touch Event Handlers for Drag-to-Navigate ---
  const handleTouchStart = (e) => {
    hasDraggedRef.current = false;
    touchStartPos.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };

    // Pre-calculate bounding boxes on touch start for ultra-responsive dragging
    if (navRef.current) {
      const items = Array.from(navRef.current.querySelectorAll("[data-path]"));
      navRectsRef.current = items.map((item) => ({
        path: item.getAttribute("data-path"),
        rect: item.getBoundingClientRect(),
      }));
    }

    // Provide instant visual feedback for the item being pressed
    const element = e.target.closest("[data-path]");
    if (element) {
      setPressedPath(element.getAttribute("data-path"));
    }
  };

  const handleTouchMove = (e) => {
    const touch = e.touches[0];

    // Check if we moved enough to call it a "drag"
    if (!hasDraggedRef.current && touchStartPos.current) {
      const dx = Math.abs(touch.clientX - touchStartPos.current.x);
      const dy = Math.abs(touch.clientY - touchStartPos.current.y);
      if (dx > 8 || dy > 8) {
        hasDraggedRef.current = true;
      }
    }

    if (hasDraggedRef.current) {
      let foundPath = null;

      // Check cached rects instead of document.elementFromPoint to avoid reflows
      for (const n of navRectsRef.current) {
        if (
          touch.clientX >= n.rect.left &&
          touch.clientX <= n.rect.right &&
          touch.clientY >= n.rect.top &&
          touch.clientY <= n.rect.bottom
        ) {
          foundPath = n.path;
          break;
        }
      }

      if (foundPath !== pressedPath) {
        setPressedPath(foundPath);
        // Trigger subtle haptic feedback for snappy feeling when sliding into a new item
        if (
          foundPath &&
          typeof navigator !== "undefined" &&
          navigator.vibrate
        ) {
          try {
            // Check for user activation to prevent browser intervention warnings in console
            if (
              !navigator.userActivation ||
              navigator.userActivation.hasBeenActive
            ) {
              navigator.vibrate(30);
            }
          } catch (e) {
            // Silent fail if vibration is blocked
          }
        }
      }
    }
  };

  const handleTouchEnd = (e) => {
    // If we were dragging, we handle the navigation here
    if (hasDraggedRef.current) {
      // Prevent default to try to stop the browser's simulated click
      if (e.cancelable) {
        e.preventDefault();
      }

      if (pressedPath) {
        if (pressedPath === "more") {
          setShowMore((prev) => !prev);
        } else if (pressedPath.startsWith("http")) {
          window.open(pressedPath, "_blank");
          setShowMore(false);
        } else {
          setOptimisticPath(pressedPath); // Optimistic UI update to prevent glitches
          navigate(pressedPath);
          setShowMore(false);
        }
      }

      // Delay resetting the drag state to ensure the delayed mobile 'click' event
      // (which fires ~300ms after touchend) is caught and prevented in the onClick handlers.
      setTimeout(() => {
        hasDraggedRef.current = false;
      }, 500);
    } else {
      // It was a tap, let the native onClick handle navigation
      // But update optimistic UI instantly for snappy feel
      if (pressedPath && pressedPath !== "more") {
        setOptimisticPath(pressedPath);
      }
      hasDraggedRef.current = false;
    }

    setPressedPath(null);
    touchStartPos.current = null;
  };

  const renderItem = (item) => {
    const isActuallyActive = isActive(item.path);
    const isPressed = pressedPath === item.path;
    // Visual active state prioritizes pressed item during drag
    const active = pressedPath ? isPressed : isActuallyActive;

    return (
      <Link
        key={item.path}
        to={item.path}
        data-path={item.path}
        draggable="false"
        style={{ WebkitUserDrag: "none" }}
        onClick={(e) => {
          // If we were dragging, prevent default click so onTouchEnd handles it
          if (hasDraggedRef.current) {
            e.preventDefault();
          } else {
            setShowMore(false);
            if (typeof navigator !== "undefined" && navigator.vibrate) {
              try {
                navigator.vibrate(30);
              } catch (err) {}
            }
          }
        }}
        className={`flex flex-col items-center justify-center p-2 relative w-full h-full select-none ${
          active
            ? item.name === "Live"
              ? "text-red-600"
              : "text-[var(--accent)]"
            : "text-white/70 hover:text-white"
        }`}>
        {active && (
          <motion.div
            layoutId="navbar-active-pill"
            className={`absolute inset-0 rounded-2xl -z-10 shadow-[inset_0_0_12px_rgba(255,255,255,0.1)] ${
              item.name === "Live" ? "bg-red-600/10" : "bg-theme-accent/1"
            }`}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
          />
        )}
        <motion.div
          animate={{
            y: active ? -8 : 0,
            scale: isPressed ? 0.85 : active ? 1.1 : 1,
          }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
          className="relative">
          {item.icon}
          {item.hasNotification && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-600 rounded-full border-[1.5px] border-black shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
          )}
        </motion.div>

        <motion.span
          initial={false}
          animate={{
            opacity: active ? 1 : 0,
            y: active ? 4 : 8,
            scale: isPressed ? 0.7 : active ? 1 : 0.8,
          }}
          transition={{
            y: { type: "spring", stiffness: 300, damping: 20 },
            scale: { type: "spring", stiffness: 300, damping: 20 },
            opacity: { type: "tween", duration: 0.15 },
          }}
          className="text-[8px] font-bold uppercase tracking-wider absolute bottom-2 truncate max-w-full px-1">
          {item.name}
        </motion.span>

        {active && (
          <motion.div
            layoutId="navbar-active-dot"
            className={`absolute -bottom-1 w-4 h-0.5 rounded-full ${
              item.name === "Live"
                ? "bg-red-600 shadow-[0_0_8px_rgba(239,68,68,0.8)]"
                : "bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]"
            }`}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          />
        )}
      </Link>
    );
  };

  return (
    <div
      className="lg:hidden fixed  bottom-0 left-0 right-0 z-[100] px-2 pt-2 pb-4 touch-none select-none"
      style={{
        WebkitTouchCallout: "none",
        WebkitUserSelect: "none",
        userSelect: "none",
      }}
      onContextMenu={(e) => e.preventDefault()}
      ref={navRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}>
      {/* Liquid Morphing More Options Popover */}
      <MorphingModal
        viewId={showMore ? "more" : null}
        onClose={() => setShowMore(false)}
        className="backdrop-blur-sm bg-[var(--admin-card-bg)] max-w-[90%] border border-[var(--admin-border)] shadow-[0_12px_40px_-10px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.05)] rounded-3xl"
        style={{ backgroundColor: "color-mix(in srgb, var(--admin-card-bg) 95%, transparent)" }}>
        {showMore === true ? (
          <div>
            <div className="grid grid-cols-3 gap-2 min-w-[80%] relative z-10">
              {overflowItems.map((item) => {
                const isExternal = item.external || (typeof item.path === 'string' && item.path.startsWith('http'));
                const content = (
                  <>
                    <div className="relative">
                      {item.icon}
                      {item.hasNotification && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-theme-accent rounded-full border border-black shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                      )}
                    </div>
                    <span className="text-[10px] font-semibold text-center mt-1">
                      {item.name}
                    </span>
                  </>
                );

                const itemClass = "flex flex-col items-center justify-center p-3 rounded-2xl bg-black/50 border border-white/[0.06] hover:bg-white/10 active:scale-95 transition-all text-white/70 hover:text-white relative overflow-hidden group";

                if (isExternal) {
                  return (
                    <a
                      key={item.path}
                      href={item.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      draggable="false"
                      style={{ WebkitUserDrag: "none" }}
                      onClick={() => setShowMore(false)}
                      className={itemClass}>
                      {content}
                    </a>
                  );
                }

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    draggable="false"
                    style={{ WebkitUserDrag: "none" }}
                    onClick={() => setShowMore(false)}
                    className={itemClass}>
                    {content}
                  </Link>
                );
              })}
            </div>
          </div>
        ) : null}
      </MorphingModal>

      <GlassSurface
        width="90%"
        height={64}
        borderRadius={28}
        displace={1.2}
        distortionScale={-180}
        redOffset={0}
        greenOffset={8}
        blueOffset={10}
        brightness={100}
        opacity={0.65}
        mixBlendMode="screen"
        backgroundOpacity={0.1}
        className="mx-auto border mb-2 border-[var(--admin-border)] relative z-[100] shadow-[0_12px_40px_0_rgba(0,0,0,0.95)] transition-all duration-300">
        <div 
          className="absolute inset-0 rounded-2xl -z-10 m-0" 
          style={{ background: "linear-gradient(to bottom, color-mix(in srgb, var(--admin-card-bg) 90%, transparent), color-mix(in srgb, var(--admin-bg) 90%, transparent))" }}
        />
        <div className="flex items-center justify-between w-full h-full relative z-10 px-1">
          {primaryItems.map(renderItem)}

          {overflowItems.length > 0 && (
            <button
              data-path="more"
              draggable="false"
              style={{ WebkitUserDrag: "none" }}
              onClick={(e) => {
                if (hasDraggedRef.current) {
                  e.preventDefault();
                } else {
                  setShowMore(!showMore);
                  if (typeof navigator !== "undefined" && navigator.vibrate) {
                    try {
                      navigator.vibrate(30);
                    } catch (err) {}
                  }
                }
              }}
              className={`flex flex-col items-center justify-center p-2 relative w-full h-full select-none ${
                (pressedPath ? pressedPath === "more" : showMore)
                  ? "text-[var(--accent)]"
                  : "text-white/70 hover:text-white"
              }`}>
              {(pressedPath ? pressedPath === "more" : showMore) && (
                <motion.div
                  layoutId="navbar-active-pill"
                  className="absolute inset-0 bg-theme-accent/10 rounded-full -z-10 shadow-[inset_0_0_12px_rgba(255,255,255,0.1)]"
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                />
              )}
              <motion.div
                animate={{
                  y: (pressedPath ? pressedPath === "more" : showMore) ? -8 : 0,
                  scale:
                    pressedPath === "more"
                      ? 0.85
                      : (pressedPath ? pressedPath === "more" : showMore)
                        ? 1.1
                        : 1,
                  rotate: (pressedPath ? pressedPath === "more" : showMore)
                    ? 90
                    : 0,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="relative">
                {showMore ? <X size={18} /> : <GripHorizontal size={18} />}
                {overflowItems.some((i) => i.hasNotification) && !showMore && (
                  <span className="absolute -top-2 -right-1 w-2.5 h-2.5 bg-red-600 rounded-full border-[1.5px] border-black shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                )}
              </motion.div>
              <motion.span
                initial={false}
                animate={{
                  opacity: (pressedPath ? pressedPath === "more" : showMore)
                    ? 1
                    : 0,
                  y: (pressedPath ? pressedPath === "more" : showMore) ? 4 : 8,
                  scale:
                    pressedPath === "more"
                      ? 0.7
                      : (pressedPath ? pressedPath === "more" : showMore)
                        ? 1
                        : 0.8,
                }}
                transition={{
                  y: { type: "spring", stiffness: 300, damping: 20 },
                  scale: { type: "spring", stiffness: 300, damping: 20 },
                  opacity: { type: "tween", duration: 0.15 },
                }}
                className="text-[9px] font-bold uppercase tracking-wider absolute bottom-1">
                More
              </motion.span>
            </button>
          )}
        </div>
      </GlassSurface>
    </div>
  );
};

export default BottomNavbar;
