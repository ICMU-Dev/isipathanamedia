import React from "react";
import {
  Edit2,
  Key,
  PowerOff,
  Trash2,
  X,
  Mail,
  ShieldOff,
} from "lucide-react";
import { MorphingModal } from "../../../components/motion/morphing-modal";
import { getRoleLabel } from "../../../utils/roles";

export default function UserActionsModal({
  user,
  onClose,
  onEditUser,
  onResetPassword,
  onToggleActive,
  onDeleteUser,
}) {
  if (!user) return null;

  return (
    <MorphingModal
      viewId={user ? `actions-${user.id}` : null}
      onClose={onClose}
      className="max-w-sm w-full bg-[#0a0a0d]/98 border border-white/[0.08] rounded-[28px] backdrop-blur-2xl shadow-2xl p-0 overflow-hidden">
      {/* Header with full email & identity credentials */}
      <div className="p-5 border-b border-white/[0.06] flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-white/10 flex items-center justify-center font-bold text-white relative overflow-hidden shrink-0 shadow-md">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.full_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{user.full_name?.charAt(0)}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-white tracking-tight truncate">
              {user.full_name}
            </h3>
            <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
              #{user.index_number || "N/A"} • {getRoleLabel(user.role)}
            </p>
            {user.email ? (
              <div className="flex items-center gap-1.5 mt-1 text-xs text-zinc-300 min-w-0">
                <Mail size={12} className="text-cyan-400 shrink-0" />
                <span className="font-mono text-[11px] text-zinc-300 truncate select-all">
                  {user.email}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 mt-1 text-xs text-amber-400/90">
                <ShieldOff size={12} className="shrink-0" />
                <span className="font-mono text-[11px]">
                  Password Login
                </span>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0 ml-2">
          <X size={16} />
        </button>
      </div>

      {/* Action Items */}
      <div className="p-4 space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 px-1 block mb-1">
          Account Actions
        </span>

        {/* 1. Rename */}
        <button
          onClick={() => {
            onClose();
            onEditUser(user);
          }}
          className="w-full flex items-center gap-3.5 p-3 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.05] hover:border-white/12 text-left transition-all group cursor-pointer">
          <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-300 group-hover:text-white shrink-0">
            <Edit2 size={15} />
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-200 group-hover:text-white">
              Update Name
            </p>
            <p className="text-[11px] text-zinc-400">
              Change user's display name
            </p>
          </div>
        </button>

        {/* 2. Reset Password */}
        <button
          onClick={() => {
            onClose();
            onResetPassword(user.id);
          }}
          className="w-full flex items-center gap-3.5 p-3 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.05] hover:border-white/12 text-left transition-all group cursor-pointer">
          <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-300 group-hover:text-white shrink-0">
            <Key size={15} />
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-200 group-hover:text-white">
              Reset Password
            </p>
            <p className="text-[11px] text-zinc-400">
              Create a new login password
            </p>
          </div>
        </button>

        {/* 3. Suspend / Activate */}
        <button
          onClick={() => {
            onClose();
            onToggleActive(user.id, user.is_active);
          }}
          className="w-full flex items-center gap-3.5 p-3 rounded-2xl bg-amber-500/[0.03] hover:bg-amber-500/[0.08] border border-amber-500/15 hover:border-amber-500/25 text-left transition-all group cursor-pointer">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <PowerOff size={15} />
          </div>
          <div>
            <p className="text-xs font-semibold text-amber-300">
              {user.is_active !== false ? "Suspend User" : "Activate User"}
            </p>
            <p className="text-[11px] text-zinc-400">
              {user.is_active !== false
                ? "Temporarily disable account access"
                : "Re-enable account access"}
            </p>
          </div>
        </button>

        {/* 4. Delete */}
        <button
          onClick={() => {
            onClose();
            onDeleteUser(user.id);
          }}
          className="w-full flex items-center gap-3.5 p-3 rounded-2xl bg-red-500/[0.03] hover:bg-red-500/[0.08] border border-red-500/15 hover:border-red-500/25 text-left transition-all group cursor-pointer">
          <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
            <Trash2 size={15} />
          </div>
          <div>
            <p className="text-xs font-semibold text-red-400">
              Delete User
            </p>
            <p className="text-[11px] text-zinc-400">
              Permanently remove this account
            </p>
          </div>
        </button>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/[0.06] bg-black/50 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer">
          Close
        </button>
      </div>
    </MorphingModal>
  );
}
