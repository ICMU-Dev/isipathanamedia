import React, { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { supabase } from "../../lib/supabaseClient";
import {
  X,
  Upload,
  Link2,
  Image as ImageIcon,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  Search,
  Loader2,
  AlertCircle,
  FolderOpen,
  Folder,
  Layers,
} from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "../../context/AuthContext";

const BUCKET = "news_images";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const COMPRESS_THRESHOLD = 4 * 1024 * 1024; // 4MB

const TABS = [
  { key: "uploads", label: "Library", icon: FolderOpen },
  { key: "upload", label: "Upload", icon: Upload },
  { key: "external", label: "External URL", icon: Link2 },
];

// --- Helpers ---

const formatBytes = (bytes, decimals = 2) => {
  if (!bytes || bytes === 0) return "0 B";
  const byteThreshold = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const unitIndex = Math.floor(Math.log(bytes) / Math.log(byteThreshold));

  return (
    parseFloat((bytes / Math.pow(byteThreshold, unitIndex)).toFixed(dm)) +
    " " +
    sizes[unitIndex]
  );
};

const compressImage = (file) =>
  new Promise((resolve, reject) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
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
        0.8
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image for compression"));
    };
    img.src = url;
  });

// --- Sub-components ---

const Spinner = ({ size = 20, className = "" }) => (
  <Loader2 size={size} className={`animate-spin ${className}`} />
);

