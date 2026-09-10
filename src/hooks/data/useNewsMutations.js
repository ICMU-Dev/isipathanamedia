import { useMutation, useQueryClient } from "@tanstack/react-query";
import { newsKeys } from "../../lib/queryKeys";
import { applyNewsChange } from "../../lib/cache/news";
import {
  createNews,
  updateNews as apiUpdateNews,
  deleteNews as apiDeleteNews,
  deleteManyNews as apiDeleteManyNews,
  updateManyNews as apiUpdateManyNews,
} from "../../lib/api/newsApi";

export function useNewsMutations(ctx = {}) {
  const queryClient = useQueryClient();

  const addNewsMutation = useMutation({
    mutationFn: (article) => createNews(article),
    onMutate: async (newArticle) => {
      await queryClient.cancelQueries({ queryKey: newsKeys.lists() });

      const tempId = `temp-${crypto.randomUUID ? crypto.randomUUID() : Date.now()}`;
      const optimisticArticle = {
        ...newArticle,
        id: tempId,
        created_at: new Date().toISOString(),
        pending: true,
      };

      // Route through the SAME dispatcher realtime uses
      applyNewsChange(queryClient, { type: "INSERT", row: optimisticArticle }, ctx);

      return { tempId };
    },
    onError: (_err, _variables, context) => {
      if (context?.tempId) {
        applyNewsChange(
          queryClient,
          { type: "DELETE", row: { id: context.tempId } },
          ctx
        );
      }
    },
    onSuccess: (serverArticle, _variables, context) => {
      if (context?.tempId) {
        applyNewsChange(
          queryClient,
          { type: "DELETE", row: { id: context.tempId } },
          ctx
        );
      }
      if (serverArticle) {
        applyNewsChange(queryClient, { type: "INSERT", row: serverArticle }, ctx);
      }
    },
  });

  const updateNewsMutation = useMutation({
    mutationFn: ({ id, patch }) => apiUpdateNews(id, patch),
    onMutate: async ({ id, patch }) => {
      await queryClient.cancelQueries({ queryKey: newsKeys.lists() });
      await queryClient.cancelQueries({ queryKey: newsKeys.detail(id) });

      const previousDetail = queryClient.getQueryData(newsKeys.detail(id));
      const optimisticRow = { id, ...(previousDetail || {}), ...patch };

      applyNewsChange(queryClient, { type: "UPDATE", row: optimisticRow }, ctx);

      return { previousDetail };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousDetail) {
        applyNewsChange(
          queryClient,
          { type: "UPDATE", row: context.previousDetail },
          ctx
        );
      }
    },
    onSuccess: (serverArticle) => {
      if (serverArticle) {
        applyNewsChange(queryClient, { type: "UPDATE", row: serverArticle }, ctx);
      }
    },
  });

  const deleteNewsMutation = useMutation({
    mutationFn: (id) => apiDeleteNews(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: newsKeys.lists() });
      await queryClient.cancelQueries({ queryKey: newsKeys.detail(id) });

      const previousDetail = queryClient.getQueryData(newsKeys.detail(id));
      applyNewsChange(queryClient, { type: "DELETE", row: { id } }, ctx);

      return { previousDetail };
    },
    onError: (_err, id, context) => {
      if (context?.previousDetail) {
        applyNewsChange(
          queryClient,
          { type: "INSERT", row: context.previousDetail },
          ctx
        );
      }
    },
  });

  const deleteManyNewsMutation = useMutation({
    mutationFn: (ids) => apiDeleteManyNews(ids),
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: newsKeys.lists() });
      ids.forEach((id) => {
        applyNewsChange(queryClient, { type: "DELETE", row: { id } }, ctx);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: newsKeys.lists() });
    },
  });

  const updateManyNewsMutation = useMutation({
    mutationFn: ({ ids, patch }) => apiUpdateManyNews(ids, patch),
    onMutate: async ({ ids, patch }) => {
      await queryClient.cancelQueries({ queryKey: newsKeys.lists() });
      ids.forEach((id) => {
        applyNewsChange(queryClient, { type: "UPDATE", row: { id, ...patch } }, ctx);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: newsKeys.lists() });
    },
  });

  return {
    addNews: addNewsMutation.mutateAsync,
    updateNews: (id, patch) => updateNewsMutation.mutateAsync({ id, patch }),
    deleteNews: deleteNewsMutation.mutateAsync,
    deleteManyNews: deleteManyNewsMutation.mutateAsync,
    updateManyNews: (ids, patch) => updateManyNewsMutation.mutateAsync({ ids, patch }),
    isMutating:
      addNewsMutation.isPending ||
      updateNewsMutation.isPending ||
      deleteNewsMutation.isPending ||
      deleteManyNewsMutation.isPending ||
      updateManyNewsMutation.isPending,
  };
}
