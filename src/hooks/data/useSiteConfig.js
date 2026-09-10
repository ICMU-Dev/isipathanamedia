import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { siteConfigKeys, assetsKeys } from "../../lib/queryKeys";
import {
  fetchSiteConfigAndAssets,
  updateSiteConfig as apiUpdateSiteConfig,
  updateAsset as apiUpdateAsset,
  DEFAULT_SITE_CONFIG,
} from "../../lib/api/siteConfigApi";
import { subscribeToSiteConfig } from "../../lib/realtime/siteConfigChannel";

/**
 * Thin hook for site config and assets with realtime synchronization.
 */
export function useSiteConfig() {
  const queryClient = useQueryClient();

  useEffect(() => {
    return subscribeToSiteConfig(queryClient);
  }, [queryClient]);

  const query = useQuery({
    queryKey: siteConfigKeys.detail(),
    queryFn: fetchSiteConfigAndAssets,
    staleTime: 30_000,
    placeholderData: {
      siteConfig: DEFAULT_SITE_CONFIG,
      assets: {},
    },
  });

  const data = query.data || {
    siteConfig: DEFAULT_SITE_CONFIG,
    assets: {},
  };

  const siteConfig = data.siteConfig || DEFAULT_SITE_CONFIG;
  const assets = data.assets || {};

  return {
    siteConfig,
    assets,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    refetch: query.refetch,
  };
}

/**
 * Hook for mutating siteConfig and assets.
 */
export function useSiteConfigMutations() {
  const queryClient = useQueryClient();

  const updateConfigMutation = useMutation({
    mutationFn: apiUpdateSiteConfig,
    onMutate: async (newConfig) => {
      await queryClient.cancelQueries({ queryKey: siteConfigKeys.detail() });
      const previous = queryClient.getQueryData(siteConfigKeys.detail());
      queryClient.setQueryData(siteConfigKeys.detail(), (old) => {
        const prevSiteConfig = old?.siteConfig || DEFAULT_SITE_CONFIG;
        return {
          ...(old || {}),
          siteConfig: {
            ...prevSiteConfig,
            ...newConfig,
            socialLinks: { ...(prevSiteConfig.socialLinks || {}), ...(newConfig.socialLinks || {}) },
            contactDetails: { ...(prevSiteConfig.contactDetails || {}), ...(newConfig.contactDetails || {}) },
            liveStream: { ...(prevSiteConfig.liveStream || {}), ...(newConfig.liveStream || {}) },
            nethinethera: { ...(prevSiteConfig.nethinethera || {}), ...(newConfig.nethinethera || {}) },
          },
        };
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(siteConfigKeys.detail(), context.previous);
      }
    },
    onSuccess: (serverConfig) => {
      if (serverConfig) {
        queryClient.setQueryData(siteConfigKeys.detail(), (old) => ({
          ...(old || {}),
          siteConfig: serverConfig,
        }));
      }
    },
  });

  const updateAssetMutation = useMutation({
    mutationFn: ({ key, url }) => apiUpdateAsset(key, url),
    onMutate: async ({ key, url }) => {
      await queryClient.cancelQueries({ queryKey: siteConfigKeys.detail() });
      await queryClient.cancelQueries({ queryKey: assetsKeys.all });
      const previous = queryClient.getQueryData(siteConfigKeys.detail());
      queryClient.setQueryData(siteConfigKeys.detail(), (old) => ({
        ...(old || {}),
        assets: { ...((old && old.assets) || {}), [key]: url },
      }));
      queryClient.setQueryData(assetsKeys.all, (old) => ({
        ...(old || {}),
        [key]: url,
      }));
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(siteConfigKeys.detail(), context.previous);
      }
    },
  });

  return {
    updateSiteConfig: updateConfigMutation.mutateAsync,
    updateAsset: (key, url) => updateAssetMutation.mutateAsync({ key, url }),
    isMutating: updateConfigMutation.isPending || updateAssetMutation.isPending,
  };
}
