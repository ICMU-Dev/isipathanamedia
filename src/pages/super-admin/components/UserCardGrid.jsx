import React from "react";
import {
  Globe,
  ShieldOff,
  Key,
  ChevronDown,
  MoreVertical,
  Edit2,
  PowerOff,
  Trash2,
  Clock,
  LogOut,
} from "lucide-react";
import { AnimatedBadge } from "../../../components/motion/animated-badge";

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
          className="rounded-2xl shadow-xl bg-[#09090b] flex flex-col relative group hover:shadow-2xl transition-all duration-300 border border-white/[0.06]  hover:border-white/20">
          <div className="p-4 sm:p-6 flex items-start gap-3 sm:gap-4 relative z-10">
            <div className="relative shrink-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl sm:rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-lg sm:text-xl font-bold text-white overflow-hidden shadow-inner">
                <span className="absolute flex items-center justify-center w-full h-full">
                  {u.full_name?.charAt(0)}
                </span>
                {u.avatar_url && (
                  <img
                    src={u.avatar_url}
                    alt={u.full_name}
                    className="w-full h-full object-cover relative z-10"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                )}
              </div>
              {u.is_active !== false && (
                <div className="absolute top-1 right-1 w-3 h-3 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.4)] border-2 border-black" />
              )}
            </div>

            <div className="min-w-0 flex-1 pt-1">
              <h4 className="font-bold text-base sm:text-lg text-white tracking-tight leading-tight truncate">
                {u.full_name}
              </h4>
              <div className="text-[11px] text-zinc-500 font-mono tracking-widest uppercase mt-0.5">
                {u.index_number}
              </div>

              <div className="flex items-center gap-2 mt-3">
                {u.email ? (
                  <AnimatedBadge
                    status="info"
                    size="sm"
                    icon={<Globe size={10} />}
                    className="uppercase tracking-widest font-bold text-[9px]">
                    Google SSO
                  </AnimatedBadge>
                ) : (
                  <AnimatedBadge
                    status="warning"
                    size="sm"
                    icon={<ShieldOff size={10} />}
                    className="uppercase tracking-widest font-bold text-[9px]">
                    Local Hash
                  </AnimatedBadge>
                )}
              </div>
            </div>

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
                    className="p-2 text-zinc-500 hover:text-white bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-transparent hover:border-white/5">
                    <MoreVertical size={20} />
                  </button>
                  {openMenuId === u.id && (
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[var(--admin-input-bg)]   border border-white/5 shadow-2xl ring-1 ring-white/5 z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-right overflow-hidden p-1.5 flex flex-col gap-1 backdrop-blur-sm">
                      <button
                        onClick={() => {
                          onEditUser(u);
                          setOpenMenuId(null);
                        }}
                        className="w-full text-left px-3 py-3 rounded-2xl flex items-center gap-3 text-sm font-semibold text-zinc-400 hover:bg-white/10 hover:text-white transition-colors">
                        <Edit2 size={16} /> Rename
                      </button>
                      <button
                        onClick={() => {
                          onResetPassword(u.id);
                          setOpenMenuId(null);
                        }}
                        className="w-full text-left px-3 py-3 rounded-2xl flex items-center gap-3 text-sm font-semibold text-zinc-400 hover:bg-white/10 hover:text-white transition-colors">
                        <Key size={16} /> Password
                      </button>
                      <button
                        onClick={() => {
                          onToggleActive(u.id, u.is_active);
                          setOpenMenuId(null);
                        }}
                        className="w-full text-left px-3 py-3 rounded-2xl flex items-center gap-3 text-sm font-semibold text-amber-500 hover:bg-amber-500/10 hover:text-amber-300 transition-colors">
                        <PowerOff size={16} />{" "}
                        {u.is_active !== false ? "Suspend" : "Restore"}
                      </button>
                      <div className="h-px bg-white/10 my-1 mx-2"></div>
                      <button
                        onClick={() => {
                          onDeleteUser(u.id);
                          setOpenMenuId(null);
                        }}
                        className="w-full text-left px-3 py-3 rounded-2xl flex items-center gap-3 text-sm font-semibold text-red-600 hover:bg-red-600/10 hover:text-red-300 transition-colors">
                        <Trash2 size={16} /> Terminate
                      </button>
                    </div>
                  )}
                </div>
              )}
          </div>

          <div className="px-5 sm:px-6 py-5 bg-[#050505] border-t border-white/[0.06]  flex-1 flex flex-col justify-end space-y-4">
            <div className="flex flex-col gap-2.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                Clearance Level
              </label>
              {u.index_number === "24929" || u.index_number === "25473" ? (
                <AnimatedBadge
                  status="neutral"
                  size="md"
                  icon={<Key size={14} />}
                  className="uppercase tracking-widest font-bold bg-white/5 border border-white/5 text-[11px] w-full justify-center">
                  Developer Lock
                </AnimatedBadge>
              ) : (
                <div className="relative">
                  <select
                    value={u.role || "admin"}
                    onChange={(e) => onRoleChange(u.id, e.target.value)}
                    className="w-full appearance-none bg-[#050505] border border-white/5 rounded-2xl py-3 pl-4 pr-10 text-sm font-bold text-white focus:outline-none focus:border-white/30 cursor-pointer shadow-sm transition-all">
                    <option className="bg-[#000000] text-white" value="writer">
                      Writer
                    </option>
                    <option className="bg-[#000000] text-white" value="admin">
                      Admin
                    </option>
                    <option
                      className="bg-[#000000] text-white"
                      value="super-admin">
                      Super Admin
                    </option>
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/[0.06] ">
              <span
                className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${
                  u.is_active !== false ? "text-white" : "text-red-600"
                }`}>
                <span
                  className={`w-2 h-2 rounded-full ${
                    u.is_active !== false
                      ? "bg-white shadow-sm text-black"
                      : "bg-red-600"
                  }`}
                />
                {u.is_active !== false ? "Active" : "Suspended"}
              </span>
              <span
                className="text-[10px] text-zinc-400 font-mono tracking-widest uppercase inline-flex items-center gap-1"
                title={
                  getLatestSessionTime(u)
                    ? new Date(getLatestSessionTime(u)).toLocaleString()
                    : "No entry"
                }>
                <Clock size={10} className="text-zinc-500 shrink-0" />
                Last Login: {formatLastSeen(getLatestSessionTime(u))}
              </span>
            </div>
          </div>
        </div>
      ))}
      {users.length === 0 && (
        <div className="col-span-full py-20 text-center text-zinc-600 text-sm font-bold tracking-widest uppercase border border-white/[0.06]  rounded-2xl bg-zinc-950">
          No identities found.
        </div>
      )}
    </div>
  );
};

export default UserCardGrid;
