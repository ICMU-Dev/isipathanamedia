import { supabase } from "../supabaseClient";

/**
 * Upload a file to Supabase storage and return its public URL.
 */
export async function uploadImage(file, bucket = "assets", folder = "") {
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`;
    const cleanFolder = folder ? folder.replace(/^\/+|\/+$/g, "") : "";
    const filePath = cleanFolder ? `${cleanFolder}/${fileName}` : fileName;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error("Upload Error:", error);
    return null;
  }
}

/**
 * List uploaded files from a storage bucket.
 */
export async function listUploads(bucket = "news_images", folder = "") {
  try {
    if (bucket === "news_images" && !folder) {
      const [rootRes, articlesRes, updatesRes] = await Promise.all([
        supabase.storage
          .from(bucket)
          .list("", { limit: 100, sortBy: { column: "created_at", order: "desc" } }),
        supabase.storage
          .from(bucket)
          .list("articles", { limit: 100, sortBy: { column: "created_at", order: "desc" } }),
        supabase.storage
          .from(bucket)
          .list("updates", { limit: 100, sortBy: { column: "created_at", order: "desc" } }),
      ]);

      const rootFiles = (rootRes.data || [])
        .filter((f) => f.name && f.name !== "articles" && f.name !== "updates" && !f.name.startsWith(".") && f.id)
        .map((file) => ({
          ...file,
          folder: "root",
          fullPath: file.name,
          publicUrl: supabase.storage.from(bucket).getPublicUrl(file.name).data.publicUrl,
        }));

      const articleFiles = (articlesRes.data || [])
        .filter((f) => f.name && !f.name.startsWith(".") && f.id)
        .map((file) => ({
          ...file,
          folder: "articles",
          fullPath: `articles/${file.name}`,
          publicUrl: supabase.storage.from(bucket).getPublicUrl(`articles/${file.name}`).data.publicUrl,
        }));

      const updateFiles = (updatesRes.data || [])
        .filter((f) => f.name && !f.name.startsWith(".") && f.id)
        .map((file) => ({
          ...file,
          folder: "updates",
          fullPath: `updates/${file.name}`,
          publicUrl: supabase.storage.from(bucket).getPublicUrl(`updates/${file.name}`).data.publicUrl,
        }));

      const all = [...articleFiles, ...updateFiles, ...rootFiles];
      all.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
      return all;
    }

    const cleanFolder = folder ? folder.replace(/^\/+|\/+$/g, "") : "";
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(cleanFolder, { limit: 200, sortBy: { column: "created_at", order: "desc" } });

    if (error) throw error;

    return (data || [])
      .filter((f) => f.name && !f.name.startsWith(".") && f.id)
      .map((file) => {
        const fullPath = cleanFolder ? `${cleanFolder}/${file.name}` : file.name;
        return {
          ...file,
          folder: cleanFolder || "root",
          fullPath,
          publicUrl: supabase.storage.from(bucket).getPublicUrl(fullPath).data.publicUrl,
        };
      });
  } catch (error) {
    console.error("List Uploads Error:", error);
    return [];
  }
}

/**
 * Delete an uploaded file from Supabase storage.
 */
export async function deleteUpload(fullPath, bucket = "news_images") {
  try {
    const { error } = await supabase.storage.from(bucket).remove([fullPath]);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Delete Upload Error:", error);
    return false;
  }
}

/**
 * Client-side image compression using Canvas API.
 */
export async function compressImage(file, maxSizeMB = 4, quality = 0.8) {
  if (file.size <= maxSizeMB * 1024 * 1024) return file;
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      try {
        URL.revokeObjectURL(img.src);
      } catch {
        // ignore
      }
      const canvas = document.createElement("canvas");
      let { width, height } = img;
      const MAX_DIM = 2400;
      if (width > MAX_DIM || height > MAX_DIM) {
        const ratio = Math.min(MAX_DIM / width, MAX_DIM / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error("Compression failed"));
          const compressed = new File(
            [blob],
            file.name.replace(/\.[^.]+$/, ".webp"),
            { type: "image/webp" }
          );
          resolve(compressed);
        },
        "image/webp",
        quality
      );
    };
    img.onerror = (err) => {
      try {
        URL.revokeObjectURL(img.src);
      } catch {
        // ignore
      }
      reject(err);
    };
    img.src = URL.createObjectURL(file);
  });
}
