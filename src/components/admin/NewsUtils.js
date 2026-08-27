export const getStatusColor = (status) => {
  switch (status) {
    case "published":
      return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    case "pending":
      return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    case "rejected":
      return "text-red-400 bg-red-600/10 border-red-600/20";
    default:
      if (status === 'needs_attention') {
        return "text-orange-400 bg-orange-600/10 border-orange-600/20";
      }
      return "text-white/60 bg-white/10 border-white/5";
  }
};

export const resolveBadgeInfo = (item) => {
  if (item.needs_attention) {
    return {
      label: "Needs Attention",
      type: "needs_attention",
      className: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    };
  }
  if (item.status === "draft") {
    return {
      label: "Draft",
      type: "draft",
      className: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    };
  }
  if (item.status === "pending") {
    return {
      label: "Pending",
      type: "pending",
      className: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    };
  }
  if (item.status === "rejected") {
    return {
      label: "Rejected",
      type: "rejected",
      className: "bg-red-500/20 text-red-300 border-red-500/30",
    };
  }

  // Published: Show Visibility chip with icon & text (Public, Private, Unlisted)
  const vis = item.visibility?.toLowerCase();
  if (vis === "private") {
    return {
      label: "Private",
      type: "private",
      className: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    };
  }
  if (vis === "unlisted") {
    return {
      label: "Unlisted",
      type: "unlisted",
      className: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    };
  }
  return {
    label: "Public",
    type: "public",
    className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  };
};

export const getCategoryColor = (category) => {
  const colors = [
    "text-theme-accent bg-theme-accent/10 border-theme-accent/20",
    "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    "text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/20",
    "text-blue-400 bg-blue-500/10 border-blue-500/20",
    "text-violet-400 bg-violet-500/10 border-violet-500/20",
    "text-rose-400 bg-rose-500/10 border-rose-500/20",
    "text-orange-400 bg-orange-500/10 border-orange-500/20",
  ];
  if (!category) return colors[0];
  let hash = 0;
  for (let i = 0; i < category.length; i++)
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

export const getRelativeDateLabel = (dateInput) => {
  const date = new Date(dateInput);
  const today = new Date();

  // Reset times to midnight for accurate day comparison
  const dateWithoutTime = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  const todayWithoutTime = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  const diffTime = todayWithoutTime - dateWithoutTime;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays > 1 && diffDays <= 7) return "This Week";
  if (diffDays > 7 && diffDays <= 14) return "Last Week";
  if (diffDays > 14 && diffDays <= 30) return "This Month";

  // Older than a month, group by month and year
  const options = { month: "long", year: "numeric" };
  return date.toLocaleDateString(undefined, options);
};

