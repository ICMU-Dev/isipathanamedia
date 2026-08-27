import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useAdminPresence } from "../../hooks/useAdminPresence";
import { Users } from "lucide-react";

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
        <div className="flex -space-x-2">
          {displayAdmins.map((admin, idx) => {
            const pic =
              admin.avatarUrl || admin.profile || admin.profile_picture;
            return (
              <div
                key={admin.id || idx}
                className="w-8 h-8 rounded-full bg-theme-card border-2 border-admin-bg flex items-center justify-center text-[10px] font-bold text-theme-primary opacity-80 relative group-hover:border-white/20 transition-colors shadow-sm"
                style={{ zIndex: 10 - idx }}>
                {pic ? (
                  <img
                    src={pic}
                    alt={admin.name || "Admin"}
                    width={28}
                    height={28}
                    loading="lazy"
                    className="w-full h-full rounded-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      e.currentTarget.nextSibling.style.display = "flex";
                    }}
                  />
                ) : null}
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ display: pic ? "none" : "flex" }}>
                  {admin.name ? admin.name.charAt(0).toUpperCase() : "A"}
                </div>
                <div className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-[var(--accent)] border border-admin-bg" />
              </div>
            );
          })}
          {remaining > 0 && (
            <div
              className="w-8 h-8 rounded-full bg-[var(--admin-border)] border-2 border-[#0c0c0c] flex items-center justify-center text-[9px] font-bold text-theme-primary opacity-60"
              style={{ zIndex: 10 - maxAvatars }}>
              +{remaining}
            </div>
          )}
        </div>

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
          className={`absolute z-[100] py-2 min-w-[220px] rounded-2xl border border-white/5 bg-[var(--admin-card-bg)] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.8)] animate-liquid-reveal ${
            isMobile
              ? "right-0 top-full mt-3"
              : isCollapsed
                ? "left-full ml-4 bottom-0"
                : "left-0 bottom-full mb-2"
          } ${isMobile ? "origin-top-right" : isCollapsed ? "origin-bottom-left" : "origin-bottom-left"}`}>
          <div className="px-3 pb-2 mb-2 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users size={12} className="text-white/40" />
              <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">
                Active Admins
              </span>
            </div>
          </div>

          <div className="max-h-[250px] overflow-y-auto hide-scrollbar px-2 space-y-1">
            {onlineAdmins.map((admin) => {
              const pic =
                admin.avatarUrl || admin.profile || admin.profile_picture;
              const isSelf = admin.id === user?.id;

              return (
                <div
                  key={admin.id}
                  className="flex items-center justify-between gap-2.5 px-2 py-1.5 rounded-2xl hover:bg-white/10 opacity-90 transition-colors group">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-bold text-white opacity-70 shrink-0 relative">
                      {pic ? (
                        <img
                          src={pic}
                          alt={admin.name || "Admin"}
                          width={24}
                          height={24}
                          loading="lazy"
                          className="w-full h-full rounded-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            e.currentTarget.nextSibling.style.display = "flex";
                          }}
                        />
                      ) : null}
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ display: pic ? "none" : "flex" }}>
                        {admin.name ? admin.name.charAt(0).toUpperCase() : "A"}
                      </div>
                      <div className="absolute bottom-0 right-0 w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[11px] font-medium text-white opacity-90 truncate">
                        {admin.name}{" "}
                        {isSelf && <span className="text-white/30">(You)</span>}
                      </span>
                      <span className="text-[9px] text-white/50 capitalize truncate">
                        {admin.role || "Admin"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveAdmins;
