import { messagesKeys } from "../queryKeys";

/**
 * Single source of truth for how a message change propagates through the cache.
 */
export function applyMessageChange(queryClient, change) {
  const { type, row, oldRow } = change;
  if (!row && !oldRow) return;

  const rawId = row?.id ?? oldRow?.id;
  if (rawId == null || rawId === "") return;
  const rowId = String(rawId);

  queryClient.setQueryData(messagesKeys.list(), (oldList) => {
    const list = Array.isArray(oldList) ? oldList : [];

    switch (type) {
      case "INSERT": {
        if (list.some((m) => String(m.id) === rowId)) {
          return list.map((m) => (String(m.id) === rowId ? { ...m, ...row } : m));
        }
        return [row, ...list].sort(
          (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
        );
      }
      case "UPDATE": {
        return list.map((m) => (String(m.id) === rowId ? { ...m, ...row } : m));
      }
      case "DELETE": {
        return list.filter((m) => String(m.id) !== rowId);
      }
      default:
        return list;
    }
  });

  if (type === "DELETE") {
    queryClient.removeQueries({ queryKey: messagesKeys.detail(rowId) });
  } else if (row) {
    queryClient.setQueryData(messagesKeys.detail(rowId), row);
  }
}
