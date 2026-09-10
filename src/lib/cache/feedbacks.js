import { feedbacksKeys } from "../queryKeys";

/**
 * Single source of truth for how a feedback entity change propagates through the TanStack Query cache.
 */
export function applyFeedbackChange(queryClient, change) {
  const { type, row, oldRow } = change;
  if (!row && !oldRow) return;

  const rawId = row?.id ?? oldRow?.id;
  if (rawId == null || rawId === "") return;
  const rowId = String(rawId);

  queryClient.setQueryData(feedbacksKeys.list(), (oldList) => {
    const list = Array.isArray(oldList) ? oldList : [];

    switch (type) {
      case "INSERT": {
        if (list.some((f) => String(f.id) === rowId)) {
          return list.map((f) =>
            String(f.id) === rowId ? { ...f, ...row } : f
          );
        }
        return [row, ...list].sort(
          (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
        );
      }
      case "UPDATE": {
        return list.map((f) =>
          String(f.id) === rowId ? { ...f, ...row } : f
        );
      }
      case "DELETE": {
        return list.filter((f) => String(f.id) !== rowId);
      }
      default:
        return list;
    }
  });

  if (type === "DELETE") {
    queryClient.removeQueries({ queryKey: feedbacksKeys.detail(rowId) });
  } else if (row) {
    queryClient.setQueryData(feedbacksKeys.detail(rowId), (prev) =>
      prev ? { ...prev, ...row } : row
    );
  }
}
