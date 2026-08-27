import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY);
const csvData = \id,submitted_by
64,Thamindu Hasarinda
65,Rusath Sri Nejan
68,Sandupa Sansana
70,Rusath Sri Nejan
78,Sandupa Sansana
79,Sandupa Sansana
80,Sandupa Sansana
95,Thamindu Hasarinda\;
async function main() {
  const { data: users, error: usersError } = await supabase.from('users').select('id, full_name');
  if (usersError) throw usersError;
  const lines = csvData.split('\n').slice(1);
  for (const line of lines) {
    if (!line.trim()) continue;
    const [id, name] = line.split(',');
    const user = users.find(u => u.full_name === name);
    if (!user) { console.log('User not found: ' + name); continue; }
    console.log('Updating ID ' + id + ' with UUID ' + user.id);
    await supabase.from('news').update({ submitted_by: user.id }).eq('id', parseInt(id));
  }
  console.log('Done!');
}
main().catch(console.error);

