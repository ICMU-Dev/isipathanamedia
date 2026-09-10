import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

// ─── Preloaded Image Cache ──────────────────────────────────────
const loadedImageUrls = new Set();
const failedImageUrls = new Set();

// ─── Helpers: URL & Initials Extraction ─────────────────────────
export const extractAvatarUrl = (user) => {
  if (!user) return null;

  if (typeof user === "string") {
    const trimmed = user.trim();
    if (!trimmed || trimmed === "null" || trimmed === "undefined") return null;
    return trimmed;
  }

  const candidate =
    user.avatarUrl ||
    user.avatar_url ||
    user.profile ||
    user.profile_picture ||
    user.picture ||
    user.photoURL ||
    user.photo_url ||
    user.image ||
    user.avatar ||
    user.user_metadata?.avatar_url ||
    user.user_metadata?.picture ||
    user.user_metadata?.avatar ||
    user.identities?.find?.((i) => i.provider === "google")?.identity_data?.avatar_url ||
    user.identities?.find?.((i) => i.provider === "google")?.identity_data?.picture ||
    null;

  if (typeof candidate === "string") {
    const trimmed = candidate.trim();
    if (!trimmed || trimmed === "null" || trimmed === "undefined") return null;
    return trimmed;
  }

  return null;
};

export const getAvatarInitials = (name, fallback = "U") => {
  if (!name || typeof name !== "string") return fallback;
  const clean = name.trim().replace(/^[@#]/, "");
  if (!clean) return fallback;
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return fallback;
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// ─── Context for Loading State ─────────────────────────────────
const AvatarContext = React.createContext({
  imageLoadingStatus: "idle",
  onImageLoadingStatusChange: () => {},
  size: "default",
});

// ─── Avatar Root Component ─────────────────────────────────────
const avatarVariants = cva(
  "relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden font-medium transition-all",
  {
    variants: {
      size: {
        xs: "h-4.5 w-4.5 text-[9px]",
        sm: "h-6 w-6 text-[10px]",
        default: "h-8 w-8 text-xs",
        md: "h-9 w-9 text-sm",
        lg: "h-12 w-12 text-base",
        xl: "h-14 w-14 text-lg",
        "2xl": "h-24 w-24 sm:h-28 sm:w-28 text-2xl",
        "3xl": "h-32 w-32 sm:h-40 sm:w-40 text-4xl font-bold",
      },
      shape: {
        circle: "rounded-full",
        rounded: "rounded-2xl",
        square: "rounded-lg",
      },
    },
    defaultVariants: {
      size: "default",
      shape: "circle",
    },
  }
);

const Avatar = React.forwardRef(
  ({ className, size = "default", shape = "circle", initialStatus = "idle", ...props }, ref) => {
    const [imageLoadingStatus, setImageLoadingStatus] = React.useState(initialStatus);

    const onImageLoadingStatusChange = React.useCallback((status) => {
      setImageLoadingStatus(status);
    }, []);

    // Sync if initialStatus transitions from idle to loaded
    React.useEffect(() => {
      if (initialStatus === "loaded" && imageLoadingStatus !== "loaded") {
        setImageLoadingStatus("loaded");
      }
    }, [initialStatus, imageLoadingStatus]);

    return (
      <AvatarContext.Provider
        value={{
          imageLoadingStatus,
          onImageLoadingStatusChange,
          size,
        }}>
        <div
          ref={ref}
          className={cn(
            avatarVariants({ size, shape }),
            "bg-white/[0.05] border border-white/[0.08] shadow-sm",
            className
          )}
          {...props}
        />
      </AvatarContext.Provider>
    );
  }
);
Avatar.displayName = "Avatar";

// ─── AvatarImage ───────────────────────────────────────────────
const AvatarImage = React.forwardRef(
  (
    {
      className,
      src,
      alt = "",
      onLoad,
      onError,
      loading = "eager",
      referrerPolicy = "no-referrer",
      crossOrigin,
      ...props
    },
    ref
  ) => {
    const { onImageLoadingStatusChange } = React.useContext(AvatarContext);
    const imgRef = React.useRef(null);
    React.useImperativeHandle(ref, () => imgRef.current);

    const [status, setStatus] = React.useState(() => {
      if (!src || failedImageUrls.has(src)) return "error";
      if (loadedImageUrls.has(src)) return "loaded";
      return "idle";
    });

    React.useLayoutEffect(() => {
      if (!src) {
        setStatus("error");
        onImageLoadingStatusChange("error");
        return;
      }

      if (failedImageUrls.has(src)) {
        setStatus("error");
        onImageLoadingStatusChange("error");
        return;
      }

      if (loadedImageUrls.has(src)) {
        setStatus("loaded");
        onImageLoadingStatusChange("loaded");
        return;
      }

      // Check if the DOM image is already complete in browser memory/cache
      const domImg = imgRef.current;
      if (domImg && domImg.complete) {
        if (domImg.naturalWidth > 0) {
          loadedImageUrls.add(src);
          setStatus("loaded");
          onImageLoadingStatusChange("loaded");
          return;
        } else {
          failedImageUrls.add(src);
          setStatus("error");
          onImageLoadingStatusChange("error");
          return;
        }
      }

      // Preload test to catch both cache hits and async network load
      let isMounted = true;
      const img = new window.Image();
      if (referrerPolicy) img.referrerPolicy = referrerPolicy;
      if (crossOrigin) img.crossOrigin = crossOrigin;

      img.onload = () => {
        loadedImageUrls.add(src);
        if (!isMounted) return;
        setStatus("loaded");
        onImageLoadingStatusChange("loaded");
      };

      img.onerror = () => {
        failedImageUrls.add(src);
        if (!isMounted) return;
        setStatus("error");
        onImageLoadingStatusChange("error");
      };

      img.src = src;

      if (img.complete) {
        if (img.naturalWidth > 0) {
          loadedImageUrls.add(src);
          setStatus("loaded");
          onImageLoadingStatusChange("loaded");
        } else {
          failedImageUrls.add(src);
          setStatus("error");
          onImageLoadingStatusChange("error");
        }
        return;
      }

      setStatus("loading");
      onImageLoadingStatusChange("loading");

      return () => {
        isMounted = false;
      };
    }, [src, referrerPolicy, crossOrigin, onImageLoadingStatusChange]);

    if (!src || status === "error") {
      return null;
    }

    const isLoaded = status === "loaded";

    return (
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading={loading}
        decoding="async"
        referrerPolicy={referrerPolicy}
        crossOrigin={crossOrigin}
        onLoad={(event) => {
          loadedImageUrls.add(src);
          setStatus("loaded");
          onImageLoadingStatusChange("loaded");
          onLoad?.(event);
        }}
        onError={(event) => {
          failedImageUrls.add(src);
          setStatus("error");
          onImageLoadingStatusChange("error");
          onError?.(event);
        }}
        className={cn(
          "h-full w-full object-cover relative z-10 transition-opacity duration-150",
          isLoaded ? "opacity-100" : "opacity-0",
          className
        )}
        {...props}
      />
    );
  }
);
AvatarImage.displayName = "AvatarImage";

// ─── AvatarFallback ────────────────────────────────────────────
const AvatarFallback = React.forwardRef(
  ({ className, children, ...props }, ref) => {
    const { imageLoadingStatus } = React.useContext(AvatarContext);

    const canRender = imageLoadingStatus !== "loaded";

    if (!canRender) {
      return null;
    }

    return (
      <span
        ref={ref}
        className={cn(
          "absolute inset-0 flex h-full w-full items-center justify-center font-semibold text-theme-primary opacity-80 uppercase tracking-tight select-none",
          className
        )}
        {...props}>
        {children}
      </span>
    );
  }
);
AvatarFallback.displayName = "AvatarFallback";

// ─── AvatarBadge ───────────────────────────────────────────────
const badgeSizeVariants = {
  xs: "w-1.5 h-1.5 border-[1px]",
  sm: "w-2 h-2 border-[1.5px]",
  default: "w-2.5 h-2.5 border-2",
  md: "w-2.5 h-2.5 border-2",
  lg: "w-3.5 h-3.5 border-2",
  xl: "w-4 h-4 border-2",
  "2xl": "w-6 h-6 border-3",
  "3xl": "w-8 h-8 border-4",
};

const AvatarBadge = React.forwardRef(
  ({ className, position = "bottom-right", ...props }, ref) => {
    const { size } = React.useContext(AvatarContext);
    const sizeCls = badgeSizeVariants[size] || "w-2 h-2 border-[1.5px]";

    const positionCls =
      position === "top-right"
        ? "top-0 right-0"
        : position === "top-left"
        ? "top-0 left-0"
        : position === "bottom-left"
        ? "bottom-0 left-0"
        : "bottom-0 right-0";

    return (
      <span
        ref={ref}
        className={cn(
          "absolute rounded-full z-20 border-background pointer-events-none",
          positionCls,
          sizeCls,
          className
        )}
        {...props}
      />
    );
  }
);
AvatarBadge.displayName = "AvatarBadge";

// ─── AvatarGroup ───────────────────────────────────────────────
const AvatarGroup = React.forwardRef(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-center -space-x-2 group/avatar-group", className)}
        {...props}>
        {children}
      </div>
    );
  }
);
AvatarGroup.displayName = "AvatarGroup";

// ─── AvatarGroupCount ──────────────────────────────────────────
const AvatarGroupCount = React.forwardRef(
  ({ className, count, size = "default", shape = "circle", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          avatarVariants({ size, shape }),
          "bg-[var(--admin-border,#27272a)] border-2 border-[#0c0c0c] text-[9px] font-bold text-theme-primary opacity-70 flex items-center justify-center select-none shadow-sm",
          className
        )}
        {...props}>
        +{count}
      </div>
    );
  }
);
AvatarGroupCount.displayName = "AvatarGroupCount";

