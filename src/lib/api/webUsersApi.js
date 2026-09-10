import { supabase } from "../supabaseClient";
import { KNOWN_ADMIN_PROFILES_LIST } from "../../utils/roles";

/**
 * Fetch all registered users sorted by full_name ascending.
 */
export async function fetchWebUsersList() {
  const { data, error } = await supabase
    .from("users")
    .select("id, full_name, role, index_number, avatar_url, email")
    .order("full_name", { ascending: true });

  if (error) throw error;

  const list = data ? [...data] : [];
  for (const fallback of KNOWN_ADMIN_PROFILES_LIST) {
    if (!list.some((u) => u.id === fallback.id || String(u.index_number) === String(fallback.index_number))) {
      list.push(fallback);
    }
  }

  return list;
}
