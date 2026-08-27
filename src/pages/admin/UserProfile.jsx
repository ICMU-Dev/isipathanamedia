import Loader from "../../components/ui/Loader";
import { MorphingModal } from "../../components/motion/morphing-modal";
import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  User,
  Key,
  LogOut,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ChevronRight,
  Monitor,
  Smartphone,
  Camera,
  ShieldCheck,
  Edit2,
  Power,
} from "lucide-react";
import { AnimatedBadge } from "../../components/motion/animated-badge";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../components/motion/tabs";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabaseClient";
import TabHeader from "../../components/admin/TabHeader";
import ProfileSkeleton from "../../components/admin/ProfileSkeleton";
import { useLocation, useNavigate } from "react-router-dom";

const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;
const SECONDS_PER_DAY = 86400;
const SECONDS_IN_TWO_DAYS = 172800;
const TOAST_DURATION_MS = 5000;
const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024;
const MIN_PASSWORD_LENGTH = 6;

const formatRelativeTime = (dateString) => {
  if (!dateString) return "Unknown";
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((new Date() - date) / 1000);

  if (diffInSeconds < SECONDS_PER_MINUTE) return "Just now";
  if (diffInSeconds < SECONDS_PER_HOUR) {
    return `${Math.floor(diffInSeconds / SECONDS_PER_MINUTE)} minutes ago`;
  }
  if (diffInSeconds < SECONDS_PER_DAY) {
    const hours = Math.floor(diffInSeconds / SECONDS_PER_HOUR);
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  }
  if (diffInSeconds < SECONDS_IN_TWO_DAYS) return "Yesterday";
  return date.toLocaleDateString();
};

const parseSessionDetails = (session) => {
  const isMobile =
    session.deviceName?.includes("iOS") ||
    session.deviceName?.includes("Android");
  const [osBrowser, locationText] =
    session.deviceName?.split("(") || ["Unknown", ""];
  const location = locationText
    ? locationText.replace(")", "").trim()
    : "Unknown Location";
  const [os, browser] = osBrowser.split("•").map((s) => s?.trim());
  const displayName = session.customName || location;

  return { isMobile, location, os, browser, displayName };
};

