import { webUsersKeys } from "../queryKeys";

/**
 * Single source of truth for how a user change propagates through the cache.
 */
export function applyWebUsersChange(queryClient, change) {
  const { type, row, oldRow } = change;
  if (!row && !oldRow) return;

  const rowId = String(row?.id ?? oldRow?.id);
  if (!rowId) return;

  queryClient.setQueryData(webUsersKeys.list(), (oldList) => {
    if (!oldList || !Array.isArray(oldList)) return oldList;

    switch (type) {
      case "INSERT": {
        if (oldList.some((u) => String(u.id) === rowId)) {
          return oldList.map((u) => (String(u.id) === rowId ? { ...u, ...row } : u));
        }
        return [...oldList, row].sort((a, b) =>
          (a.full_name || "").localeCompare(b.full_name || "")
        );
      }
      case "UPDATE": {
        return oldList
          .map((u) => (String(u.id) === rowId ? { ...u, ...row } : u))
          .sort((a, b) => (a.full_name || "").localeCompare(b.full_name || ""));
      }
      case "DELETE": {
        return oldList.filter((u) => String(u.id) !== rowId);
      }
      default:
        return oldList;
    }
  });

  if (type === "DELETE") {
    queryClient.removeQueries({ queryKey: webUsersKeys.detail(rowId) });
  } else if (row) {
    queryClient.setQueryData(webUsersKeys.detail(rowId), row);
  }
}
