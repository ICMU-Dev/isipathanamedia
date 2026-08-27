import React, { useState, useEffect, useRef } from "react";
import {  AnimatePresence } from "framer-motion";
import { motion } from "framer-motion";
import { useData } from "../../context/DataContext";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";
import ConfigFormEditor from "../../components/admin/config/ConfigFormEditor";
import ConfigJsonEditor from "../../components/admin/config/ConfigJsonEditor";
import ConfigActivityLog from "../../components/admin/config/ConfigActivityLog";
import FeedbackPanel from "../../components/admin/FeedbackPanel";
import PWAInstallCard from "../../components/admin/PWAInstallCard";
import AppearanceTab from "./settings/AppearanceTab";
import AboutTab from "./settings/AboutTab";
import ConfigTab from "./settings/ConfigTab";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../components/motion/tabs";
import { supabase } from "../../lib/supabaseClient";
import {
  Save,
  Download,
  Upload,
  Search,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Code2,
  X,
  Palette,
  Check,
  MoreHorizontal,
  Share2,
  Layers,
  History,
  MessageSquarePlus,
  Info,
  Globe,
  Zap,
  ShieldCheck,
} from "lucide-react";
import Loader from "../../components/ui/Loader";

import TabHeader from "../../components/admin/TabHeader";

const urlB64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

