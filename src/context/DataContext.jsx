import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "./AuthContext";
import { isAdmin as checkIsAdmin, isWriter as checkIsWriter } from "../utils/roles";

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);
  const [news, setNews] = useState([]);
  const [team, setTeam] = useState([]);

  const [messages, setMessages] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [webUsers, setWebUsers] = useState([]);
  const [assets, setAssets] = useState({});
  const { user } = useAuth();
  const [nethinetheraSchools, setNethinetheraSchools] = useState([]);
  const [nethinetheraAgenda, setNethinetheraAgenda] = useState([]);
  const [nethinetheraVotes, setNethinetheraVotes] = useState([]);
  const [nethinetheraSeating, setNethinetheraSeating] = useState([]);
  const [siteConfig, setSiteConfig] = useState({
    socialLinks: {
      facebook: "https://facebook.com",
      instagram: "https://instagram.com",
      youtube: "https://youtube.com",
      twitter: "https://twitter.com",
    },
    sectionOrder: [
      "home",
      "partnerLogos",
      "about",
      "nethinethera",
      "news",
      "services",
      "team",
      "contact",
    ],
    contactDetails: {
      address: "Isipathana College, Colombo 05, Sri Lanka",
      email: "icmediaunit@gmail.com",
      phone: "+94 11 123 4567",
      leadership: [
        {
          id: 1,
          name: "Sahan Perera",
          role: "President",
          phone: "+94 77 123 4567",
          whatsapp: "94771234567",
        },
        {
          id: 2,
          name: "Amila Silva",
          role: "Secretary",
          phone: "+94 77 987 6543",
          whatsapp: "94779876543",
        },
      ],
    },
    nethinethera: {
      registrationOpen: true,
      maxCapacity: 100,
      emergencyNotice: "",
    },
    liveStream: {
      platform: "youtube",
      videoId: "",
      videoUrl: "",
      title: "",
      useCustomTitle: false,
      description: "",
      useCustomDescription: false,
      isLive: false,
      showChat: false,
      autoplay: true,
      muted: true,
    },
  });

  // Track which data has been fetched to avoid re-fetching
  const fetchedRef = useRef({ news: false, team: false, events: false, config: false, messages: false, webUsers: false });

  // Stats for Admin Dashboard
  const stats = useMemo(() => ({
    totalNews: news.length,
    totalMembers: (team || []).length,
    totalServices: 3,
    totalMessages: messages.length,
    totalViews: 12450,
  }), [news.length, team, messages.length]);

  // Fetch public data (news, team, events, assets/config)
  const fetchConfig = useCallback(async (force = false) => {
    if (fetchedRef.current.config && !force) return;
    try {
      const { data: assetsData, error } = await supabase.from("assets").select("key, url");
      if (error) throw error;
      if (assetsData) {
        const assetMap = {};
        let remoteConfigFound = null;
        assetsData.forEach((a) => {
          if (a.key === "site_config") {
            try {
              remoteConfigFound = JSON.parse(a.url);
              setSiteConfig((prev) => ({
                ...prev,
                ...remoteConfigFound,
                socialLinks: { ...prev.socialLinks, ...remoteConfigFound.socialLinks },
                contactDetails: { ...prev.contactDetails, ...remoteConfigFound.contactDetails },
                sectionOrder: remoteConfigFound.sectionOrder || prev.sectionOrder,
              }));
            } catch (e) { console.error("Config parse error:", e); }
          } else {
            assetMap[a.key] = a.url;
          }
        });
        setAssets((prev) => ({ ...prev, ...assetMap }));
        fetchedRef.current.config = true;
      }
    } catch (err) {
      console.error("Config fetch error:", err.message);
    }
  }, []);

  const [hasMoreNews, setHasMoreNews] = useState(true);

  // Helper to dynamically patch old image URLs that were moved to the updates/ folder
  const patchImageUrl = (item) => {
    if (item && item.image && item.image.includes('/news_images/') && !item.image.includes('/news_images/updates/') && !item.image.includes('/news_images/articles/')) {
      item.image = item.image.replace('/news_images/', '/news_images/updates/');
    }
    return item;
  };

  const fetchNews = useCallback(async (force = false, page = 0, limit = 30) => {
    if (fetchedRef.current.news && !force && page === 0) return;
    try {
      const { data, error } = await supabase
        .from("news")
        .select("id, title, content, image, date, category, author, tags, type, status, submitted_by, original_link, created_at, visibility, needs_attention, review_notes")
        .order("date", { ascending: false })
        .range(page * limit, (page + 1) * limit - 1);
        
      if (error) throw error;
      if (data) {
        if (data.length < limit) setHasMoreNews(false);
        else setHasMoreNews(true);

        const patchedData = data.map(patchImageUrl);

        if (page === 0) {
          setNews(patchedData);
        } else {
          setNews(prev => {
            const newMap = new Map(prev.map(item => [item.id, item]));
            patchedData.forEach(item => newMap.set(item.id, item));
            return Array.from(newMap.values()).sort((a, b) => new Date(b.date) - new Date(a.date));
          });
        }
        if (page === 0) fetchedRef.current.news = true;
      }
    } catch (err) {
      console.error("News fetch error:", err.message);
    }
  }, []);

  const fetchArticleById = useCallback(async (id, currentUser = null) => {
    try {
      let { data, error } = await supabase
        .from("news")
        .select("id, title, content, image, date, category, author, tags, type, status, submitted_by, original_link, created_at, visibility, needs_attention, review_notes")
        .eq("id", id)
        .maybeSingle();
        
      if (error) throw error;
      if (data) {
        // Access Control
        // Public: Everyone
        // Unlisted: Anyone with the direct link
        // Private: Logged-in roles only (super admin, admin, writer, broadcaster, etc.)
        // Draft/Pending: Admin or author only
        let isAuthorized = false;
        
        if (currentUser) {
          const userRole = currentUser?.role;
          if (checkIsAdmin(userRole)) {
            // Admins & super-admins can view all statuses and visibilities
            isAuthorized = true;
          } else if (currentUser.id === data.submitted_by) {
            // The author can view their own article regardless of status/visibility
            isAuthorized = true;
          }
        }
        
        if (!isAuthorized && data.status === "published") {
          if (data.visibility === "public") {
            // Public: visible to all
            isAuthorized = true;
          } else if (data.visibility === "unlisted") {
            // Unlisted: visible to anyone who has the direct link
            isAuthorized = true;
          } else if (data.visibility === "private" && currentUser) {
            // Private: visible to any logged-in user with an account/role
            isAuthorized = true;
          }
        }
        
        if (!isAuthorized) return null;

        data = patchImageUrl(data);
        setNews(prev => {
          const exists = prev.find(n => n.id === data.id);
          if (exists) return prev;
          return [...prev, data].sort((a, b) => new Date(b.date) - new Date(a.date));
        });
        return data;
      }
      return null;
    } catch (err) {
      console.error("Fetch article error:", err.message);
      return null;
    }
  }, []);

  const fetchTeam = useCallback(async (force = false) => {
    if (fetchedRef.current.team && !force) return;
    try {
      const { data, error } = await supabase.from("team").select("id, name, role, image").order("id", { ascending: true });
      if (error) throw error;
      if (data) {
        setTeam(data);
        fetchedRef.current.team = true;
      }
    } catch (err) {
      console.error("Team fetch error:", err.message);
    }
  }, []);

  const fetchWebUsers = useCallback(async (force = false) => {
    if (fetchedRef.current.webUsers && !force) return;
    try {
      const { data, error } = await supabase.from("users").select("id, full_name, role, index_number, avatar_url, email").order("full_name", { ascending: true });
      if (error) throw error;
      if (data) {
        setWebUsers(data);
        fetchedRef.current.webUsers = true;
      }
    } catch (err) {
      console.error("Web Users fetch error:", err.message);
    }
  }, []);

  const fetchMessages = useCallback(async (force = false) => {
    if (fetchedRef.current.messages && !force) return;
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        if (error.code === "PGRST205" || error.message?.includes("schema cache")) {
          setMessages([]);
          fetchedRef.current.messages = true;
          return;
        }
        throw error;
      }
      if (data) {
        setMessages(data);
        fetchedRef.current.messages = true;
      }
    } catch (err) {
      if (!err.message?.includes("schema cache") && err.code !== "PGRST205") {
        console.warn("Messages fetch note:", err.message);
      }
    }
  }, []);

  const fetchData = useCallback(async (force = false) => {
    setIsFetching(true);
    await Promise.allSettled([
      fetchNews(force),
      fetchTeam(force),
      fetchConfig(force),
      fetchMessages(force),
      fetchWebUsers(force),
    ]);
    setIsFetching(false);
    setLoading(false);
  }, [fetchNews, fetchTeam, fetchConfig, fetchMessages, fetchWebUsers]);

  useEffect(() => {
    // Eagerly fetch all essential dashboard data on initial load.
    // This removes the need for individual pages to call fetchData().
    fetchData();
  }, [fetchData]);

  // Window focus & visibility-change listener to auto-sync fresh data
  const lastFocusFetchRef = useRef(Date.now());
  useEffect(() => {
    const handleSyncOnFocus = () => {
      // Throttle to at most once every 30 seconds to prevent hammering DB on rapid tab switches
      const now = Date.now();
      if (now - lastFocusFetchRef.current > 30_000) {
        lastFocusFetchRef.current = now;
        fetchData(true);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        handleSyncOnFocus();
      }
    };

    window.addEventListener("focus", handleSyncOnFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleSyncOnFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchData]);

  const hasConnectedRef = useRef(false);

  // Realtime listeners (syncs updates globally via WebSocket, zero polling)
  useEffect(() => {
    if (!supabase || typeof supabase.channel !== "function") return;

    const channel = supabase
      .channel("public_db_changes")
      // 1. Listen for site config changes
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "assets",
          filter: "key=eq.site_config",
        },
        (payload) => {
          if (payload.new && payload.new.url) {
            try {
              const remoteConfigFound = JSON.parse(payload.new.url);
              setSiteConfig((prev) => ({
                ...prev,
                ...remoteConfigFound,
                socialLinks: { ...prev.socialLinks, ...remoteConfigFound.socialLinks },
                contactDetails: { ...prev.contactDetails, ...remoteConfigFound.contactDetails },
                sectionOrder: remoteConfigFound.sectionOrder || prev.sectionOrder,
              }));
            } catch (e) {
              console.error("Realtime site config parse error:", e);
            }
          }
        }
      )
      // 2. Listen for news/article changes
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "news",
        },
        (payload) => {
          if (payload.eventType === "DELETE") {
            setNews((prev) => prev.filter((n) => n.id !== payload.old.id));
            return;
          }
          if (payload.eventType === "INSERT") {
            if (payload.new) {
              const patched = patchImageUrl(payload.new);
              setNews((prev) => {
                if (prev.some((n) => n.id === patched.id)) return prev;
                return [patched, ...prev].sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date));
              });
            }
            return;
          }
          if (payload.eventType === "UPDATE") {
            if (payload.new && payload.new.title) {
              const patched = patchImageUrl(payload.new);
              setNews((prev) => prev.map((n) => (n.id === patched.id ? { ...n, ...patched } : n)));
            } else if (payload.new?.id) {
              // If large text truncated payload.new, fetch full record
              supabase
                .from("news")
                .select("id, title, content, image, date, category, author, tags, type, status, submitted_by, original_link, created_at, visibility, needs_attention, review_notes")
                .eq("id", payload.new.id)
                .maybeSingle()
                .then(({ data }) => {
                  if (data) {
                    const patched = patchImageUrl(data);
                    setNews((prev) => prev.map((n) => (n.id === patched.id ? { ...n, ...patched } : n)));
                  }
                })
                .catch(() => {});
            }
            return;
          }
        }
      )
      // 3. Listen for team changes
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "team",
        },
        (payload) => {
          setTeam((prev) => {
            if (payload.eventType === "INSERT") {
              if (prev.some((t) => t.id === payload.new.id)) return prev;
              return [...prev, payload.new].sort((a, b) => Number(a.id) - Number(b.id));
            }
            if (payload.eventType === "UPDATE") {
              return prev.map((t) => (t.id === payload.new.id ? { ...t, ...payload.new } : t)).sort((a, b) => Number(a.id) - Number(b.id));
            }
            if (payload.eventType === "DELETE") {
              return prev.filter((t) => t.id !== payload.old.id);
            }
            return prev;
          });
        }
      )
      // 4. Listen for messages changes
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          setMessages((prev) => {
            if (payload.eventType === "INSERT") {
              if (prev.some((m) => m.id === payload.new.id)) return prev;
              return [payload.new, ...prev].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            }
            if (payload.eventType === "UPDATE") {
              return prev.map((m) => (m.id === payload.new.id ? { ...m, ...payload.new } : m));
            }
            if (payload.eventType === "DELETE") {
              return prev.filter((m) => m.id !== payload.old.id);
            }
            return prev;
          });
        }
      )
      // 5. Listen for users changes
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "users",
        },
        (payload) => {
          setWebUsers((prev) => {
            if (payload.eventType === "INSERT") {
              if (prev.some((u) => u.id === payload.new.id)) return prev;
              return [...prev, payload.new].sort((a, b) => (a.full_name || "").localeCompare(b.full_name || ""));
            }
            if (payload.eventType === "UPDATE") {
              return prev.map((u) => (u.id === payload.new.id ? { ...u, ...payload.new } : u)).sort((a, b) => (a.full_name || "").localeCompare(b.full_name || ""));
            }
            if (payload.eventType === "DELETE") {
              return prev.filter((u) => u.id !== payload.old.id);
            }
            return prev;
          });
        }
      )
      .subscribe((status, err) => {
        if (status === "SUBSCRIBED") {
          // If socket reconnects after initial connection, silent refetch to catch up on missed data
          if (hasConnectedRef.current) {
            fetchData(true);
          } else {
            hasConnectedRef.current = true;
          }
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          console.warn("[DataContext] Realtime subscription status:", status, err);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  const updateSiteConfig = async (newConfig) => {
    const { error } = await supabase.from("assets").upsert({
      key: "site_config",
      url: JSON.stringify(newConfig),
    });
    if (!error) {
      setSiteConfig(newConfig);
      return true;
    }
    return false;
  };

  // CRUD Operations (Supabase Optimized)

  // ARTICLES --------------------
  const addNews = async (article) => {
    const { data, error } = await supabase
      .from("news")
      .insert([article])
      .select();
    if (!error && data && data[0]) {
      const patched = patchImageUrl(data[0]);
      setNews((prev) => {
        if (prev.some((n) => n.id === patched.id)) return prev;
        return [patched, ...prev].sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date));
      });
      return { data, error: null };
    }
    if (error) {
      console.error("[DataContext] Error adding news:", error.message);
      return { data: null, error };
    }
  };
  const updateNews = async (id, updated) => {
    setNews((prevNews) => prevNews.map((n) => (n.id === id ? { ...n, ...updated } : n)));
    const { error } = await supabase.from("news").update(updated).eq("id", id);
    if (error) {
      console.error("[DataContext] Error updating news:", error.message);
      fetchNews(true); // rollback on error
      return false;
    }
    return true;
  };
  const deleteNews = async (id) => {
    setNews((prevNews) => prevNews.filter((n) => n.id !== id));
    const { error } = await supabase.from("news").delete().eq("id", id);
    if (error) {
      console.error("[DataContext] Error deleting news:", error.message);
      fetchNews(true); // rollback on error
      return false;
    }
    return true;
  };
  const deleteManyNews = async (ids) => {
    setNews((prevNews) => prevNews.filter((n) => !ids.includes(n.id)));
    const { error } = await supabase.from("news").delete().in("id", ids);
    if (error) {
      console.error("[DataContext] Error deleting multiple news:", error.message);
      fetchNews(true); // rollback on error
      return false;
    }
    return true;
  };
  const updateManyNews = async (ids, updated) => {
    setNews((prevNews) => prevNews.map((n) => (ids.includes(n.id) ? { ...n, ...updated } : n)));
    const { error } = await supabase.from("news").update(updated).in("id", ids);
    if (error) {
      console.error("[DataContext] Error updating multiple news:", error.message);
      fetchNews(true); // rollback on error
      return false;
    }
    return true;
  };

  // TEAM ------------------------
  const addTeamMember = async (member) => {
    const { data, error } = await supabase
      .from("team")
      .insert([member])
      .select();
    if (!error && data) {
      setTeam((prev) => {
        if (prev.some((t) => t.id === data[0].id)) return prev;
        return [...prev, data[0]].sort((a, b) => Number(a.id) - Number(b.id));
      });
    }
  };
  const updateTeam = async (id, updated) => {
    const { error } = await supabase.from("team").update(updated).eq("id", id);
    if (!error) {
      setTeam(
        team
          .map((t) => (t.id === id ? { ...t, ...updated } : t))
          .sort((a, b) => Number(a.id) - Number(b.id)),
      );
    }
  };
  const deleteTeam = async (id) => {
    const { error } = await supabase.from("team").delete().eq("id", id);
    if (!error) {
      setTeam(team.filter((t) => t.id !== id));
    }
  };

  // MESSAGES ----------------------
  const addMessage = async (messageData) => {
    try {
      const { error } = await supabase
        .from("messages")
        .insert([messageData]);
      if (error) throw error;

      // Notify admins of new message
      supabase.functions.invoke("send-feedback-push", {
        body: {
          title: "New Public Message",
          description: messageData.message ? messageData.message.substring(0, 100) : "You received a new message.",
          type: "message",
          reporter_name: messageData.name || "Anonymous",
          submitter_user_id: null,
          target_url: "/admin-redirect?to=messages",
        },
      }).catch((err) => console.warn("[DataContext] Push notify failed:", err));
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  };

  const deleteMessage = async (id) => {
    const { error } = await supabase.from("messages").delete().eq("id", id);
    if (!error) {
      setMessages(messages.filter((m) => m.id !== id));
    }
  };

  // LOGS --------------------------
  const addActivityLog = (action, details, status = "SUCCESS", user_email = "admin") => {
    const log = { id: Date.now(), action, details, created_at: new Date().toISOString(), status, user_email };
    setActivityLogs((prev) => [log, ...prev]);
  };

  // ASSETS ------------------------
  const updateAsset = async (key, url) => {
    const { error } = await supabase.from("assets").upsert({ key, url });
    if (!error) {
      setAssets((prev) => ({ ...prev, [key]: url }));
    }
  };

  const uploadImage = async (file, bucket = "assets", folder = "") => {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`;
      const cleanFolder = folder ? folder.replace(/^\/+|\/+$/g, '') : '';
      const filePath = cleanFolder ? `${cleanFolder}/${fileName}` : fileName;

      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filePath);
      return publicUrl;
    } catch (error) {
      console.error("Upload Error:", error);
      return null;
    }
  };

  // List uploaded files from a storage bucket (supports folder and recursive or multiple folders)
  const listUploads = async (bucket = "news_images", folder = "") => {
    try {
      if (bucket === "news_images" && !folder) {
        // Fetch from root and subfolders: articles and updates
        const [rootRes, articlesRes, updatesRes] = await Promise.all([
          supabase.storage.from(bucket).list('', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } }),
          supabase.storage.from(bucket).list('articles', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } }),
          supabase.storage.from(bucket).list('updates', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } }),
        ]);

        const rootFiles = (rootRes.data || [])
          .filter(f => f.name && f.name !== 'articles' && f.name !== 'updates' && !f.name.startsWith('.') && f.id)
          .map(file => ({
            ...file,
            folder: 'root',
            fullPath: file.name,
            publicUrl: supabase.storage.from(bucket).getPublicUrl(file.name).data.publicUrl,
          }));

        const articleFiles = (articlesRes.data || [])
          .filter(f => f.name && !f.name.startsWith('.') && f.id)
          .map(file => ({
            ...file,
            folder: 'articles',
            fullPath: `articles/${file.name}`,
            publicUrl: supabase.storage.from(bucket).getPublicUrl(`articles/${file.name}`).data.publicUrl,
          }));

        const updateFiles = (updatesRes.data || [])
          .filter(f => f.name && !f.name.startsWith('.') && f.id)
          .map(file => ({
            ...file,
            folder: 'updates',
            fullPath: `updates/${file.name}`,
            publicUrl: supabase.storage.from(bucket).getPublicUrl(`updates/${file.name}`).data.publicUrl,
          }));

        const all = [...articleFiles, ...updateFiles, ...rootFiles];
        // Sort by created_at desc
        all.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        return all;
      }

      const cleanFolder = folder ? folder.replace(/^\/+|\/+$/g, '') : '';
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(cleanFolder, { limit: 200, sortBy: { column: 'created_at', order: 'desc' } });
      if (error) throw error;
      return (data || [])
        .filter(f => f.name && !f.name.startsWith('.') && f.id)
        .map(file => {
          const fullPath = cleanFolder ? `${cleanFolder}/${file.name}` : file.name;
          return {
            ...file,
            folder: cleanFolder || 'root',
            fullPath,
            publicUrl: supabase.storage.from(bucket).getPublicUrl(fullPath).data.publicUrl,
          };
        });
    } catch (error) {
      console.error("List Uploads Error:", error);
      return [];
    }
  };

  const deleteUpload = async (fullPath, bucket = "news_images") => {
    try {
      const { error } = await supabase.storage.from(bucket).remove([fullPath]);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Delete Upload Error:", error);
      return false;
    }
  };

  // Client-side image compression using Canvas API
  const compressImage = async (file, maxSizeMB = 4, quality = 0.8) => {
    if (file.size <= maxSizeMB * 1024 * 1024) return file;
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        // Scale down if very large
        const MAX_DIM = 2400;
        if (width > MAX_DIM || height > MAX_DIM) {
          const ratio = Math.min(MAX_DIM / width, MAX_DIM / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error('Compression failed'));
            const compressed = new File([blob], file.name.replace(/\.[^.]+$/, '.webp'), { type: 'image/webp' });
            resolve(compressed);
          },
          'image/webp',
          quality
        );
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const contextValue = useMemo(() => ({
    news,
    team,
    webUsers,
    stats,
    messages,
    activityLogs,
    assets,
    loading,
    isFetching,
    user,
    siteConfig,
    nethinetheraSchools,
    nethinetheraAgenda,
    nethinetheraVotes,
    nethinetheraSeating,
    addNews,
    updateNews,
    deleteNews,
    deleteManyNews,
    updateManyNews,
    addTeamMember,
    updateTeam,
    deleteTeam,
    updateAsset,
    updateSiteConfig,
    uploadImage,
    listUploads,
    deleteUpload,
    compressImage,
    fetchData,
    fetchNews,
    hasMoreNews,
    fetchArticleById,
    fetchTeam,
    fetchWebUsers,
    fetchConfig,
    addMessage,
    deleteMessage,
    addActivityLog,
    fetchMessages,
    setNethinetheraSchools,
    // Aliases
    addMember: addTeamMember,
    updateMember: updateTeam,
    deleteMember: deleteTeam,
  }), [
    news, team, webUsers, stats, messages, activityLogs, assets,
    loading, isFetching, user, siteConfig, nethinetheraSchools,
    nethinetheraAgenda, nethinetheraVotes, nethinetheraSeating,
    addNews, updateNews, deleteNews, deleteManyNews, updateManyNews,
    addTeamMember, updateTeam, deleteTeam, updateAsset, updateSiteConfig,
    uploadImage, listUploads, deleteUpload, compressImage, fetchData, fetchNews, hasMoreNews, fetchArticleById,
    fetchTeam, fetchWebUsers, fetchConfig, addMessage, deleteMessage,
    addActivityLog, fetchMessages, setNethinetheraSchools
  ]);

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};
