import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { webUsersKeys } from "../../lib/queryKeys";
import { fetchWebUsersList } from "../../lib/api/webUsersApi";
import { subscribeToWebUsers } from "../../lib/realtime/webUsersChannel";

/**
 * Thin hook to fetch and subscribe to web users.
 */
export function useWebUsers(enabled = true) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;
    return subscribeToWebUsers(queryClient);
  }, [queryClient, enabled]);

  return useQuery({
    queryKey: webUsersKeys.list(),
    queryFn: fetchWebUsersList,
    enabled,
    staleTime: 60_000,
  });
}
