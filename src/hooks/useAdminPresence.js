import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

let globalAdmins = [];
let subscribers = new Set();
let channel = null;

const notifySubscribers = () => {
  subscribers.forEach(fn => fn([...globalAdmins]));
};

export const useAdminPresence = (user) => {
  const [onlineAdmins, setOnlineAdmins] = useState(globalAdmins);

  useEffect(() => {
    if (!user || !supabase) return;

    const handler = (admins) => setOnlineAdmins(admins);
    subscribers.add(handler);

    if (!channel) {
      channel = supabase.channel('admin_presence_global', {
        config: { presence: { key: user.id } }
      });

      channel.on('presence', { event: 'sync' }, async () => {
        const state = channel.presenceState();
        const admins = Object.values(state).flatMap(p => p);
        
        // Fetch latest avatar_url from DB safely (using only existing columns)
        const adminIds = admins.map(a => a.id).filter(Boolean);
        if (adminIds.length > 0) {
          const { data: dbUsers, error } = await supabase
            .from('users')
            .select('id, avatar_url')
            .in('id', adminIds);
            
          if (!error && dbUsers) {
            admins.forEach(a => {
              const dbU = dbUsers.find(u => u.id === a.id);
              if (dbU) {
                a.avatarUrl = a.avatarUrl || dbU.avatar_url || null;
              }
            });
          }
        }

        globalAdmins = Array.from(new Map(admins.map(a => [a.id, a])).values());
        notifySubscribers();
      }).subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ 
            id: user.id, 
            name: user.name || user.full_name || 'Admin', 
            role: user.role || 'Admin', 
            avatarUrl: user.avatarUrl || user.avatar_url || null,
            onlineAt: new Date().toISOString() 
          });
        }
      });
    }

    return () => {
      subscribers.delete(handler);
      if (subscribers.size === 0 && channel) {
        supabase.removeChannel(channel);
        channel = null;
        globalAdmins = [];
      }
    };
  }, [user]);

  return onlineAdmins;
};
