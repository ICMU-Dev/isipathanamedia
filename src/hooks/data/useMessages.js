import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { messagesKeys } from "../../lib/queryKeys";
import {
  fetchMessagesList,
  sendMessage as apiSendMessage,
  deleteMessage as apiDeleteMessage,
} from "../../lib/api/messagesApi";
import { subscribeToMessages } from "../../lib/realtime/messagesChannel";
import { applyMessageChange } from "../../lib/cache/messages";

/**
 * Thin hook for querying messages with realtime updates.
 */
export function useMessages(enabled = true) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;
    return subscribeToMessages(queryClient);
  }, [queryClient, enabled]);

  return useQuery({
    queryKey: messagesKeys.list(),
    queryFn: fetchMessagesList,
    enabled,
    staleTime: 30_000,
  });
}

/**
 * Hook for messages mutations.
 */
export function useMessageMutations() {
  const queryClient = useQueryClient();

  const sendMutation = useMutation({
    mutationFn: (messageData) => apiSendMessage(messageData),
    onMutate: async (newMessage) => {
      await queryClient.cancelQueries({ queryKey: messagesKeys.list() });

      const tempId = `temp-${Date.now()}`;
      const optimisticMessage = {
        ...newMessage,
        id: tempId,
        created_at: new Date().toISOString(),
      };

      applyMessageChange(queryClient, {
        type: "INSERT",
        row: optimisticMessage,
      });

      return { tempId };
    },
    onError: (_err, _vars, context) => {
      if (context?.tempId) {
        applyMessageChange(queryClient, {
          type: "DELETE",
          row: { id: context.tempId },
        });
      }
    },
    onSuccess: (serverMessage, _vars, context) => {
      if (context?.tempId) {
        applyMessageChange(queryClient, {
          type: "DELETE",
          row: { id: context.tempId },
        });
      }
      if (serverMessage) {
        applyMessageChange(queryClient, {
          type: "INSERT",
          row: serverMessage,
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: messagesKeys.lists() });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiDeleteMessage(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: messagesKeys.list() });
      const previousMessages = queryClient.getQueryData(messagesKeys.list());
      applyMessageChange(queryClient, { type: "DELETE", row: { id } });
      return { previousMessages };
    },
    onError: (_err, _id, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(messagesKeys.list(), context.previousMessages);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: messagesKeys.lists() });
    },
  });

  return {
    sendMessage: sendMutation.mutateAsync,
    deleteMessage: deleteMutation.mutateAsync,
    isMutating: sendMutation.isPending || deleteMutation.isPending,
  };
}