const getInitials = (name) => {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

const UserProfile = () => {
  const {
    user,
    logout,
    setPassword,
    uploadCustomAvatar,
    deleteCustomAvatar,
    restoreGoogleAvatar,
    unlinkGoogleIdentity,
    renameDeviceSession,
    revokeDeviceSession,
    revokeAllOtherSessions,
  } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isSavingName, setIsSavingName] = useState(false);
  const [isSavingPass, setIsSavingPass] = useState(false);
  const [isLinkingGoogle, setIsLinkingGoogle] = useState(false);
  const [isUnlinkingGoogle, setIsUnlinkingGoogle] = useState(false);
  const [googleActionModal, setGoogleActionModal] = useState(null);
  const [revokingSessionId, setRevokingSessionId] = useState(null);
  const [isFreezingAccount, setIsFreezingAccount] = useState(false);

  // Unified modal state
  const [activeModal, setActiveModal] = useState(null);
  const [modalContext, setModalContext] = useState(null);

  const currentDeviceId = localStorage.getItem("icmu_device_id");

  // Form States
  const [newName, setNewName] = useState("");
  const [passwords, setPasswords] = useState({ new: "", confirm: "" });

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isDeletingAvatar, setIsDeletingAvatar] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const [googleAvatarUrl, setGoogleAvatarUrl] = useState(null);
  const [isRestoringGoogle, setIsRestoringGoogle] = useState(false);

  // Hash-based tab routing
  const activeTab = location.hash?.replace("#", "") || "general";
  const setActiveTab = (tab) => navigate({ hash: tab }, { replace: true });

  const fileInputRef = useRef(null);

  // ─── Data Fetching ───
  useEffect(() => {
    if (user) fetchUserData();
  }, [user]);

  const fetchUserData = async () => {
    try {
      let query = null;
      if (user?.id) {
        query = supabase.from("users").select("*").eq("id", user.id);
      } else if (user?.indexNumber) {
        query = supabase
          .from("users")
          .select("*")
          .eq("index_number", user.indexNumber);
      } else if (user?.email) {
        query = supabase.from("users").select("*").eq("email", user.email);
      }

      if (!query) return;

      const { data: dbData } = await query.maybeSingle();
      if (dbData) {
        setUserData(dbData);
        setNewName(dbData.full_name || "");
      }
    } catch {
      setMsg({ type: "error", text: "Failed to load profile." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!msg.text) return;
    const timer = setTimeout(
      () => setMsg({ type: "", text: "" }),
      TOAST_DURATION_MS,
    );
    return () => clearTimeout(timer);
  }, [msg]);

  // Fix BFCache stuck loading state when swiping back from OAuth
  useEffect(() => {
    const handlePageShow = (e) => {
      if (e.persisted) {
        setIsLinkingGoogle(false);
      }
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  // ─── Actions ───
  const handleRenameDevice = async () => {
    if (!modalContext?.sessionId || !newName.trim()) {
      setActiveModal(null);
      return;
    }
    const result = await renameDeviceSession(
      modalContext.sessionId,
      newName.trim(),
    );
    if (result.success) {
      setMsg({ type: "success", text: "Device name updated." });
      setUserData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          active_sessions: prev.active_sessions.map((s) =>
            s.sessionId === modalContext.sessionId
              ? { ...s, customName: newName.trim() }
              : s,
          ),
        };
      });
    } else {
      setMsg({
        type: "error",
        text: result.message || "Failed to rename device.",
      });
    }
    setActiveModal(null);
    setNewName("");
  };

  const handlePanicMode = async () => {
    setActiveModal(null);
    setIsFreezingAccount(true);
    try {
      const res = await revokeAllOtherSessions(currentDeviceId);
      if (res.success) {
        setMsg({
          type: "success",
          text: "All other sessions have been terminated.",
        });
        fetchUserData(); // refresh list
      } else {
        setMsg({ type: "error", text: res.message });
      }
    } catch {
      setMsg({ type: "error", text: "Failed to freeze account." });
    } finally {
      setIsFreezingAccount(false);
    }
  };

  const handleRevokeSession = async (sessionId) => {
    setRevokingSessionId(sessionId);
    try {
      const res = await revokeDeviceSession(sessionId);
      if (res.success) {
        setUserData((prev) => ({
          ...prev,
          active_sessions: prev.active_sessions.filter(
            (s) => s.sessionId !== sessionId,
          ),
        }));
        setMsg({ type: "success", text: "Session revoked successfully." });
      } else {
        throw new Error(res.message);
      }
    } catch (err) {
      setMsg({
        type: "error",
        text: err.message || "Failed to revoke session.",
      });
    } finally {
      setRevokingSessionId(null);
    }
  };

  const handleLinkGoogleAccount = async () => {
    setIsLinkingGoogle(true);
    setMsg({ type: "", text: "" });
    try {
      localStorage.setItem("icmu_auth_action", "link");
      const callbackUrl = `${window.location.origin}/auth/google/callback`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callbackUrl,
          queryParams: { access_type: "offline", prompt: "consent" },
        },
      });
      if (error) throw error;
    } catch (err) {
      setMsg({
        type: "error",
        text: err.message || "Failed to initiate Google account linking.",
      });
      setIsLinkingGoogle(false);
    }
  };

  const handleUnlinkGoogleAccount = async () => {
    setIsUnlinkingGoogle(true);
    setMsg({ type: "", text: "" });
    try {
      const res = await unlinkGoogleIdentity();
      if (!res.success) throw new Error(res.message);

      setUserData((prev) => ({ ...prev, email: null })); // Optionally clear email or keep it if they have a password
      setMsg({
        type: "success",
        text: "Google account unlinked successfully.",
      });
    } catch (err) {
      setMsg({
        type: "error",
        text: err.message || "Failed to unlink Google account.",
      });
    } finally {
      setIsUnlinkingGoogle(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMsg({
        type: "error",
        text: "Please upload a valid image file.",
      });
      return;
    }
    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      setMsg({ type: "error", text: "Image must be under 2MB." });
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const res = await uploadCustomAvatar(file);
      if (res.success) {
        setUserData((prev) => ({ ...prev, avatar_url: res.avatarUrl }));
        setMsg({ type: "success", text: "Profile picture updated!" });
      } else {
        setMsg({ type: "error", text: res.message || "Upload failed." });
      }
    } catch {
      setMsg({ type: "error", text: "An error occurred." });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleDeleteAvatar = async () => {
    setIsDeletingAvatar(true);
    try {
      const res = await deleteCustomAvatar();
      if (res.success) {
        setUserData((prev) => ({ ...prev, avatar_url: null }));
        setMsg({ type: "success", text: "Profile picture deleted." });
      } else {
        setMsg({ type: "error", text: res.message || "Delete failed." });
      }
    } catch {
      setMsg({ type: "error", text: "An error occurred." });
    } finally {
      setIsDeletingAvatar(false);
    }
  };

  useEffect(() => {
    const fetchGoogleAvatar = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user?.user_metadata?.avatar_url) {
        setGoogleAvatarUrl(data.user.user_metadata.avatar_url);
      }
    };
    fetchGoogleAvatar();
  }, []);

  const handleUseGoogleAvatar = async () => {
    if (!googleAvatarUrl) return;
    setIsRestoringGoogle(true);
    try {
      const res = await restoreGoogleAvatar(googleAvatarUrl);
      if (!res.success) throw new Error(res.message);

      setUserData((prev) => ({ ...prev, avatar_url: googleAvatarUrl }));
      setMsg({ type: "success", text: "Google profile picture restored!" });
    } catch (err) {
      setMsg({
        type: "error",
        text: err.message || "Failed to restore Google picture.",
      });
    } finally {
      setIsRestoringGoogle(false);
    }
  };

  const handleUpdateName = async (e) => {
    e?.preventDefault();
    if (!newName.trim()) {
      setMsg({ type: "error", text: "Display name cannot be empty." });
      return;
    }
    setIsSavingName(true);
    try {
      const { error } = await supabase
        .from("users")
        .update({ full_name: newName.trim() })
        .eq("id", user.id);
      if (error) throw error;
      setUserData((prev) => ({ ...prev, full_name: newName.trim() }));
      setActiveModal(null);
      setMsg({ type: "success", text: "Display name updated." });
    } catch {
      setMsg({ type: "error", text: "Update failed." });
    } finally {
      setIsSavingName(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.new.length < MIN_PASSWORD_LENGTH) {
      setMsg({
        type: "error",
        text: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
      });
      return;
    }
    if (passwords.new !== passwords.confirm) {
      setMsg({ type: "error", text: "Passwords do not match." });
      return;
    }

    setIsSavingPass(true);
    try {
      const result = await setPassword(user.indexNumber, passwords.new);
      if (!result.success) throw new Error(result.message);
      setPasswords({ new: "", confirm: "" });
      setMsg({ type: "success", text: "Password updated successfully." });
    } catch (error) {
      setMsg({
        type: "error",
        text: error.message || "Password update failed.",
      });
    } finally {
      setIsSavingPass(false);
    }
  };

  const sortedSessions = useMemo(() => {
    if (!userData?.active_sessions?.length) return [];
    return [...userData.active_sessions].sort((a, b) => {
      if (a.sessionId === currentDeviceId) return -1;
      if (b.sessionId === currentDeviceId) return 1;
      return new Date(b.loginTime || 0) - new Date(a.loginTime || 0);
    });
  }, [userData?.active_sessions, currentDeviceId]);

  const currentAvatar = userData?.avatar_url || user?.avatarUrl;

  const renderModalContent = () => {
    if (activeModal === "edit_name") {
      return (
        <div className="p-2 flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
          <div className="w-12 h-12 rounded-full bg-[var(--admin-input-bg)] flex items-center justify-center mb-4 border border-[var(--admin-border)]">
            <User size={20} className="text-[var(--admin-text-secondary)]" />
          </div>
          <h3 className="text-lg font-bold text-[var(--admin-text-primary)] text-center">
            Change Name
          </h3>
          <p className="text-xs text-[var(--admin-text-secondary)] mt-1 mb-6 text-center max-w-[260px] mx-auto">
            Update how your name appears across the dashboard.
          </p>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Your full name"
            autoFocus
            className="w-full bg-[var(--admin-input-bg)] border border-[var(--admin-border)] focus:border-white/20 rounded-2xl px-4 py-3 text-[13px] text-[var(--admin-text-primary)] focus:outline-none mb-4 text-center"
          />
          <div className="flex w-full gap-3 mt-2">
            <button
              onClick={() => setActiveModal(null)}
              className="flex-1 py-3 px-4 rounded-2xl bg-[var(--admin-input-bg)] hover:bg-[var(--admin-border)] text-[var(--admin-text-primary)] text-xs font-bold transition-colors">
              Cancel
            </button>
            <button
              onClick={handleUpdateName}
              disabled={isSavingName || !newName.trim()}
              className="flex-1 py-3 px-4 rounded-2xl bg-white text-black hover:bg-white/90 text-xs font-bold transition-colors disabled:opacity-50 flex justify-center">
              {isSavingName ? (
                <Loader size={14} className="text-current" />
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </div>
      );
    }

    if (activeModal === "edit_password") {
      return (
        <div className="p-2 flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
          <div className="w-12 h-12 rounded-full bg-amber-400/10 flex items-center justify-center mb-4 border border-amber-400/20">
            <Key size={20} className="text-amber-400" />
          </div>
          <h3 className="text-lg font-bold text-[var(--admin-text-primary)] text-center">
            Change Password
          </h3>
          <p className="text-xs text-[var(--admin-text-secondary)] mt-1 mb-6 text-center max-w-[260px] mx-auto">
            Enter your new secure password below.
          </p>
          <div className="w-full space-y-3 mb-4">
            <input
              type="password"
              value={passwords.new}
              onChange={(e) =>
                setPasswords((p) => ({ ...p, new: e.target.value }))
              }
              placeholder={`New Password (min ${MIN_PASSWORD_LENGTH} chars)`}
              autoFocus
              className="w-full bg-[var(--admin-input-bg)] border border-[var(--admin-border)] focus:border-amber-400/30 rounded-2xl px-4 py-3 text-[13px] text-[var(--admin-text-primary)] focus:outline-none"
            />
            <input
              type="password"
              value={passwords.confirm}
              onChange={(e) =>
                setPasswords((p) => ({ ...p, confirm: e.target.value }))
              }
              placeholder="Confirm Password"
              className="w-full bg-[var(--admin-input-bg)] border border-[var(--admin-border)] focus:border-amber-400/30 rounded-2xl px-4 py-3 text-[13px] text-[var(--admin-text-primary)] focus:outline-none"
            />
          </div>
          <div className="flex w-full gap-3 mt-2">
            <button
              onClick={() => setActiveModal(null)}
              className="flex-1 py-3 px-4 rounded-2xl bg-[var(--admin-input-bg)] hover:bg-[var(--admin-border)] text-[var(--admin-text-primary)] text-xs font-bold transition-colors">
              Cancel
            </button>
            <button
              onClick={handleChangePassword}
              disabled={
                isSavingPass ||
                !passwords.new ||
                passwords.new.length < MIN_PASSWORD_LENGTH ||
                passwords.new !== passwords.confirm
              }
              className="flex-1 py-3 px-4 rounded-2xl bg-amber-400 text-black hover:bg-amber-300 text-xs font-bold transition-colors disabled:opacity-50 flex justify-center">
              {isSavingPass ? (
                <Loader size={14} className="text-current" />
              ) : (
                "Update"
              )}
            </button>
          </div>
        </div>
      );
    }

    if (activeModal === "rename_device") {
      return (
        <div className="p-2 flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
          <div className="w-12 h-12 rounded-full bg-[var(--admin-input-bg)] flex items-center justify-center mb-4 border border-[var(--admin-border)]">
            <Monitor size={20} className="text-[var(--admin-text-secondary)]" />
          </div>
          <h3 className="text-lg font-bold text-[var(--admin-text-primary)] text-center">
            Rename Device
          </h3>
          <p className="text-xs text-[var(--admin-text-secondary)] mt-1 mb-6 text-center max-w-[260px] mx-auto">
            Give this device a custom name to recognize it easily.
          </p>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. My Work Laptop"
            autoFocus
            className="w-full bg-[var(--admin-input-bg)] border border-[var(--admin-border)] focus:border-white/20 rounded-2xl px-4 py-3 text-[13px] text-[var(--admin-text-primary)] focus:outline-none mb-4 text-center"
          />
          <div className="flex w-full gap-3 mt-2">
            <button
              onClick={() => setActiveModal(null)}
              className="flex-1 py-3 px-4 rounded-2xl bg-[var(--admin-input-bg)] hover:bg-[var(--admin-border)] text-[var(--admin-text-primary)] text-xs font-bold transition-colors">
              Cancel
            </button>
            <button
              onClick={handleRenameDevice}
              disabled={!newName.trim()}
              className="flex-1 py-3 px-4 rounded-2xl bg-white text-black hover:bg-white/90 text-xs font-bold transition-colors disabled:opacity-50 flex justify-center">
              Save
            </button>
          </div>
        </div>
      );
    }

    if (activeModal === "revoke_device") {
      return (
        <div className="p-2 flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
          <div className="w-12 h-12 rounded-full bg-red-600/10 flex items-center justify-center mb-4 border border-red-600/20">
            <Power size={20} className="text-red-400" />
          </div>
          <h3 className="text-lg font-bold text-[var(--admin-text-primary)] text-center">
            Log Out Device
          </h3>
          <p className="text-xs text-[var(--admin-text-secondary)] mt-1 mb-6 text-center max-w-[260px] mx-auto">
            Are you sure you want to sign out{" "}
            <strong className="text-[var(--admin-text-primary)]">
              {modalContext?.deviceLabel}
            </strong>
            ?
          </p>
          <div className="flex w-full gap-3 mt-2">
            <button
              onClick={() => setActiveModal(null)}
              className="flex-1 py-3 px-4 rounded-2xl bg-[var(--admin-input-bg)] hover:bg-[var(--admin-border)] text-[var(--admin-text-primary)] text-xs font-bold transition-colors">
              Cancel
            </button>
            <button
              onClick={() => {
                handleRevokeSession(modalContext?.sessionId);
                setActiveModal(null);
              }}
              className="flex-1 py-3 px-4 rounded-2xl bg-red-600 text-[var(--admin-text-primary)] hover:bg-red-600 text-xs font-bold transition-colors flex justify-center">
              Log Out Device
            </button>
          </div>
        </div>
      );
    }

    if (activeModal === "panic_mode") {
      return (
        <div className="p-2 flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
          <div className="w-12 h-12 rounded-full bg-red-600/10 flex items-center justify-center mb-4 border border-red-600/20">
            <AlertTriangle size={20} className="text-red-400" />
          </div>
          <h3 className="text-lg font-bold text-[var(--admin-text-primary)] text-center">
            Threat Control
          </h3>
          <p className="text-xs text-[var(--admin-text-secondary)] mt-1 mb-6 text-center max-w-[260px] mx-auto">
            This will instantly terminate{" "}
            <strong className="text-red-400">ALL</strong> other active
            sessions. You will remain logged in only on this device.
          </p>
          <div className="flex w-full gap-3 mt-2">
            <button
              onClick={() => setActiveModal(null)}
              className="flex-1 py-3 px-4 rounded-2xl bg-[var(--admin-input-bg)] hover:bg-[var(--admin-border)] text-[var(--admin-text-primary)] text-xs font-bold transition-colors">
              Cancel
            </button>
            <button
              onClick={handlePanicMode}
              className="flex-1 py-3 px-4 rounded-2xl bg-red-600 text-[var(--admin-text-primary)] hover:bg-red-600 text-xs font-bold transition-colors flex justify-center">
              Terminate All
            </button>
          </div>
        </div>
      );
    }

    if (activeModal === "sign_out") {
      return (
        <div className="p-2 flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
          <div className="w-12 h-12 rounded-full bg-red-600/10 flex items-center justify-center mb-4 border border-red-600/20">
            <LogOut size={20} className="text-red-400" />
          </div>
          <h3 className="text-lg font-bold text-[var(--admin-text-primary)] text-center">
            Sign Out
          </h3>
          <p className="text-xs text-[var(--admin-text-secondary)] mt-1 mb-6 text-center max-w-[260px] mx-auto">
            Are you sure you want to log out of your account on this device?
          </p>
          <div className="flex w-full gap-3 mt-2">
            <button
              onClick={() => setActiveModal(null)}
              className="flex-1 py-3 px-4 rounded-2xl bg-[var(--admin-input-bg)] hover:bg-[var(--admin-border)] text-[var(--admin-text-primary)] text-xs font-bold transition-colors">
              Cancel
            </button>
            <button
              onClick={logout}
              className="flex-1 py-3 px-4 rounded-2xl bg-red-600 text-[var(--admin-text-primary)] hover:bg-red-600 text-xs font-bold transition-colors flex justify-center">
              Sign Out
            </button>
          </div>
        </div>
      );
    }

    return null;
  };

  const renderGoogleModalContent = () => {
    if (googleActionModal === "link") {
      return (
        <div className="flex flex-col gap-4 text-center items-center py-2 px-1">
          <div className="w-12 h-12 rounded-full bg-[var(--admin-input-bg)] flex items-center justify-center mb-1">
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.74 12.27c0-.82-.07-1.61-.21-2.38H12v4.51h6.58c-.28 1.46-1.11 2.7-2.34 3.52v2.93h3.79c2.22-2.05 3.5-5.07 3.5-8.58z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.31 0 6.08-1.09 8.11-2.96l-3.79-2.93c-1.1.74-2.5 1.18-4.32 1.18-3.32 0-6.14-2.24-7.14-5.26H1.01v3.02C3.04 21.08 7.21 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M4.86 14.03c-.26-.74-.4-1.54-.4-2.36s.14-1.62.4-2.36V6.29H1.01C.37 7.78 0 9.42 0 11.67c0 2.24.37 3.88 1.01 5.38l3.85-3.02z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-[var(--admin-text-primary)] leading-tight">
              Link Google Account
            </h3>
            <p className="text-xs text-[var(--admin-text-secondary)] mt-1 max-w-[260px] mx-auto">
              Connect your Google account to enable quick one-click sign in for
              the admin portal.
            </p>
          </div>
          <div className="flex w-full gap-3 mt-2">
            <button
              onClick={() => setGoogleActionModal(null)}
              className="flex-1 py-3 px-4 rounded-2xl bg-[var(--admin-input-bg)] hover:bg-[var(--admin-border)] text-[var(--admin-text-primary)] text-xs font-bold transition-colors">
              Cancel
            </button>
            <button
              onClick={() => {
                setGoogleActionModal(null);
                handleLinkGoogleAccount();
              }}
              className="flex-1 py-3 px-4 rounded-2xl bg-white text-black hover:bg-white/90 text-xs font-bold transition-colors">
              Continue
            </button>
          </div>
        </div>
      );
    }

    if (googleActionModal === "unlink") {
      return (
        <div className="flex flex-col gap-4 text-center items-center py-2 px-1">
          <div className="w-12 h-12 rounded-full bg-red-600/10 text-red-600 flex items-center justify-center mb-1">
            <AlertTriangle size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[var(--admin-text-primary)] leading-tight">
              Unlink Google Account
            </h3>
            <p className="text-xs text-[var(--admin-text-secondary)] mt-1 max-w-[260px] mx-auto">
              Are you sure you want to unlink your Google account? You will no
              longer be able to sign in using Google.
            </p>
          </div>
          <div className="flex w-full gap-3 mt-2">
            <button
              onClick={() => setGoogleActionModal(null)}
              className="flex-1 py-3 px-4 rounded-2xl bg-[var(--admin-input-bg)] hover:bg-[var(--admin-border)] text-[var(--admin-text-primary)] text-xs font-bold transition-colors">
              Cancel
            </button>
            <button
              onClick={() => {
                setGoogleActionModal(null);
                handleUnlinkGoogleAccount();
              }}
              className="flex-1 py-3 px-4 rounded-2xl bg-red-600 hover:bg-red-600 text-[var(--admin-text-primary)] text-xs font-bold transition-colors">
              Unlink Account
            </button>
          </div>
        </div>
      );
    }

    return null;
  };

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="max-w-3xl mx-auto sm:px-6 py-6 sm:py-10 animate-fade-in font-sans pb-24 sm:pb-10">
      {/* Unified Modals */}
      <MorphingModal
        viewId={activeModal}
        onClose={() => {
          setActiveModal(null);
          setModalContext(null);
          setNewName("");
          setPasswords({ new: "", confirm: "" });
        }}
        className="backdrop-blur-md border border-[var(--admin-border)] shadow-[0_12px_40px_-10px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.05)] rounded-2xl overflow-hidden"
        style={{ backgroundColor: "color-mix(in srgb, var(--admin-card-bg) 95%, transparent)" }}>
        {renderModalContent()}
      </MorphingModal>

      {/* Toast Alert */}
      {msg.text && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl border shadow-2xl flex items-center gap-3 backdrop-blur-md transition-all duration-300 animate-fade-in ${
            msg.type === "success"
              ? "bg-emerald-950/95 border-emerald-500/50 text-emerald-300"
              : "bg-red-950/95 border-red-600/50 text-red-300"
          }`}>
          {msg.type === "success" ? (
            <CheckCircle2 size={18} className="text-theme-accent" />
          ) : (
            <AlertCircle size={18} className="text-red-400" />
          )}
          <span className="text-xs font-semibold">{msg.text}</span>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="flex items-center text-[10px] sm:text-[11px] text-[var(--admin-text-secondary)] mb-8 sm:mb-12 font-medium tracking-wide">
        <span>My Account</span>
        <ChevronRight size={12} className="mx-2" />
        <span className="text-[var(--admin-text-primary)]">Profile</span>
      </div>

      {/* Profile Header (Centered) */}
      <div className="flex flex-col items-center mb-10 relative">
        <div className="relative mb-5">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden ring-[3px] ring-white/5 shadow-2xl bg-[var(--admin-input-bg)] border border-[var(--admin-border)] flex items-center justify-center relative">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarUpload}
              accept="image/*"
              className="hidden"
            />

            <span className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-[var(--admin-text-primary)] z-0">
              {getInitials(userData?.full_name || user?.name)}
            </span>
            {currentAvatar && (
              <img
                src={currentAvatar}
                alt="Profile"
                className="w-full h-full object-cover relative z-10"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            )}
          </div>
          {/* Persistent Camera Badge like the inspiration */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center backdrop-blur-sm justify-center cursor-pointer shadow-lg z-30 hover:scale-105 transition-transform btn-theme-primary">
            {isUploadingAvatar ? (
              <Loader size={14} className="text-current" />
            ) : (
              <Camera size={14} />
            )}
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--admin-text-primary)] tracking-tight mb-1.5 text-center flex items-center gap-2">
          {userData?.full_name || "Admin User"}
        </h1>
        <p className="text-sm text-[var(--admin-text-secondary)]  text-center">
          {userData?.email || user?.email || "No email linked"}
        </p>

        <button
          onClick={() => setActiveModal("sign_out")}
          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl bg-red-600/5 hover:bg-red-600/10 text-red-400 border border-red-600/20 text-xs font-bold transition-all uppercase tracking-wider mt-4">
          <LogOut size={14} /> Log Out
        </button>
      </div>

      {/* Nav Tabs (Pill Style using @beui/tabs) */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        variant="pill"
        className="w-full mb-10">
        <TabsList className="bg-transparent flex items-center justify-start sm:justify-start gap-2 mb-6 overflow-x-auto scrollbar-hide w-full pb-1">
          <TabsTrigger
            value="general"
            indicatorClassName="bg-[var(--admin-card-bg)]"
            className={`whitespace-nowrap rounded-full px-5 py-2.5 transition-colors font-bold text-xs ${activeTab === "general" ? "text-[var(--admin-text-primary)]" : "text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] hover:bg-[var(--admin-input-bg)]"}`}>
            Personal Info
          </TabsTrigger>
          <TabsTrigger
            value="security"
            indicatorClassName="bg-[var(--admin-card-bg)]"
            className={`whitespace-nowrap rounded-full px-5 py-2.5 transition-colors font-bold text-xs ${activeTab === "security" ? "text-[var(--admin-text-primary)]" : "text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] hover:bg-[var(--admin-input-bg)]"}`}>
            Security
          </TabsTrigger>
          <TabsTrigger
            value="devices"
            indicatorClassName="bg-[var(--admin-card-bg)]"
            className={`whitespace-nowrap rounded-full px-5 py-2.5 transition-colors font-bold text-xs ${activeTab === "devices" ? "text-[var(--admin-text-primary)]" : "text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] hover:bg-[var(--admin-input-bg)]"}`}>
            Logged Devices
          </TabsTrigger>
        </TabsList>

        <div className="mt-4">
          <TabsContent value="general">
            {/* Section 1: Profile Information */}
            <div className="mb-8">
              <TabHeader
                title="Profile Information"
                subtitle="Your basic identity and picture"
              />

              <div className="flex flex-col bg-[var(--admin-card-bg)] border border-[var(--admin-border)] rounded-2xl p-2">
                {/* Row: Full name */}
                <div className="flex items-center justify-between p-4 hover:bg-[var(--admin-input-bg)] transition-colors rounded-2xl mb-1">
                  <span className="text-sm font-medium text-[var(--admin-text-secondary)]">
                    Full name
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-[var(--admin-text-primary)] font-medium">
                      {userData?.full_name || "—"}
                    </span>
                    <button
                      onClick={() => {
                        setNewName(userData?.full_name || "");
                        setActiveModal("edit_name");
                      }}
                      className="w-7 h-7 rounded-full bg-[var(--admin-input-bg)] flex items-center justify-center text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] hover:bg-[var(--admin-border)] transition-colors">
                      <Edit2 size={12} />
                    </button>
                  </div>
                </div>

                {/* Row: Index No */}
                <div className="flex items-center justify-between p-4 hover:bg-[var(--admin-input-bg)] transition-colors rounded-2xl mb-1">
                  <span className="text-sm font-medium text-[var(--admin-text-secondary)]">
                    Index No.
                  </span>
                  <span className="text-sm text-[var(--admin-text-primary)] font-medium">
                    {userData?.index_number || "—"}
                  </span>
                </div>

                {/* Row: Picture */}
                {(currentAvatar || googleAvatarUrl) && (
                  <div className="flex items-center justify-between p-4 hover:bg-[var(--admin-input-bg)] transition-colors rounded-2xl">
                    <span className="text-sm font-medium text-[var(--admin-text-secondary)]">
                      Picture
                    </span>
                    <div className="flex items-center gap-2">
                      {googleAvatarUrl && currentAvatar !== googleAvatarUrl && (
                        <button
                          onClick={handleUseGoogleAvatar}
                          disabled={isRestoringGoogle}
                          className="px-4 py-2 rounded-2xl bg-[var(--admin-border)] hover:bg-white/20 text-[var(--admin-text-secondary)] text-xs font-bold transition-colors flex items-center gap-2">
                          {isRestoringGoogle ? (
                            <Loader size={12} className="text-current" />
                          ) : (
                            <>
                              <svg
                                className="w-4 h-4 shrink-0"
                                viewBox="0 0 24 24">
                                <path
                                  fill="#4285F4"
                                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                  fill="#34A853"
                                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                  fill="#FBBC05"
                                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                                />
                                <path
                                  fill="#EA4335"
                                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                              </svg>{" "}
                              <span>Use Google</span>
                            </>
                          )}
                        </button>
                      )}
                      {currentAvatar && (
                        <button
                          onClick={handleDeleteAvatar}
                          disabled={isDeletingAvatar}
                          className="px-4 py-2 rounded-2xl bg-red-600/5 hover:bg-red-600/10 text-red-400 text-xs font-bold transition-colors flex items-center gap-2">
                          {isDeletingAvatar ? (
                            <Loader size={12} className="text-current" />
                          ) : (
                            "Remove"
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Section 2: Account Status */}
            <div className="mb-8">
              <div className="mb-4 px-1">
                <h3 className="text-sm font-bold text-[var(--admin-text-primary)]">Account Status</h3>
                <p className="text-xs text-[var(--admin-text-secondary)] mt-1">
                  Your privileges and current state
                </p>
              </div>
              <div className="flex flex-col bg-[var(--admin-card-bg)] border border-[var(--admin-border)] rounded-2xl p-2">
                {/* Row: Role */}
                <div className="flex items-center justify-between p-4 hover:bg-[var(--admin-input-bg)] transition-colors rounded-2xl mb-1">
                  <span className="text-sm font-medium text-[var(--admin-text-secondary)]">
                    Role
                  </span>
                  <span className="text-sm text-[var(--admin-text-primary)] font-medium capitalize">
                    {userData?.role || "User"}
                  </span>
                </div>

                {/* Row: Status */}
                <div className="flex items-center justify-between p-4 hover:bg-[var(--admin-input-bg)] transition-colors rounded-2xl">
                  <span className="text-sm font-medium text-[var(--admin-text-secondary)]">
                    Status
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[var(--admin-text-primary)] font-medium">
                      {userData?.is_active ? "Active" : "Suspended"}
                    </span>
                    <div
                      className={`w-2 h-2 rounded-full ${userData?.is_active ? "bg-green-500 shadow-[0_0_8px_rgba(52,211,153,0.8)]" : "bg-red-600 shadow-[0_0_8px_rgba(239,68,68,0.8)]"}`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Connected Accounts */}
            <div className="mb-4">
              <div className="mb-4 px-1">
                <h3 className="text-sm font-bold text-[var(--admin-text-primary)]">
                  Connected Accounts
                </h3>
                <p className="text-xs text-[var(--admin-text-secondary)] mt-1">
                  Manage linked third-party providers
                </p>
              </div>
              <div className="flex flex-col bg-[var(--admin-card-bg)] border border-[var(--admin-border)] rounded-2xl p-2">
                {/* Row: Google Link */}
                <div className="flex items-center justify-between p-4 hover:bg-[var(--admin-input-bg)] transition-colors rounded-2xl">
                  <div className="flex items-center gap-3">
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span className="text-sm font-medium text-[var(--admin-text-secondary)]">
                      Google
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {userData?.email || user?.email ? (
                      <>
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] text-theme-accent font-bold uppercase tracking-widest flex items-center gap-1 mt-0.5">
                            <CheckCircle2 size={10} /> Linked
                          </span>
                        </div>
                        <button
                          onClick={() => setGoogleActionModal("unlink")}
                          disabled={isUnlinkingGoogle}
                          className="px-3 py-1.5 rounded-2xl bg-red-600/5 hover:bg-red-600/10 text-red-400 text-xs font-bold transition-colors flex items-center gap-1">
                          {isUnlinkingGoogle ? (
                            <Loader size={12} className="text-current" />
                          ) : (
                            "Unlink"
                          )}
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setGoogleActionModal("link")}
                        disabled={isLinkingGoogle}
                        className="px-4 py-2 rounded-2xl bg-[var(--admin-border)] hover:bg-white/20 text-[var(--admin-text-primary)] text-xs font-bold transition-colors flex items-center gap-2">
                        {isLinkingGoogle ? (
                          <Loader size={12} className="text-current" />
                        ) : (
                          "Link Account"
                        )}
                      </button>
                    )}
                  </div>
                </div>

                <MorphingModal
                  viewId={googleActionModal}
                  onClose={() => setGoogleActionModal(null)}
                  className="backdrop-blur-md border border-[var(--admin-border)] shadow-[0_12px_40px_-10px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.05)] rounded-2xl"
                  style={{ backgroundColor: "color-mix(in srgb, var(--admin-card-bg) 95%, transparent)" }}>
                  {renderGoogleModalContent()}
                </MorphingModal>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="security">
            <div>
              <TabHeader
                title="Security Hub"
                subtitle="Manage your account protection and authentication"
              />

              <div className="flex flex-col gap-4 max-w-xl">
                {/* Security Health Scorecard */}
                <div className="bg-[var(--admin-card-bg)] border border-[var(--admin-border)] rounded-2xl p-4 flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-theme-accent/5 flex items-center justify-center shrink-0 border border-theme-accent/20">
                    <ShieldCheck size={18} className="text-theme-accent" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[13px] font-bold text-[var(--admin-text-primary)]">
                      Security: Excellent
                    </h3>
                    <p className="text-[10px] text-[var(--admin-text-secondary)] mt-0.5">
                      {userData?.active_sessions?.length || 0} active session
                      {userData?.active_sessions?.length !== 1 ? "s" : ""}{" "}
                      tracked
                    </p>
                  </div>
                </div>

                {/* Password Management */}
                <div className="bg-[var(--admin-card-bg)] border border-[var(--admin-border)] rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-2xl bg-amber-400/10 flex items-center justify-center border border-amber-400/20 shrink-0">
                      <Key size={14} className="text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-[13px] font-bold text-[var(--admin-text-primary)] mb-0.5">
                        Password
                      </h3>
                      <p className="text-[9px] text-[var(--admin-text-secondary)] uppercase tracking-wider font-bold">
                        Ensure your account uses a strong password
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setPasswords({ new: "", confirm: "" });
                      setActiveModal("edit_password");
                    }}
                    className="px-4 py-2.5 rounded-2xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 text-[11px] font-bold transition-colors border border-amber-400/20 whitespace-nowrap">
                    Change Password
                  </button>
                </div>

                {/* Panic Mode / Threat Control */}
                <div className="bg-[var(--admin-card-bg)] border border-red-600/20 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 justify-between relative overflow-hidden group">
                  <div className="relative z-10 flex-1">
                    <h3 className="text-[13px] font-bold text-red-400 mb-0.5 flex items-center gap-1.5">
                      <AlertTriangle size={14} /> Threat Control
                    </h3>
                    <p className="text-[11px] text-[var(--admin-text-secondary)] leading-relaxed sm:max-w-[250px]">
                      Instantly freeze your account and log out of all other
                      devices if you suspect a breach.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveModal("panic_mode")}
                    disabled={
                      isFreezingAccount ||
                      userData?.active_sessions?.length <= 1
                    }
                    className="relative z-10 w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-red-600/5 hover:bg-red-600/10 text-red-400 text-[11px] font-bold transition-all disabled:opacity-50 border border-red-600/20 flex items-center justify-center gap-1.5 whitespace-nowrap">
                    {isFreezingAccount ? (
                      <Loader size={12} className="text-current" />
                    ) : (
                      <LogOut size={12} />
                    )}
                    {isFreezingAccount
                      ? "Terminating..."
                      : "Log Out Everywhere Else"}
                  </button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="devices">
            <div>
              <TabHeader
                title="Logged Devices"
                subtitle="Active sessions connected to your account"
              />

              {/* Mobile View */}
              <div className="md:hidden flex flex-col gap-3 ">
                {sortedSessions.length > 0 ? (
                  sortedSessions.map((session, index, arr) => {
                    const isCurrent = session.sessionId === currentDeviceId;
                    const showDivider =
                      !isCurrent &&
                      index > 0 &&
                      arr[index - 1].sessionId === currentDeviceId;
                    const { isMobile, os, browser, displayName } =
                      parseSessionDetails(session);

                    return (
                      <React.Fragment key={session.sessionId || index}>
                        {showDivider && (
                          <div className="flex items-center gap-3 my-2">
                            <div className="h-px bg-[var(--admin-input-bg)] flex-1"></div>
                            <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--admin-text-secondary)]">
                              Other Devices
                            </p>
                            <div className="h-px bg-[var(--admin-input-bg)] flex-1"></div>
                          </div>
                        )}
                        <div className="flex flex-col gap-3 bg-[var(--admin-card-bg)] border border-[var(--admin-border)] p-3.5 rounded-2xl group">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 border ${isCurrent ? "bg-amber-400/10 border-amber-400/20 text-amber-400" : "bg-[var(--admin-input-bg)] border-[var(--admin-border)] text-[var(--admin-text-secondary)]"} transition-colors`}>
                                {isMobile ? (
                                  <Smartphone size={16} />
                                ) : (
                                  <Monitor size={16} />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5 group/edit">
                                  <p className="text-[13px] font-bold text-[var(--admin-text-primary)] truncate">
                                    {displayName}
                                  </p>
                                  <button
                                    onClick={() => {
                                      setNewName(
                                        session.customName ||
                                          (displayName !== "Unknown Location"
                                            ? displayName
                                            : ""),
                                      );
                                      setModalContext({
                                        sessionId: session.sessionId,
                                        deviceLabel: displayName,
                                      });
                                      setActiveModal("rename_device");
                                    }}
                                    className="opacity-0 group-hover/edit:opacity-100 p-1 text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] transition-opacity">
                                    <Edit2 size={12} />
                                  </button>
                                </div>
                                <p className="text-[9px] uppercase tracking-wider font-semibold text-[var(--admin-text-secondary)] truncate">
                                  IP:{" "}
                                  {session.ip && session.ip !== "Unknown"
                                    ? session.ip
                                    : "HIDDEN"}
                                </p>
                              </div>
                            </div>
                            {isCurrent ? (
                              <AnimatedBadge
                                status="success"
                                size="sm"
                                className="uppercase tracking-wider font-bold">
                                Current
                              </AnimatedBadge>
                            ) : (
                              <button
                                onClick={() =>
                                  handleRevokeSession(session.sessionId)
                                }
                                disabled={
                                  revokingSessionId === session.sessionId
                                }
                                className="inline-flex items-center justify-center w-8 h-8 rounded-2xl bg-red-600/10 hover:bg-red-600/20 text-red-400 transition-all disabled:opacity-50 border border-red-600/10">
                                {revokingSessionId === session.sessionId ? (
                                  <Loader size={12} className="text-current" />
                                ) : (
                                  <LogOut size={12} />
                                )}
                              </button>
                            )}
                          </div>
                          <div className="flex justify-between items-center bg-[var(--admin-input-bg)] p-2.5 rounded-2xl border border-[var(--admin-border)]">
                            <div>
                              <p className="text-[11px] font-bold text-[var(--admin-text-primary)] mb-0.5">
                                {os || "Unknown OS"}
                              </p>
                              <p className="text-[9px] uppercase tracking-wider font-semibold text-[var(--admin-text-secondary)]">
                                {browser || "Unknown Browser"}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-[11px] font-bold text-[var(--admin-text-primary)] mb-0.5">
                                {formatRelativeTime(session.loginTime)}
                              </p>
                              <p className="text-[9px] uppercase tracking-wider font-semibold text-[var(--admin-text-secondary)]">
                                {session.loginTime
                                  ? new Date(
                                      session.loginTime,
                                    ).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : ""}
                              </p>
                            </div>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })
                ) : (
                  <div className="p-10 text-center">
                    <Monitor size={32} className="mx-auto mb-3 text-white/10" />
                    <p className="text-xs text-[var(--admin-text-secondary)]">
                      No active sessions tracked.
                    </p>
                  </div>
                )}
              </div>

              {/* Desktop View */}
              <div className="hidden md:block overflow-x-auto scrollbar-hide">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-[var(--admin-border)] text-[10px] text-[var(--admin-text-secondary)] font-bold uppercase tracking-wider bg-[var(--admin-input-bg)]">
                      <th className="p-5 font-medium">Location & IP</th>
                      <th className="p-5 font-medium">OS & Browser</th>
                      <th className="p-5 font-medium">Last Accessed</th>
                      <th className="p-5 font-medium text-right">Manage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {sortedSessions.length > 0 ? (
                      sortedSessions.map((session, index, arr) => {
                        const isCurrent = session.sessionId === currentDeviceId;
                        const showDivider =
                          !isCurrent &&
                          index > 0 &&
                          arr[index - 1].sessionId === currentDeviceId;
                        const { isMobile, os, browser, displayName } =
                          parseSessionDetails(session);

                        return (
                          <React.Fragment key={session.sessionId || index}>
                            {showDivider && (
                              <tr>
                                <td
                                  colSpan={4}
                                  className="px-5 py-3 bg-[var(--admin-input-bg)]">
                                  <div className="flex items-center gap-3">
                                    <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--admin-text-secondary)]">
                                      Other Devices
                                    </p>
                                    <div className="h-px bg-[var(--admin-input-bg)] flex-1"></div>
                                  </div>
                                </td>
                              </tr>
                            )}
                            <tr className="hover:bg-[var(--admin-input-bg)] transition-colors group">
                              <td className="p-5 align-middle">
                                <div className="flex items-center gap-4">
                                  <div
                                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${isCurrent ? "bg-amber-400/10 border-amber-400/20 text-amber-400" : "bg-[var(--admin-input-bg)] border-[var(--admin-border)] text-[var(--admin-text-secondary)] group-hover:text-[var(--admin-text-primary)]"} transition-colors`}>
                                    {isMobile ? (
                                      <Smartphone size={18} />
                                    ) : (
                                      <Monitor size={18} />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5 group/edit">
                                      <p className="text-sm font-bold text-[var(--admin-text-primary)] truncate max-w-[250px]">
                                        {displayName}
                                      </p>
                                      <button
                                        onClick={() => {
                                          setNewName(
                                            session.customName ||
                                              (displayName !== "Unknown Location"
                                                ? displayName
                                                : ""),
                                          );
                                          setModalContext({
                                            sessionId: session.sessionId,
                                            deviceLabel: displayName,
                                          });
                                          setActiveModal("rename_device");
                                        }}
                                        className="opacity-0 group-hover/edit:opacity-100 p-1 text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] transition-opacity">
                                        <Edit2 size={14} />
                                      </button>
                                    </div>
                                    <p className="text-[10px] uppercase tracking-wider font-semibold text-[var(--admin-text-secondary)]">
                                      IP:{" "}
                                      {session.ip && session.ip !== "Unknown"
                                        ? session.ip
                                        : "HIDDEN"}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-5 align-middle">
                                <p className="text-xs font-regular text-[var(--admin-text-primary)] mb-0.5">
                                  {os || "Unknown OS"}
                                </p>
                                <p className="text-[10px] uppercase tracking-wider font-semibold text-[var(--admin-text-secondary)]">
                                  {browser || "Unknown Browser"}
                                </p>
                              </td>
                              <td className="p-5 align-middle">
                                <p className="text-xs font-regular text-[var(--admin-text-primary)] mb-0.5">
                                  {formatRelativeTime(session.loginTime)}
                                </p>
                                <p className="text-[10px] uppercase tracking-wider font-semibold text-[var(--admin-text-secondary)]">
                                  {session.loginTime
                                    ? new Date(
                                        session.loginTime,
                                      ).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })
                                    : ""}
                                </p>
                              </td>
                              <td className="p-5 align-middle text-right">
                                {isCurrent ? (
                                  <AnimatedBadge
                                    status="success"
                                    size="sm"
                                    className="uppercase tracking-wider font-bold">
                                    Current
                                  </AnimatedBadge>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setModalContext({
                                        sessionId: session.sessionId,
                                        deviceLabel: displayName,
                                      });
                                      setActiveModal("revoke_device");
                                    }}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-red-600/10 hover:bg-red-600/20 text-red-400 text-xs font-bold transition-all border border-red-600/10">
                                    Sign out
                                  </button>
                                )}
                              </td>
                            </tr>
                          </React.Fragment>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="4" className="p-10 text-center">
                          <Monitor
                            size={32}
                            className="mx-auto mb-3 text-white/10"
                          />
                          <p className="text-xs text-[var(--admin-text-secondary)]">
                            No active sessions tracked.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default UserProfile;

