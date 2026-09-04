import React from "react";
import { Shield, ShieldAlert, Radio, PenTool, Check } from "lucide-react";
import { parseRoles } from "../../../utils/roles";

/**
 * Unified RolePicker:
 * - When nothing is checked: All 4 options are enabled.
 * - When Admin is checked: Broadcaster enabled (+Admin allowed), Writer and Super Admin disabled.
 * - When Broadcaster is checked: Admin enabled (+Broadcaster allowed), Writer and Super Admin disabled.
 * - When Writer is checked: All other 3 options disabled.
 * - When Super Admin is checked: All other 3 options disabled.
 * - Unchecking an active role deselects it (reverting to empty if nothing remains).
 */
const RolePicker = ({ value = "", onChange, disabled = false }) => {
  const roles = parseRoles(value);
  const isSuper =
    roles.includes("super-admin") ||
    roles.includes("superadmin") ||
    roles.includes("super_admin");
  const isWrit = roles.includes("writer") && !isSuper;
  const hasAdm = roles.includes("admin") && !isSuper && !isWrit;
  const hasBrd = roles.includes("broadcaster") && !isSuper && !isWrit;
  const nothingChecked = !isSuper && !isWrit && !hasAdm && !hasBrd;

  const handleToggle = (roleKey) => {
    if (disabled) return;

    if (roleKey === "super-admin") {
      onChange(isSuper ? "" : "super-admin");
      return;
    }

    if (roleKey === "writer") {
      onChange(isWrit ? "" : "writer");
      return;
    }

    if (roleKey === "admin") {
      if (hasAdm) {
        onChange(hasBrd ? "broadcaster" : "");
      } else {
        onChange(hasBrd ? "admin,broadcaster" : "admin");
      }
      return;
    }

    if (roleKey === "broadcaster") {
      if (hasBrd) {
        onChange(hasAdm ? "admin" : "");
      } else {
        onChange(hasAdm ? "admin,broadcaster" : "broadcaster");
      }
      return;
    }
  };

  const options = [
    {
      id: "admin",
      label: "Admin",
      desc: "Manage content & settings",
      icon: Shield,
      checked: hasAdm,
      disabled: isSuper || isWrit,
      iconColor: hasAdm ? "text-green-400" : "text-zinc-500",
    },
    {
      id: "broadcaster",
      label: "Broadcaster",
      desc: "Live stream controls",
      icon: Radio,
      checked: hasBrd,
      disabled: isSuper || isWrit,
      iconColor: hasBrd ? "text-cyan-400" : "text-zinc-500",
    },
    {
      id: "writer",
      label: "Writer",
      desc: "News articles & drafts",
      icon: PenTool,
      checked: isWrit,
      disabled: isSuper || hasAdm || hasBrd,
      iconColor: isWrit ? "text-purple-400" : "text-zinc-500",
    },
    {
      id: "super-admin",
      label: "Super Admin",
      desc: "Full system access",
      icon: ShieldAlert,
      checked: isSuper,
      disabled: isWrit || hasAdm || hasBrd,
      iconColor: isSuper ? "text-red-400" : "text-zinc-500",
    },
  ];

  return (
    <div className="space-y-2.5">
      <div className="grid grid-cols-2 gap-2.5">
        {options.map((opt) => {
          const Icon = opt.icon;
          const isChecked = opt.checked;
          const isItemDisabled = opt.disabled && !isChecked;

          return (
            <button
              key={opt.id}
              type="button"
              disabled={disabled || isItemDisabled}
              onClick={() => handleToggle(opt.id)}
              className={`p-3 rounded-2xl border text-left transition-all select-none flex flex-col justify-between ${
                isChecked
                  ? "bg-white/[0.08] border-white/25 text-white shadow-sm ring-1 ring-white/10"
                  : isItemDisabled
                    ? "bg-black/20 border-white/[0.04] text-zinc-600 opacity-40 cursor-not-allowed"
                    : "bg-[#111115] border-white/[0.07] text-zinc-300 hover:text-white hover:border-white/20 hover:bg-white/[0.04] cursor-pointer"
              } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}>
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <Icon size={14} className={`shrink-0 ${opt.iconColor}`} />
                    <span className="text-xs font-semibold tracking-tight truncate">
                      {opt.label}
                    </span>
                  </div>

                  {/* Visible Checkbox Indicator */}
                  <div
                    className={`hidden w-4 h-4 rounded-md border  items-center justify-center shrink-0 transition-all ${
                      isChecked
                        ? "bg-green-500 border-green-400 text-zinc-950 shadow-[0_0_8px_rgba(34,197,94,0.4)]"
                        : "border-white/15 bg-black/30 text-transparent"
                    }`}>
                    {isChecked && <Check size={11} strokeWidth={3} />}
                  </div>
                </div>

                <p className="text-[11px] text-zinc-400 line-clamp-1">
                  {opt.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Status strip */}
      <div className="flex items-center justify-between px-1 text-[11px] text-zinc-400">
        <span>
          Selected role:{" "}
          {nothingChecked ? (
            <span className="text-amber-400/90 font-medium">
              None (Select a role)
            </span>
          ) : (
            <strong className="text-white font-medium">
              {isSuper
                ? "Super Admin"
                : isWrit
                  ? "Writer"
                  : hasAdm && hasBrd
                    ? "Admin + Broadcaster (Dual Role)"
                    : hasAdm
                      ? "Admin"
                      : "Broadcaster"}
            </strong>
          )}
        </span>
        {hasAdm && hasBrd && (
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 font-bold border border-green-500/25">
            Dual Role
          </span>
        )}
      </div>
    </div>
  );
};

export default RolePicker;
