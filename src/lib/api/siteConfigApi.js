import { supabase } from "../supabaseClient";

export const DEFAULT_SITE_CONFIG = {
  socialLinks: {
    facebook: "https://facebook.com",
    instagram: "https://instagram.com",
    youtube: "https://youtube.com",
    twitter: "https://twitter.com",
    tiktok: "",
  },
  contactDetails: {
    address: "Isipathana College, Colombo 05, Sri Lanka",
    email: "icmediaunit@gmail.com",
    phone: "+94 11 123 4567",
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
  nethinethera: {
    registrationOpen: true,
    maxCapacity: 100,
    emergencyNotice: "",
  },
  liveStream: {
    platform: "youtube",
    videoId: "",
    videoUrl: "",
    title: "",
    useCustomTitle: false,
    description: "",
    useCustomDescription: false,
    isLive: false,
    showChat: false,
    autoplay: true,
    muted: true,
  },
};

/**
 * Fetch all assets and the parsed site_config.
 */
export async function fetchSiteConfigAndAssets() {
  const { data: assetsData, error } = await supabase
    .from("assets")
    .select("key, url");

  if (error) throw error;

  const assetMap = {};
  let siteConfig = { ...DEFAULT_SITE_CONFIG };

  (assetsData || []).forEach((a) => {
    if (a.key === "site_config") {
      try {
        const parsed = JSON.parse(a.url);
        siteConfig = {
          ...DEFAULT_SITE_CONFIG,
          ...parsed,
          socialLinks: { ...DEFAULT_SITE_CONFIG.socialLinks, ...(parsed.socialLinks || {}) },
          contactDetails: { ...DEFAULT_SITE_CONFIG.contactDetails, ...(parsed.contactDetails || {}) },
          liveStream: { ...DEFAULT_SITE_CONFIG.liveStream, ...(parsed.liveStream || {}) },
          nethinethera: { ...DEFAULT_SITE_CONFIG.nethinethera, ...(parsed.nethinethera || {}) },
        };
      } catch (e) {
        console.error("Config parse error:", e);
      }
    } else {
      assetMap[a.key] = a.url;
    }
  });

  return { siteConfig, assets: assetMap };
}

/**
 * Upsert site_config in assets table with deep merge protection.
 */
export async function updateSiteConfig(newConfig) {
  let existing = {};
  try {
    const { data: currentAsset } = await supabase
      .from("assets")
      .select("url")
      .eq("key", "site_config")
      .maybeSingle();

    if (currentAsset?.url) {
      existing = JSON.parse(currentAsset.url);
    }
  } catch (e) {
    console.warn("[siteConfigApi] Could not read existing config prior to upsert:", e);
  }

  const merged = {
    ...DEFAULT_SITE_CONFIG,
    ...existing,
    ...newConfig,
    socialLinks: {
      ...DEFAULT_SITE_CONFIG.socialLinks,
      ...(existing.socialLinks || {}),
      ...(newConfig.socialLinks || {}),
    },
    contactDetails: {
      ...DEFAULT_SITE_CONFIG.contactDetails,
      ...(existing.contactDetails || {}),
      ...(newConfig.contactDetails || {}),
    },
    liveStream: {
      ...DEFAULT_SITE_CONFIG.liveStream,
      ...(existing.liveStream || {}),
      ...(newConfig.liveStream || {}),
    },
    nethinethera: {
      ...DEFAULT_SITE_CONFIG.nethinethera,
      ...(existing.nethinethera || {}),
      ...(newConfig.nethinethera || {}),
    },
  };

  const { error } = await supabase.from("assets").upsert({
    key: "site_config",
    url: JSON.stringify(merged),
  });

  if (error) throw error;
  return merged;
}

/**
 * Upsert an arbitrary asset key/url.
 */
export async function updateAsset(key, url) {
  const { error } = await supabase.from("assets").upsert({ key, url });
  if (error) throw error;
  return { key, url };
}
