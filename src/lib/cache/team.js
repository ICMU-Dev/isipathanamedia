import { teamKeys } from "../queryKeys";

/**
 * Single source of truth for how a team member change propagates through the cache.
 */
export function applyTeamChange(queryClient, change) {
  const { type, row, oldRow } = change;
  if (!row && !oldRow) return;

  const rowId = String(row?.id ?? oldRow?.id);
  if (!rowId) return;

  queryClient.setQueryData(teamKeys.list(), (oldList) => {
    if (!oldList || !Array.isArray(oldList)) return oldList;

    switch (type) {
      case "INSERT": {
        if (oldList.some((t) => String(t.id) === rowId)) {
          return oldList.map((t) => (String(t.id) === rowId ? { ...t, ...row } : t));
        }
        return [...oldList, row].sort((a, b) => Number(a.id) - Number(b.id));
      }
      case "UPDATE": {
        return oldList
          .map((t) => (String(t.id) === rowId ? { ...t, ...row } : t))
          .sort((a, b) => Number(a.id) - Number(b.id));
      }
      case "DELETE": {
        return oldList.filter((t) => String(t.id) !== rowId);
      }
      default:
        return oldList;
    }
  });

  if (type === "DELETE") {
    queryClient.removeQueries({ queryKey: teamKeys.detail(rowId) });
  } else if (row) {
    queryClient.setQueryData(teamKeys.detail(rowId), row);
  }
}
