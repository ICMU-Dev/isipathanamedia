import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";

export const useUpdateForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { news, addNews, updateNews, uploadImage, compressImage, fetchNews } = useData();
  const { user } = useAuth();

  const [link, setLink] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Cropper state
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    image: "",
    category: "Updates",
    original_link: "",
    type: "update",
    status: "pending",
  });

  const [initialFormData, setInitialFormData] = useState(null);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (initialFormData) {
      setIsDirty(JSON.stringify(formData) !== JSON.stringify(initialFormData));
    }
  }, [formData, initialFormData]);

  const isEditing = Boolean(id);
  
  const role = user?.role?.toLowerCase();
  const isSuperAdmin = role === 'super-admin' || role === 'superadmin' || role === 'super_admin';
  const isAdmin = role === 'admin' || isSuperAdmin;
  
  const canEditMetadata = !isEditing || (formData.submitted_by === user?.id) || isAdmin;

  // Load existing data if editing
  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  useEffect(() => {
    if (isEditing && news.length > 0) {
      const existingUpdate = news.find(n => n.id === id || n.id?.toString() === id?.toString());
      if (existingUpdate) {
        const authorMatch = existingUpdate.submitted_by === user?.id;
        if (!isAdmin && !authorMatch) {
          toast.error("You are not authorized to edit this update.");
          navigate(-1);
          return;
        }

        const loadedData = {
          title: existingUpdate.title || "",
          content: existingUpdate.content || "",
          image: existingUpdate.image || "",
          category: existingUpdate.category || "Updates",
          original_link: existingUpdate.original_link || "",
          type: "update",
          status: existingUpdate.status || "pending",
          submitted_by: existingUpdate.submitted_by,
          author: existingUpdate.author
        };

        setFormData(loadedData);
        setInitialFormData(loadedData);
        setLink(existingUpdate.original_link || "");
      }
    } else if (!isEditing && !initialFormData) {
      setInitialFormData(formData);
    }
  }, [id, news, isAdmin, user, navigate, isEditing]);

  // Check for shared URL from PWA Share Target
  useEffect(() => {
    if (!isEditing) {
      const shared = sessionStorage.getItem('pendingSharedUrl');
      if (shared) {
        setLink(shared);
        sessionStorage.removeItem('pendingSharedUrl');
        setTimeout(() => {
          document.getElementById('extract-btn')?.click();
        }, 500);
      }
    }
  }, [isEditing]);

  const extractData = async () => {
    if (!link.trim()) {
      toast.error("Please paste a link first.");
      return;
    }
    
    // Auto-fix URL if missing http/https
    let targetUrl = link.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = 'https://' + targetUrl;
      setLink(targetUrl);
    }

    setExtracting(true);
    try {
      let title, description, imageUrl;

      // Strategy 1: Try Netlify Edge Function (works in production, handles Facebook)
      try {
        const edgeRes = await fetch(`/api/extract-og?url=${encodeURIComponent(targetUrl)}`);
        if (edgeRes.ok) {
          const edgeData = await edgeRes.json();
          title = edgeData.title;
          description = edgeData.description;
          imageUrl = edgeData.image;
        }
      } catch (e) {
        // Edge function not available (local dev) — fall through to Microlink
      }

      // Strategy 2: Fallback to Microlink API (client-side, works locally for most sites)
      if (!title && !description && !imageUrl) {
        try {
          const mlRes = await fetch(`https://api.microlink.io?url=${encodeURIComponent(targetUrl)}`);
          const mlData = await mlRes.json();
          if (mlData.status === "success" && mlData.data) {
            const d = mlData.data;
            // Only use Microlink data if it's not a generic login-page redirect
            const isGeneric = d.title === "Facebook" || d.title === "Log in or sign up to view";
            if (!isGeneric) {
              title = d.title;
              description = d.description;
              imageUrl = d.image?.url || null;
            }
          }
        } catch (e) {
          console.warn("Microlink fallback failed", e);
        }
      }

      // If we still got nothing
      if (!title && !description && !imageUrl) {
        toast.error("Could not extract data from this URL. Facebook links require production deployment.");
        setExtracting(false);
        return;
      }

      // Upload extracted image to Supabase to prevent CDN URLs from expiring
      let finalImage = formData.image;
      if (imageUrl && typeof imageUrl === 'string' && imageUrl.startsWith('http')) {
        try {
          // Try Netlify proxy first (production), then allorigins fallback
          let imgRes;
          try {
            imgRes = await fetch(`/api/proxy-image?url=${encodeURIComponent(imageUrl)}`);
            if (!imgRes.ok) throw new Error('Netlify proxy failed');
          } catch {
            imgRes = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(imageUrl)}`);
          }

          if (imgRes.ok) {
            const blob = await imgRes.blob();
            // Verify it's actually an image (allorigins can return HTML error pages)
            if (blob.type && blob.type.startsWith('image')) {
              const file = new File([blob], `extracted_${Date.now()}.jpg`, { type: blob.type || 'image/jpeg' });
              const fileToUpload = compressImage ? await compressImage(file, 4, 0.8) : file;
              const publicUrl = await uploadImage(fileToUpload, "news_images", "updates");
              if (publicUrl) {
                finalImage = publicUrl;
              }
            } else {
              // Not an image blob, just use the original URL
              finalImage = imageUrl;
            }
          }
        } catch (e) {
          console.warn("Failed to permanently host extracted image, using original URL", e);
          finalImage = imageUrl;
        }
      }

      setFormData(prev => ({
        ...prev,
        title: title || prev.title,
        content: description || prev.content,
        image: finalImage,
        original_link: targetUrl,
      }));
      toast.success("Details extracted successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Network error while extracting.");
    } finally {
      setExtracting(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file.");
        return;
    }
    
    const localUrl = URL.createObjectURL(file);
    setImageToCrop(localUrl);
    setCropModalOpen(true);
    e.target.value = null;
  };

  const handleCropComplete = async (croppedFile) => {
    setCropModalOpen(false);
    setImageToCrop(null);
    setUploading(true);
    
    try {
      const compressed = await compressImage(croppedFile, 4, 0.8);
      if (compressed.size > 5 * 1024 * 1024) {
        toast.error("Image is too large (max 5MB)");
        setUploading(false);
        return;
      }
      const publicUrl = await uploadImage(compressed, "news_images", "updates");
      if (publicUrl) {
        setFormData(prev => ({ ...prev, image: publicUrl }));
        toast.success("Cover image uploaded!");
      }
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!formData.title && !formData.content) {
      toast.error("Please provide at least a title or caption.");
      return;
    }

    setSaving(true);
    try {
      const targetStatus = isAdmin ? 'published' : 'pending';
      const payload = {
        title: formData.content ? formData.content.substring(0, 40) : "Quick Update",
        content: formData.content || "",
        image: formData.image || "",
        category: formData.category || "Updates",
        type: 'update',
        status: formData.status === 'published' ? 'published' : targetStatus,
        visibility: "public",
        original_link: formData.original_link || link,
      };

      if (!isEditing) {
        payload.date = new Date().toISOString().split("T")[0];
        payload.submitted_by = user?.id; // UUID
        payload.author = null; 
        await addNews(payload);
        toast.success("Update published successfully!");
      } else {
        // preserve original submitter and author
        const originalUpdate = news.find(n => n.id.toString() === id);
        if (originalUpdate) {
            payload.submitted_by = originalUpdate.submitted_by;
            payload.author = originalUpdate.author;
        }
        await updateNews(id, payload);
        toast.success("Update saved successfully!");
      }
      navigate(-1); 
    } catch (err) {
      console.error(err);
      toast.error(`Failed to ${isEditing ? 'save' : 'publish'} update`);
    } finally {
      setSaving(false);
    }
  };

  return {
    navigate,
    id,
    isEditing,
    canEditMetadata,
    formData,
    setFormData,
    isDirty,
    link,
    setLink,
    extracting,
    saving,
    uploading,
    cropModalOpen,
    setCropModalOpen,
    imageToCrop,
    setImageToCrop,
    extractData,
    handleFileUpload,
    handleCropComplete,
    handleSave,
    uploadImage,
  };
};
