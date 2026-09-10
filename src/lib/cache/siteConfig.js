import { siteConfigKeys, assetsKeys } from "../queryKeys";
import { DEFAULT_SITE_CONFIG } from "../api/siteConfigApi";

/**
 * Single source of truth for siteConfig and asset cache updates.
 */
export function applySiteConfigChange(queryClient, change) {
  const { type, row } = change;
  if (!row || type === "DELETE") return;

  queryClient.setQueryData(siteConfigKeys.detail(), (old) => {
    const prevSiteConfig = old?.siteConfig || DEFAULT_SITE_CONFIG;
    const prevAssets = old?.assets || {};

    let nextSiteConfig = prevSiteConfig;
    if (row.key === "site_config" && row.url) {
      try {
        const parsedConfig = JSON.parse(row.url);
        nextSiteConfig = {
          ...prevSiteConfig,
          ...parsedConfig,
          socialLinks: { ...prevSiteConfig.socialLinks, ...parsedConfig.socialLinks },
          contactDetails: { ...prevSiteConfig.contactDetails, ...parsedConfig.contactDetails },
          liveStream: { ...prevSiteConfig.liveStream, ...parsedConfig.liveStream },
          nethinethera: { ...prevSiteConfig.nethinethera, ...parsedConfig.nethinethera },
        };
      } catch (e) {
        console.error("[applySiteConfigChange] Parse error:", e);
      }
    }

    const nextAssets =
      row.key === "site_config"
        ? prevAssets
        : { ...prevAssets, [row.key]: row.url };

    return {
      siteConfig: nextSiteConfig,
      assets: nextAssets,
    };
  });

  // Also update assetsKeys.all (excluding site_config)
  if (row.key !== "site_config") {
    queryClient.setQueryData(assetsKeys.all, (oldAssets) => {
      if (!oldAssets) return { [row.key]: row.url };
      return { ...oldAssets, [row.key]: row.url };
    });
  }
}