const TabButton = ({ tab, active, onClick }) => {
  const Icon = tab.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
        active
          ? "bg-[var(--accent)] text-black shadow-md shadow-[var(--accent)]/20"
          : "text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] hover:bg-[var(--admin-card-bg)] border border-transparent"
      }`}
    >
      <Icon size={15} />
      <span>{tab.label}</span>
    </button>
  );
};

// --- Uploads Tab ---

const UploadsTab = ({ onSelect, onClose }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin" || user?.role === "super_admin" || user?.role === "super-admin" || user?.role === "superadmin";

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState("all");
  const [search, setSearch] = useState("");
  const [copiedUrl, setCopiedUrl] = useState(null);
  const [deletingPath, setDeletingPath] = useState(null);
  const [confirmDeletePath, setConfirmDeletePath] = useState(null);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      // Concurrently list from root, articles, and updates
      const [rootRes, articlesRes, updatesRes] = await Promise.all([
        supabase.storage.from(BUCKET).list("", {
          limit: 100,
          sortBy: { column: "created_at", order: "desc" },
        }),
        supabase.storage.from(BUCKET).list("articles", {
          limit: 100,
          sortBy: { column: "created_at", order: "desc" },
        }),
        supabase.storage.from(BUCKET).list("updates", {
          limit: 100,
          sortBy: { column: "created_at", order: "desc" },
        }),
      ]);

      const rootFiles = (rootRes.data || [])
        .filter((f) => f.name && f.name !== "articles" && f.name !== "updates" && !f.name.startsWith(".") && f.id)
        .map((file) => ({
          ...file,
          folder: "root",
          fullPath: file.name,
          publicUrl: supabase.storage.from(BUCKET).getPublicUrl(file.name).data.publicUrl,
        }));

      const articleFiles = (articlesRes.data || [])
        .filter((f) => f.name && !f.name.startsWith(".") && f.id)
        .map((file) => ({
          ...file,
          folder: "articles",
          fullPath: `articles/${file.name}`,
          publicUrl: supabase.storage.from(BUCKET).getPublicUrl(`articles/${file.name}`).data.publicUrl,
        }));

      const updateFiles = (updatesRes.data || [])
        .filter((f) => f.name && !f.name.startsWith(".") && f.id)
        .map((file) => ({
          ...file,
          folder: "updates",
          fullPath: `updates/${file.name}`,
          publicUrl: supabase.storage.from(BUCKET).getPublicUrl(`updates/${file.name}`).data.publicUrl,
        }));

      const all = [...articleFiles, ...updateFiles, ...rootFiles];
      all.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
      setFiles(all);
    } catch (err) {
      console.error("Failed to list uploads:", err);
      toast.error("Failed to load uploads");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleCopy = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      toast.success("URL copied to clipboard");
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch {
      toast.error("Failed to copy URL");
    }
  };

  const handleDelete = async (fullPath) => {
    setDeletingPath(fullPath);
    try {
      const { error } = await supabase.storage.from(BUCKET).remove([fullPath]);
      if (error) throw error;
      setFiles((prev) => prev.filter((f) => f.fullPath !== fullPath));
      toast.success("Image deleted");
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete image");
    } finally {
      setDeletingPath(null);
      setConfirmDeletePath(null);
    }
  };

  // Filter by folder and search term
  const folderFiltered = files.filter((f) => {
    if (selectedFolder === "all") return true;
    return f.folder === selectedFolder;
  });

  const filtered = folderFiltered.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  // Folder counts
  const articlesCount = files.filter((f) => f.folder === "articles").length;
  const updatesCount = files.filter((f) => f.folder === "updates").length;
  const totalCount = files.length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Spinner size={28} className="text-[var(--accent)]" />
        <span className="text-xs font-semibold text-[var(--admin-text-secondary)] uppercase tracking-widest">
          Loading bucket media...
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Controls: Search and Folder Pills */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Folder Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-[var(--admin-input-bg)] border border-[var(--admin-border)] rounded-xl shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => setSelectedFolder("all")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-3xl  text-xs font-bold transition-colors whitespace-nowrap ${
              selectedFolder === "all"
                ? "bg-[var(--accent)] text-black shadow-sm"
                : "text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)]"
            }`}
          >
            <span>All Media</span>
            <span className="text-[10px] opacity-75 font-mono">({totalCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedFolder("articles")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-3xl  text-xs font-bold transition-colors whitespace-nowrap ${
              selectedFolder === "articles"
                ? "bg-[var(--accent)] text-black shadow-sm"
                : "text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)]"
            }`}
          >
            <Folder size={12} />
            <span>Articles</span>
            <span className="text-[10px] opacity-75 font-mono">({articlesCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedFolder("updates")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-3xl  text-xs font-bold transition-colors whitespace-nowrap ${
              selectedFolder === "updates"
                ? "bg-[var(--accent)] text-black shadow-sm"
                : "text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)]"
            }`}
          >
            <Folder size={12} />
            <span>Updates</span>
            <span className="text-[10px] opacity-75 font-mono">({updatesCount})</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--admin-text-secondary)]"
          />
          <input
            type="text"
            placeholder="Filter by filename..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[var(--admin-input-bg)] border border-[var(--admin-border)] rounded-xl pl-9 pr-4 py-2 text-xs text-[var(--admin-text-primary)] placeholder-[var(--admin-text-secondary)]/50 focus:outline-none focus:border-[var(--accent)] transition-all"
          />
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-[var(--admin-text-secondary)]">
          <ImageIcon size={36} className="opacity-30" />
          <p className="text-xs font-medium">
            {search ? "No images match your filter" : "No images in this folder yet"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pr-1 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {filtered.map((file) => {
            const isCopied = copiedUrl === file.publicUrl;
            const isDeleting = deletingPath === file.fullPath;
            const isConfirming = confirmDeletePath === file.fullPath;

            return (
              <div
                key={file.fullPath}
                className="group relative rounded-xl border border-[var(--admin-border)] overflow-hidden bg-[var(--admin-input-bg)] hover:border-[var(--accent)]/40 transition-all flex flex-col h-full shadow-sm"
              >
                {/* Thumbnail Header */}
                <div className="relative aspect-square overflow-hidden bg-black/40 flex items-center justify-center">
                  <img
                    src={file.publicUrl}
                    alt={file.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                  />
                  {/* Folder Badge */}
                  <span
                    className={`absolute top-3 shadow-2xl right-2 px-2 py-0.5 rounded-3xl  text-[6px] font-bold uppercase tracking-wider  ${
                      file.folder === "articles"
                        ? "bg-orange-800 text-white font-extrabold"
                        : file.folder === "updates"
                        ? "bg-orange-800 text-white font-extrabold"
                        : "bg-black/70 text-white border border-white/10"
                    }`}
                  >
                    {file.folder}
                  </span>
                </div>

                {/* Info & Actions */}
                <div className="p-2.5 space-y-2 mt-auto">
                  <div className="min-w-0">
                    <p
                      className="text-[11px] font-medium text-[var(--admin-text-primary)] truncate font-mono"
                      title={file.name}
                    >
                      {file.name}
                    </p>
                    <p className="text-[10px] text-[var(--admin-text-secondary)] mt-0.5">
                      {formatBytes(file.metadata?.size)}
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1.5 pt-1 border-t border-[var(--admin-border)]">
                    <button
                      type="button"
                      onClick={() => {
                        onSelect(file.publicUrl);
                        onClose();
                      }}
                      className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-3xl  bg-[var(--accent)] text-black text-[11px] font-bold hover:opacity-95 transition-colors"
                    >
                      <Check size={12} />
                      <span>Select</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopy(file.publicUrl)}
                      className="p-1.5 rounded-3xl  text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] hover:bg-[var(--admin-card-bg)] border border-[var(--admin-border)] transition-colors"
                      title="Copy URL"
                    >
                      {isCopied ? (
                        <Check size={13} className="text-[var(--accent)]" />
                      ) : (
                        <Copy size={13} />
                      )}
                    </button>

                      {isAdmin && (
                        isConfirming ? (
                          <button
                            type="button"
                            onClick={() => handleDelete(file.fullPath)}
                            disabled={isDeleting}
                            className="p-1.5 rounded-3xl  text-white bg-red-600 hover:bg-red-500 transition-colors"
                            title="Confirm delete"
                          >
                            {isDeleting ? <Spinner size={13} /> : <Trash2 size={13} />}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeletePath(file.fullPath)}
                            className="p-1.5 rounded-3xl  text-[var(--admin-text-secondary)] hover:text-red-400 hover:bg-red-500/10 border border-[var(--admin-border)] transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        )
                      )}
                    </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// --- Upload New Tab ---

const UploadNewTab = ({ uploadImage, onSelect, onClose, defaultFolder = "articles" }) => {
  const [dragActive, setDragActive] = useState(false);
  const [targetFolder, setTargetFolder] = useState(defaultFolder);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [compressionInfo, setCompressionInfo] = useState(null);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const reset = () => {
    setFile(null);
    setPreview(null);
    setCompressionInfo(null);
    setError(null);
  };

  const processFile = useCallback(async (rawFile) => {
    if (!rawFile || !rawFile.type.startsWith("image/")) {
      setError("Please select a valid image file");
      return;
    }
    setError(null);
    setCompressionInfo(null);

    let finalFile = rawFile;
    const originalSize = rawFile.size;

    // Compress if larger than threshold
    if (originalSize > COMPRESS_THRESHOLD) {
      try {
        finalFile = await compressImage(rawFile);
        setCompressionInfo({
          original: originalSize,
          compressed: finalFile.size,
        });
      } catch {
        setError("Image compression failed. Try a smaller image.");
        return;
      }
    }

    if (finalFile.size > MAX_FILE_SIZE) {
      setError(
        `Image is too large (${formatBytes(finalFile.size)}). Maximum is 5MB even after compression.`
      );
      return;
    }

    setFile(finalFile);
    const objectUrl = URL.createObjectURL(finalFile);
    setPreview(objectUrl);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragActive(false);
      const dropped = e.dataTransfer?.files?.[0];
      if (dropped) processFile(dropped);
    },
    [processFile]
  );

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleUpload = async () => {
    if (!file || !uploadImage) return;
    setUploading(true);
    setError(null);
    try {
      const publicUrl = await uploadImage(file, BUCKET, targetFolder);
      if (publicUrl) {
        toast.success(`Image uploaded to ${targetFolder}/ successfully!`);
        onSelect(publicUrl);
        onClose();
      } else {
        setError("Upload failed. Please try again.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  return (
    <div className="flex flex-col gap-4">
      {/* Folder Destination Selector */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--admin-input-bg)] border border-[var(--admin-border)]">
        <div>
          <h4 className="text-xs font-bold text-[var(--admin-text-primary)]">Destination Folder</h4>
          <p className="text-[10px] text-[var(--admin-text-secondary)]">
            Store file in <code className="font-mono text-[var(--accent)]">{targetFolder}/</code>
          </p>
        </div>
        <div className="flex gap-1 bg-[var(--admin-card-bg)] p-1 rounded-3xl  border border-[var(--admin-border)]">
          <button
            type="button"
            onClick={() => setTargetFolder("articles")}
            className={`px-3 py-1 text-xs font-bold rounded-3xl  transition-colors ${
              targetFolder === "articles"
                ? "bg-[var(--accent)] text-black shadow-sm"
                : "text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)]"
            }`}
          >
            Articles
          </button>
          <button
            type="button"
            onClick={() => setTargetFolder("updates")}
            className={`px-3 py-1 text-xs font-bold rounded-3xl  transition-colors ${
              targetFolder === "updates"
                ? "bg-[var(--accent)] text-black shadow-sm"
                : "text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)]"
            }`}
          >
            Updates
          </button>
        </div>
      </div>

      {!file ? (
        /* Drop zone */
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center gap-3 p-8 sm:p-12 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
            dragActive
              ? "border-[var(--accent)] bg-[var(--accent)]/5"
              : "border-[var(--admin-border)] hover:border-[var(--accent)]/40 bg-[var(--admin-input-bg)]"
          }`}
        >
          <div
            className={`p-3.5 rounded-2xl transition-colors ${
              dragActive ? "bg-[var(--accent)]/20 text-[var(--accent)]" : "bg-[var(--admin-card-bg)] text-[var(--accent)]"
            }`}
          >
            <Upload size={28} />
          </div>
          <div className="text-center">
            <p className="text-xs font-bold text-[var(--admin-text-primary)]">
              {dragActive ? "Drop image here" : `Click or drag image to upload into ${targetFolder}/`}
            </p>
            <p className="text-[11px] text-[var(--admin-text-secondary)] mt-1">
              JPEG, PNG, WebP · Max 5MB
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files?.[0]) processFile(e.target.files[0]);
            }}
            className="hidden"
          />
        </div>
      ) : (
        /* File selected – preview & upload */
        <div className="space-y-4">
          <div className="relative rounded-2xl overflow-hidden border border-[var(--admin-border)] bg-black/40  flex items-center justify-center">
            <img
              src={preview}
              alt="Upload preview"
              className="w-full max-h-56 object-contain rounded-3xl "
            />
          </div>

          {/* File info */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--admin-input-bg)] border border-[var(--admin-border)]">
            <div className="flex items-center gap-3 min-w-0">
              <ImageIcon size={18} className="text-[var(--accent)] shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-[var(--admin-text-primary)] truncate font-mono">
                  {file.name}
                </p>
                <p className="text-[10px] text-[var(--admin-text-secondary)]">
                  {formatBytes(file.size)} • Folder: <span className="font-mono text-[var(--accent)]">{targetFolder}/</span>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={reset}
              disabled={uploading}
              className="p-1.5 rounded-3xl  text-[var(--admin-text-secondary)] hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0 disabled:opacity-50"
            >
              <X size={16} />
            </button>
          </div>

          {/* Compression info */}
          {compressionInfo && (
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-xs">
              <AlertCircle size={14} className="text-[var(--accent)] shrink-0" />
              <span className="text-[var(--admin-text-primary)] text-[11px]">
                Compressed: {formatBytes(compressionInfo.original)} →{" "}
                <span className="text-[var(--accent)] font-bold">
                  {formatBytes(compressionInfo.compressed)}
                </span>
              </span>
            </div>
          )}

          {/* Upload button */}
          <button
            type="button"
            onClick={handleUpload}
            disabled={uploading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--accent)] text-black text-xs font-bold hover:opacity-95 active:scale-[0.99] disabled:opacity-50 transition-all shadow-md"
          >
            {uploading ? (
              <>
                <Spinner size={16} />
                <span>Uploading to {targetFolder}/...</span>
              </>
            ) : (
              <>
                <Upload size={16} />
                <span>Upload to {targetFolder}/ & Select</span>
              </>
            )}
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          <AlertCircle size={14} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

// --- External URL Tab ---

const ExternalUrlTab = ({ onSelect, onClose }) => {
  const [url, setUrl] = useState("");
  const [imgValid, setImgValid] = useState(false);
  const [imgLoading, setImgLoading] = useState(false);

  useEffect(() => {
    if (!url.trim()) {
      setImgValid(false);
      return;
    }
    setImgLoading(true);
    setImgValid(false);
    const img = new window.Image();
    img.onload = () => {
      setImgValid(true);
      setImgLoading(false);
    };
    img.onerror = () => {
      setImgValid(false);
      setImgLoading(false);
    };
    img.src = url;
  }, [url]);

  const handleUse = () => {
    if (!url.trim()) return;
    onSelect(url.trim());
    onClose();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-[var(--admin-text-secondary)] ml-1">
          Image URL
        </label>
        <div className="relative">
          <ExternalLink
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--admin-text-secondary)]"
          />
          <input
            type="url"
            placeholder="https://example.com/image.jpg"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full bg-[var(--admin-input-bg)] border border-[var(--admin-border)] rounded-xl pl-9 pr-4 py-2.5 text-xs text-[var(--admin-text-primary)] placeholder-[var(--admin-text-secondary)]/50 focus:outline-none focus:border-[var(--accent)] transition-all"
          />
        </div>
      </div>

      {/* Preview */}
      {url.trim() && (
        <div className="rounded-xl overflow-hidden border border-[var(--admin-border)] bg-black/40 min-h-[120px] flex items-center justify-center p-2">
          {imgLoading ? (
            <Spinner size={24} className="text-[var(--accent)]" />
          ) : imgValid ? (
            <img
              src={url}
              alt="External preview"
              className="w-full max-h-56 object-contain rounded-3xl "
            />
          ) : (
            <div className="flex flex-col items-center gap-1.5 py-6 text-red-400">
              <AlertCircle size={18} />
              <span className="text-xs">Could not load image from this URL</span>
            </div>
          )}
        </div>
      )}

      {/* Info note */}
      <p className="text-[11px] text-[var(--admin-text-secondary)] flex items-center gap-1.5 ml-1">
        <ExternalLink size={12} />
        Loaded directly from external URL without consuming bucket storage.
      </p>

      {/* Use button */}
      <button
        type="button"
        onClick={handleUse}
        disabled={!imgValid}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--accent)] text-black text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-95 transition-all shadow-md"
      >
        <Check size={16} />
        <span>Use This Image</span>
      </button>
    </div>
  );
};

// --- Main Modal ---

const MediaLibrary = ({
  isOpen,
  onClose,
  onSelect,
  uploadImage,
  defaultFolder = "articles",
}) => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin" || user?.role === "super_admin" || user?.role === "super-admin" || user?.role === "superadmin";

  const [activeTab, setActiveTab] = useState("uploads");
  const overlayRef = useRef(null);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      className="fixed inset-0 z-[120] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      {/* Modal container */}
      <div className="w-full h-[95dvh] sm:h-auto sm:max-h-[88vh] sm:max-w-4xl bg-[var(--admin-card-bg,#121212)] rounded-2xl border border-[var(--admin-border)] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--admin-border)] bg-[var(--admin-input-bg)] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
              <ImageIcon size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[var(--admin-text-primary)]">
                Media Library
              </h2>
              <p className="text-[10px] text-[var(--admin-text-secondary)]">
                Manage bucket images 
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-[var(--admin-card-bg)] hover:bg-[var(--admin-border)] text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-5 py-2.5 border-b border-[var(--admin-border)] bg-[var(--admin-card-bg)] shrink-0 overflow-x-auto">
          {TABS.map((tab) => (
            <TabButton
              key={tab.key}
              tab={tab}
              active={activeTab === tab.key}
              onClick={() => setActiveTab(tab.key)}
            />
          ))}
        </div>

        {/* Tab Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 custom-scrollbar">
          {activeTab === "uploads" && (
            <UploadsTab onSelect={onSelect} onClose={onClose} />
          )}
          {activeTab === "upload" && (
            <UploadNewTab
              uploadImage={uploadImage}
              onSelect={onSelect}
              onClose={onClose}
              defaultFolder={defaultFolder}
            />
          )}
          {activeTab === "external" && (
            <ExternalUrlTab onSelect={onSelect} onClose={onClose} />
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default MediaLibrary;

