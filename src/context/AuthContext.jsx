import React, { createContext, useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';

// ─── Session config ───────────────────────────────────────────
const SESSION_KEY       = 'icmu_session';
const SESSION_TTL_SHORT = 8 * 60 * 60 * 1000; // 8 hours in ms
const SESSION_TTL_LONG  = 30 * 24 * 60 * 60 * 1000; // 30 days in ms

// ─── Helpers ─────────────────────────────────────────────────
function saveSession(profile, rememberMe = false) {
    const ttl = rememberMe ? SESSION_TTL_LONG : SESSION_TTL_SHORT;
    const session = { ...profile, expiresAt: Date.now() + ttl, rememberMe };
    try { 
        if (rememberMe) {
            localStorage.setItem(SESSION_KEY, JSON.stringify(session));
            sessionStorage.removeItem(SESSION_KEY);
        } else {
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
            localStorage.removeItem(SESSION_KEY);
        }
    } catch (_) {}
}

function loadSession() {
    try {
        let raw = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
        if (!raw) return null;
        const session = JSON.parse(raw);
        if (!session?.expiresAt || Date.now() > session.expiresAt) {
            clearSession();
            return null;
        }
        return session;
    } catch (_) { return null; }
}

function clearSession() {
    try { 
        localStorage.removeItem(SESSION_KEY);
        sessionStorage.removeItem(SESSION_KEY);
    } catch (_) {}
}

const DEVICE_ID_KEY = 'icmu_device_id';
function getDeviceId() {
    try {
        let deviceId = localStorage.getItem(DEVICE_ID_KEY);
        if (!deviceId) {
            deviceId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
            localStorage.setItem(DEVICE_ID_KEY, deviceId);
        }
        return deviceId;
    } catch (_) {
        return Math.random().toString(36).substring(2);
    }
}

// ─── Track Device Session ────────────────────────────────────
function getDeviceName() {
    const ua = navigator.userAgent;
    
    // 1. Parse OS & Version
    let os = "Unknown OS";
    if (/Windows NT 10.0/i.test(ua)) os = "Windows 10/11";
    else if (/Windows NT 6.3/i.test(ua)) os = "Windows 8.1";
    else if (/Windows NT 6.2/i.test(ua)) os = "Windows 8";
    else if (/Windows NT 6.1/i.test(ua)) os = "Windows 7";
    else if (/Mac OS X (\d+[._]\d+)/i.test(ua)) {
        const match = ua.match(/Mac OS X (\d+[._]\d+)/i);
        os = `macOS ${match[1].replace('_', '.')}`;
    }
    else if (/Android (\d+(\.\d+)?)/i.test(ua)) {
        const match = ua.match(/Android (\d+(\.\d+)?)/i);
        os = `Android ${match[1]}`;
    }
    else if (/iPhone OS (\d+[._]\d+)/i.test(ua) || /iPad.*OS (\d+[._]\d+)/i.test(ua)) {
        const match = ua.match(/OS (\d+[._]\d+)/i);
        os = `iOS ${match[1].replace('_', '.')}`;
    }
    else if (/Linux/i.test(ua)) os = "Linux";

    // 2. Parse Browser & Version
    let browser = "Unknown Browser";
    let match = null;
    
    if (/Edg\/(\d+)/i.test(ua)) {
        match = ua.match(/Edg\/(\d+)/i);
        browser = `Edge ${match[1]}`;
    } else if (/OPR\/(\d+)/i.test(ua) || /Opera\/(\d+)/i.test(ua)) {
        match = ua.match(/(OPR|Opera)\/(\d+)/i);
        browser = `Opera ${match[2]}`;
    } else if (/Firefox\/(\d+)/i.test(ua)) {
        match = ua.match(/Firefox\/(\d+)/i);
        browser = `Firefox ${match[1]}`;
    } else if (/Chrome\/(\d+)/i.test(ua)) {
        match = ua.match(/Chrome\/(\d+)/i);
        browser = `Chrome ${match[1]}`;
    } else if (/Safari\/(\d+)/i.test(ua) && !/Chrome/i.test(ua)) {
        match = ua.match(/Version\/(\d+)/i);
        browser = match ? `Safari ${match[1]}` : "Safari";
    }

    // 3. Approximate location via TimeZone
    let location = "";
    try {
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (timeZone) {
            const city = timeZone.split('/').pop().replace(/_/g, ' ');
            location = ` (${city})`;
        }
    } catch(e) {}

    return `${os} • ${browser}${location}`;
}

async function trackDeviceSession(userId) {
    try {
        // 1. Fetch current sessions to append to them
        const { data } = await supabase.from('users').select('active_sessions').eq('id', userId).single();
        const currentSessions = data?.active_sessions || [];
        const sessionsArray = Array.isArray(currentSessions) ? currentSessions : [];

        let ipAddress = 'Unknown';
        try {
            const ipRes = await fetch('https://api.ipify.org?format=json');
            const ipData = await ipRes.json();
            ipAddress = ipData.ip;
        } catch (_) {}

        // 2. Create new session footprint using persistent deviceId
        const deviceId = getDeviceId();
        const newSession = {
            sessionId: deviceId,
            deviceName: getDeviceName(),
            userAgent: navigator.userAgent,
            platform: navigator.platform || 'Unknown',
            loginTime: new Date().toISOString(),
            ip: ipAddress
        };

        // If the session exists (same browser), update it. Otherwise, append it.
        const existingIndex = sessionsArray.findIndex(s => s.sessionId === deviceId);
        let updatedSessions;
        if (existingIndex >= 0) {
            newSession.customName = sessionsArray[existingIndex].customName;
            sessionsArray[existingIndex] = newSession;
            updatedSessions = [...sessionsArray];
        } else {
            // Keep only the last 10 sessions to prevent JSONB bloat
            updatedSessions = [...sessionsArray, newSession].slice(-10);
        }

        // 3. Update DB securely via RPC to bypass RLS
        await supabase.rpc('update_active_sessions', {
            p_id: userId,
            p_sessions: updatedSessions
        });
            
        // Also update last_login
        await supabase.from('users').update({ last_login: new Date().toISOString() }).eq('id', userId);
            
        return deviceId;
    } catch (e) {
        console.error('[Auth] Failed to track session:', e.message);
    }
}

// ─── Context ──────────────────────────────────────────────────
const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser]       = useState(() => loadSession());
    const [loading, setLoading] = useState(false);

    // Refresh session TTL on each page load while user is active & sync latest Supabase record
    useEffect(() => {
        const initSession = async () => {
            const session = loadSession();
            if (session) {
                // Instantly set what we have to prevent UI jumps
                setUser(session);
                saveSession(session, session.rememberMe);

                // Fetch latest live user record directly from Supabase DB
                try {
                    let dbUser = null;
                    if (session.indexNumber) {
                        const { data } = await supabase
                            .from('users')
                            .select('*')
                            .eq('index_number', session.indexNumber)
                            .maybeSingle();
                        dbUser = data;
                    }
                    if (!dbUser && session.id) {
                        const { data } = await supabase
                            .from('users')
                            .select('*')
                            .eq('id', session.id)
                            .maybeSingle();
                        dbUser = data;
                    }
                    if (!dbUser && session.email) {
                        const { data } = await supabase
                            .from('users')
                            .select('*')
                            .eq('email', session.email)
                            .maybeSingle();
                        dbUser = data;
                    }

                    if (dbUser) {
                        // Check if user account has been suspended
                        if (dbUser.is_active === false) {
                            console.warn('[Auth] Account suspended by administrator.');
                            clearSession();
                            setUser(null);
                            return;
                        }

                        // Check if session was revoked remotely
                        const deviceId = getDeviceId();
                        const hasActiveSessions = Array.isArray(dbUser.active_sessions) && dbUser.active_sessions.length > 0;
                        const isSessionActive = hasActiveSessions ? dbUser.active_sessions.some(s => s.sessionId === deviceId) : false;
                        
                        if (hasActiveSessions && !isSessionActive) {
                            console.warn('[Auth] Session was revoked remotely.');
                            clearSession();
                            setUser(null);
                            return;
                        }

                        const liveSession = {
                            ...session,
                            id: dbUser.id || session.id,
                            name: dbUser.full_name || session.name,
                            role: dbUser.role || session.role,
                            indexNumber: dbUser.index_number || session.indexNumber,
                            email: dbUser.email || session.email || null,
                            avatarUrl: dbUser.avatar_url || session.avatarUrl || null,
                            userSettings: dbUser.user_settings || {},
                        };
                        setUser(liveSession);
                        saveSession(liveSession, session.rememberMe);

                        if (dbUser.user_settings) {
                            try {
                                if (dbUser.user_settings.customTheme) {
                                    localStorage.setItem('icmu_custom_theme', JSON.stringify(dbUser.user_settings.customTheme));
                                }
                                if (dbUser.user_settings.activeTheme) {
                                    localStorage.setItem("icmu_admin_theme", dbUser.user_settings.activeTheme);
                                }
                                window.dispatchEvent(new Event('theme_sync'));
                            } catch (e) {}
                        }
                    } else if (session.indexNumber) {
                        // RPC verification fallback
                        const { data, error } = await supabase.rpc('get_user_by_index', {
                            p_index_number: session.indexNumber,
                        });
                        if (!error && !data?.found) {
                            clearSession();
                            setUser(null);
                        }
                    }
                } catch (err) {
                    console.error('[Auth] Live session sync failed:', err.message);
                }
            }
        };
        initSession();
    }, []);

    // ─── Realtime & Periodic suspension heartbeat ─────────────────
    // Listens for instant suspension via Supabase Realtime and falls back 
    // to a 30-second polling interval in case the websocket disconnects.
    useEffect(() => {
        if (!user?.id) return;

        const checkSuspension = async () => {
            try {
                const { data } = await supabase
                    .from('users')
                    .select('is_active')
                    .eq('id', user.id)
                    .maybeSingle();

                if (data && data.is_active === false) {
                    console.warn('[Auth] Account suspended — forcing logout.');
                    clearSession();
                    setUser(null);
                }
            } catch (_) {
                // Silently fail — next interval will retry
            }
        };

        // Realtime listener for instant suspension kick
        const channel = supabase
            .channel(`user-status-${user.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'users',
                    filter: `id=eq.${user.id}`,
                },
                (payload) => {
                    if (payload.new && payload.new.is_active === false) {
                        console.warn('[Auth] Account suspended instantly via realtime.');
                        clearSession();
                        setUser(null);
                        window.location.href = "/admin"; // Force redirect to login
                    }
                }
            )
            .subscribe();

        // 5 seconds polling fallback
        const interval = setInterval(checkSuspension, 5 * 1000);

        return () => {
            clearInterval(interval);
            supabase.removeChannel(channel);
        };
    }, [user?.id]);

    // ─── Check if a user exists by index number ───────────────
    // Returns: { found, id, name, role, is_active, needs_setup }
    const checkUser = useCallback(async (indexNumber) => {
        try {
            const { data, error } = await supabase.rpc('get_user_by_index', {
                p_index_number: indexNumber,
            });
            if (error) throw error;
            return data ?? { found: false };
        } catch (err) {
            console.error('[Auth] checkUser failed:', err.message);
            return { found: false, message: err.message };
        }
    }, []);

    // ─── Login: verify index_number + password via RPC ────────
    const login = useCallback(async (indexNumber, password, rememberMe = false) => {
        setLoading(true);
        try {
            const { data, error } = await supabase.rpc('verify_user_login', {
                p_index_number: indexNumber,
                p_password:     password,
            });

            if (error) throw error;

            if (!data?.success) {
                return { success: false, message: data?.message || 'Login failed.' };
            }

            const profile = {
                id:          data.id,
                name:        data.name,
                role:        data.role,
                indexNumber: data.index_number,
                email:       data.email ?? null,
                avatarUrl:   data.avatar_url ?? data.profile ?? data.profile_picture ?? null,
                profile:     data.profile ?? null,
                profile_picture: data.profile_picture ?? null,
                rememberMe:  rememberMe,
            };

            saveSession(profile, rememberMe);
            localStorage.setItem("icmu_admin_path", `/${data.index_number}/dashboard`);
            setUser(profile);
            
            // Track session and last login
            trackDeviceSession(profile.id);

            return { success: true, role: profile.role, name: profile.name, avatarUrl: profile.avatarUrl };
        } catch (err) {
            console.error('[Auth] login failed:', err.message);
            return { success: false, message: err.message || 'Login failed.' };
        } finally {
            setLoading(false);
        }
    }, []);

    // ─── Set password: first-time setup via RPC ───────────────
    const setPassword = useCallback(async (indexNumber, password) => {
        setLoading(true);
        try {
            const { data, error } = await supabase.rpc('set_user_password', {
                p_index_number: indexNumber,
                p_password:     password,
            });

            if (error) throw error;

            if (!data?.success) {
                return { success: false, message: data?.message || 'Setup failed.' };
            }

            // Auto-login after password creation
            const profile = {
                id:          data.id,
                name:        data.name,
                role:        data.role,
                indexNumber: data.index_number,
                email:       data.email ?? null,
                avatarUrl:   data.avatar_url ?? data.profile ?? data.profile_picture ?? null,
                profile:     data.profile ?? null,
                profile_picture: data.profile_picture ?? null,
                rememberMe:  true, // Default to true for new setups
            };

            saveSession(profile, true);
            localStorage.setItem("icmu_admin_path", `/${data.index_number}/dashboard`);
            setUser(profile);
            
            // Track session and last login
            trackDeviceSession(profile.id);

            return { success: true, role: profile.role, name: profile.name, avatarUrl: profile.avatarUrl };
        } catch (err) {
            console.error('[Auth] setPassword failed:', err.message);
            return { success: false, message: err.message || 'Setup failed.' };
        } finally {
            setLoading(false);
        }
    }, []);

    // ─── Google OAuth: Authenticate Existing Linked User ────────
    const authenticateViaGoogle = useCallback(async (googleEmail, googlePicture, urlIndexNo, rememberMe = true) => {
        setLoading(true);
        try {
            if (!googleEmail) {
                return { success: false, message: "No email address provided by Google account." };
            }

            // Strictly find user by email via RPC to bypass RLS blocking
            const { data: result, error: rpcError } = await supabase.rpc('get_user_by_email', { p_email: googleEmail });
            if (rpcError) throw rpcError;

            if (!result || !result.found) {
                return {
                    success: false,
                    message: "This Google account is not linked to any profile. Please login with your password first and link your Google account from your profile settings."
                };
            }

            const dbUser = result;

            if (dbUser.is_active === false) {
                return {
                    success: false,
                    message: "Your account has been suspended. Please contact the Super Administrator."
                };
            }

            // Log them in using our custom session structure
            const profile = {
                id:          dbUser.id,
                name:        dbUser.full_name || "Admin User",
                role:        dbUser.role || "admin",
                indexNumber: dbUser.index_number,
                email:       dbUser.email,
                avatarUrl:   dbUser.avatar_url ?? dbUser.profile ?? dbUser.profile_picture ?? null,
                profile:     dbUser.profile ?? null,
                profile_picture: dbUser.profile_picture ?? null,
                rememberMe:  rememberMe,
            };

            saveSession(profile, rememberMe);
            localStorage.setItem("icmu_admin_path", `/${dbUser.index_number}/dashboard`);
            setUser(profile);

            trackDeviceSession(profile.id);

            return {
                success: true,
                role: profile.role,
                name: profile.name,
                indexNumber: profile.indexNumber,
                avatarUrl: profile.avatarUrl
            };
        } catch (err) {
            console.error('[Auth] authenticateViaGoogle failed:', err);
            return { success: false, message: err.message || 'Google login failed.' };
        } finally {
            setLoading(false);
        }
    }, []);

    // ─── Google OAuth: Bind Identity to Logged-in User ─────────
    const bindGoogleIdentity = useCallback(async (googleEmail, googlePicture) => {
        if (!user || !user.id) return { success: false, message: "You must be logged in to link an account." };
        
        try {
            // Overwrite email and avatar_url in the database securely bypassing RLS
            const { data: success, error } = await supabase.rpc('link_google_identity', {
                p_id: user.id,
                p_email: googleEmail,
                p_avatar: googlePicture
            });

            if (error) throw error;
            if (!success) throw new Error("Failed to link account. User profile not found in database.");

            const updatedProfile = {
                ...user,
                email: googleEmail,
                avatarUrl: googlePicture
            };

            saveSession(updatedProfile, user.rememberMe);
            setUser(updatedProfile);

            return { success: true, email: googleEmail, avatarUrl: googlePicture };
        } catch (err) {
            console.error('[Auth] bindGoogleIdentity failed:', err);
            return { success: false, message: err.message || 'Failed to bind Google identity.' };
        }
    }, [user]);

    // ─── Custom Avatar Upload ───────────────────────────────────
    const uploadCustomAvatar = useCallback(async (file) => {
        if (!user || !user.id) return { success: false, message: "Not logged in." };
        setLoading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}-${Math.random()}.${fileExt}`;
            const filePath = `avatars/${fileName}`;

            // Upload to Supabase Storage (assuming 'profiles' bucket exists)
            const { error: uploadError } = await supabase.storage
                .from('profiles')
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('profiles')
                .getPublicUrl(filePath);

            // Update database via RPC to bypass RLS
            const { data: success, error: updateError } = await supabase.rpc('update_user_avatar', {
                p_id: user.id,
                p_avatar: publicUrl
            });

            if (updateError) throw updateError;
            if (!success) throw new Error("User record not found to update.");

            const updatedProfile = { ...user, avatarUrl: publicUrl };
            saveSession(updatedProfile, user.rememberMe);
            setUser(updatedProfile);

            return { success: true, avatarUrl: publicUrl };
        } catch (err) {
            console.error('[Auth] uploadCustomAvatar failed:', err);
            return { success: false, message: err.message || 'Failed to upload avatar.' };
        } finally {
            setLoading(false);
        }
    }, [user]);

    // ─── Delete Custom Avatar ───────────────────────────────────
    const deleteCustomAvatar = useCallback(async () => {
        if (!user || !user.id || !user.avatarUrl) return { success: false, message: "No avatar to delete." };
        
        setLoading(true);
        try {
            // Extract file path from public URL if it's a Supabase storage file
            if (user.avatarUrl.includes('/profiles/')) {
                const urlParts = user.avatarUrl.split('/profiles/');
                if (urlParts.length > 1) {
                    const filePath = urlParts[1];
                    // Delete from Supabase Storage
                    const { error: storageError } = await supabase.storage
                        .from('profiles')
                        .remove([filePath]);
                    if (storageError) console.warn('[Auth] Failed to delete file from storage:', storageError);
                }
            }

            // Update database to remove URL via RPC to bypass RLS
            const { data: success, error: updateError } = await supabase.rpc('update_user_avatar', {
                p_id: user.id,
                p_avatar: null
            });

            if (updateError) throw updateError;
            if (!success) throw new Error("User record not found to update.");

            const updatedProfile = { ...user, avatarUrl: null };
            saveSession(updatedProfile, user.rememberMe);
            setUser(updatedProfile);

            return { success: true };
        } catch (err) {
            console.error('[Auth] deleteCustomAvatar failed:', err);
            return { success: false, message: err.message || 'Failed to delete avatar.' };
        } finally {
            setLoading(false);
        }
    }, [user]);

    // ─── Restore Google Avatar ──────────────────────────────────
    const restoreGoogleAvatar = useCallback(async (googleUrl) => {
        if (!user || !user.id || !googleUrl) return { success: false, message: "Missing user or Google URL." };
        
        setLoading(true);
        try {
            // Update database via RPC to bypass RLS
            const { data: success, error: updateError } = await supabase.rpc('update_user_avatar', {
                p_id: user.id,
                p_avatar: googleUrl
            });

            if (updateError) throw updateError;
            if (!success) throw new Error("User record not found to update.");

            const updatedProfile = { ...user, avatarUrl: googleUrl };
            saveSession(updatedProfile, user.rememberMe);
            setUser(updatedProfile);

            return { success: true, avatarUrl: googleUrl };
        } catch (err) {
            console.error('[Auth] restoreGoogleAvatar failed:', err);
            return { success: false, message: err.message || 'Failed to restore Google avatar.' };
        } finally {
            setLoading(false);
        }
    }, [user]);

    // ─── Unlink Google Identity ─────────────────────────────────
    const unlinkGoogleIdentity = useCallback(async () => {
        if (!user || !user.id) return { success: false, message: "Not logged in." };
        setLoading(true);
        try {
            // Optional: Remove from Supabase Auth identities if they have a session
            try {
                const { data: { identities }, error: idError } = await supabase.auth.getUserIdentities();
                if (!idError && identities) {
                    const googleIdentity = identities.find(id => id.provider === 'google');
                    if (googleIdentity) {
                        await supabase.auth.unlinkIdentity(googleIdentity.identity_id);
                    }
                }
            } catch (err) {
                // Ignore errors here. If they logged in via password, they won't have an auth session to unlink.
                // The database unlink below is what actually unlinks their profile.
            }

            // Remove email from the users table securely via RPC
            const { data: success, error: dbError } = await supabase.rpc('unlink_google_identity', { p_id: user.id });
            if (dbError) throw dbError;
            if (!success) console.warn("[Auth] Failed to unlink in database, row might not exist.");

            // Update local session
            const updatedProfile = { ...user, email: null };
            saveSession(updatedProfile, user.rememberMe);
            setUser(updatedProfile);

            return { success: true };
        } catch (err) {
            console.error('[Auth] unlinkGoogleIdentity failed:', err);
            return { success: false, message: err.message || 'Failed to unlink Google account.' };
        } finally {
            setLoading(false);
        }
    }, [user]);

    // ─── Rename Specific Device Session ────────────────────────
    const renameDeviceSession = useCallback(async (sessionIdToRename, customName) => {
        if (!user || !user.id) return { success: false, message: "Not logged in." };
        setLoading(true);
        try {
            const { data } = await supabase.from('users').select('active_sessions').eq('id', user.id).single();
            const currentSessions = data?.active_sessions || [];
            const sessionsArray = Array.isArray(currentSessions) ? currentSessions : [];
            
            const updatedSessions = sessionsArray.map(s => 
                s.sessionId === sessionIdToRename ? { ...s, customName } : s
            );
            
            const { data: success, error: rpcError } = await supabase.rpc('update_active_sessions', {
                p_id: user.id,
                p_sessions: updatedSessions
            });

            if (rpcError) throw rpcError;
            if (!success) throw new Error("Failed to update active sessions.");

            return { success: true };
        } catch (err) {
            console.error('[Auth] renameDeviceSession failed:', err);
            return { success: false, message: err.message || 'Failed to rename session.' };
        } finally {
            setLoading(false);
        }
    }, [user]);

    // ─── Revoke Specific Device Session ────────────────────────
    const revokeDeviceSession = useCallback(async (sessionIdToRevoke) => {
        if (!user || !user.id) return { success: false, message: "Not logged in." };
        setLoading(true);
        try {
            const { data } = await supabase.from('users').select('active_sessions').eq('id', user.id).single();
            const currentSessions = data?.active_sessions || [];
            const sessionsArray = Array.isArray(currentSessions) ? currentSessions : [];
            
            const updatedSessions = sessionsArray.filter(s => s.sessionId !== sessionIdToRevoke);
            
            const { data: success, error: rpcError } = await supabase.rpc('update_active_sessions', {
                p_id: user.id,
                p_sessions: updatedSessions
            });

            if (rpcError) throw rpcError;
            if (!success) throw new Error("Failed to update active sessions.");

            return { success: true };
        } catch (err) {
            console.error('[Auth] revokeDeviceSession failed:', err);
            return { success: false, message: err.message || 'Failed to revoke session.' };
        } finally {
            setLoading(false);
        }
    }, [user]);

    // — Revoke All Other Device Sessions (Panic Mode) —
    const revokeAllOtherSessions = useCallback(async (currentSessionId) => {
        if (!user || !user.id) return { success: false, message: "Not logged in." };
        setLoading(true);
        try {
            const { data } = await supabase.from('users').select('active_sessions').eq('id', user.id).single();
            const currentSessions = data?.active_sessions || [];
            const sessionsArray = Array.isArray(currentSessions) ? currentSessions : [];
            
            // Keep only the current session
            const updatedSessions = sessionsArray.filter(s => s.sessionId === currentSessionId);
            
            const { data: success, error: rpcError } = await supabase.rpc('update_active_sessions', {
                p_id: user.id,
                p_sessions: updatedSessions
            });

            if (rpcError) throw rpcError;
            if (!success) throw new Error("Failed to update active sessions.");

            return { success: true };
        } catch (err) {
            console.error('[Auth] revokeAllOtherSessions failed:', err);
            return { success: false, message: err.message || 'Failed to revoke other sessions.' };
        } finally {
            setLoading(false);
        }
    }, [user]);

    // ─── Logout ───────────────────────────────────────────────
    const logout = useCallback(() => {
        clearSession();
        setUser(null);
    }, []);

    const updateUserSettings = useCallback(async (newSettings) => {
        if (!user?.id) return false;
        try {
            await supabase.rpc('update_user_settings', {
                p_id: user.id,
                p_settings: newSettings,
            });
            const updated = { ...user, userSettings: newSettings };
            setUser(updated);
            saveSession(updated, user.rememberMe);
            return true;
        } catch (e) {
            console.error('[Auth] updateUserSettings failed:', e.message);
            return false;
        }
    }, [user]);

    const contextValue = useMemo(() => ({
        user,
        loading,
        login,
        logout,
        updateUserSettings,
        setPassword,
        checkUser,
        authenticateViaGoogle,
        bindGoogleIdentity,
        unlinkGoogleIdentity,
        restoreGoogleAvatar,
        uploadCustomAvatar,
        deleteCustomAvatar,
        renameDeviceSession,
        revokeDeviceSession,
        revokeAllOtherSessions
    }), [user, loading, login, logout, updateUserSettings, setPassword, checkUser, authenticateViaGoogle, bindGoogleIdentity, unlinkGoogleIdentity, restoreGoogleAvatar, uploadCustomAvatar, deleteCustomAvatar, renameDeviceSession, revokeDeviceSession, revokeAllOtherSessions]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};
