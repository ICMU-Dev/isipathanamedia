import React from "react";
import {
  Image as ImageIcon,
  Upload,
  Crop,
  FileImage,
  AlertCircle,
  PlusCircle,
  ImagesIcon,
  ImageUpIcon,
} from "lucide-react";

const ArticleMediaStep = ({
  formData,
  errors,
  canEditMetadata,
  uploading,
  saving,
  setImageToCrop,
  setCropModalOpen,
  handleFileUpload,
  openMediaLibrary,
}) => {
  return (
    <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="p-4 md:p-8 border-b border-theme-base bg-[#050505]/50 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-theme-accent/5 flex items-center justify-center text-theme-accent shrink-0 shadow-[0_0_15px_rgba(var(--accent-rgb),0.1)]">
          <ImagesIcon size={18} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-theme-primary">Cover Image</h2>
          <p className="text-theme-primary opacity-40 text-xs font-medium">
            Set a striking 16:9 thumbnail for the article feed.
          </p>
        </div>
      </div>

      <div className="p-4 md:p-8 flex-1 flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_center,rgba(var(--accent-rgb),0.02)_0%,transparent_70%)]">
        <div className="w-full max-w-2xl flex flex-col gap-6">
          {/* Main Image Preview Card */}
          <div
            className={`relative w-full aspect-video rounded-3xl border border-white/[0.06]  overflow-hidden bg-theme-card shadow-2xl flex flex-col items-center justify-center ${errors.image ? "border-red-600/50 shadow-[0_0_20px_rgba(239,68,68,0.1)]" : "hover:border-theme-accent/10 "} transition-all duration-300`}>
            {formData.image ? (
              <img
                src={formData.image}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-center h-full w-full relative">
                <div className="absolute inset-0 bg-theme-accent/5  animate-pulse opacity-50"></div>
                <div className="w-20 h-20 rounded-full bg-[#050505] border border-theme-base flex items-center justify-center mb-6 shadow-xl relative z-10">
                  <ImageUpIcon
                    size={32}
                    className="text-theme-primary opacity-40"
                  />
                </div>
                <h3 className="text-xl font-black text-theme-primary mb-2 relative z-10 tracking-tight">
                  No Cover Selected
                </h3>
                <p className="text-xs text-theme-primary opacity-40 max-w-xs relative z-10 font-medium">
                  Upload or select an image from the library to set the face of
                  your article.
                </p>
              </div>
            )}

            {uploading && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center gap-4 z-20">
                <div className="w-12 h-12 border-4 border-white/[0.06]  border-t-[var(--accent)] rounded-full animate-spin shadow-[0_0_20px_rgba(var(--accent-rgb),0.5)]"></div>
                <span className="text-xs font-bold text-white tracking-widest uppercase">
                  Processing...
                </span>
              </div>
            )}
          </div>

          {errors.image && (
            <p className="text-red-400 text-sm font-bold text-center flex items-center justify-center gap-1.5 animate-bounce">
              <AlertCircle size={14} />
              {errors.image}
            </p>
          )}

          {/* Explicit Action Buttons (Mobile-friendly, NO HOVER HIDING) */}
          {canEditMetadata ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full animate-fade-in-up">
              {formData.image && (
                <button
                  type="button"
                  onClick={() => {
                    setImageToCrop(formData.image);
                    setCropModalOpen(true);
                  }}
                  disabled={saving || uploading}
                  className="flex flex-col items-center justify-center gap-2 py-4 px-2 rounded-2xl bg-[#050505] border border-theme-base hover:bg-white/[0.02] hover:border-white/5 transition-all shadow-lg group disabled:opacity-50 disabled:pointer-events-none text-theme-primary">
                  <Crop
                    size={18}
                    className="group-hover:text-[var(--accent)] transition-colors opacity-70 group-hover:opacity-100"
                  />
                  <span className="text-[10px] font-bold tracking-widest uppercase opacity-70">
                    Adjust Crop
                  </span>
                </button>
              )}

              <label
                className={`flex flex-col items-center justify-center gap-2 py-4 px-2 rounded-2xl border transition-all shadow-lg cursor-pointer group disabled:opacity-50 disabled:pointer-events-none ${formData.image ? "bg-[#050505] border-theme-base hover:bg-white/[0.02] hover:border-white/5 text-theme-primary" : "bg-theme-accent/5 border-theme-accent/30 text-theme-accent hover:bg-theme-accent/20 shadow-[0_0_20px_rgba(var(--accent-rgb),0.1)]"}`}>
                {formData.image ? (
                  <Upload
                    size={18}
                    className="opacity-70 group-hover:opacity-100 transition-opacity"
                  />
                ) : (
                  <PlusCircle
                    size={20}
                    className="group-hover:scale-110 transition-transform"
                  />
                )}
                <span className="text-[10px] font-bold tracking-widest uppercase opacity-80">
                  {formData.image ? "Replace File" : "Upload File"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading || saving}
                />
              </label>

              <button
                type="button"
                onClick={() => openMediaLibrary("cover")}
                disabled={saving || uploading}
                className={`flex flex-col items-center justify-center gap-2 py-4 px-2 rounded-2xl border transition-all shadow-lg group disabled:opacity-50 disabled:pointer-events-none ${formData.image ? "bg-[#050505] border-theme-base hover:bg-white/[0.02] hover:border-white/5 text-theme-primary" : "bg-white/[0.02] border-white/[0.06]  hover:bg-white/[0.05] text-theme-primary"}`}>
                <FileImage
                  size={18}
                  className="opacity-70 group-hover:opacity-100 transition-opacity"
                />
                <span className="text-[10px] font-bold tracking-widest uppercase opacity-70">
                  Library
                </span>
              </button>
            </div>
          ) : (
            <div className="w-full text-center p-4 rounded-2xl bg-red-600/10 border border-red-600/20 text-red-400 text-xs font-bold flex items-center justify-center gap-2">
              <AlertCircle size={14} /> You do not have permission to change the
              cover image.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArticleMediaStep;
