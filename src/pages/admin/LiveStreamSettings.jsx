import React, { useState, useEffect, useCallback, useRef } from "react";
import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabaseClient";
import { extractYouTubeId, getYouTubeWatchUrl } from "../../lib/youtubeUtils";
import {
  extractFacebookVideoUrl,
  getFacebookWatchUrl,
  detectPlatform,
} from "../../lib/videoUtils";
import VideoEmbed from "../../components/ui/VideoEmbed";
import {
  Radio,
  AlertCircle,
  CheckCircle,
  Link2,
  Type,
  Monitor,
  Tv,
  Copy,
  ExternalLink,
  Youtube,
  MessageSquare,
  FileText,
  Play,
  VolumeX,
  RefreshCw,
  AlertTriangle,
  Users,
} from "lucide-react";
import { Switch } from "../../components/motion/switch";
import LiveSkeleton from "../../components/admin/LiveSkeleton";

// ─── Facebook icon ───
const FacebookIcon = ({ size = 20, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="currentColor"
    className={className}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

// ─── Auto/Custom segment control using basic buttons ───
const SourceToggle = ({ isCustom, onToggle }) => (
  <div className="flex w-[120px] h-7 bg-[var(--admin-input-bg)] border border-[var(--admin-border)] p-0.5 rounded-2xl">
    <button
      onClick={() => onToggle(false)}
      className={`flex-1 flex items-center justify-center text-[9px] font-bold uppercase rounded-2xl  transition-all ${
        !isCustom
          ? "bg-white text-black shadow-sm"
          : "text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)]"
      }`}>
      Auto
    </button>
    <button
      onClick={() => onToggle(true)}
      className={`flex-1 flex items-center justify-center text-[9px] font-bold uppercase rounded-2xl  transition-all ${
        isCustom
          ? "bg-white text-black shadow-sm"
          : "text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)]"
      }`}>
      Custom
    </button>
  </div>
);

const LiveStreamSettings = () => {
  const { siteConfig, updateSiteConfig, loading: isLoading } = useData();
  const { user } = useAuth();
  const [onlineAdmins, setOnlineAdmins] = useState([]);

  if (isLoading && !siteConfig) {
    return <LiveSkeleton />;
  }

  // ─── Realtime Presence for Admins ───
  useEffect(() => {
    if (!user || !supabase) return;
    const channel = supabase.channel("admin_presence_livestream", {
      config: { presence: { key: user.id } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const allAdmins = Object.values(state).flatMap((p) => p);
        const uniqueAdmins = Array.from(
          new Map(allAdmins.map((admin) => [admin.id, admin])).values(),
        );
        setOnlineAdmins(uniqueAdmins);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            id: user.id,
            name: user.name,
            role: user.role,
            onlineAt: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // ─── Local state ───
  const [form, setForm] = useState({
    platform: "youtube",
    url: "",
    title: "",
    useCustomTitle: false,
    description: "",
    useCustomDescription: false,
    isLive: false,
    showChat: false,
    autoplay: true,
    muted: true,
  });

  const [extractedId, setExtractedId] = useState(null);
  const [extractedFbUrl, setExtractedFbUrl] = useState(null);
  const [saveStatus, setSaveStatus] = useState("idle"); // idle | saving | saved | error
  const [copied, setCopied] = useState(false);
  const [showStopConfirm, setShowStopConfirm] = useState(false);

  // Metadata autograb values
  const [fetchedTitle, setFetchedTitle] = useState("Live Broadcast");
  const [fetchedDesc, setFetchedDesc] = useState(
    "Streaming live from the Isipathana College Media Unit",
  );
  const [fetchingMetadata, setFetchingMetadata] = useState(false);

  // Responsive device tracking
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  const debounceRef = useRef(null);
  const mountedRef = useRef(false);

  // Refs to avoid stale closures inside async functions, timeouts, and callbacks
  const formRef = useRef(form);
  const siteConfigRef = useRef(siteConfig);
  const fetchedTitleRef = useRef(fetchedTitle);
  const fetchedDescRef = useRef(fetchedDesc);

  useEffect(() => {
    formRef.current = form;
  }, [form]);
  useEffect(() => {
    siteConfigRef.current = siteConfig;
  }, [siteConfig]);
  useEffect(() => {
    fetchedTitleRef.current = fetchedTitle;
  }, [fetchedTitle]);
  useEffect(() => {
    fetchedDescRef.current = fetchedDesc;
  }, [fetchedDesc]);

  // Detect screen size changes for adaptive preview layout
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ─── Sync from siteConfig on mount ───
  useEffect(() => {
    if (!siteConfig?.liveStream) return;
    const ls = siteConfig.liveStream;
    setForm({
      platform: ls.platform || "youtube",
      url: ls.platform === "facebook" ? ls.videoUrl || "" : ls.videoId || "",
      title: ls.title || "",
      useCustomTitle: ls.useCustomTitle || false,
      description: ls.description || "",
      useCustomDescription: ls.useCustomDescription || false,
      isLive: ls.isLive || false,
      showChat: ls.showChat || false,
      autoplay: ls.autoplay !== undefined ? ls.autoplay : true,
      muted: ls.muted !== undefined ? ls.muted : true,
    });
    if (ls.platform === "facebook" && ls.videoUrl) {
      setExtractedFbUrl(ls.videoUrl);
    } else if (ls.videoId) {
      setExtractedId(ls.videoId);
    }
    setTimeout(() => {
      mountedRef.current = true;
    }, 500);
  }, [siteConfig]);

  // ─── Extract IDs when URL changes ───
  useEffect(() => {
    const trimmed = form.url.trim();
    if (!trimmed) {
      setExtractedId(null);
      setExtractedFbUrl(null);
      return;
    }
    const detected = detectPlatform(trimmed);
    if (detected && detected !== form.platform) {
      setForm((prev) => ({ ...prev, platform: detected }));
    }
    const activePlatform = detected || form.platform;
    if (activePlatform === "youtube") {
      setExtractedId(extractYouTubeId(trimmed));
      setExtractedFbUrl(null);
    } else {
      setExtractedFbUrl(extractFacebookVideoUrl(trimmed));
      setExtractedId(null);
    }
  }, [form.url, form.platform]);

  // ─── Build the full config payload from current form state (read via Ref to avoid stale closure) ───
  const buildPayload = useCallback((overrides = {}) => {
    const currentForm = formRef.current;
    const merged = { ...currentForm, ...overrides };
    const ytId =
      merged.platform === "youtube" ? extractYouTubeId(merged.url) || "" : "";
    const fbUrl =
      merged.platform === "facebook"
        ? extractFacebookVideoUrl(merged.url) || merged.url
        : "";
    return {
      platform: merged.platform,
      videoId: ytId,
      videoUrl: fbUrl,
      title: merged.title,
      useCustomTitle: merged.useCustomTitle,
      description: merged.description,
      useCustomDescription: merged.useCustomDescription,
      isLive: merged.isLive,
      showChat: merged.showChat,
      autoplay: merged.autoplay,
      muted: merged.muted,
    };
  }, []);

  // ─── Save to Supabase ───
  const save = useCallback(
    async (overrides = {}) => {
      setSaveStatus("saving");
      try {
        const payload = buildPayload(overrides);
        const updatedConfig = { ...siteConfigRef.current, liveStream: payload };
        const ok = await updateSiteConfig(updatedConfig);
        setSaveStatus(ok ? "saved" : "error");
        if (ok) setTimeout(() => setSaveStatus("idle"), 2500);
      } catch {
        setSaveStatus("error");
      }
    },
    [buildPayload, updateSiteConfig],
  );

  // ─── Instant save (for toggles / platform selects) ───
  const instantSave = useCallback(
    (overrides) => {
      setForm((prev) => ({ ...prev, ...overrides }));
      setTimeout(() => save(overrides), 50);
    },
    [save],
  );

  // Helper to fetch oEmbed metadata synchronously with saving to prevent race conditions
  const fetchAndSaveMetadata = async (targetUrl, targetPlatform) => {
    let titleVal = formRef.current.title;
    let descVal = formRef.current.description;

    if (targetPlatform === "youtube") {
      const id = extractYouTubeId(targetUrl);
      if (id) {
        setFetchingMetadata(true);
        try {
          const res = await fetch(
            `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${id}`,
          );
          if (res.ok) {
            const data = await res.json();
            if (data.title) {
              setFetchedTitle(data.title);
              const customDesc = `${data.title} - presented by the Isipathana College Media Unit.`;
              setFetchedDesc(customDesc);

              if (!formRef.current.useCustomTitle) titleVal = data.title;
              if (!formRef.current.useCustomDescription) descVal = customDesc;
            }
          }
        } catch (e) {
          console.error("Error fetching oembed metadata", e);
        } finally {
          setFetchingMetadata(false);
        }
      }
    } else if (targetPlatform === "facebook") {
      const defaultFbTitle = "Facebook Live Broadcast";
      const defaultFbDesc =
        "Streaming live coverage of event activities via our Facebook stream page.";
      setFetchedTitle(defaultFbTitle);
      setFetchedDesc(defaultFbDesc);

      if (!formRef.current.useCustomTitle) titleVal = defaultFbTitle;
      if (!formRef.current.useCustomDescription) descVal = defaultFbDesc;
    }

    const finalFormUpdates = {
      url: targetUrl,
      title: titleVal,
      description: descVal,
    };
    setForm((prev) => ({ ...prev, ...finalFormUpdates }));
    save(finalFormUpdates);
  };

  // ─── Debounced URL save (combines URL update + Metadata fetch to prevent mismatches) ───
  const handleUrlChange = (value) => {
    setForm((prev) => ({ ...prev, url: value }));
    setSaveStatus("saving");

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const detected = detectPlatform(value);
      const activePlatform = detected || formRef.current.platform;
      fetchAndSaveMetadata(value, activePlatform);
    }, 1200);
  };

  // ─── Debounced save (for title/description custom text inputs) ───
  const debouncedSave = useCallback(
    (field, value) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => save({ [field]: value }), 1200);
    },
    [save],
  );

  // Toggle Custom Title Source
  const handleCustomTitleToggle = (val) => {
    const updates = { useCustomTitle: val };
    // If turning custom title OFF, assign the auto-fetched title to the database title field
    if (!val) {
      updates.title = fetchedTitleRef.current;
    }
    instantSave(updates);
  };

  // Toggle Custom Description Source
  const handleCustomDescToggle = (val) => {
    const updates = { useCustomDescription: val };
    // If turning custom description OFF, assign the auto-fetched description to the database description field
    if (!val) {
      updates.description = fetchedDescRef.current;
    }
    instantSave(updates);
  };

  // ─── Status Toggle with confirmation warnings ───
  const handleStatusToggle = () => {
    if (form.isLive) {
      setShowStopConfirm(true);
    } else {
      instantSave({ isLive: true });
    }
  };

  const confirmStopStream = () => {
    setShowStopConfirm(false);
    instantSave({ isLive: false });
  };

  // ─── Derived state ───
  const hasValidSource =
    (form.platform === "youtube" && extractedId) ||
    (form.platform === "facebook" && extractedFbUrl);

  const displayTitle = form.useCustomTitle ? form.title : fetchedTitle;
  const displayDesc = form.useCustomDescription
    ? form.description
    : fetchedDesc;

  const handleCopy = () => {
    navigator.clipboard.writeText(`${window.location.origin}/live`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen text-theme-primary bg-theme-bg font-sans space-y-0  rounded-2xl">
      {/* ═══ Header (Redesigned Minimalist) ═══ */}
      <div className="pt-4 sm:pt-6 pb-4 sm:pb-5 flex items-center justify-between border-b border-[var(--admin-border)] mb-6 sm:mb-8 -mx-4 px-4 sm:mx-0 sm:px-0">
        {/* Left Side: Minimal Title */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex flex-col">
            <h1 className="text-lg sm:text-2xl font-black tracking-tight text-white leading-none">
              Live Stream
            </h1>
            <p className="text-[9px] sm:text-[11px] font-bold text-[var(--admin-text-secondary)] mt-1 uppercase tracking-widest hidden sm:block">
              Broadcast Settings
            </p>
          </div>
        </div>

        {/* Right Side: Actions */}
        <div className="flex items-center gap-2.5 sm:gap-2">
          {/* Active Admins */}
          {onlineAdmins.length > 0 && (
            <div
              className="flex items-center gap-1 sm:mr-1"
              title={`${onlineAdmins.length} admin${onlineAdmins.length > 1 ? "s" : ""} editing`}>
              <div className="flex -space-x-1.5 sm:-space-x-2">
                {onlineAdmins.slice(0, 3).map((admin, idx) => {
                  const pic =
                    admin.avatarUrl || admin.profile || admin.profile_picture;
                  return (
                    <div
                      key={admin.id || idx}
                      className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[var(--admin-card-bg)] ring-2 ring-admin-bg flex items-center justify-center text-[9px] font-black text-[var(--admin-text-secondary)] select-none shrink-0 overflow-hidden"
                      style={{ zIndex: 10 - idx }}>
                      {pic ? (
                        <img
                          src={pic}
                          alt=""
                          className="w-full h-full object-cover rounded-full"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <span>
                          {admin.name?.charAt(0)?.toUpperCase() || "A"}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              {onlineAdmins.length > 3 && (
                <span className="text-[10px] text-[var(--admin-text-secondary)] font-bold ml-0.5">
                  +{onlineAdmins.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Copy Link (Icon Only, Desktop) */}
          <button
            onClick={handleCopy}
            title="Copy Stream Link"
            className="hidden sm:flex w-9 h-9 rounded-full bg-[var(--admin-input-bg)] hover:bg-white/[0.08] border border-[var(--admin-border)] text-[var(--admin-text-secondary)] hover:text-white transition-all items-center justify-center">
            {copied ? (
              <CheckCircle size={15} className="text-emerald-400" />
            ) : (
              <Copy size={15} />
            )}
          </button>

          {/* View Page (Icon Only, Desktop) */}
          <a
            href="/live"
            target="_blank"
            rel="noopener noreferrer"
            title="View Live Page"
            className="hidden sm:flex w-9 h-9 rounded-full bg-[var(--admin-input-bg)] hover:bg-white/[0.08] border border-[var(--admin-border)] text-[var(--admin-text-secondary)] hover:text-white transition-all items-center justify-center">
            <ExternalLink size={15} />
          </a>

          {/* Live Toggle Button */}
          <button
            onClick={handleStatusToggle}
            disabled={!form.isLive && !hasValidSource}
            className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-[11px] sm:text-[13px] font-bold transition-all ${
              form.isLive
                ? "bg-red-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                : !hasValidSource
                  ? "bg-[var(--admin-card-bg)] text-white/30 cursor-not-allowed border border-[var(--admin-border)]"
                  : "bg-theme-accent/10 hover:bg-theme-accent/20 text-[var(--accent)] border border-theme-accent/20"
            }`}>
            <div className="flex flex-row gap-1 items-center">
              <span>{form.isLive ? "End" : "Go"}</span>
              <span>{form.isLive ? "Stream" : "Live"}</span>
            </div>
          </button>
        </div>
      </div>

      {/* ═══ PAGE BODY (Redesigned Premium) ═══ */}
      <div className="mx-auto pb-48 space-y-8 lg:space-y-10">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 lg:gap-4">
          {/* ── LEFT: SOURCE & PLAYBACK CONTROLS ── */}
          <div className="order-2 xl:order-1 xl:col-span-7 flex flex-col gap-4">
            {/* SOURCE SECTION CARD */}
            <div className="bg-[var(--admin-card-bg)] border border-[var(--admin-border)] rounded-3xl p-5 shadow-2xl relative overflow-hidden">
              <div className="space-y-8 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[var(--admin-input-bg)] border border-[var(--admin-border)] rounded-2xl text-[var(--admin-text-secondary)]">
                      <Radio size={16} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white tracking-wide">
                        Source Settings
                      </h3>
                      <p className="text-[11px] font-semibold text-white/30 mt-0.5">
                        Configure your stream input
                      </p>
                    </div>
                  </div>
                  {form.isLive && (
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 shadow-sm">
                      Locked
                    </span>
                  )}
                </div>

                <div className="grid w-full grid-cols-3 h-14 bg-[var(--admin-input-bg)] border border-[var(--admin-border)] p-1.5 rounded-2xl shadow-inner gap-1">
                  {[
                    { id: "youtube", label: "YouTube", Icon: Youtube },
                    { id: "facebook", label: "Facebook", Icon: FacebookIcon },
                    { id: "custom", label: "OBS/vMix", Icon: Radio },
                  ].map(({ id, label, Icon }) => {
                    const isActive = form.platform === id;
                    const isDisabled = form.isLive || id === "custom";
                    return (
                      <button
                        key={id}
                        onClick={() => {
                          if (!isDisabled)
                            instantSave({ platform: id, url: "" });
                        }}
                        disabled={isDisabled}
                        className={`flex items-center justify-center text-xs font-semibold rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                          isActive
                            ? "bg-white text-black shadow-md"
                            : "text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] hover:bg-[var(--admin-card-bg)]"
                        }`}
                        title={id === "custom" ? "Coming soon" : ""}>
                        <Icon
                          size={16}
                          className={`mr-2 ${isActive ? "opacity-100" : "opacity-70"}`}
                        />
                        <span className="truncate">{label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-[11px] font-bold text-[var(--admin-text-secondary)] uppercase tracking-widest pl-1">
                    <Link2 size={12} />
                    {form.platform === "youtube"
                      ? "YouTube URL"
                      : "Facebook URL"}
                  </label>
                  <div className="relative group">
                    <input
                      type="text"
                      value={form.url}
                      disabled={form.isLive || form.platform === "custom"}
                      onChange={(e) => handleUrlChange(e.target.value)}
                      placeholder={
                        form.platform === "youtube"
                          ? "Paste YouTube live link..."
                          : form.platform === "custom"
                            ? "RTMP settings coming soon..."
                            : "Paste Facebook video URL..."
                      }
                      className={`w-full bg-[var(--admin-input-bg)] border border-[var(--admin-border)] rounded-2xl px-5 py-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 focus:ring-4 focus:ring-white/[0.02] transition-all font-mono shadow-inner ${form.isLive || form.platform === "custom" ? "opacity-40 cursor-not-allowed" : "group-hover:border-[var(--admin-border)]"}`}
                    />
                    {form.url.trim() && form.platform !== "custom" && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        {hasValidSource ? (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                            <CheckCircle size={10} /> Valid
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-2xl bg-red-600/10 border border-red-600/20 text-red-400 text-[10px] font-bold">
                            <AlertCircle size={10} /> Invalid
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* PLAYBACK SECTION CARD */}
            <div className="bg-[var(--admin-card-bg)] border border-[var(--admin-border)] rounded-3xl p-5 shadow-2xl relative overflow-hidden">
              <div className="space-y-6 relative z-10">
                <div className="flex items-center gap-3 pb-2">
                  <div className="p-2 bg-[var(--admin-input-bg)] border border-[var(--admin-border)] rounded-2xl text-[var(--admin-text-secondary)]">
                    <Monitor size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-wide">
                      Playback Control
                    </h3>
                    <p className="text-[11px] font-semibold text-white/30 mt-0.5">
                      Viewer experience settings
                    </p>
                  </div>
                </div>

                <div className="space-y-1 bg-[var(--admin-input-bg)] rounded-2xl border border-[var(--admin-border)] p-2">
                  <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-[var(--admin-card-bg)] transition-colors">
                    <div className="flex items-center gap-3 text-sm font-medium text-[var(--admin-text-primary)]">
                      <Play size={16} className="text-white/30" /> Autoplay
                    </div>
                    <div className="[--accent:theme(colors.emerald.500)]">
                      <Switch
                        checked={form.autoplay}
                        onCheckedChange={(v) => instantSave({ autoplay: v })}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-[var(--admin-card-bg)] transition-colors">
                    <div className="flex items-center gap-3 text-sm font-medium text-[var(--admin-text-primary)]">
                      <VolumeX size={16} className="text-white/30" /> Start
                      Muted
                    </div>
                    <div className="[--accent:theme(colors.emerald.500)]">
                      <Switch
                        checked={form.muted}
                        onCheckedChange={(v) => instantSave({ muted: v })}
                      />
                    </div>
                  </div>
                  {form.platform === "youtube" && (
                    <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-[var(--admin-card-bg)] transition-colors">
                      <div className="flex items-center gap-3 text-sm font-medium text-[var(--admin-text-primary)]">
                        <MessageSquare size={16} className="text-white/30" />{" "}
                        Live Chat Sidebar
                      </div>
                      <div className="[--accent:theme(colors.emerald.500)]">
                        <Switch
                          checked={form.showChat}
                          onCheckedChange={(v) => instantSave({ showChat: v })}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT: VIDEO PREVIEW + METADATA ── */}
          <div className="order-1 xl:order-2 xl:col-span-5 flex flex-col gap-4">
            {/* Live Player Section */}
            <div
              className={`p-4 sm:p-5 rounded-3xl border transition-all duration-500 shadow-2xl relative ${form.isLive ? "bg-red-600/[0.02] border-red-600/20 shadow-[0_0_50px_rgba(239,68,68,0.05)]" : "bg-[var(--admin-card-bg)] border-[var(--admin-border)]"}`}>
              <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`p-1.5 rounded-3xl  border ${form.isLive ? "bg-red-600/10 border-red-600/20 text-red-400" : "bg-[var(--admin-input-bg)] border-[var(--admin-border)] text-[var(--admin-text-secondary)]"}`}>
                    <Tv size={14} />
                  </div>
                  <h3 className="text-sm font-bold text-white tracking-wide">
                    Live Preview
                  </h3>
                </div>
                {form.isLive && (
                  <span className="flex items-center gap-1.5 text-[10px] font-black text-red-400 bg-red-600/10 px-3 py-1.5 rounded-full border border-red-600/20 uppercase shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />{" "}
                    Live
                  </span>
                )}
              </div>

              {/* Premium Video Frame */}
              <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden border border-[var(--admin-border)] shadow-inner relative group">
                {form.isLive && (
                  <div className="absolute inset-0 pointer-events-none border border-red-600/20 rounded-2xl z-20" />
                )}
                {hasValidSource ? (
                  <VideoEmbed
                    platform={form.platform}
                    videoId={extractedId || ""}
                    videoUrl={extractedFbUrl || ""}
                    autoplay={form.autoplay}
                    muted={form.muted}
                    title={displayTitle}
                    size="sm"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-white/15 space-y-4 py-12 bg-[var(--admin-input-bg)]">
                    <div className="p-4 rounded-2xl bg-[var(--admin-card-bg)] border border-[var(--admin-border)]">
                      <Tv size={32} />
                    </div>
                    <p className="text-xs font-semibold tracking-widest uppercase">
                      Awaiting Signal
                    </p>
                  </div>
                )}
              </div>

              {/* Quick Actions (Mobile Only) */}
              <div className="flex sm:hidden items-center gap-3 pt-5 pb-1">
                <button
                  onClick={handleCopy}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[var(--admin-input-bg)] border border-[var(--admin-border)] text-[var(--admin-text-primary)] text-xs font-bold hover:bg-[var(--admin-border)] transition-colors">
                  {copied ? (
                    <CheckCircle size={14} className="text-emerald-400" />
                  ) : (
                    <Copy size={14} />
                  )}
                  {copied ? "Copied" : "Copy Link"}
                </button>
                <a
                  href="/live"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-white/[0.05] border border-[var(--admin-border)] text-white text-xs font-bold hover:bg-[var(--admin-border)] shadow-sm transition-colors">
                  <ExternalLink size={14} />
                  View Site
                </a>
              </div>
            </div>

            {/* Metadata (Title & Description) CARD */}
            <div className="bg-[var(--admin-card-bg)] border border-[var(--admin-border)] rounded-3xl p-5 shadow-2xl relative overflow-hidden">
              <div className="flex items-center gap-3 pb-6">
                <div className="p-2 bg-[var(--admin-input-bg)] border border-[var(--admin-border)] rounded-2xl text-[var(--admin-text-secondary)]">
                  <FileText size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">
                    Stream Metadata
                  </h3>
                  <p className="text-[11px] font-semibold text-white/30 mt-0.5">
                    What viewers see on the page
                  </p>
                </div>
              </div>

              <div className="space-y-8">
                {/* Title */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-[11px] font-bold text-[var(--admin-text-secondary)] uppercase tracking-widest pl-1">
                      <Type size={12} /> Title
                    </label>
                    <SourceToggle
                      isCustom={form.useCustomTitle}
                      onToggle={handleCustomTitleToggle}
                    />
                  </div>
                  {form.useCustomTitle ? (
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => debouncedSave("title", e.target.value)}
                      placeholder="Custom stream title..."
                      className="w-full bg-[var(--admin-input-bg)] border border-[var(--admin-border)] rounded-2xl px-5 py-4 text-sm font-semibold text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 focus:ring-4 focus:ring-white/[0.02] transition-all shadow-inner hover:border-[var(--admin-border)]"
                    />
                  ) : (
                    <div className="flex items-center justify-between px-5 py-4 rounded-2xl bg-[var(--admin-input-bg)] border border-[var(--admin-border)] text-sm font-semibold text-[var(--admin-text-secondary)] min-h-[54px]">
                      <span className="line-clamp-1">{displayTitle}</span>
                      {fetchingMetadata && (
                        <RefreshCw
                          size={14}
                          className="animate-spin text-white/30 shrink-0 ml-3"
                        />
                      )}
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-[11px] font-bold text-[var(--admin-text-secondary)] uppercase tracking-widest pl-1">
                      <FileText size={12} /> Description
                    </label>
                    <SourceToggle
                      isCustom={form.useCustomDescription}
                      onToggle={handleCustomDescToggle}
                    />
                  </div>
                  {form.useCustomDescription ? (
                    <textarea
                      value={form.description}
                      onChange={(e) =>
                        debouncedSave("description", e.target.value)
                      }
                      placeholder="Custom description..."
                      rows={4}
                      className="w-full bg-[var(--admin-input-bg)] border border-[var(--admin-border)] rounded-2xl px-5 py-4 text-sm leading-relaxed text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 focus:ring-4 focus:ring-white/[0.02] transition-all shadow-inner hover:border-[var(--admin-border)] resize-none"
                    />
                  ) : (
                    <div className="px-5 py-4 rounded-2xl bg-[var(--admin-input-bg)] border border-[var(--admin-border)] text-sm text-[var(--admin-text-secondary)] italic leading-relaxed min-h-[100px]">
                      <span className="line-clamp-4">{displayDesc}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Stop Stream Modal ═══ */}
      {showStopConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-theme-card border border-theme rounded-2xl p-6 max-w-sm w-full space-y-5 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-600/10 rounded-2xl border border-red-600/20 shrink-0">
                <AlertTriangle size={20} className="text-red-400" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-bold">Stop Live Stream?</h3>
                <p className="text-xs opacity-50 leading-relaxed">
                  This will immediately remove the live player from the public
                  website.
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-2 border-t border-theme">
              <button
                onClick={() => setShowStopConfirm(false)}
                className="px-5 py-2.5 rounded-2xl bg-[var(--admin-input-bg)] border border-theme text-xs font-bold hover:bg-white/[0.08] transition-colors">
                Cancel
              </button>
              <button
                onClick={confirmStopStream}
                className="px-5 py-2.5 rounded-2xl bg-red-600 text-white text-xs font-bold hover:bg-red-600 shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all">
                End Stream
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveStreamSettings;
