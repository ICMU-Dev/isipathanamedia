/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./AuthContext";
import { isAdmin as checkIsAdmin, isWriter as checkIsWriter } from "../utils/roles";
import { newsKeys, teamKeys, messagesKeys, webUsersKeys, siteConfigKeys, assetsKeys, feedbacksKeys } from "../lib/queryKeys";
import {
  fetchNewsList,
  fetchArticleById as apiFetchArticleById,
} from "../lib/api/newsApi";
import { fetchTeamList } from "../lib/api/teamApi";
import { fetchMessagesList } from "../lib/api/messagesApi";
import { fetchWebUsersList } from "../lib/api/webUsersApi";
import { fetchFeedbacksList } from "../lib/api/feedbacksApi";
import {
  fetchSiteConfigAndAssets,
  DEFAULT_SITE_CONFIG,
} from "../lib/api/siteConfigApi";
import {
  uploadImage as apiUploadImage,
  listUploads as apiListUploads,
  deleteUpload as apiDeleteUpload,
  compressImage as apiCompressImage,
} from "../lib/api/storageApi";
import {
  useNews,
  useNewsMutations,
  useTeam,
  useTeamMutations,
  useMessages,
  useMessageMutations,
  useWebUsers,
  useSiteConfig,
  useSiteConfigMutations,
  useFeedbacks,
  useFeedbackMutations,
} from "../hooks/data";


