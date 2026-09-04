import React from "react";
import {
  Globe,
  ShieldOff,
  Key,
  Shield,
  MoreVertical,
  Edit2,
  PowerOff,
  Trash2,
  Clock,
} from "lucide-react";
import { AnimatedBadge } from "../../../components/motion/animated-badge";
import RoleMenuDropdown from "./RoleMenuDropdown";

const formatLastSeen = (timestamp) => {
  if (!timestamp) return "Never";
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return "Never";

  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 30) return "Just now";
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// Get most recent loginTime from active_sessions array
const getLatestSessionTime = (user) => {
  const sessions = user?.active_sessions;
  if (!Array.isArray(sessions) || sessions.length === 0)
    return user?.last_seen || user?.last_login || null;
  const times = sessions
    .map((s) => new Date(s.loginTime).getTime())
    .filter((t) => !isNaN(t));
  if (times.length === 0) return user?.last_seen || user?.last_login || null;
  return new Date(Math.max(...times)).toISOString();
};

const UserCardGrid = ({
  users,
  viewMode,
  openMenuId,
  setOpenMenuId,
  onEditUser,
  onResetPassword,
  onToggleActive,
  onDeleteUser,
  onRoleChange,
}) => {
  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 ${
        viewMode === "list" ? "block sm:hidden" : "block"
      }`}>
      {users.map((u) => (
        <div
          key={u.id}
          className="rounded-3xl bg-[#09090b] hover:bg-[#0c0c0e] border border-white/[0.08] hover:border-white/20 transition-all duration-300 flex flex-col justify-between overflow-visible relative group shadow-xl hover:shadow-2xl">
          {/* Card Top Section: Avatar, Identity, Badges, 3-dots */}
          <div className="p-5 sm:p-6 flex items-start gap-3.5 sm:gap-4 relative z-10">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center text-lg font-bold text-white overflow-hidden shadow-inner relative">
                <span className="flex items-center justify-center w-full h-full text-zinc-300 font-semibold select-none">
                  {u.full_name?.charAt(0)}
                </span>
                {u.avatar_url && (
                  <img
                    src={u.avatar_url}
                    alt={u.full_name}
                    className="w-full h-full object-cover absolute inset-0 z-10"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                )}
              </div>
              {u.is_active !== false && (
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] border-2 border-[#09090b]" />
              )}
            </div>

            {/* Name & Identity */}
            <div className="min-w-0 flex-1 pt-0.5">
              <h4
                className="font-bold text-base sm:text-[17px] text-white tracking-tight leading-snug line-clamp-2"
                title={u.full_name}>
                {u.full_name}
              </h4>
              <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                <span className="font-mono text-[10px] text-zinc-400 font-medium tracking-wider bg-white/[0.04] px-2 py-0.5 rounded-md border border-white/5">
                  #{u.index_number}
                </span>

                {u.email ? (
                  <AnimatedBadge
                    status="info"
                    size="sm"
                    icon={<Globe size={10} />}
                    className="uppercase tracking-widest font-bold text-[9px] py-0.5">
                    Google SSO
                  </AnimatedBadge>
                ) : (
                  <AnimatedBadge
                    status="warning"
                    size="sm"
                    icon={<ShieldOff size={10} />}
                    className="uppercase tracking-widest font-bold text-[9px] py-0.5">
                    Local Hash
                  </AnimatedBadge>
                )}
              </div>
            </div>

            {/* 3-Dots Action Menu */}
            {u.role !== "super-admin" &&
              u.index_number !== "24929" &&
              u.index_number !== "25473" && (
                <div
                  className="relative shrink-0"
                  onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(openMenuId === u.id ? null : u.id);
                    }}
                    className="p-2 text-zinc-500 hover:text-white bg-white/[0.03] hover:bg-white/10 rounded-xl transition-all border border-white/5 hover:border-white/10 cursor-pointer">
                    <MoreVertical size={18} />
                  </button>
                  {openMenuId === u.id && (
                    <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-zinc-950 border border-white/10 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-right overflow-hidden p-1.5 flex flex-col gap-1 backdrop-blur-md">
                      <button
                        onClick={() => {
                          onEditUser(u);
                          setOpenMenuId(null);
                        }}
                        className="w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-2.5 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer">
                        <Edit2 size={14} /> Rename Protocol
                      </button>
                      <button
                        onClick={() => {
                          onResetPassword(u.id);
                          setOpenMenuId(null);
                        }}
                        className="w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-2.5 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer">
                        <Key size={14} /> Force Password
                      </button>
                      <button
                        onClick={() => {
                          onToggleActive(u.id, u.is_active);
                          setOpenMenuId(null);
                        }}
                        className="w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-2.5 text-xs font-semibold text-amber-400 hover:bg-amber-500/10 hover:text-amber-300 transition-colors cursor-pointer">
                        <PowerOff size={14} />{" "}
                        {u.is_active !== false ? "Suspend Access" : "Restore Access"}
                      </button>
                      <div className="h-px bg-white/10 my-1 mx-2"></div>
                      <button
                        onClick={() => {
                          onDeleteUser(u.id);
                          setOpenMenuId(null);
                        }}
                        className="w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-2.5 text-xs font-semibold text-red-500 hover:bg-red-600/10 hover:text-red-400 transition-colors cursor-pointer">
                        <Trash2 size={14} /> Terminate
                      </button>
                    </div>
                  )}
                </div>
              )}
          </div>

          {/* Card Middle Section: Clearance Level Dropdown */}
          <div className="px-5 sm:px-6 py-4 bg-black/40 border-t border-white/[0.06] flex-1 flex flex-col justify-end space-y-2">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              <Shield size={11} className="text-zinc-500" />
              <span>Clearance Level</span>
            </div>

            {u.index_number === "24929" || u.index_number === "25473" ? (
              <div className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-white/[0.03] border border-white/10 rounded-2xl text-xs font-mono font-bold tracking-widest uppercase text-zinc-400">
                <Key size={13} className="text-zinc-500" />
                <span>Developer Lock</span>
              </div>
            ) : (
              <RoleMenuDropdown
                role={u.role || "admin"}
                onSave={(newRole) => onRoleChange(u.id, newRole)}
              />
            )}
          </div>

          {/* Card Bottom Section: Status Pill & Last Login */}
          <div className="px-5 sm:px-6 py-3.5 bg-black/70 border-t border-white/[0.06] flex items-center justify-between">
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                u.is_active !== false
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : "bg-red-500/10 border-red-500/20 text-red-400"
              }`}>
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  u.is_active !== false
                    ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)] animate-pulse"
                    : "bg-red-500"
                }`}
              />
              {u.is_active !== false ? "Active" : "Suspended"}
            </div>

            <span
              className="text-[10px] text-zinc-500 font-mono tracking-wider uppercase inline-flex items-center gap-1"
              title={
                getLatestSessionTime(u)
                  ? new Date(getLatestSessionTime(u)).toLocaleString()
                  : "No entry"
              }>
              <Clock size={10} className="text-zinc-600 shrink-0" />
              {formatLastSeen(getLatestSessionTime(u))}
            </span>
          </div>
        </div>
      ))}
      {users.length === 0 && (
        <div className="col-span-full py-20 text-center text-zinc-600 text-sm font-bold tracking-widest uppercase border border-white/[0.06] rounded-3xl bg-zinc-950">
          No identities found.
        </div>
      )}
    </div>
  );
};

export default UserCardGrid;
