import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { newsKeys } from "../../lib/queryKeys";
import { fetchNewsList, fetchArticleById } from "../../lib/api/newsApi";
import { subscribeToNews } from "../../lib/realtime/newsChannel";

/**
 * Thin hook to fetch and subscribe to news articles.
 */
export function useNews(filters = {}, ctx = {}) {
  const queryClient = useQueryClient();
  const role = ctx.currentUserRole;
  const userId = ctx.currentUserId;

  useEffect(() => {
    return subscribeToNews(queryClient, {
      currentUserRole: role,
      currentUserId: userId,
    });
  }, [queryClient, role, userId]);

  return useQuery({
    queryKey: newsKeys.list(filters),
    queryFn: () => fetchNewsList(filters),
    staleTime: 30_000,
  });
}

/**
 * Thin hook to fetch and subscribe to a single article by ID.
 */
export function useArticle(id, currentUser = null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    return subscribeToNews(queryClient, {
      currentUserRole: currentUser?.role,
      currentUserId: currentUser?.id,
    });
  }, [queryClient, currentUser?.role, currentUser?.id]);

  return useQuery({
    queryKey: newsKeys.detail(id),
    queryFn: () => fetchArticleById(id, currentUser),
    enabled: Boolean(id),
    staleTime: 30_000,
  });
}
