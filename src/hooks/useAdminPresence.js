import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';

let globalAdmins = [];
let subscribers = new Set();
let channel = null;

const notifySubscribers = () => {
  subscribers.forEach(fn => fn([...globalAdmins]));
};

export const useAdminPresence = (user) => {
  const [onlineAdmins, setOnlineAdmins] = useState(globalAdmins);

  const userId = user?.id;
  const userName = user?.name || user?.full_name || 'Admin';
  const userRole = user?.role || 'Admin';
  const userAvatar = user?.avatarUrl || user?.avatar_url || null;

  const selfAdmin = useMemo(() => {
    if (!userId) return null;
    return {
      id: userId,
      name: userName,
      role: userRole,
      avatarUrl: userAvatar,
      avatar_url: userAvatar,
      onlineAt: new Date().toISOString(),
    };
  }, [userId, userName, userRole, userAvatar]);

  useEffect(() => {
    if (!userId || !supabase) return;

    const handler = (admins) => setOnlineAdmins(admins);
    subscribers.add(handler);

    const trackCurrentAdmin = async () => {
      if (channel) {
        try {
          await channel.track({
            id: userId,
            name: userName,
            role: userRole,
            avatarUrl: userAvatar,
            onlineAt: new Date().toISOString(),
          });
        } catch (e) {
          console.warn('[useAdminPresence] track error:', e);
        }
      }
    };

    if (!channel) {
      channel = supabase.channel('admin_presence_global', {
        config: { presence: { key: String(userId) } },
      });

      channel
        .on('presence', { event: 'sync' }, async () => {
          const state = channel.presenceState();
          const admins = Object.values(state).flatMap((p) => p);

          // Fetch latest avatar_url from DB safely (using only existing columns)
          const adminIds = admins.map((a) => a.id).filter(Boolean);
          if (adminIds.length > 0) {
            const { data: dbUsers, error } = await supabase
              .from('users')
              .select('id, avatar_url')
              .in('id', adminIds);

            if (!error && dbUsers) {
              admins.forEach((a) => {
                const dbU = dbUsers.find((u) => u.id === a.id);
                if (dbU) {
                  const liveAvatar = dbU.avatar_url || a.avatarUrl || null;
                  a.avatarUrl = liveAvatar;
                  a.avatar_url = liveAvatar;
                }
              });
            }
          }

          globalAdmins = Array.from(new Map(admins.map((a) => [a.id, a])).values());
          notifySubscribers();
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await trackCurrentAdmin();
          }
        });
    } else {
      trackCurrentAdmin();
    }

    return () => {
      subscribers.delete(handler);
      if (subscribers.size === 0 && channel) {
        supabase.removeChannel(channel);
        channel = null;
        globalAdmins = [];
      }
    };
  }, [userId, userName, userRole, userAvatar]);

  // Merge current user with real-time admins so active admins is never blank for logged-in user
  const effectiveAdmins = useMemo(() => {
    if (!onlineAdmins || onlineAdmins.length === 0) {
      return selfAdmin ? [selfAdmin] : [];
    }

    let hasSelf = false;
    const merged = onlineAdmins.map((a) => {
      if (a.id === userId) {
        hasSelf = true;
        return {
          ...a,
          name: userName || a.name,
          role: userRole || a.role,
          avatarUrl: userAvatar || a.avatarUrl || a.avatar_url,
          avatar_url: userAvatar || a.avatar_url || a.avatarUrl,
        };
      }
      return a;
    });

    if (!hasSelf && selfAdmin) {
      return [selfAdmin, ...merged];
    }
    return merged;
  }, [onlineAdmins, userId, userName, userRole, userAvatar, selfAdmin]);

  return effectiveAdmins;
};
