import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Check, Shield, ShieldAlert, Radio, PenTool, X, Save, RefreshCw } from "lucide-react";
import { parseRoles, getRoleLabel, formatStoredRole } from "../../../utils/roles";
import { toast } from "sonner";

/**
 * RoleMenuDropdown Component
 * 
 * Elegant expandable menu trigger that opens a clean checkbox selection panel
 * with an explicit "Save" button to commit changes and refresh data.
 */
const RoleMenuDropdown = ({ role = "admin", onSave, disabled = false, align = "left" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempRole, setTempRole] = useState(role);
  const [isSaving, setIsSaving] = useState(false);
  const menuRef = useRef(null);

  // Sync tempRole when external role prop changes
  useEffect(() => {
    setTempRole(role);
  }, [role]);

  // Click outside listener to close menu
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
        setTempRole(role); // revert on click away without saving
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, role]);

  const roles = parseRoles(tempRole);
  const isSuper = roles.includes("super-admin") || roles.includes("superadmin") || roles.includes("super_admin");
  const isWrit = roles.includes("writer") && !isSuper;
  const hasAdm = roles.includes("admin") && !isSuper && !isWrit;
  const hasBrd = roles.includes("broadcaster") && !isSuper && !isWrit;

  // Toggle checkbox logic
  const handleToggle = (roleKey) => {
    if (roleKey === "super-admin") {
      if (isSuper) {
        setTempRole("admin");
      } else {
        setTempRole("super-admin");
      }
      return;
    }

    if (roleKey === "writer") {
      if (isWrit) {
        setTempRole("admin");
      } else {
        setTempRole("writer");
      }
      return;
    }

    if (roleKey === "admin") {
      if (isSuper || isWrit) {
        setTempRole("admin");
        return;
      }
      if (hasAdm) {
        if (hasBrd) {
          setTempRole("broadcaster");
        } else {
          setTempRole("broadcaster");
        }
      } else {
        if (hasBrd) {
          setTempRole("admin,broadcaster");
        } else {
          setTempRole("admin");
        }
      }
      return;
    }

    if (roleKey === "broadcaster") {
      if (isSuper || isWrit) {
        setTempRole("broadcaster");
        return;
      }
      if (hasBrd) {
        if (hasAdm) {
          setTempRole("admin");
        } else {
          setTempRole("admin");
        }
      } else {
        if (hasAdm) {
          setTempRole("admin,broadcaster");
        } else {
          setTempRole("broadcaster");
        }
      }
      return;
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const formatted = formatStoredRole(tempRole);
      await onSave(formatted);
      toast.success(`Clearance updated to ${getRoleLabel(formatted)}`);
      setIsOpen(false);
    } catch (err) {
      toast.error(`Update failed: ${err?.message || "Unknown error"}`);
    } finally {
      setIsSaving(false);
    }
  };

  const roleOptions = [
    {
      id: "admin",
      label: "Admin",
      desc: "Full portal & content management",
      icon: Shield,
      checked: hasAdm,
      disabled: isSuper || isWrit,
    },
    {
      id: "broadcaster",
      label: "Broadcaster",
      desc: "Live stream operations panel",
      icon: Radio,
      checked: hasBrd,
      disabled: isSuper || isWrit,
    },
    {
      id: "writer",
      label: "Writer",
      desc: "Limited to newsroom articles",
      icon: PenTool,
      checked: isWrit,
      disabled: isSuper || hasAdm || hasBrd,
    },
    {
      id: "super-admin",
      label: "Super Admin",
      desc: "Unrestricted master clearance",
      icon: ShieldAlert,
      checked: isSuper,
      disabled: isWrit || hasAdm || hasBrd,
    },
  ];

  return (
    <div className={`relative inline-block w-full ${isOpen ? "z-40" : "z-10"}`} ref={menuRef}>
      {/* Trigger Button - Clean & Minimal */}
      <button
        type="button"
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation();
          if (!disabled) setIsOpen((prev) => !prev);
        }}
        className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer shadow-sm ${
          isOpen
            ? "bg-white text-black border-white ring-1 ring-white/40"
            : "bg-black border-white/10 hover:border-white/20 text-white hover:bg-white/[0.04]"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}>
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={`w-2 h-2 rounded-full shrink-0 ${
              isSuper
                ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"
                : hasAdm && hasBrd
                  ? "bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"
                  : hasAdm
                    ? "bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                    : hasBrd
                      ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]"
                      : "bg-zinc-400"
            }`}
          />
          <span className="text-xs font-bold uppercase tracking-wider truncate">
            {getRoleLabel(role)}
          </span>
        </div>
        <ChevronDown
          size={14}
          className={`shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-black" : "text-zinc-500"
          }`}
        />
      </button>

      {/* Expandable Menu Panel */}
      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className={`absolute top-full mt-2 z-50 w-72 p-3 bg-zinc-950 border border-white/15 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in-95 duration-150 ${
            align === "right" ? "right-0" : "left-0"
          }`}>
          <div className="flex items-center justify-between px-1 pb-2 mb-2 border-b border-white/[0.08]">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              Select Clearance
            </span>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setTempRole(role);
              }}
              className="p-1 rounded-lg hover:bg-white/10 text-zinc-500 hover:text-white transition-colors">
              <X size={12} />
            </button>
          </div>

          {/* Checkboxes List */}
          <div className="space-y-1.5 mb-3">
            {roleOptions.map((opt) => {
              const Icon = opt.icon;
              const isChecked = opt.checked;
              const isDisabled = opt.disabled && !isChecked;

              return (
                <div
                  key={opt.id}
                  onClick={() => handleToggle(opt.id)}
                  className={`flex items-center justify-between px-2.5 py-2 rounded-xl border text-left transition-all select-none cursor-pointer ${
                    isChecked
                      ? "bg-white text-black border-white shadow-sm"
                      : isDisabled
                        ? "bg-black/20 text-zinc-600 border-white/[0.03] hover:border-white/10 hover:text-zinc-400"
                        : "bg-black/50 text-zinc-300 border-white/[0.08] hover:border-white/20 hover:bg-white/5"
                  }`}>
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center border transition-all shrink-0 ${
                        isChecked
                          ? "bg-black border-black text-white"
                          : isDisabled
                            ? "border-zinc-800 bg-zinc-900/60"
                            : "border-zinc-600 bg-zinc-900"
                      }`}>
                      {isChecked && <Check size={11} strokeWidth={3} />}
                    </div>
                    <Icon
                      size={13}
                      className={`shrink-0 ${isChecked ? "text-black" : "text-zinc-400"}`}
                    />
                    <div className="min-w-0">
                      <span className="text-xs font-bold uppercase tracking-wider block truncate">
                        {opt.label}
                      </span>
                      <span
                        className={`text-[9px] block truncate ${
                          isChecked ? "text-zinc-700" : "text-zinc-500"
                        }`}>
                        {opt.desc}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Buttons: Save & Cancel */}
          <div className="pt-2 border-t border-white/[0.08] flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setTempRole(role);
              }}
              className="flex-1 py-2 text-center text-xs font-semibold text-zinc-400 hover:text-white rounded-xl hover:bg-white/5 transition-all">
              Cancel
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSave}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-white hover:bg-zinc-200 text-black text-xs font-bold rounded-xl transition-all uppercase tracking-wider shadow-sm hover:scale-[1.02] active:scale-95 disabled:opacity-50">
              {isSaving ? (
                <RefreshCw size={12} className="animate-spin" />
              ) : (
                <Save size={12} />
              )}
              <span>{isSaving ? "Saving..." : "Save"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleMenuDropdown;
