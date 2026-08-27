import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  X,
  Image as ImageIcon,
  FileText,
  Link as LinkIcon,
  RefreshCw,
  ChevronRight,
} from "lucide-react";
import ImageCropperModal from "../../components/admin/ImageCropperModal";
import MediaLibrary from "../../components/admin/MediaLibrary";
import { useUpdateForm } from "../../hooks/admin/useUpdateForm";
import { MorphingModal } from "../../components/motion/morphing-modal";
import UpdateMediaSection from "../../components/admin/update-form/UpdateMediaSection";
import UpdateFormSection from "../../components/admin/update-form/UpdateFormSection";

const CreateUpdate = () => {
  const form = useUpdateForm();

  const {
    navigate,
    isEditing,
    canEditMetadata,
    formData,
    setFormData,
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
  } = form;

  const [step, setStep] = useState("link"); // 'link' | 'media' | 'form'
  const [mediaLibraryOpen, setMediaLibraryOpen] = useState(false);

  // Default to form if editing existing post
  useEffect(() => {
    if (isEditing) {
      setStep("form");
    } else {
      setStep("link");
    }
  }, [isEditing]);

  const handleExtractAndContinue = async () => {
    if (link.trim()) {
      await extractData();
    }
    setStep("media");
  };

  return (
    <div className="min-h-screen bg-[#050505] text-theme-primary flex items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden">
      {/* ── Background decoration ── */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#111] to-black"></div>

      <MorphingModal
        viewId={step}
        onClose={() => navigate(-1)}
        className="sm:max-w-[500px]">
        <div className="w-full bg-[var(--admin-card-bg)] flex flex-col min-h-[450px] max-h-[85vh] overflow-hidden relative rounded-3xl border border-white/5 p-2 shadow-2xl">
          {step === "link" && (
            <div className="flex flex-col h-full flex-1">
              <div className="flex justify-between items-center p-3 pb-2 border-b border-white/[0.06]">
                <h3 className="text-[14px] font-bold text-white tracking-wide flex items-center gap-2">
                  <LinkIcon size={16} className="text-white/40" /> Step 1: Link
                </h3>
                <button
                  onClick={() => navigate(-1)}
                  className="text-white/40 hover:text-white bg-white/5 hover:bg-white/10 rounded-full p-1.5 transition-colors">
                  <X size={14} />
                </button>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-center gap-4 min-h-[220px]">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/50">
                    Facebook Post or Article URL
                  </label>
                  <input
                    type="url"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="https://facebook.com/..."
                    disabled={!canEditMetadata}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-all font-mono"
                  />
                  <p className="text-[11px] text-white/30">
                    We'll extract the title, description, and image
                    automatically.
                  </p>
                </div>
              </div>

              <div className="p-3 pt-2 mt-auto flex gap-2">
                <button
                  onClick={() => setStep("media")}
                  className=" px-8 py-3 rounded-2xl text-[13px] font-bold text-white/70 bg-white/[0.04] hover:bg-white/[0.08] active:scale-95 transition-all">
                  Skip 
                </button>
                <button
                  onClick={handleExtractAndContinue}
                  disabled={extracting || !link.trim()}
                  className="flex-1 py-3 rounded-2xl text-[13px] font-bold text-black bg-[var(--accent)] hover:scale-[1.02] active:scale-95 transition-all shadow-md shadow-theme-accent/20 flex items-center justify-center gap-2 disabled:opacity-50">
                  {extracting ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      Extracting...
                    </>
                  ) : (
                    <>
                      Extract & Continue <ChevronRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {step === "media" && (
            <div className="flex flex-col h-full flex-1 min-h-0">
              <div className="flex justify-between items-center p-3 pb-2 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setStep("link")}
                    className="text-white/40 hover:text-white bg-white/5 hover:bg-white/10 rounded-full p-1.5 transition-colors">
                    <ArrowLeft size={14} />
                  </button>
                  <h3 className="text-[14px] font-bold text-white tracking-wide flex items-center gap-2">
                    <ImageIcon size={16} className="text-white/40" /> Step 2:
                    Media (3:4 Poster)
                  </h3>
                </div>
                <button
                  onClick={() => navigate(-1)}
                  className="text-white/40 hover:text-white bg-white/5 hover:bg-white/10 rounded-full p-1.5 transition-colors">
                  <X size={14} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto hide-scrollbar flex flex-col relative min-h-[300px]">
                <UpdateMediaSection
                  formData={formData}
                  canEditMetadata={canEditMetadata}
                  uploading={uploading}
                  saving={saving}
                  extracting={extracting}
                  setImageToCrop={setImageToCrop}
                  setCropModalOpen={setCropModalOpen}
                  handleFileUpload={handleFileUpload}
                  onOpenMediaLibrary={() => setMediaLibraryOpen(true)}
                />
              </div>

              <div className="p-3 pt-2 mt-auto">
                <button
                  onClick={() => setStep("form")}
                  className="w-full py-3 rounded-2xl text-[13px] font-bold text-black bg-[var(--accent)] hover:scale-[1.02] active:scale-95 transition-all shadow-md shadow-theme-accent/20">
                  Next: Details
                </button>
              </div>
            </div>
          )}

          {step === "form" && (
            <div className="flex flex-col h-full flex-1 min-h-0">
              <div className="flex justify-between items-center p-3 pb-2 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setStep("media")}
                    className="text-white/40 hover:text-white bg-white/5 hover:bg-white/10 rounded-full p-1.5 transition-colors">
                    <ArrowLeft size={14} />
                  </button>
                  <h3 className="text-[14px] font-bold text-white tracking-wide flex items-center gap-2">
                    <FileText size={16} className="text-white/40" /> Step 3:
                    Details
                  </h3>
                </div>
                <button
                  onClick={() => navigate(-1)}
                  className="text-white/40 hover:text-white bg-white/5 hover:bg-white/10 rounded-full p-1.5 transition-colors">
                  <X size={14} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto hide-scrollbar flex flex-col relative min-h-[400px] mt-3">
                <UpdateFormSection
                  formData={formData}
                  setFormData={setFormData}
                  link={link}
                  setLink={setLink}
                  canEditMetadata={canEditMetadata}
                  extracting={extracting}
                  saving={saving}
                  isEditing={isEditing}
                  extractData={extractData}
                  handleSave={handleSave}
                  navigate={navigate}
                />
              </div>
            </div>
          )}
        </div>
      </MorphingModal>

      <MediaLibrary
        isOpen={mediaLibraryOpen}
        onClose={() => setMediaLibraryOpen(false)}
        onSelect={(url) => setFormData((prev) => ({ ...prev, image: url }))}
        uploadImage={uploadImage}
        defaultFolder="updates"
      />

      <ImageCropperModal
        isOpen={cropModalOpen}
        onClose={() => {
          setCropModalOpen(false);
          setImageToCrop(null);
        }}
        imageSrc={imageToCrop}
        onCropComplete={handleCropComplete}
        aspectRatio={3 / 4}
        aspectRatioLabel="3:4 Portrait Ratio (Quick Update)"
      />
    </div>
  );
};

export default CreateUpdate;
