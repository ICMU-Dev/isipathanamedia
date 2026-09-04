import React, { useState, useEffect } from "react";
import { X, Lock, Check, Shield } from "lucide-react";
import { MorphingModal } from "../../../components/motion/morphing-modal";
import RolePicker from "./RolePicker";
import {
  getRoleLabel,
  formatStoredRole,
  isSuperAdmin,
} from "../../../utils/roles";
import { toast } from "sonner";

export default function ClearanceModal({ user, onClose, onSave }) {
  const [selectedRole, setSelectedRole] = useState(user?.role || "");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user?.role) {
      setSelectedRole(user.role);
    }
  }, [user]);

  if (!user) return null;

  const isDevLocked =
    user.index_number === "24929" || user.index_number === "25473";
  const isSuperUser = isSuperAdmin(user?.role);
  const isProtected = isDevLocked || isSuperUser;

  const hasRoleChanged = Boolean(selectedRole) && selectedRole !== user?.role;
  const canSave = !isProtected && !isSaving && Boolean(selectedRole) && hasRoleChanged;

  const handleSave = async () => {
    if (!canSave) return;
    try {
      setIsSaving(true);
      const formatted = formatStoredRole(selectedRole);
      await onSave(user.id, formatted);
      toast.success(`Role updated to ${getRoleLabel(formatted)}`);
      onClose();
    } catch (err) {
      toast.error(`Update failed: ${err?.message || "Unknown error"}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <MorphingModal
      viewId={user ? `clearance-${user.id}` : null}
      onClose={onClose}
      className="max-w-md w-full bg-[#0a0a0d]/98 border border-white/[0.08] rounded-[28px] backdrop-blur-2xl shadow-2xl p-0 overflow-hidden">
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center font-bold text-white relative overflow-hidden shrink-0 shadow-md">
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
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight truncate">
                {user.full_name}
              </h3>
              {isProtected && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
                  <Lock size={10} /> Protected
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 font-mono mt-0.5 truncate">
              #{user.index_number || "N/A"} •{" "}
              <span className="text-zinc-200 font-medium">
                Current: {getRoleLabel(user.role)}
              </span>
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0 ml-2">
          <X size={18} />
        </button>
      </div>

      {/* Role Picker Section */}
      <div className="p-5 sm:p-6 space-y-3">
        <div className="flex items-center justify-between px-1">
          <div>
            <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              Update Role
            </h4>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Select the new clearance level for this user.
            </p>
          </div>
        </div>

        {isProtected ? (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-3">
            <Lock size={16} className="shrink-0 text-amber-400" />
            <span>
              This is a protected system administrator account. Its role cannot
              be changed.
            </span>
          </div>
        ) : (
          <RolePicker
            value={selectedRole}
            onChange={setSelectedRole}
            disabled={isProtected || isSaving}
          />
        )}
      </div>

      {/* Footer */}
      <div className="p-5 sm:p-6 border-t border-white/[0.08] bg-black/40 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer">
          Cancel
        </button>

        {!isDevLocked && (
          <button
            type="button"
            disabled={!canSave}
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 bg-green-500 hover:bg-green-400 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none text-zinc-950 rounded-xl text-xs font-bold transition-all shadow-[0_0_20px_rgba(34,197,94,0.25)] active:scale-[0.98] cursor-pointer">
            <Shield size={14} />
            {isSaving ? "Updating..." : "Update Role"}
          </button>
        )}
      </div>
    </MorphingModal>
  );
}
