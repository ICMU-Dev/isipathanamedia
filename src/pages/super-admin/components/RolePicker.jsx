import React from "react";
import { Shield, ShieldAlert, Radio, PenTool, Check } from "lucide-react";
import { parseRoles } from "../../../utils/roles";

/**
 * RolePicker with Checkbox Logic
 * 
 * Enforces business logic:
 * - Super Admin: Solo role. When checked, disables/replaces other selections.
 * - Writer: Solo role. When checked, disables/replaces other selections.
 * - Admin: Can be combined ONLY with Broadcaster.
 * - Broadcaster: Can be combined ONLY with Admin.
 */
const RolePicker = ({ value = "admin", onChange, disabled = false, compact = false }) => {
  const roles = parseRoles(value);
  const isSuper = roles.includes("super-admin") || roles.includes("superadmin") || roles.includes("super_admin");
  const isWrit = roles.includes("writer") && !isSuper;
  const hasAdm = roles.includes("admin") && !isSuper && !isWrit;
  const hasBrd = roles.includes("broadcaster") && !isSuper && !isWrit;

  // Toggle handler implementing the checkbox rules
  const handleToggle = (roleKey) => {
    if (disabled) return;

    if (roleKey === "super-admin") {
      if (isSuper) {
        // If already super-admin, clicking unchecks and defaults to admin
        onChange("admin");
      } else {
        // Super Admin disables all other selections (solo)
        onChange("super-admin");
      }
      return;
    }

    if (roleKey === "writer") {
      if (isWrit) {
        // If already writer, clicking unchecks and defaults to admin
        onChange("admin");
      } else {
        // Writer disables all other selections (solo)
        onChange("writer");
      }
      return;
    }

    if (roleKey === "admin") {
      if (isSuper || isWrit) {
        // Switch from solo role to admin
        onChange("admin");
        return;
      }
      if (hasAdm) {
        // Unchecking admin: if broadcaster is checked, keep broadcaster; otherwise switch to broadcaster
        if (hasBrd) {
          onChange("broadcaster");
        } else {
          // Cannot have 0 roles: toggle to broadcaster or keep admin
          onChange("broadcaster");
        }
      } else {
        // Checking admin: if broadcaster is already checked, form combo
        if (hasBrd) {
          onChange("admin,broadcaster");
        } else {
          onChange("admin");
        }
      }
      return;
    }

    if (roleKey === "broadcaster") {
      if (isSuper || isWrit) {
        // Switch from solo role to broadcaster
        onChange("broadcaster");
        return;
      }
      if (hasBrd) {
        // Unchecking broadcaster: if admin is checked, keep admin; otherwise switch to admin
        if (hasAdm) {
          onChange("admin");
        } else {
          // Cannot have 0 roles: toggle to admin
          onChange("admin");
        }
      } else {
        // Checking broadcaster: if admin is already checked, form combo
        if (hasAdm) {
          onChange("admin,broadcaster");
        } else {
          onChange("broadcaster");
        }
      }
      return;
    }
  };

  const roleDefinitions = [
    {
      id: "admin",
      label: "Admin",
      desc: "Full administrative portal & content management",
      icon: Shield,
      checked: hasAdm,
      disabled: isSuper || isWrit,
      disabledNote: isSuper ? "Disabled (Super Admin selected)" : isWrit ? "Disabled (Writer selected)" : null,
      comboNote: hasAdm && !hasBrd ? "Can also check Broadcaster" : null,
    },
    {
      id: "broadcaster",
      label: "Broadcaster",
      desc: "Broadcasting operations terminal access",
      icon: Radio,
      checked: hasBrd,
      disabled: isSuper || isWrit,
      disabledNote: isSuper ? "Disabled (Super Admin selected)" : isWrit ? "Disabled (Writer selected)" : null,
      comboNote: hasBrd && !hasAdm ? "Can also check Admin" : null,
    },
    {
      id: "writer",
      label: "Writer",
      desc: "Strictly isolated to Newsroom & Article editor",
      icon: PenTool,
      checked: isWrit,
      disabled: isSuper || hasAdm || hasBrd,
      disabledNote: isSuper ? "Disabled (Super Admin selected)" : (hasAdm || hasBrd) ? "Disabled (Admin/Broadcaster selected)" : null,
    },
    {
      id: "super-admin",
      label: "Super Admin",
      desc: "Unrestricted master access across all 4 dashboards",
      icon: ShieldAlert,
      checked: isSuper,
      disabled: isWrit || hasAdm || hasBrd,
      disabledNote: isWrit ? "Disabled (Writer selected)" : (hasAdm || hasBrd) ? "Disabled (Admin/Broadcaster selected)" : null,
    },
  ];

  if (compact) {
    return (
      <div className="space-y-1.5 w-full">
        {roleDefinitions.map((item) => {
          const Icon = item.icon;
          const isItemChecked = item.checked;
          const isItemDisabled = item.disabled && !isItemChecked;

          return (
            <div
              key={item.id}
              onClick={() => handleToggle(item.id)}
              className={`flex items-center justify-between px-3 py-2 rounded-xl border text-left transition-all select-none cursor-pointer ${
                isItemChecked
                  ? "bg-white text-black border-white shadow-sm"
                  : isItemDisabled
                    ? "bg-black/30 text-zinc-600 border-white/[0.04] hover:border-white/15 hover:text-zinc-400"
                    : "bg-black/60 text-zinc-300 border-white/10 hover:border-white/20 hover:bg-white/5"
              } ${disabled ? "opacity-50 pointer-events-none" : ""}`}>
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                    isItemChecked
                      ? "bg-black border-black text-white"
                      : isItemDisabled
                        ? "border-zinc-700 bg-zinc-900/50"
                        : "border-zinc-600 bg-zinc-900"
                  }`}>
                  {isItemChecked && <Check size={12} strokeWidth={3} />}
                </div>
                <Icon size={13} className={isItemChecked ? "text-black" : "text-zinc-400"} />
                <span className="text-xs font-bold uppercase tracking-wider truncate">
                  {item.label}
                </span>
              </div>
              {isItemChecked && (
                <span className="text-[9px] font-mono uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-black/10 text-black">
                  Active
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {roleDefinitions.map((item) => {
          const Icon = item.icon;
          const isItemChecked = item.checked;
          const isItemDisabled = item.disabled && !isItemChecked;

          return (
            <div
              key={item.id}
              onClick={() => handleToggle(item.id)}
              className={`p-3.5 rounded-2xl border text-left transition-all select-none cursor-pointer flex flex-col justify-between relative group ${
                isItemChecked
                  ? "bg-white text-black border-white shadow-lg"
                  : isItemDisabled
                    ? "bg-black/40 text-zinc-500 border-white/[0.05] hover:border-white/20 hover:text-zinc-300"
                    : "bg-zinc-950/80 text-zinc-300 border-white/10 hover:border-white/20 hover:bg-white/[0.03]"
              } ${disabled ? "opacity-50 pointer-events-none" : ""}`}>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    {/* Custom Styled Checkbox */}
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                        isItemChecked
                          ? "bg-black border-black text-white"
                          : isItemDisabled
                            ? "border-zinc-700 bg-zinc-900/60"
                            : "border-zinc-600 bg-zinc-900 group-hover:border-zinc-400"
                      }`}>
                      {isItemChecked && <Check size={12} strokeWidth={3} />}
                    </div>
                    <Icon size={14} className={isItemChecked ? "text-black" : "text-zinc-400"} />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {item.label}
                    </span>
                  </div>

                  {isItemChecked && (
                    <span className="text-[9px] font-mono uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-black/10 text-black">
                      Active
                    </span>
                  )}
                </div>

                <p
                  className={`text-[11px] leading-tight ${
                    isItemChecked ? "text-zinc-700" : "text-zinc-400"
                  }`}>
                  {item.desc}
                </p>
              </div>

              {/* Status / Combination helper note */}
              {isItemDisabled && item.disabledNote && (
                <div className="mt-2 text-[9px] font-mono uppercase tracking-wider text-zinc-500">
                  {item.disabledNote}
                </div>
              )}
              {isItemChecked && item.comboNote && (
                <div className="mt-2 text-[9px] font-bold text-zinc-800 uppercase tracking-wider">
                  + {item.comboNote}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Helper text showing the selected status */}
      <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[11px] text-zinc-400">
        <span>
          Selected clearance:{" "}
          <strong className="text-white">
            {isSuper
              ? "Super Admin"
              : isWrit
                ? "Writer"
                : hasAdm && hasBrd
                  ? "Admin + Broadcaster (Dual Clearance)"
                  : hasAdm
                    ? "Admin"
                    : hasBrd
                      ? "Broadcaster"
                      : "None"}
          </strong>
        </span>
        {hasAdm && hasBrd && (
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
            Dual Clearance
          </span>
        )}
      </div>
    </div>
  );
};

export default RolePicker;
