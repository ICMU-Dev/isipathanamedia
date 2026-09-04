import React, { useState } from "react";
import {
  Globe,
  ShieldOff,
  Key,
  MoreHorizontal,
  Clock,
  Shield,
} from "lucide-react";
import { AnimatedBadge } from "../../../components/motion/animated-badge";
import ClearanceModal from "./ClearanceModal";
import UserActionsModal from "./UserActionsModal";
import { getRoleLabel, isSuperAdmin } from "../../../utils/roles";

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
  onEditUser,
  onResetPassword,
  onToggleActive,
  onDeleteUser,
  onRoleChange,
}) => {
  const [selectedClearanceUser, setSelectedClearanceUser] = useState(null);
  const [selectedActionUser, setSelectedActionUser] = useState(null);

  return (
    <>
      <div className={viewMode === "list" ? "hidden sm:block" : "hidden"}>
        <div className="rounded-2xl bg-[#09090c] border border-white/[0.06] overflow-hidden shadow-2xl backdrop-blur-xl">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left whitespace-nowrap min-w-[800px]">
              <thead className="bg-[#060608] border-b border-white/[0.06] text-zinc-400">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest">
                    User
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest">
                    Sign-in Method
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest">
                    Role
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {users.map((u) => {
                  const isDevLocked =
                    u.index_number === "24929" || u.index_number === "25473";
                  const isSuper = isSuperAdmin(u.role);

                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="relative w-12 h-12 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center font-bold text-lg text-zinc-100 overflow-hidden shrink-0 shadow-inner">
                            <span className="absolute flex items-center justify-center w-full h-full">
                              {u.full_name?.charAt(0)}
                            </span>
                            {u.avatar_url && (
                              <img
                                src={u.avatar_url}
                                alt={u.full_name}
                                loading="lazy"
                                decoding="async"
                                className="w-full h-full object-cover absolute inset-0 z-10"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            )}
                            <div
                              className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-black z-20 ${
                                u.is_active !== false
                                  ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.85)] animate-pulse"
                                  : "bg-red-500"
                              }`}
                            />
                          </div>
                          <div>
                            <div className="font-bold text-white text-base tracking-tight flex items-center gap-2">
                              {u.full_name}
                              {u.is_active === false && (
                                <AnimatedBadge
                                  status="error"
                                  size="sm"
                                  className="text-[9px] uppercase tracking-wider font-bold">
                                  Suspended
                                </AnimatedBadge>
                              )}
                            </div>
                            <div className="text-xs text-zinc-400 font-mono mt-0.5">
                              #{u.index_number}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 items-start">
                          {u.email ? (
                            <AnimatedBadge
                              status="info"
                              size="sm"
                              icon={<Globe size={12} />}
                              className="uppercase tracking-widest font-bold border border-cyan-500/20 bg-cyan-500/10 text-cyan-400"
                              title={u.email}>
                              Google SSO
                            </AnimatedBadge>
                          ) : (
                            <AnimatedBadge
                              status="warning"
                              size="sm"
                              icon={<ShieldOff size={12} />}
                              className="uppercase tracking-widest font-bold border border-amber-500/20 bg-amber-500/10 text-amber-400">
                              Local Hash
                            </AnimatedBadge>
                          )}
                          <span
                            className="text-[10px] text-zinc-400 font-mono tracking-widest uppercase inline-flex items-center gap-1.5"
                            title={
                              getLatestSessionTime(u)
                                ? new Date(
                                    getLatestSessionTime(u),
                                  ).toLocaleString()
                                : "No entry"
                            }>
                            <Clock size={11} className="text-zinc-500 shrink-0" />
                            Seen: {formatLastSeen(getLatestSessionTime(u))}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {isDevLocked ? (
                          <AnimatedBadge
                            status="neutral"
                            size="md"
                            icon={<Key size={12} />}
                            className="uppercase tracking-widest font-bold bg-white/[0.04] border border-white/[0.08] text-zinc-400 text-[10px]">
                            Protected
                          </AnimatedBadge>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setSelectedClearanceUser(u)}
                            title="Update Role"
                            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/[0.08] hover:border-white/20 text-xs font-semibold text-zinc-200 hover:text-white transition-all cursor-pointer shadow-sm">
                            <Shield
                              size={13}
                              className={
                                isSuper ? "text-red-400" : "text-green-400"
                              }
                            />
                            <span>{getRoleLabel(u.role)}</span>
                          </button>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        {!isSuper && !isDevLocked && (
                          <button
                            type="button"
                            onClick={() => setSelectedActionUser(u)}
                            className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                            title="User options">
                            <MoreHorizontal size={18} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Portal-based Modals: Immune to Table overflow-x-auto Clipping */}
      {selectedClearanceUser && (
        <ClearanceModal
          user={selectedClearanceUser}
          onClose={() => setSelectedClearanceUser(null)}
          onSave={async (userId, newRole) => {
            await onRoleChange(userId, newRole);
          }}
        />
      )}

      {selectedActionUser && (
        <UserActionsModal
          user={selectedActionUser}
          onClose={() => setSelectedActionUser(null)}
          onEditUser={onEditUser}
          onResetPassword={onResetPassword}
          onToggleActive={onToggleActive}
          onDeleteUser={onDeleteUser}
        />
      )}
    </>
  );
};

export default UserTableView;