const Settings = () => {
  const { siteConfig, updateSiteConfig, fetchData } = useData();
  const { themeId, setTheme, themes } = useTheme();
  const { user } = useAuth();
  const { markAllFeedbacksAsRead, notifications } = useNotification();
  const unreadFeedbacks =
    notifications?.filter((n) => n.isFeedback && !n.read).length || 0;

  const role = user?.role?.toLowerCase();
  const isSuperAdmin =
    role === "super-admin" || role === "superadmin" || role === "super_admin";

  const [activeTab, setActiveTab] = useState("appearance");
  const [configState, setConfigState] = useState(siteConfig || {});
  const [rawJsonText, setRawJsonText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [jsonError, setJsonError] = useState(null);

  // Clear feedback notification dots when viewing the feedbacks tab
  useEffect(() => {
    if (activeTab === "feedbacks" && unreadFeedbacks > 0) {
      markAllFeedbacksAsRead();
    }
  }, [activeTab, unreadFeedbacks, markAllFeedbacksAsRead]);

  const [showActionsDropdown, setShowActionsDropdown] = useState(false);
  const [showJsonModal, setShowJsonModal] = useState(false);

  const [feedbackEnabled, setFeedbackEnabled] = useState(() => {
    try {
      return localStorage.getItem("icmu_feedback_widget_enabled") !== "false";
    } catch {
      return true;
    }
  });

  const toggleFeedbackWidget = () => {
    const next = !feedbackEnabled;
    setFeedbackEnabled(next);
    try {
      localStorage.setItem("icmu_feedback_widget_enabled", String(next));
      window.dispatchEvent(new Event("icmu_feedback_toggle"));
    } catch (e) {
      console.warn("Failed to toggle feedback widget:", e);
    }
    showToast(
      "success",
      next ? "Universal feedback icon enabled" : "Feedback icon disabled",
    );
  };

  const [notificationsBlocked, setNotificationsBlocked] = useState(true);
  const [notifPermission, setNotifPermission] = useState("default");
  const [isNotifLoading, setIsNotifLoading] = useState(false);

  useEffect(() => {
    if ("Notification" in window) {
      setNotifPermission(Notification.permission);
    }
    // Guard: Service Workers and Push API may not be available on all browsers/environments
    if (!navigator.serviceWorker || !window.PushManager) return;

    const checkPushState = async () => {
      try {
        setIsNotifLoading(true);
        const version = localStorage.getItem("icmu_notif_version");
        const registration = await navigator.serviceWorker.ready;
        let sub = await registration.pushManager.getSubscription();

        // Subscription check

        if (sub) {
          const { data } = await supabase
            .from("push_subscriptions")
            .select("is_allowed")
            .eq("endpoint", sub.endpoint)
            .maybeSingle();

          const isBlocked = data?.is_allowed !== true;
          setNotificationsBlocked(isBlocked);
          localStorage.setItem("icmu_notifications_blocked", String(isBlocked));
        } else {
          setNotificationsBlocked(true);
          localStorage.setItem("icmu_notifications_blocked", "true");
        }
      } catch (e) {
        console.warn("Failed to check push state:", e);
      } finally {
        setIsNotifLoading(false);
      }
    };
    checkPushState();
  }, []);

  const toggleNotificationsBlocked = async () => {
    const nextBlocked = !notificationsBlocked;
    setIsNotifLoading(true);

    try {
      if (!nextBlocked) {
        if (!("Notification" in window)) {
          showToast("error", "Push notifications are not supported on this browser (iOS users must 'Add to Home Screen' first).");
          setIsNotifLoading(false);
          return;
        }

        if (Notification.permission === "default") {
          const perm = await Notification.requestPermission();
          setNotifPermission(perm);
          if (perm !== "granted") {
            showToast("error", "Permission denied. Please allow notifications in your browser settings.");
            return;
          }
        } else if (Notification.permission !== "granted") {
          showToast("error", "Notifications are blocked. Please allow them in your browser settings first.");
          return;
        }

        const success = await handleSubscribePush(true);
        if (!success) {
          setIsNotifLoading(false);
          return; // Abort UI update if subscription failed
        }
      } else {
        // Toggled off: mark as not allowed in DB
        if (navigator.serviceWorker && window.PushManager) {
          const registration = await navigator.serviceWorker.ready;
          const sub = await registration.pushManager.getSubscription();
          if (sub) {
            await supabase
              .from("push_subscriptions")
              .update({ is_allowed: false })
              .eq("endpoint", sub.endpoint);
          }
        }
      }

      setNotificationsBlocked(nextBlocked);
      try {
        localStorage.setItem("icmu_notifications_blocked", String(nextBlocked));
      } catch (e) {
        console.warn("Failed to save notifications block state:", e);
      }
      showToast(
        "success",
        nextBlocked ? "Notifications disabled" : "Notifications enabled",
      );
    } catch (error) {
      showToast("error", "An error occurred while updating settings.");
      console.error(error);
    } finally {
      setIsNotifLoading(false);
    }
  };

  const handleSubscribePush = async (silentMode = false) => {
    if (!("Notification" in window)) {
      if (!silentMode)
        showToast("error", "Push notifications are not supported on this browser. iOS users must 'Add to Home Screen' first.");
      return false;
    }

    if (Notification.permission === "default") {
      const perm = await Notification.requestPermission();
      setNotifPermission(perm);
      if (perm !== "granted") return false;
    } else if (Notification.permission !== "granted") {
      if (!silentMode)
        alert("Notifications are blocked in your browser settings.");
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const VAPID_PUBLIC_KEY =
        import.meta.env.VITE_VAPID_PUBLIC_KEY ||
        "BDvKzqdXgPr7u-kietdGltOi9aPtHMB5jOJCSSgJ7sBfW6DRslAV130dXy4zp5FEKm7V3FpSSHeC7zyhqHD23xc";

      if (!VAPID_PUBLIC_KEY) {
        showToast("error", "VAPID public key not found in env");
        return false;
      }

      let subscription;
      try {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlB64ToUint8Array(VAPID_PUBLIC_KEY),
        });
      } catch (subErr) {
        if (subErr.message && subErr.message.includes("applicationServerKey")) {
          // The user has a stale subscription with an old key. Unsubscribe it first!
          const oldSub = await registration.pushManager.getSubscription();
          if (oldSub) {
            await oldSub.unsubscribe();
          }
          // Retry subscription with the new key
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlB64ToUint8Array(VAPID_PUBLIC_KEY),
          });
        } else {
          throw subErr;
        }
      }

      const subData = JSON.parse(JSON.stringify(subscription));

      const { error } = await supabase.from("push_subscriptions").upsert(
        {
          user_id: user.id,
          endpoint: subData.endpoint,
          p256dh: subData.keys.p256dh,
          auth: subData.keys.auth,
          is_allowed: true,
        },
        { onConflict: "user_id, endpoint" },
      );

      if (error) throw error;
      showToast("success", "Subscribed to Push Notifications!");
      return true;
    } catch (err) {
      if (err.code === "23505") {
        showToast(
          "success",
          "You are already subscribed to Push Notifications on this device.",
        );
        return true;
      } else {
        console.error(err);
        showToast("error", "Failed to subscribe to push: " + err.message);
        return false;
      }
    }
  };

  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (siteConfig && !isSaving) {
      setConfigState(siteConfig);
      setRawJsonText(JSON.stringify(siteConfig, null, 2));
    }
  }, [siteConfig, isSaving]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowActionsDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFormChange = (newConfig) => {
    setConfigState(newConfig);
    setRawJsonText(JSON.stringify(newConfig, null, 2));
    setJsonError(null);
  };

  const handleRawTextChange = (text) => {
    setRawJsonText(text);
    try {
      const parsed = JSON.parse(text);
      setConfigState(parsed);
      setJsonError(null);
    } catch (err) {
      setJsonError(err.message);
    }
  };

  const handlePrettify = () => {
    try {
      const parsed = JSON.parse(rawJsonText);
      const formatted = JSON.stringify(parsed, null, 2);
      setRawJsonText(formatted);
      setConfigState(parsed);
      setJsonError(null);
      showToast("success", "JSON formatted cleanly");
    } catch {
      setJsonError("Invalid JSON syntax");
      showToast("error", "Syntax error in JSON");
    }
  };

  const handleResetDefault = () => {
    if (window.confirm("Reset website settings to default parameters?")) {
      const defaultConfig = {
        socialLinks: {
          facebook: "https://facebook.com",
          instagram: "https://instagram.com",
          youtube: "https://youtube.com",
          twitter: "https://twitter.com",
        },
        sectionOrder: [
          "home",
          "partnerLogos",
          "about",
          "news",
          "services",
          "team",
          "events",
          "contact",
        ],
        contactDetails: {
          address: "Isipathana College, Colombo 05, Sri Lanka",
          email: "icmediaunit@gmail.com",
          leadership: [
            {
              id: 1,
              name: "Sahan Perera",
              role: "President",
              phone: "+94 77 123 4567",
              whatsapp: "94771234567",
            },
            {
              id: 2,
              name: "Amila Silva",
              role: "Secretary",
              phone: "+94 77 987 6543",
              whatsapp: "94779876543",
            },
          ],
        },
      };
      handleFormChange(defaultConfig);
      showToast("success", "Reset to default settings");
      setShowActionsDropdown(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      setShowActionsDropdown(false);
      await fetchData();
      showToast("success", "Synced latest data");
    } catch {
      showToast("error", "Failed to sync data");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSaveConfig = async () => {
    try {
      setIsSaving(true);
      setToastMessage(null);

      let configToSave = configState;
      if (showJsonModal) {
        configToSave = JSON.parse(rawJsonText);
      }

      const success = await updateSiteConfig(configToSave);
      if (!success) throw new Error("Failed to save settings");
      showToast("success", "Settings saved successfully!");
      setShowJsonModal(false);
    } catch (err) {
      setJsonError(err.message);
      showToast("error", err.message || "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = () => {
    try {
      setShowActionsDropdown(false);
      const dataStr =
        "data:text/json;charset=utf-8," + encodeURIComponent(rawJsonText);
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute(
        "download",
        `site_config_backup_${Date.now()}.json`,
      );
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast("success", "Exported JSON backup file");
    } catch {
      showToast("error", "Export failed");
    }
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setShowActionsDropdown(false);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        const parsed = JSON.parse(text);
        handleFormChange(parsed);
        showToast("success", "Imported settings from file");
      } catch (err) {
        showToast("error", "Invalid file format: " + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const showToast = (type, text) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const allSettingsTabs = [
    {
      id: "appearance",
      label: "General Settings",
      desc: "Customize the admin interface",
      icon: <Palette size={16} />,
      roles: ["writer", "admin", "super_admin"],
    },
    {
      id: "general",
      label: "Website Settings",
      desc: "Update core metadata and links",
      icon: <Share2 size={16} />,
      roles: ["super_admin"],
    },
    {
      id: "feedbacks",
      label: "Feedbacks",
      desc: "Review submitted feedback & bug reports",
      icon: <MessageSquarePlus size={16} />,
      roles: ["admin", "super_admin"],
    },
    {
      id: "about",
      label: "About",
      desc: "App info & credits",
      icon: <Info size={16} />,
      roles: ["writer", "admin", "super_admin"],
    },
  ];

  // helper to resolve normalizedRole for tab filtering
  const normalizedRole = isSuperAdmin
    ? "super_admin"
    : role === "admin"
      ? "admin"
      : "writer";

  const settingsTabs = allSettingsTabs.filter((tab) =>
    tab.roles.includes(normalizedRole),
  );

  // Divide themes into Skins and Colors for the new UI
  const themeValues = Object.values(themes);
  const themeSkins = themeValues.slice(0, 3); // Top 3 as "Skins"
  const themeColors = themeValues.slice(3); // Rest as "Colors"

  const hasChanges = JSON.stringify(siteConfig) !== JSON.stringify(configState);

  return (
    <div className="animate-fade-in max-w-4xl mx-auto pb-24 relative min-h-[calc(100vh-80px)] px-4 sm:px-6 lg:px-8">
      {/* Dynamic Island Toast */}
      <div className="fixed bottom-24 left-0 right-0 z-[9999] flex justify-center pointer-events-none">
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              layout
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 250, damping: 25 }}
              className={`flex items-center gap-2.5 px-4 py-2 max-w-[85vw] sm:max-w-sm rounded-2xl border backdrop-blur-sm shadow-[0_10px_40px_rgb(0,0,0,0.5)] pointer-events-auto ${
                toastMessage.type === "success"
                  ? "bg-[#050505]/95 border-emerald-500/30 text-emerald-400"
                  : "bg-[#050505]/95 border-red-500/30 text-red-400"
              }`}>
              <motion.div
                layout="position"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 20,
                  delay: 0.1,
                }}
                className="shrink-0 flex items-center justify-center">
                {toastMessage.type === "success" ? (
                  <CheckCircle2
                    size={14}
                    strokeWidth={2.5}
                    className="drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                  />
                ) : (
                  <AlertCircle
                    size={14}
                    strokeWidth={2.5}
                    className="drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                  />
                )}
              </motion.div>
              <motion.div
                layout="position"
                initial={{ opacity: 0, filter: "blur(4px)", x: -10 }}
                animate={{ opacity: 1, filter: "blur(0px)", x: 0 }}
                exit={{ opacity: 0, filter: "blur(4px)", x: -10 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="overflow-hidden">
                <span className="text-[11px] font-medium tracking-normal normal-case pr-1 block leading-relaxed text-[var(--admin-text-primary)]">
                  {toastMessage.text}
                </span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── STICKY TOP HEADER ── */}
      <div className="sticky top-0 z-40  border-b border-[var(--admin-border)] pt-6 pb-4 mb-8 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Settings
            </h1>
            <p className="text-[11px] text-[var(--admin-text-secondary)] mt-1 uppercase tracking-widest font-mono">
              System Configuration
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            {isSuperAdmin && (
              <button
                type="button"
                onClick={handleSaveConfig}
                disabled={!hasChanges || isSaving || isRefreshing}
                className="min-h-[40px] px-5 py-2 text-xs font-bold rounded-2xl transition-all duration-150 flex items-center justify-center flex-1 sm:flex-none gap-2 btn-theme-primary disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 shadow-md">
                {isSaving ? (
                  <Loader
                    size="sm"
                    className="text-current"
                  />
                ) : (
                  <Save size={14} />
                )}
                {isSaving
                  ? "Saving..."
                  : hasChanges
                    ? "Save Settings"
                    : "No Changes"}
              </button>
            )}
            {isSuperAdmin && (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setShowActionsDropdown(!showActionsDropdown)}
                  className="min-h-[40px] px-3 py-2 bg-white/[0.04] hover:bg-white/[0.08] text-[var(--admin-text-secondary)] hover:text-white borderborder-white/[0.06]  rounded-2xl text-xs transition-colors flex items-center justify-center shrink-0"
                  title="More Actions">
                  <MoreHorizontal size={16} />
                </button>

                {showActionsDropdown && (
                  <div className="absolute right-0 mt-2 w-52 admin-card borderborder-white/[0.06]  rounded-2xl shadow-xl py-1.5 z-50 animate-fade-in">
                    <button
                      type="button"
                      onClick={handleRefresh}
                      disabled={isRefreshing || isSaving}
                      className="w-full px-4 py-2 text-left text-xs text-[var(--admin-text-primary)] hover:text-white hover:bg-white/[0.05] flex items-center gap-2 transition-colors">
                      {isRefreshing ? (
                        <Loader
                          size="sm"
                          className="text-current"
                        />
                      ) : (
                        <RotateCcw size={13} />
                      )}
                      Sync Data
                    </button>
                    <button
                      type="button"
                      onClick={handleExport}
                      disabled={isRefreshing || isSaving}
                      className="w-full px-4 py-2 text-left text-xs text-[var(--admin-text-primary)] hover:text-white hover:bg-white/[0.05] flex items-center gap-2 transition-colors">
                      <Download size={13} />
                      Export Backup
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowActionsDropdown(false);
                        fileInputRef.current?.click();
                      }}
                      disabled={isRefreshing || isSaving}
                      className="w-full px-4 py-2 text-left text-xs text-[var(--admin-text-primary)] hover:text-white hover:bg-white/[0.05] flex items-center gap-2 transition-colors">
                      <Upload size={13} />
                      Import File
                    </button>

                    <div className="my-1 border-t border-[var(--admin-border)]" />

                    <button
                      type="button"
                      onClick={() => {
                        setShowActionsDropdown(false);
                        setShowJsonModal(true);
                      }}
                      disabled={isRefreshing || isSaving}
                      className="w-full px-4 py-2 text-left text-xs text-[var(--admin-text-primary)] hover:text-white hover:bg-white/[0.05] flex items-center gap-2 transition-colors">
                      <Code2 size={13} />
                      View JSON Code
                    </button>
                    <button
                      type="button"
                      onClick={handleResetDefault}
                      disabled={isRefreshing || isSaving}
                      className="w-full px-4 py-2 text-left text-xs text-red-400/80 hover:text-red-300 hover:bg-red-600/[0.05] flex items-center gap-2 transition-colors">
                      <RotateCcw size={13} />
                      Reset Defaults
                    </button>
                  </div>
                )}
              </div>
            )}

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImport}
              accept=".json"
              className="hidden"
            />
          </div>
        </div>

        {/* Segmented Control / Pill Navigation */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          variant="pill"
          className="w-full flex flex-col min-h-0">
          <TabsList className=" lg:bg-transparent bg-white/[0.03] flex items-center justify-start gap-2 overflow-x-auto scrollbar-hide w-full pb-1">
            {settingsTabs.map((tab) => {
              const hasNotification =
                tab.id === "feedbacks" && unreadFeedbacks > 0;
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  indicatorClassName="bg-[var(--admin-card-bg)]"
                  className={`relative whitespace-nowrap rounded-full px-5 py-2.5 transition-colors font-bold text-xs ${
                    activeTab === tab.id
                      ? "text-white bg-[var(--admin-card-bg)] border-none"
                      : "text-white/30 hover:text-white hover:bg-[var(--admin-card-bg)] border-none"
                  }`}>
                  {tab.label}
                  {hasNotification && (
                    <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-600 rounded-full border-[1.5px] border-black shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* ── CONTENT PANE ── */}
          <div className="min-h-0 mt-6">
            {/* TAB 1: APPEARANCE & THEMES */}
            <TabsContent value="appearance">
              <AppearanceTab
                notificationsBlocked={notificationsBlocked}
                toggleNotificationsBlocked={toggleNotificationsBlocked}
                notifPermission={notifPermission}
                handleSubscribePush={handleSubscribePush}
                feedbackEnabled={feedbackEnabled}
                toggleFeedbackWidget={toggleFeedbackWidget}
                themeId={themeId}
                setTheme={setTheme}
                themeSkins={themeSkins}
                themeColors={themeColors}
                isNotifLoading={isNotifLoading}
                isSuperAdminOrAdmin={normalizedRole !== 'writer'}
              />
            </TabsContent>

            {/* TAB: FEEDBACKS */}
            <TabsContent value="feedbacks">
              <FeedbackPanel />
            </TabsContent>

            {/* TAB: ABOUT */}
            <TabsContent value="about">
              <AboutTab />
            </TabsContent>

            {/* TAB: GENERAL */}
            <TabsContent value="general">
              <ConfigTab
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                configState={configState}
                handleFormChange={handleFormChange}
                activeTab={activeTab}
              />
            </TabsContent>

            {/* TAB: CONTENT */}
            <TabsContent value="content">
              <ConfigTab
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                configState={configState}
                handleFormChange={handleFormChange}
                activeTab={activeTab}
              />
            </TabsContent>
          </div>
        </Tabs>

        {/* ── JSON Modal ── */}
        {showJsonModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in overflow-y-auto">
            <div className="admin-card border border-[var(--admin-border)] rounded-2xl w-full max-w-3xl max-h-[85vh] sm:max-h-[90vh] flex flex-col overflow-hidden shadow-2xl my-auto">
              <div className="px-6 py-4 border-b border-[var(--admin-border)] flex items-center justify-between shrink-0 bg-[var(--admin-input-bg)]">
                <div className="flex items-center gap-3">
                  <Code2 size={16} className="text-[var(--accent)]" />
                  <h3 className="text-sm font-bold text-white">
                    Raw JSON Configuration
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowJsonModal(false)}
                  className="p-1.5 rounded-2xl text-[var(--admin-text-secondary)] hover:text-white hover:bg-[var(--admin-border)] transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="p-4 sm:p-6 flex-1 min-h-0 overflow-y-auto">
                <ConfigJsonEditor
                  rawJsonText={rawJsonText}
                  onChangeRawText={handleRawTextChange}
                  jsonError={jsonError}
                  onPrettify={handlePrettify}
                  onResetDefault={handleResetDefault}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
