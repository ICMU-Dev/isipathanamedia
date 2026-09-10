import { newsKeys } from "../queryKeys";
import { patchImageUrl } from "../api/newsApi";
import { isAdmin as checkIsAdmin } from "../../utils/roles";

/**
 * Single source of truth for how a news change propagates through the TanStack Query cache.
 * Called from realtime subscriptions AND from mutation onMutate/onSuccess.
 */
export function applyNewsChange(queryClient, change, ctx = {}) {
  let { type, row, oldRow } = change;
  if (!row && !oldRow) return;

  const rowId = String(row?.id ?? oldRow?.id);
  if (!rowId) return;

  const patchedRow = row ? patchImageUrl(row) : null;
  const isAdmin = checkIsAdmin(ctx.currentUserRole);
  const isAuthor = ctx.currentUserId && patchedRow?.submitted_by === ctx.currentUserId;

  // 1. Update all cached news lists
  const queryCache = queryClient.getQueryCache();
  const listQueries = queryCache.findAll({ queryKey: newsKeys.lists() });

  listQueries.forEach((query) => {
    const queryKey = query.queryKey;
    const filters = queryKey[2] || {};
    const queryIsAdmin = Boolean(filters.isAdmin);

    queryClient.setQueryData(queryKey, (oldList) => {
      if (!oldList || !Array.isArray(oldList)) return oldList;

      // Check visibility for this specific query list
      const isVisibleInThisList =
        queryIsAdmin ||
        (patchedRow &&
          patchedRow.status === "published" &&
          (patchedRow.visibility === "public" ||
            (patchedRow.visibility === "unlisted" && (isAdmin || isAuthor)) ||
            (patchedRow.visibility === "private" && (isAdmin || isAuthor))));

      switch (type) {
        case "INSERT": {
          if (!isVisibleInThisList) return oldList;
          // De-dupe: if item with same ID or temp ID exists, skip or replace
          if (oldList.some((item) => String(item.id) === rowId)) {
            return oldList.map((item) => (String(item.id) === rowId ? { ...item, ...patchedRow } : item));
          }
          return [patchedRow, ...oldList].sort(
            (a, b) => new Date(b.date || b.created_at) - new Date(a.date || a.created_at)
          );
        }

        case "UPDATE": {
          const exists = oldList.some((item) => String(item.id) === rowId);
          if (!isVisibleInThisList) {
            // Became hidden / private -> remove from public list
            return oldList.filter((item) => String(item.id) !== rowId);
          }
          if (exists) {
            return oldList
              .map((item) => (String(item.id) === rowId ? { ...item, ...patchedRow } : item))
              .sort((a, b) => new Date(b.date || b.created_at) - new Date(a.date || a.created_at));
          }
          // If not in this list yet but matches visibility
          return [patchedRow, ...oldList].sort(
            (a, b) => new Date(b.date || b.created_at) - new Date(a.date || a.created_at)
          );
        }

        case "DELETE": {
          return oldList.filter((item) => String(item.id) !== rowId);
        }

        default:
          return oldList;
      }
    });
  });

  // 2. Update detail view cache
  if (type === "DELETE") {
    queryClient.removeQueries({ queryKey: newsKeys.detail(rowId) });
  } else if (patchedRow) {
    queryClient.setQueryData(newsKeys.detail(rowId), (old) => {
      if (!old) return patchedRow;
      return { ...old, ...patchedRow };
    });
  }
}
