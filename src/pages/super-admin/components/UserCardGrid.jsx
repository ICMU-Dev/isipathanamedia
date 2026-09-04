import React, { useState } from "react";
import {
  Key,
  Shield,
  ShieldAlert,
  Radio,
  PenTool,
  MoreHorizontal,
  Clock,
  CheckCircle2,
  Globe,
  ShieldOff,
  Lock,
} from "lucide-react";
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

const getRoleIcon = (roleStr) => {
  if (isSuperAdmin(roleStr)) return ShieldAlert;
  if (roleStr?.includes("broadcaster") && !roleStr?.includes("admin"))
    return Radio;
  if (roleStr?.includes("writer")) return PenTool;
  return Shield;
};

const UserCardGrid = ({
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
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 ${
          viewMode === "list" ? "block sm:hidden" : "block"
        }`}>
        {users.map((u) => {
          const isDevLocked =
            u.index_number === "24929" || u.index_number === "25473";
          const isSuper = isSuperAdmin(u.role);
          const lastSeen = formatLastSeen(getLatestSessionTime(u));
          const RoleIcon = getRoleIcon(u.role);

          return (
            <div
              key={u.id}
              className="rounded-[24px] bg-[#09090c] border border-white/[0.06] hover:border-white/[0.14] transition-all duration-300 flex flex-col justify-between relative group shadow-2xl hover:shadow-[0_16px_40px_rgba(0,0,0,0.85)] backdrop-blur-2xl p-5 overflow-hidden">
              {/* Subtle Ambient Background Highlight */}

              {/* Profile Top Section - Compact & Icon-Driven */}
              <div className="flex flex-col items-center text-center relative z-10">
                {/* Circular Avatar with Warmer Green Online Indicator Dot */}
                <div className="relative mx-auto mb-2.5">
                  <div className="w-14 h-14 rounded-full bg-zinc-950 border border-white/10 ring-2 ring-black/60 flex items-center justify-center text-xl font-bold text-white overflow-hidden shadow-lg relative">
                    <span className="flex items-center justify-center w-full h-full text-zinc-300 font-semibold select-none">
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
                  </div>
                  {/* Status Indicator Dot at Avatar Rim */}
                  <div
                    className={`absolute top-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#09090c] z-20 ${
                      u.is_active !== false
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                    title={
                      u.is_active !== false ? "Active" : "Suspended"
                    }
                  />
                </div>

                {/* Identity Name with Verified Badge */}
                <h3
                  className="font-bold text-base text-white tracking-tight flex items-center justify-center gap-1.5 line-clamp-1"
                  title={u.full_name}>
                  <span>{u.full_name}</span>
                  <CheckCircle2
                    size={14}
                    className="text-sky-400 fill-sky-400/20 shrink-0"
                  />
                </h3>

                {/* Single Role Pill Badge */}
                <div className="mt-1.5">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/[0.04] border border-white/[0.08] text-zinc-200">
                    <RoleIcon
                      size={12}
                      className={
                        isSuper
                          ? "text-red-400"
                          : u.role?.includes("broadcaster") &&
                              u.role?.includes("admin")
                            ? "text-cyan-400"
                            : "text-green-400"
                      }
                    />
                    <span>{getRoleLabel(u.role)}</span>
                  </div>
                </div>

                {/* Minimal Icon-Driven Metadata Strip */}
                <div className="mt-3 flex items-center justify-center gap-2 text-xs text-zinc-400 flex-wrap">
                  {/* User Index */}
                  <span
                    className="inline-flex items-center gap-1 font-mono text-[11px] text-zinc-400 bg-white/[0.03] px-2.5 py-1 rounded-full border border-white/[0.05]"
                    title={`User #${u.index_number}`}>
                    <Key size={11} className="text-zinc-500" />
                    <span>#{u.index_number}</span>
                  </span>

                  {/* Sign-in Method Tag */}
                  <span
                    className="inline-flex items-center gap-1 text-[11px] text-zinc-400 bg-white/[0.03] px-2.5 py-1 rounded-full border border-white/[0.05]"
                    title={u.email ? "Google sign-in" : "Password sign-in"}>
                    {u.email ? (
                      <>
                        <Globe size={11} className="text-cyan-400 shrink-0" />
                        <span>Google</span>
                      </>
                    ) : (
                      <>
                        <ShieldOff
                          size={11}
                          className="text-amber-400/90 shrink-0"
                        />
                        <span>Password</span>
                      </>
                    )}
                  </span>

                  {/* Last Seen */}
                  <span
                    className="inline-flex items-center gap-1 text-[11px] text-zinc-400 bg-white/[0.03] px-2.5 py-1 rounded-full border border-white/[0.05]"
                    title={
                      getLatestSessionTime(u)
                        ? `Last active: ${new Date(getLatestSessionTime(u)).toLocaleString()}`
                        : "Not active recently"
                    }>
                    <Clock size={11} className="text-zinc-500 shrink-0" />
                    <span>{lastSeen}</span>
                  </span>
                </div>
              </div>

              {/* Bottom Tray */}
              <div className="w-full  mt-4 y-3rounded-b-[24px] flex items-center justify-between gap-2 relative z-10">
                {isDevLocked ? (
                  <div className="flex-1 py-2 px-3 bg-white/[0.02] border border-white/[0.06] rounded-xl text-xs font-mono font-medium tracking-wider uppercase text-zinc-400 flex items-center justify-center gap-1.5">
                    <Lock size={12} className="text-zinc-500" />
                    <span>Protected</span>
                  </div>
                ) : (
                  <button
                    onClick={() => setSelectedClearanceUser(u)}
                    className="flex-1 py-2 px-3 bg-white/[0.04] hover:bg-white/[0.09] border border-white/[0.07] hover:border-white/20 rounded-xl text-xs font-semibold text-zinc-200 hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-[0.98]">
                    <Shield size={13} className="text-green-400" />
                    <span>Update Role</span>
                  </button>
                )}

                {/* Actions Button */}
                {!isSuper && !isDevLocked && (
                  <button
                    onClick={() => setSelectedActionUser(u)}
                    className="p-2 bg-white/[0.04] hover:bg-white/[0.09] border border-white/[0.07] hover:border-white/20 rounded-xl text-zinc-400 hover:text-white transition-all cursor-pointer shadow-sm active:scale-[0.98]"
                    title="User options">
                    <MoreHorizontal size={15} />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {users.length === 0 && (
          <div className="col-span-full py-16 text-center text-zinc-500 text-sm font-semibold tracking-widest uppercase border border-white/[0.06] rounded-3xl bg-[#09090c]">
            No users found.
          </div>
        )}
      </div>

      {/* Portal-based Modals: Immune to Card Overflow & Stacking Context Clipping */}
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

export default UserCardGrid;