const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const userRole = user?.role;
  const isAdminUser = checkIsAdmin(userRole);
  const isWriterUser = checkIsWriter(userRole);
  const isPrivileged = isAdminUser || isWriterUser;

  const ctx = useMemo(
    () => ({
      currentUserRole: userRole,
      currentUserId: user?.id,
    }),
    [userRole, user?.id]
  );

  // 1. News query & mutations
  const newsFilters = useMemo(
    () => ({ isAdmin: isPrivileged, limit: 100 }),
    [isPrivileged]
  );
  const {
    data: newsData = [],
    isLoading: isNewsLoading,
    isFetching: isNewsFetching,
    refetch: refetchNews,
  } = useNews(newsFilters, ctx);

  const {
    addNews,
    updateNews,
    deleteNews,
    deleteManyNews,
    updateManyNews,
  } = useNewsMutations(ctx);

  // 2. Team query & mutations
  const {
    data: teamData = [],
    isLoading: isTeamLoading,
    isFetching: isTeamFetching,
    refetch: refetchTeam,
  } = useTeam();

  const {
    addMember,
    updateMember,
    deleteMember,
  } = useTeamMutations();

  // 3. Site Config & Assets
  const {
    siteConfig,
    assets,
    isLoading: isConfigLoading,
    isFetching: isConfigFetching,
    refetch: refetchConfig,
  } = useSiteConfig();

  const {
    updateSiteConfig: mutateSiteConfig,
    updateAsset: mutateAsset,
  } = useSiteConfigMutations();

  const updateSiteConfig = useCallback(
    async (newConfig) => {
      try {
        await mutateSiteConfig(newConfig);
        return true;
      } catch (err) {
        console.error("[DataContext] Error updating site config:", err);
        return false;
      }
    },
    [mutateSiteConfig]
  );

  const updateAsset = useCallback(
    async (key, url) => {
      try {
        await mutateAsset(key, url);
        return true;
      } catch (err) {
        console.error("[DataContext] Error updating asset:", err);
        return false;
      }
    },
    [mutateAsset]
  );

  // 4. Messages (Admin-only fetch)
  const {
    data: messagesData = [],
    isFetching: isMessagesFetching,
    refetch: refetchMessages,
  } = useMessages(Boolean(user && isAdminUser));

  const {
    sendMessage: apiSendMessage,
    deleteMessage: apiDeleteMessage,
  } = useMessageMutations();

  // 5. Web Users (Admin/Writer fetch)
  const {
    data: webUsersData = [],
    isFetching: isWebUsersFetching,
    refetch: refetchWebUsers,
  } = useWebUsers(Boolean(user && isPrivileged));

  // 6. Feedbacks (Admin fetch)
  const {
    data: feedbacksData = [],
    isFetching: isFeedbacksFetching,
    refetch: refetchFeedbacks,
  } = useFeedbacks(Boolean(user && isAdminUser));

  const {
    updateFeedbackStatus: apiUpdateFeedbackStatus,
    updateFeedbackReply: apiUpdateFeedbackReply,
    deleteFeedback: apiDeleteFeedback,
    submitFeedback: apiSubmitFeedback,
  } = useFeedbackMutations();

  // Local state for UI extras
  const [activityLogs, setActivityLogs] = useState([]);
  const [nethinetheraSchools, setNethinetheraSchools] = useState([]);
  const [hasMoreNews, setHasMoreNews] = useState(true);
  const [isAdminDataLoading, setIsAdminDataLoading] = useState(false);

  // Aggregated loading states
  const loading = isNewsLoading || isTeamLoading || isConfigLoading;
  const isFetching =
    isNewsFetching ||
    isTeamFetching ||
    isConfigFetching ||
    isMessagesFetching ||
    isWebUsersFetching ||
    isFeedbacksFetching;

  // Stats for Admin Dashboard
  const stats = useMemo(
    () => ({
      totalNews: newsData.length,
      totalMembers: teamData.length,
      totalServices: 3,
      totalMessages: messagesData.length,
      totalFeedbacks: feedbacksData.length,
      totalViews: 12450,
    }),
    [newsData.length, teamData.length, messagesData.length, feedbacksData.length]
  );

  // Explicit fetch functions (for backward compatibility with legacy calls)
  const fetchNews = useCallback(

    async (force = false, page = 0, limit = 50, queryIsAdmin = false) => {
      if (force && page === 0 && limit === 100 && (queryIsAdmin || isPrivileged)) {
        return refetchNews();
      }
      const filters = { page, limit, isAdmin: queryIsAdmin || isPrivileged };
      const data = await queryClient.fetchQuery({
        queryKey: newsKeys.list(filters),
        queryFn: () => fetchNewsList(filters),
        staleTime: force ? 0 : 30_000,
      });
      if (data && data.length < limit) {
        setHasMoreNews(false);
      } else {
        setHasMoreNews(true);
      }
      return data;
    },
    [queryClient, isPrivileged, refetchNews]
  );

  const fetchArticleById = useCallback(
    async (id, currentUser = null) => {
      return queryClient.fetchQuery({
        queryKey: newsKeys.detail(id),
        queryFn: () => apiFetchArticleById(id, currentUser || user),
        staleTime: 30_000,
      });
    },
    [queryClient, user]
  );

  const fetchTeam = useCallback(
    async (force = false) => {
      if (force) {
        return refetchTeam();
      }
      return queryClient.fetchQuery({
        queryKey: teamKeys.list(),
        queryFn: fetchTeamList,
        staleTime: 60_000,
      });
    },
    [queryClient, refetchTeam]
  );

  const fetchConfig = useCallback(
    async (force = false) => {
      if (force) {
        return refetchConfig();
      }
      return queryClient.fetchQuery({
        queryKey: siteConfigKeys.detail(),
        queryFn: fetchSiteConfigAndAssets,
        staleTime: 30_000,
      });
    },
    [queryClient, refetchConfig]
  );

  const fetchWebUsers = useCallback(
    async (force = false) => {
      if (!user || !isPrivileged) return [];
      if (force) {
        return refetchWebUsers();
      }
      return queryClient.fetchQuery({
        queryKey: webUsersKeys.list(),
        queryFn: fetchWebUsersList,
        staleTime: 60_000,
      });
    },
    [queryClient, user, isPrivileged, refetchWebUsers]
  );

  const fetchMessages = useCallback(
    async (force = false) => {
      if (!user || !isAdminUser) return [];
      if (force) {
        const res = await refetchMessages();
        return res?.data || [];
      }
      return queryClient.fetchQuery({
        queryKey: messagesKeys.list(),
        queryFn: fetchMessagesList,
        staleTime: 30_000,
      });
    },
    [queryClient, user, isAdminUser, refetchMessages]
  );

  const fetchFeedbacks = useCallback(
    async (force = false) => {
      if (!user || !isAdminUser) return [];
      if (force) {
        const res = await refetchFeedbacks();
        return res?.data || [];
      }
      return queryClient.fetchQuery({
        queryKey: feedbacksKeys.list(),
        queryFn: fetchFeedbacksList,
        staleTime: 30_000,
      });
    },
    [queryClient, user, isAdminUser, refetchFeedbacks]
  );

  const fetchAdminData = useCallback(
    async (force = false) => {
      if (!user || !isPrivileged) return;
      setIsAdminDataLoading(true);
      try {
        const tasks = [fetchNews(force, 0, 100, true)];
        if (isAdminUser) {
          tasks.push(fetchMessages(force));
          tasks.push(fetchFeedbacks(force));
        }
        tasks.push(fetchWebUsers(force));
        await Promise.allSettled(tasks);
      } finally {
        setIsAdminDataLoading(false);
      }
    },
    [user, isPrivileged, isAdminUser, fetchNews, fetchMessages, fetchFeedbacks, fetchWebUsers]
  );


  const fetchData = useCallback(
    async (force = false) => {
      await Promise.allSettled([
        fetchNews(force, 0, 5, false),
        fetchTeam(force),
        fetchConfig(force),
      ]);
    },
    [fetchNews, fetchTeam, fetchConfig]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addActivityLog = useCallback(
    (action, details, status = "SUCCESS", user_email = "admin") => {
      const log = {
        id: Date.now(),
        action,
        details,
        created_at: new Date().toISOString(),
        status,
        user_email,
      };
      setActivityLogs((prev) => [log, ...prev]);
    },
    []
  );

  const contextValue = useMemo(
    () => ({
      news: newsData,
      team: teamData,
      webUsers: webUsersData,
      stats,
      messages: messagesData,
      feedbacks: feedbacksData,
      activityLogs,
      assets: assets || {},
      loading,
      isLoadingNews: isNewsLoading,
      isFetching,
      user,
      siteConfig: siteConfig || DEFAULT_SITE_CONFIG,
      nethinetheraSchools,
      hasMoreNews,
      isAdminDataLoading,

      // Operations
      addNews,
      updateNews,
      deleteNews,
      deleteManyNews,
      updateManyNews,
      addTeamMember: addMember,
      updateTeam: updateMember,
      deleteTeam: deleteMember,
      addMember,
      updateMember,
      deleteMember,
      updateAsset,
      updateSiteConfig,
      addMessage: apiSendMessage,
      deleteMessage: apiDeleteMessage,
      updateFeedbackStatus: apiUpdateFeedbackStatus,
      updateFeedbackReply: apiUpdateFeedbackReply,
      deleteFeedback: apiDeleteFeedback,
      submitFeedback: apiSubmitFeedback,
      addActivityLog,
      setNethinetheraSchools,

      // Fetchers
      fetchData,
      refreshAllData: () => fetchData(true),
      fetchNews,
      fetchArticleById,
      fetchTeam,
      fetchWebUsers,
      fetchConfig,
      fetchMessages,
      fetchFeedbacks,
      refetchFeedbacks,
      fetchAdminData,

      // Storage & Utilities
      uploadImage: apiUploadImage,
      listUploads: apiListUploads,
      deleteUpload: apiDeleteUpload,
      compressImage: apiCompressImage,
    }),
    [
      newsData,
      teamData,
      webUsersData,
      stats,
      messagesData,
      feedbacksData,
      activityLogs,
      assets,
      loading,
      isNewsLoading,
      isFetching,
      user,
      siteConfig,
      nethinetheraSchools,
      hasMoreNews,
      isAdminDataLoading,
      addNews,
      updateNews,
      deleteNews,
      deleteManyNews,
      updateManyNews,
      addMember,
      updateMember,
      deleteMember,
      updateAsset,
      updateSiteConfig,
      apiSendMessage,
      apiDeleteMessage,
      apiUpdateFeedbackStatus,
      apiUpdateFeedbackReply,
      apiDeleteFeedback,
      apiSubmitFeedback,
      addActivityLog,
      fetchData,
      fetchNews,
      fetchArticleById,
      fetchTeam,
      fetchWebUsers,
      fetchConfig,
      fetchMessages,
      fetchFeedbacks,
      refetchFeedbacks,
      fetchAdminData,
    ]
  );

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};
export default DataContext;