export const resolveAuthorInfo = (item, webUsers = []) => {
  const isICMU =
    !item.author ||
    item.author === "Admin" ||
    item.author === "Isipathana College Media Unit" ||
    item.author === "isipathanamedia";

  const submitterUser = webUsers?.find(
    (u) =>
      u.id === item.submitted_by ||
      u.email === item.submitted_by ||
      u.index_number === item.submitted_by ||
      u.indexNumber === item.submitted_by ||
      u.full_name === item.submitted_by ||
      u.name === item.submitted_by,
  );

  const authorUser = !isICMU
    ? webUsers?.find(
        (u) =>
          u.full_name?.toLowerCase() === item.author?.toLowerCase() ||
          u.name?.toLowerCase() === item.author?.toLowerCase() ||
          u.id === item.author ||
          u.email === item.author,
      )
    : null;

  const authorName = isICMU
    ? (item.type === "update" ? "isipathanamedia" : "Isipathana College Media Unit")
    : (item.author || submitterUser?.full_name || submitterUser?.name || "Member");

  const submitterName =
    submitterUser?.full_name ||
    submitterUser?.name ||
    (item.submitted_by && item.submitted_by !== "Admin" ? item.submitted_by : null);

  const avatarUrl =
    authorUser?.avatar_url ||
    (!isICMU ? submitterUser?.avatar_url : null);

  const initials = (authorName || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return {
    isICMU,
    authorName,
    submitterName,
    avatarUrl,
    initials,
  };
};

import React from "react";

export const getSourcePlatform = (url) => {
  if (!url) return null;
  const lower = url.toLowerCase();
  if (
    lower.includes("facebook.com") ||
    lower.includes("fb.watch") ||
    lower.includes("fb.me")
  ) {
    return {
      name: "Facebook",
      type: "facebook",
      color: "text-[#1877F2] bg-[#1877F2]/10 border border-[#1877F2]/25",
    };
  }
  if (lower.includes("youtube.com") || lower.includes("youtu.be")) {
    return {
      name: "YouTube",
      type: "youtube",
      color: "text-[#FF0000] bg-[#FF0000]/10 border border-[#FF0000]/25",
    };
  }
  if (lower.includes("instagram.com") || lower.includes("instagr.am")) {
    return {
      name: "Instagram",
      type: "instagram",
      color: "text-[#E4405F] bg-[#E4405F]/10 border border-[#E4405F]/25",
    };
  }
  if (lower.includes("tiktok.com")) {
    return {
      name: "TikTok",
      type: "tiktok",
      color: "text-white bg-white/10 border border-white/20",
    };
  }
  if (lower.includes("twitter.com") || lower.includes("x.com")) {
    return {
      name: "X",
      type: "x",
      color: "text-white bg-white/10 border border-white/20",
    };
  }
  return {
    name: "Web",
    type: "link",
    color: "text-theme-accent bg-theme-accent/10 border border-theme-accent/20",
  };
};

export const PlatformIcon = ({ platform, className = "", size = 11 }) => {
  if (!platform) return null;
  switch (platform.type) {
    case "facebook":
      return React.createElement(
        "svg",
        {
          className,
          width: size,
          height: size,
          viewBox: "0 0 24 24",
          fill: "currentColor",
        },
        React.createElement("path", {
          d: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
        })
      );
    case "instagram":
      return React.createElement(
        "svg",
        {
          className,
          width: size,
          height: size,
          viewBox: "0 0 24 24",
          fill: "currentColor",
        },
        React.createElement("path", {
          d: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
        })
      );
    case "youtube":
      return React.createElement(
        "svg",
        {
          className,
          width: size,
          height: size,
          viewBox: "0 0 24 24",
          fill: "currentColor",
        },
        React.createElement("path", {
          d: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
        })
      );
    case "tiktok":
      return React.createElement(
        "svg",
        {
          className,
          width: size,
          height: size,
          viewBox: "0 0 24 24",
          fill: "currentColor",
        },
        React.createElement("path", {
          d: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-1.01v8.28c0 1.95-.5 3.94-1.65 5.53-1.67 2.37-4.52 3.75-7.46 3.48-3.05-.2-5.74-2.18-6.73-5.06-.99-2.9-.1-6.19 2.22-8.15 1.78-1.52 4.24-2.17 6.57-1.74v4.19c-1.1-.38-2.33-.25-3.32.37-.98.63-1.57 1.75-1.54 2.92.03 1.34.87 2.54 2.14 2.95 1.48.49 3.19-.04 4.09-1.29.35-.49.52-1.08.52-1.68V.02z",
        })
      );
    case "x":
      return React.createElement(
        "svg",
        {
          className,
          width: size,
          height: size,
          viewBox: "0 0 24 24",
          fill: "currentColor",
        },
        React.createElement("path", {
          d: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
        })
      );
    default:
      return React.createElement(
        "svg",
        {
          className,
          width: size,
          height: size,
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "2",
          strokeLinecap: "round",
          strokeLinejoin: "round",
        },
        React.createElement("circle", { cx: 12, cy: 12, r: 10 }),
        React.createElement("line", { x1: 2, y1: 12, x2: 22, y2: 12 }),
        React.createElement("path", {
          d: "M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z",
        })
      );
  }
};

