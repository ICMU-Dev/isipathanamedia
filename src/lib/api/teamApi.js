import { supabase } from "../supabaseClient";

/**
 * Fetch all team members sorted by id ascending.
 */
export async function fetchTeamList() {
  const { data, error } = await supabase
    .from("team")
    .select("id, name, role, image")
    .order("id", { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Add a new team member.
 */
export async function createTeamMember(member) {
  const { data, error } = await supabase
    .from("team")
    .insert([member])
    .select();

  if (error) throw error;
  return data?.[0];
}

/**
 * Update an existing team member.
 */
export async function updateTeamMember(id, patch) {
  const { data, error } = await supabase
    .from("team")
    .update(patch)
    .eq("id", id)
    .select();

  if (error) throw error;
  return data?.[0];
}

/**
 * Delete a team member.
 */
export async function deleteTeamMember(id) {
  const { error } = await supabase.from("team").delete().eq("id", id);
  if (error) throw error;
  return { id };
}
