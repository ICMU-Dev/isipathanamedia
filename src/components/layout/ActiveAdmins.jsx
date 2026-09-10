import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useAdminPresence } from "../../hooks/useAdminPresence";
import { Users } from "lucide-react";
import { AvatarGroup, AvatarGroupCount, UserAvatar } from "../ui/avatar";

const ActiveAdmins = ({
  isCollapsed = false,
  isMobile = false,
  disablePopup = false,
}) => {
  const { user } = useAuth();
  const onlineAdmins = useAdminPresence(user);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (onlineAdmins.length === 0) return null;

  // Show fewer avatars when collapsed to prevent horizontal overflow
  const maxAvatars = isCollapsed ? 1 : 3;
  const displayAdmins = onlineAdmins.slice(0, maxAvatars);
  const remaining = onlineAdmins.length - displayAdmins.length;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatars Stack Trigger */}
      <button
        onClick={() => {
          if (!disablePopup) setIsOpen(!isOpen);
        }}
        className={`flex items-center group transition-all duration-200 ${
          isCollapsed ? "justify-center w-full" : ""
        }`}
        title="Active Admins">
        <AvatarGroup>
          {displayAdmins.map((admin, idx) => (
            <UserAvatar
              key={admin.id || idx}
              user={admin}
              size="default"
              showBadge
              badgeClassName="bg-[var(--accent)] border-admin-bg"
              className="border-2 border-admin-bg bg-theme-card text-theme-primary opacity-80 group-hover:border-white/20 transition-colors shadow-sm"
              style={{ zIndex: 10 - idx }}
            />
          ))}
          {remaining > 0 && (
            <AvatarGroupCount
              count={remaining}
              size="default"
              style={{ zIndex: 10 - maxAvatars }}
            />
          )}
        </AvatarGroup>

        {!isCollapsed && !isMobile && (
          <div className="ml-2.5 hidden sm:flex flex-col items-start opacity-60 group-hover:opacity-100 transition-opacity">
            <span className="text-[10px] font-semibold tracking-wide text-theme-primary">
              Online Now
            </span>
            <span className="text-[9px] text-theme-primary opacity-50">
              {onlineAdmins.length} active
            </span>
          </div>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute z-[100] min-w-[220px] animate-liquid-reveal ${
            isMobile
              ? "right-0 top-full mt-2.5 origin-top-right"
              : "left-full ml-6 bottom-0 origin-bottom-left"
          }`}>
          {/* Arrow Notch / Speech Bubble Pointer */}
          {isMobile ? (
            <div className="absolute -top-1.5 right-3.5 w-3 h-3 rotate-45 bg-[var(--admin-card-bg,#121216)] border-t border-l border-[var(--admin-border,rgba(255,255,255,0.08))] pointer-events-none z-20" />
          ) : (
            <div className="absolute -left-1.5 bottom-3.5 w-3 h-3 rotate-45 bg-[var(--admin-card-bg,#121216)] border-b border-l border-[var(--admin-border,rgba(255,255,255,0.08))] pointer-events-none z-20" />
          )}

          {/* Popover Inner Card */}
          <div className="relative z-10 w-full py-2 rounded-2xl border border-[var(--admin-border,rgba(255,255,255,0.08))] bg-[var(--admin-card-bg,#121216)] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.8)] backdrop-blur-2xl overflow-hidden font-sans">
            <div className="px-3 pb-2 mb-2 border-b border-[var(--admin-border,rgba(255,255,255,0.06))] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users size={12} className="text-theme-accent" />
                <span className="text-[10px] font-bold text-[var(--admin-text-secondary,#a1a1aa)] uppercase tracking-wider">
                  Active Admins
                </span>
              </div>
              <span className="px-1.5 py-0.2 rounded-2xl text-[8.5px] font-bold bg-theme-accent/20 text-theme-accent border border-theme-accent/30">
                {onlineAdmins.length}
              </span>
            </div>

            <div className="max-h-[250px] overflow-y-auto hide-scrollbar px-2 space-y-1">
              {onlineAdmins.map((admin) => {
                const isSelf = admin.id === user?.id;

                return (
                  <div
                    key={admin.id}
                    className="flex items-center justify-between gap-2.5 px-2 py-1.5 rounded-2xl hover:bg-white/10 opacity-90 transition-colors group">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <UserAvatar
                        user={admin}
                        size="sm"
                        shape="rounded"
                        showBadge
                        badgeClassName="bg-theme-accent shadow-[0_0_6px_rgba(var(--accent-rgb,75,196,51),0.8)]"
                        className="bg-white/5 border border-white/10 shrink-0"
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="text-[11px] font-medium text-[var(--admin-text-primary,#fff)] opacity-90 truncate">
                          {admin.name}{" "}
                          {isSelf && <span className="text-white/30">(You)</span>}
                        </span>
                        <span className="text-[9px] text-[var(--admin-text-secondary,#a1a1aa)] capitalize truncate">
                          {admin.role || "Admin"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveAdmins;