// ─── High-Level UserAvatar Component ───────────────────────────
const UserAvatar = React.forwardRef(
  (
    {
      user,
      src,
      name,
      size = "default",
      shape = "circle",
      status,
      showBadge = false,
      badgeClassName,
      className,
      imageClassName,
      fallbackClassName,
      fallback,
      children,
      ...props
    },
    ref
  ) => {
    const resolvedSrc = src || extractAvatarUrl(user);
    const resolvedName =
      name ||
      (typeof user === "object"
        ? user?.name || user?.full_name || user?.username || user?.author
        : typeof user === "string" && !user.startsWith("http")
        ? user
        : "User");

    const initials = fallback || getAvatarInitials(resolvedName);
    const isOnline =
      status === "online" ||
      status === true ||
      (user && typeof user === "object" && user.is_active !== false && status !== "offline");

    const displayBadge = showBadge || status !== undefined;
    const isPreloaded = Boolean(resolvedSrc && loadedImageUrls.has(resolvedSrc));

    return (
      <Avatar
        ref={ref}
        size={size}
        shape={shape}
        className={className}
        initialStatus={isPreloaded ? "loaded" : "idle"}
        {...props}>
        {resolvedSrc ? (
          <AvatarImage
            src={resolvedSrc}
            alt={resolvedName}
            className={imageClassName}
          />
        ) : null}
        <AvatarFallback className={fallbackClassName}>{initials}</AvatarFallback>
        {displayBadge && (
          <AvatarBadge
            className={cn(
              isOnline
                ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]"
                : "bg-zinc-500",
              badgeClassName
            )}
          />
        )}
        {children}
      </Avatar>
    );
  }
);
UserAvatar.displayName = "UserAvatar";

export {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarBadge,
  AvatarGroup,
  AvatarGroupCount,
  UserAvatar,
};
