import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { teamKeys } from "../../lib/queryKeys";
import {
  fetchTeamList,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
} from "../../lib/api/teamApi";
import { subscribeToTeam } from "../../lib/realtime/teamChannel";
import { applyTeamChange } from "../../lib/cache/team";

/**
 * Thin hook for querying the team members list with realtime subscription.
 */
export function useTeam() {
  const queryClient = useQueryClient();

  useEffect(() => {
    return subscribeToTeam(queryClient);
  }, [queryClient]);

  return useQuery({
    queryKey: teamKeys.list(),
    queryFn: fetchTeamList,
    staleTime: 60_000,
  });
}

/**
 * Hook for team mutations with optimistic cache updates.
 */
export function useTeamMutations() {
  const queryClient = useQueryClient();

  const addMemberMutation = useMutation({
    mutationFn: createTeamMember,
    onMutate: async (newMember) => {
      await queryClient.cancelQueries({ queryKey: teamKeys.list() });
      const tempId = `temp-${Date.now()}`;
      const optimisticMember = { ...newMember, id: tempId };
      applyTeamChange(queryClient, { type: "INSERT", row: optimisticMember });
      return { tempId };
    },
    onError: (_err, _vars, context) => {
      if (context?.tempId) {
        applyTeamChange(queryClient, {
          type: "DELETE",
          row: { id: context.tempId },
        });
      }
    },
    onSuccess: (serverMember, _vars, context) => {
      if (context?.tempId) {
        applyTeamChange(queryClient, {
          type: "DELETE",
          row: { id: context.tempId },
        });
      }
      if (serverMember) {
        applyTeamChange(queryClient, { type: "INSERT", row: serverMember });
      }
    },
  });

  const updateMemberMutation = useMutation({
    mutationFn: ({ id, patch }) => updateTeamMember(id, patch),
    onMutate: async ({ id, patch }) => {
      await queryClient.cancelQueries({ queryKey: teamKeys.list() });
      const previousTeam = queryClient.getQueryData(teamKeys.list());
      const existing = (previousTeam || []).find((t) => String(t.id) === String(id));
      const optimistic = { ...(existing || {}), ...patch, id };
      applyTeamChange(queryClient, { type: "UPDATE", row: optimistic });
      return { previousTeam };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousTeam) {
        queryClient.setQueryData(teamKeys.list(), context.previousTeam);
      }
    },
    onSuccess: (serverMember) => {
      if (serverMember) {
        applyTeamChange(queryClient, { type: "UPDATE", row: serverMember });
      }
    },
  });

  const deleteMemberMutation = useMutation({
    mutationFn: (id) => deleteTeamMember(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: teamKeys.list() });
      const previousTeam = queryClient.getQueryData(teamKeys.list());
      applyTeamChange(queryClient, { type: "DELETE", row: { id } });
      return { previousTeam };
    },
    onError: (_err, _id, context) => {
      if (context?.previousTeam) {
        queryClient.setQueryData(teamKeys.list(), context.previousTeam);
      }
    },
  });

  return {
    addMember: addMemberMutation.mutateAsync,
    updateMember: (id, patch) => updateMemberMutation.mutateAsync({ id, patch }),
    deleteMember: deleteMemberMutation.mutateAsync,
    isMutating:
      addMemberMutation.isPending ||
      updateMemberMutation.isPending ||
      deleteMemberMutation.isPending,
  };
}
