import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { feedbacksKeys } from "../../lib/queryKeys";
import {
  fetchFeedbacksList,
  updateFeedbackStatus as apiUpdateStatus,
  updateFeedbackReply as apiUpdateReply,
  deleteFeedback as apiDeleteFeedback,
  submitFeedback as apiSubmitFeedback,
} from "../../lib/api/feedbacksApi";
import { subscribeToFeedbacks } from "../../lib/realtime/feedbacksChannel";
import { applyFeedbackChange } from "../../lib/cache/feedbacks";

/**
 * Hook for querying feedbacks with realtime PostgreSQL synchronization.
 */
export function useFeedbacks(enabled = true) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;
    return subscribeToFeedbacks(queryClient);
  }, [queryClient, enabled]);

  return useQuery({
    queryKey: feedbacksKeys.list(),
    queryFn: fetchFeedbacksList,
    enabled,
    staleTime: 30_000,
  });
}

/**
 * Hook for feedback mutations with optimistic UI patching.
 */
export function useFeedbackMutations() {
  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => apiUpdateStatus(id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: feedbacksKeys.list() });
      const previousFeedbacks = queryClient.getQueryData(feedbacksKeys.list());

      applyFeedbackChange(queryClient, {
        type: "UPDATE",
        row: { id, status },
      });

      return { previousFeedbacks };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousFeedbacks) {
        queryClient.setQueryData(feedbacksKeys.list(), context.previousFeedbacks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: feedbacksKeys.lists() });
    },
  });

  const updateReplyMutation = useMutation({
    mutationFn: ({ id, reply }) => apiUpdateReply(id, reply),
    onMutate: async ({ id, reply }) => {
      await queryClient.cancelQueries({ queryKey: feedbacksKeys.list() });
      const previousFeedbacks = queryClient.getQueryData(feedbacksKeys.list());

      applyFeedbackChange(queryClient, {
        type: "UPDATE",
        row: {
          id,
          admin_reply: reply ? reply.trim() : null,
          replied_at: reply ? new Date().toISOString() : null,
        },
      });

      return { previousFeedbacks };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousFeedbacks) {
        queryClient.setQueryData(feedbacksKeys.list(), context.previousFeedbacks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: feedbacksKeys.lists() });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiDeleteFeedback(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: feedbacksKeys.list() });
      const previousFeedbacks = queryClient.getQueryData(feedbacksKeys.list());
      applyFeedbackChange(queryClient, { type: "DELETE", row: { id } });
      return { previousFeedbacks };
    },
    onError: (_err, _id, context) => {
      if (context?.previousFeedbacks) {
        queryClient.setQueryData(feedbacksKeys.list(), context.previousFeedbacks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: feedbacksKeys.lists() });
    },
  });

  const submitMutation = useMutation({
    mutationFn: (feedbackData) => apiSubmitFeedback(feedbackData),
    onSuccess: (serverFeedback) => {
      if (serverFeedback) {
        applyFeedbackChange(queryClient, {
          type: "INSERT",
          row: serverFeedback,
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: feedbacksKeys.lists() });
    },
  });

  return {
    updateFeedbackStatus: (id, status) =>
      updateStatusMutation.mutateAsync({ id, status }),
    updateFeedbackReply: (id, reply) =>
      updateReplyMutation.mutateAsync({ id, reply }),
    deleteFeedback: (id) => deleteMutation.mutateAsync(id),
    submitFeedback: (data) => submitMutation.mutateAsync(data),
    isMutating:
      updateStatusMutation.isPending ||
      updateReplyMutation.isPending ||
      deleteMutation.isPending ||
      submitMutation.isPending,
  };
}
