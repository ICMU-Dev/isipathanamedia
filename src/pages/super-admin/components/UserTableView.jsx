import React from "react";
import {
  Globe,
  ShieldOff,
  Key,
  ChevronDown,
  MoreHorizontal,
  Edit2,
  PowerOff,
  Trash2,
  MapPin,
  Clock,
  LogOut,
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

const UserTableView = ({
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
    <div className={viewMode === "list" ? "hidden sm:block" : "hidden"}>
      <div className="rounded-2xl bg-zinc-950 border border-white/[0.06]  overflow-hidden shadow-2xl">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left whitespace-nowrap min-w-[800px]">
            <thead className="bg-[#000000] border-b border-white/[0.06]  text-zinc-500">
              <tr>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest">
                  Identity Protocol
                </th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest">
                  Auth Vector
                </th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest">
                  Clearance
                </th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-right">
                  Overrides
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {users.map((u) => (
                <tr
                  key={u.id}
                  className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="relative w-12 h-12 rounded-2xl bg-black border border-white/5 flex items-center justify-center font-bold text-lg text-white overflow-hidden shrink-0 shadow-inner">
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
                        {u.is_active !== false && (
                          <div className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.3)] border border-black" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-[15px] text-white tracking-tight">
                          {u.full_name}
                        </div>
                        <div className="text-[11px] text-zinc-500 font-mono tracking-widest uppercase mt-0.5">
                          {u.index_number}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-2">
                      {u.email ? (
                        <AnimatedBadge
                          status="info"
                          size="sm"
                          icon={<Globe size={12} />}
                          className="uppercase tracking-widest font-bold">
                          Google SSO
                        </AnimatedBadge>
                      ) : (
                        <AnimatedBadge
                          status="warning"
                          size="sm"
                          icon={<ShieldOff size={12} />}
                          className="uppercase tracking-widest font-bold">
                          Local Hash
                        </AnimatedBadge>
                      )}
                      <span
                        className="text-[10px] text-zinc-400 font-mono tracking-widest uppercase inline-flex items-center gap-1.5"
                        title={
                          getLatestSessionTime(u)
                            ? new Date(getLatestSessionTime(u)).toLocaleString()
                            : "No entry"
                        }>
                        <Clock size={11} className="text-zinc-500 shrink-0" />
                        Seen: {formatLastSeen(getLatestSessionTime(u))}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    {u.index_number === "24929" ||
                    u.index_number === "25473" ? (
                      <AnimatedBadge
                        status="neutral"
                        size="md"
                        icon={<Key size={12} />}
                        className="uppercase tracking-widest font-bold bg-white/5 border border-white/5 text-[10px]">
                        Dev Lock
                      </AnimatedBadge>
                    ) : (
                      <div className="w-48">
                        <RoleMenuDropdown
                          role={u.role || "admin"}
                          onSave={(newRole) => onRoleChange(u.id, newRole)}
                        />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-5 text-right">
                    {u.role !== "super-admin" &&
                      u.index_number !== "24929" &&
                      u.index_number !== "25473" && (
                        <div
                          className="relative inline-block text-left"
                          onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === u.id ? null : u.id);
                            }}
                            className="p-2.5 text-zinc-500 hover:text-white hover:bg-white/10 rounded-2xl transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                            <MoreHorizontal size={20} />
                          </button>
                          {openMenuId === u.id && (
                            <div className="absolute right-0 mt-2 w-56 rounded-2xl shadow-2xl bg-zinc-950 border border-white/5 ring-1 ring-black ring-opacity-5 z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-right overflow-hidden p-1.5 flex flex-col gap-1 backdrop-blur-sm">
                              <button
                                onClick={() => {
                                  onEditUser(u);
                                  setOpenMenuId(null);
                                }}
                                className="w-full text-left px-3 py-3 rounded-2xl flex items-center gap-3 text-sm font-semibold text-white hover:bg-white/10 hover:text-white transition-colors">
                                <Edit2 size={16} /> Rename Protocol
                              </button>
                              <button
                                onClick={() => {
                                  onResetPassword(u.id);
                                  setOpenMenuId(null);
                                }}
                                className="w-full text-left px-3 py-3 rounded-2xl flex items-center gap-3 text-sm font-semibold text-white hover:bg-white/10 hover:text-white transition-colors">
                                <Key size={16} /> Force Password
                              </button>
                              <button
                                onClick={() => {
                                  onToggleActive(u.id, u.is_active);
                                  setOpenMenuId(null);
                                }}
                                className="w-full text-left px-3 py-3 rounded-2xl flex items-center gap-3 text-sm font-semibold text-amber-400 hover:bg-amber-500/10 hover:text-amber-300 transition-colors">
                                <PowerOff size={16} />{" "}
                                {u.is_active !== false
                                  ? "Suspend User"
                                  : "Restore User"}
                              </button>
                              <div className="h-px bg-white/10 my-1 mx-2"></div>
                              <button
                                onClick={() => {
                                  onDeleteUser(u.id);
                                  setOpenMenuId(null);
                                }}
                                className="w-full text-left px-3 py-3 rounded-2xl flex items-center gap-3 text-sm font-semibold text-red-400 hover:bg-red-600/10 hover:text-red-300 transition-colors">
                                <Trash2 size={16} /> Terminate Access
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-12 text-center text-zinc-600 text-sm font-bold uppercase tracking-widest">
                    No identities registered.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserTableView;
