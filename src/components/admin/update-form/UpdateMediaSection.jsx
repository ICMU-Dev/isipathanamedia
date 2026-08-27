import React from "react";
import { Image as ImageIcon, Crop, Upload, FolderOpen } from "lucide-react";

const UpdateMediaSection = ({
  formData,
  canEditMetadata,
  uploading,
  saving,
  extracting,
  setImageToCrop,
  setCropModalOpen,
  handleFileUpload,
  onOpenMediaLibrary,
}) => {
  return (
    <div className="w-full flex-1 flex flex-col justify-center min-h-[300px] p-4 relative group overflow-hidden">
      {formData.image ? (
        <div className="relative w-full h-full flex flex-col items-center justify-center">
          <img
            src={formData.image}
            alt="Cover Preview"
            className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl group-hover:opacity-40 transition-opacity duration-300"
          />
          {canEditMetadata && (
            <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-wrap p-2">
              <button
                type="button"
                onClick={() => {
                  setImageToCrop(formData.image);
                  setCropModalOpen(true);
                }}
                disabled={saving}
                className="bg-black/90 px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 border border-[var(--admin-border)] cursor-pointer hover:bg-[var(--accent)] hover:text-black hover:border-[var(--accent)] transition-all shadow-xl disabled:opacity-50 text-white"
              >
                <Crop size={14} /> Crop
              </button>

              {onOpenMediaLibrary && (
                <button
                  type="button"
                  onClick={onOpenMediaLibrary}
                  disabled={saving || uploading}
                  className="bg-black/90 px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 border border-[var(--admin-border)] cursor-pointer hover:bg-white hover:text-black transition-all shadow-xl text-white"
                >
                  <FolderOpen size={14} /> Media Library
                </button>
              )}

              <label className="bg-black/90 px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 border border-[var(--admin-border)] cursor-pointer hover:bg-white hover:text-black transition-all shadow-xl text-white">
                <Upload size={14} /> Replace
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading || saving || extracting}
                />
              </label>
            </div>
          )}
        </div>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-white/10 border-2 border-dashed border-[var(--admin-border)] rounded-2xl p-6 text-center bg-white/[0.01]">
          <div className="w-14 h-14 rounded-full bg-[var(--admin-border)] border border-white/[0.06] flex items-center justify-center mb-4 shadow-inner">
            <ImageIcon size={24} className="text-[var(--accent)] opacity-75" />
          </div>
          <p className="text-xs font-bold opacity-75 tracking-widest uppercase mb-1 text-[var(--admin-text-primary)]">
            Media Attachment
          </p>
          <p className="text-[11px] mt-1 opacity-50 max-w-[240px] mb-6 leading-relaxed text-[var(--admin-text-secondary)]">
            Paste a link to extract automatically, select from Media Library, or upload a new file.
          </p>

          {canEditMetadata && (
            <div className="flex items-center gap-2 flex-wrap justify-center">
              {onOpenMediaLibrary && (
                <button
                  type="button"
                  onClick={onOpenMediaLibrary}
                  disabled={uploading || saving || extracting}
                  className="px-4 py-2.5 bg-[var(--accent)] text-black rounded-xl text-xs font-bold hover:opacity-95 transition-all flex items-center gap-2 shadow-sm"
                >
                  <FolderOpen size={14} /> Media Library
                </button>
              )}
              <label className="px-4 py-2.5 bg-[var(--admin-input-bg)] hover:bg-[var(--admin-border)] text-[var(--admin-text-primary)] rounded-xl text-xs font-bold cursor-pointer transition-all border border-[var(--admin-border)] flex items-center gap-2">
                <Upload size={14} /> Upload File
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading || saving || extracting}
                />
              </label>
            </div>
          )}
        </div>
      )}

      {uploading && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center gap-4 z-10">
          <div className="w-10 h-10 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(var(--accent-rgb),0.5)]"></div>
          <p className="text-[var(--admin-text-primary)] text-sm font-bold animate-pulse">
            Uploading Cover to updates/...
          </p>
        </div>
      )}
    </div>
  );
};

export default UpdateMediaSection;
