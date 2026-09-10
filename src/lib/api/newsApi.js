import { supabase } from "../supabaseClient";
import { isAdmin as checkIsAdmin } from "../../utils/roles";

export const patchImageUrl = (item) => {
  if (!item) return item;
  if (
    item.image &&
    typeof item.image === "string" &&
    item.image.includes("/news_images/") &&
    !item.image.includes("/news_images/updates/") &&
    !item.image.includes("/news_images/articles/")
  ) {
    return {
      ...item,
      image: item.image.replace("/news_images/", "/news_images/updates/"),
    };
  }
  return item;
};

const NEWS_COLUMNS =
  "id, title, content, image, date, category, author, tags, type, status, submitted_by, original_link, created_at, visibility, needs_attention, review_notes";

/**
 * Fetch a slice of news articles.
 */
export async function fetchNewsList({ page = 0, limit = 50, isAdmin = false } = {}) {
  let query = supabase
    .from("news")
    .select(NEWS_COLUMNS)
    .order("date", { ascending: false });

  if (!isAdmin) {
    query = query.eq("status", "published").eq("visibility", "public");
  }

  if (limit > 0) {
    query = query.range(page * limit, (page + 1) * limit - 1);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(patchImageUrl);
}

/**
 * Fetch a single article by ID with role-aware authorization check.
 */
export async function fetchArticleById(id, currentUser = null) {
  const { data, error } = await supabase
    .from("news")
    .select(NEWS_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const isSuspended = Boolean(
    currentUser &&
      (currentUser.is_active === false ||
        currentUser.status === "suspended" ||
        currentUser.is_suspended === true ||
        currentUser.active === false)
  );

  let isAuthorized = false;

  // Non-suspended authenticated users can exercise role/author privileges
  if (currentUser && !isSuspended) {
    const userRole = currentUser?.role;
    if (checkIsAdmin(userRole) || currentUser.id === data.submitted_by) {
      isAuthorized = true;
    }
  }

  // Published visibility check
  if (!isAuthorized && data.status === "published") {
    if (data.visibility === "public") {
      isAuthorized = true;
    } else if (data.visibility === "unlisted" && !isSuspended) {
      isAuthorized = true;
    } else if (data.visibility === "private" && currentUser && !isSuspended) {
      isAuthorized = true;
    }
  }

  if (!isAuthorized) return null;
  return patchImageUrl(data);
}

/**
 * Create a new article or update.
 */
export async function createNews(article) {
  const { data, error } = await supabase
    .from("news")
    .insert([article])
    .select();

  if (error) throw error;
  return patchImageUrl(data?.[0]);
}

/**
 * Update an article by ID.
 */
export async function updateNews(id, patch) {
  const { data, error } = await supabase
    .from("news")
    .update(patch)
    .eq("id", id)
    .select();

  if (error) throw error;
  return patchImageUrl(data?.[0]);
}

/**
 * Delete an article by ID.
 */
export async function deleteNews(id) {
  const { error } = await supabase.from("news").delete().eq("id", id);
  if (error) throw error;
  return { id };
}

/**
 * Delete multiple articles by ID array.
 */
export async function deleteManyNews(ids) {
  const { error } = await supabase.from("news").delete().in("id", ids);
  if (error) throw error;
  return { ids };
}

/**
 * Update multiple articles by ID array.
 */
export async function updateManyNews(ids, patch) {
  const { error } = await supabase.from("news").update(patch).in("id", ids);
  if (error) throw error;
  return { ids, patch };
}
