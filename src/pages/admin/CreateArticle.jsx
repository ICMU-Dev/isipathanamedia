import React, { useState, useEffect } from "react";
import {
  Save,
  CheckCircle2,
  X,
  Type,
  EyeOff,
  ArrowRight,
  ImageIcon,
  Send,
  SendIcon,
} from "lucide-react";
import MediaLibrary from "../../components/admin/MediaLibrary";
import ImageCropperModal from "../../components/admin/ImageCropperModal";
import DiscardChangesModal from "../../components/admin/DiscardChangesModal";
import { useArticleForm } from "../../hooks/admin/useArticleForm";
import { MorphingModal } from "../../components/motion/morphing-modal";
import TagInput from "../../components/admin/article-wizard/TagInput";
import ArticleStepper from "../../components/admin/article-wizard/ArticleStepper";
import MenuBar from "../../components/admin/article-wizard/MenuBar";
import { EditorContent } from "@tiptap/react";
import { AnimatePresence } from "framer-motion";
import { motion } from "framer-motion";

const CreateArticle = () => {
  const form = useArticleForm();

  const {
    id,
    navigate,
    isAdmin,
    user,
    currentStep,
    formData,
    setFormData,
    uploading,
    saving,
    errors,
    setErrors,
    mediaLibraryOpen,
    setMediaLibraryOpen,
    isAnonymous,
    setIsAnonymous,
    canEditMetadata,
    isEditing,
    isDirty,
    cropModalOpen,
    setCropModalOpen,
    imageToCrop,
    setImageToCrop,
    editor,
    handleFileUpload,
    handleCropComplete,
    openMediaLibrary,
    handleMediaSelect,
    handleNext,
    handleSave,
    uploadImage,
    setCurrentStep,
  } = form;

  const [showDiscardModal, setShowDiscardModal] = useState(false);

  // Check if article content has been written
  const isContentWritten = Boolean(
    formData.content &&
    formData.content !== "<p></p>" &&
    formData.content.replace(/<[^>]*>?/gm, "").trim().length > 0
  );

  // Determine if the article is half-written or has unsaved edits
  const isHalfWritten = isEditing
    ? isDirty
    : isDirty ||
      Boolean(
        formData.title?.trim() ||
        formData.category?.trim() ||
        isContentWritten ||
        formData.image ||
        (formData.tags && formData.tags.length > 0)
      );

  const handleRequestClose = () => {
    if (isHalfWritten) {
      setShowDiscardModal(true);
    } else {
      navigate(-1);
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isHalfWritten) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isHalfWritten]);

  const viewId = `step-${currentStep}`;

  return (
    <div className="min-h-screen bg-[#050505] text-theme-primary flex items-center justify-center p-2 sm:p-2 font-sans relative overflow-hidden">
      {/* ── Background decoration ── */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#111] to-black"></div>

      <MorphingModal
        viewId={viewId}
        onClose={handleRequestClose}
        className="sm:max-w-[720px]">
        <div className="w-full bg-[var(--admin-card-bg)]   flex flex-col min-h-[400px] max-h-[95vh] overflow-hidden relative rounded-3xl  border border-white/5 shadow-2xl">
          <div className="flex justify-between items-center p-3 pb-2 border-b border-white/[0.06]">
             <h3 className="text-[14px] font-bold text-white tracking-wide">
               {isEditing ? "Edit Article" : "Write Article"}
             </h3>
             <button
               onClick={handleRequestClose}
               className="text-white/40 hover:text-white bg-white/5 hover:bg-white/10 rounded-full p-1.5 transition-colors cursor-pointer">
               <X size={14} />
             </button>
          </div>
          <ArticleStepper 
            currentStep={currentStep} 
            setCurrentStep={setCurrentStep} 
            isEdit={!!form.id}
          />
          {currentStep === 1 && (
            <div className="flex flex-col h-full flex-1 min-h-0">
              <div className="flex-1 overflow-y-auto hide-scrollbar p-3 space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between ml-1">
                    <label className="block text-[10px] font-bold text-theme-primary opacity-50 uppercase tracking-widest">
                      Title *
                    </label>
                    <span className="text-[10px] font-mono text-theme-primary opacity-40">
                      {formData.title.length}/100
                    </span>
                  </div>
                  <input
                    type="text"
                    value={formData.title}
                    maxLength={100}
                    onChange={(e) => {
                      setFormData({ ...formData, title: e.target.value });
                      if (errors.title)
                        setErrors((p) => ({ ...p, title: null }));
                    }}
                    disabled={!canEditMetadata}
                    placeholder="Enter article title..."
                    className={`w-full bg-[var(--admin-input-bg)]   border ${errors.title ? "border-red-600/50" : "border-theme-base"} rounded-2xl px-4 py-3 text-sm text-theme-primary focus:outline-none focus:border-theme-accent/40 transition-all`}
                  />
                  {errors.title && (
                    <p className="text-red-400 text-xs ml-1 mt-1">
                      {errors.title}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between ml-1">
                      <label className="block text-[10px] font-bold text-theme-primary opacity-50 uppercase tracking-widest">
                        Category *
                      </label>
                      <span className="text-[10px] font-mono text-theme-primary opacity-40">
                        {formData.category.length}/40
                      </span>
                    </div>
                    <input
                      type="text"
                      value={formData.category}
                      maxLength={40}
                      onChange={(e) => {
                        setFormData({ ...formData, category: e.target.value });
                        if (errors.category)
                          setErrors((p) => ({ ...p, category: null }));
                      }}
                      disabled={!canEditMetadata}
                      placeholder="e.g. Events, Tech"
                      className={`w-full bg-[var(--admin-input-bg)]   border ${errors.category ? "border-red-600/50" : "border-theme-base"} rounded-2xl px-4 py-3 text-sm text-theme-primary focus:outline-none focus:border-theme-accent/40 transition-all`}
                    />
                    {errors.category && (
                      <p className="text-red-400 text-xs ml-1 mt-1">
                        {errors.category}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-theme-primary opacity-50 uppercase tracking-widest ml-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                      disabled={!canEditMetadata}
                      className={`w-full bg-[var(--admin-input-bg)] border ${errors.date ? "border-red-600/50" : "border-theme-base"} rounded-2xl px-4 py-3 text-sm text-theme-primary focus:outline-none focus:border-theme-accent/40 transition-all [color-scheme:dark]`}
                    />
                    {errors.date && <p className="text-red-400 text-xs ml-1 mt-1">{errors.date}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <TagInput
                    tags={formData.tags || []}
                    setTags={(tags) => setFormData((p) => ({ ...p, tags }))}
                    disabled={!canEditMetadata}
                    error={errors.tags}
                  />
                </div>
              </div>

              <div className="p-3 pt-2 mt-auto border-t border-white/[0.06] ">
                <button
                  onClick={handleNext}
                  className="w-full py-3 rounded-2xl text-[13px] font-bold text-black bg-[var(--accent)] hover:scale-[1.02] active:scale-95 transition-all shadow-md flex items-center justify-center gap-2">
                  Next: Content <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="flex flex-col h-full flex-1 min-h-0 ">

              <div className="flex-1 overflow-y-auto hide-scrollbar p-2 sm:p-3 flex flex-col relative min-h-[400px]">
                <div
                  className={`flex flex-col flex-1 border ${errors.content ? "border-red-600/50" : "border-theme-base"} rounded-2xl overflow-hidden focus-within:border-theme-accent/40 transition-colors bg-[#050505]`}>
                  <MenuBar
                    editor={editor}
                    onInsertImage={() => openMediaLibrary("inline")}
                  />
                  <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <EditorContent
                      editor={editor}
                      className="h-full min-h-[300px]"
                    />
                  </div>
                </div>
                {errors.content && (
                  <p className="text-red-400 text-xs ml-1 mt-2">
                    {errors.content}
                  </p>
                )}
              </div>

              <div className="p-3 pt-2 mt-auto border-t border-white/[0.06] ">
                <button
                  onClick={handleNext}
                  className="w-full py-3 rounded-2xl text-[13px] font-bold text-black bg-[var(--accent)] hover:scale-[1.02] active:scale-95 transition-all shadow-md flex items-center justify-center gap-2">
                  Next: Cover Image <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="flex flex-col h-full flex-1 min-h-0">

              <div className="flex-1 overflow-y-auto hide-scrollbar p-3 space-y-6">
                <div className="space-y-4">
                  <label className="block text-[10px] font-bold text-theme-primary opacity-50 uppercase tracking-widest ml-1">
                    Cover Image *
                  </label>
                  {formData.image ? (
                    <div className="relative rounded-3xl  overflow-hidden border border-theme-base bg-[#050505] group">
                      <img
                        src={formData.image}
                        alt="Cover"
                        className="w-full aspect-video object-cover"
                      />
                      {canEditMetadata && (
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                          <button
                            onClick={() =>
                              setFormData({ ...formData, image: "" })
                            }
                            className="px-4 py-2 bg-red-600/20 text-red-600 rounded-2xl text-sm font-bold hover:bg-red-600/30">
                            Remove
                          </button>
                          <button
                            onClick={() => openMediaLibrary("cover")}
                            className="px-4 py-2 bg-white/10 text-white rounded-2xl text-sm font-bold hover:bg-white/20">
                            Change
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-theme-base rounded-2xl p-6 md:p-8 bg-[#050505] flex flex-col items-center justify-center text-center gap-4 transition-colors hover:border-theme-accent/50">
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-theme-primary/50">
                        <ImageIcon size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-theme-primary mb-1">
                          Upload Cover Image
                        </p>
                        <p className="text-xs text-theme-primary/40">
                          16:9 ratio recommended
                        </p>
                      </div>
                      <div className="flex gap-3 mt-2">
                        <label className="cursor-pointer px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-xs font-bold transition-all">
                          Upload File
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>
                        <button
                          onClick={() => openMediaLibrary("cover")}
                          className="px-4 py-2 bg-theme-accent/10 text-theme-accent hover:bg-theme-accent/20 rounded-2xl text-xs font-bold transition-all">
                          Library
                        </button>
                      </div>
                    </div>
                  )}
                  {errors.image && (
                    <p className="text-red-400 text-xs ml-1">{errors.image}</p>
                  )}
                </div>
              </div>

              <div className="p-3 pt-2 mt-auto border-t border-white/[0.06] ">
                <button
                  onClick={handleNext}
                  disabled={uploading || saving}
                  className="w-full py-3 rounded-2xl text-[13px] font-bold text-black bg-[var(--accent)] hover:scale-[1.02] active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50">
                  Next: Finalize <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="flex flex-col h-full flex-1 min-h-0">
              <div className="flex-1 overflow-y-auto hide-scrollbar p-5 flex flex-col justify-center items-center text-center">
                <div className="w-16 h-16 rounded-full bg-theme-accent/ text-[var(--accent)] flex items-center justify-center mb-4">
                  <SendIcon size={24} />
                </div>
                <h2 className="text-lg font-bold text-white mb-2">
                  Ready to {id ? "Update" : "Publish"}?
                </h2>
                <p className="text-sm text-white/40 mb-8 max-w-sm">
                  Review your article before publishing. You can save it as a
                  draft or publish it immediately.
                </p>

                <label className="flex items-center   gap-4 p-4 border border-theme-base bg-[#050505] rounded-2xl mb-6 cursor-pointer w-full max-w-sm hover:border-white/20 transition-all group active:scale-90 hover:shadow-lg shadow-black/50">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="sr-only"
                  />
                  <div className="w-12 h-12 rounded-full shrink-0 border-2 border-white/[0.06]  group-hover:border-theme-accent/ transition-colors relative overflow-hidden bg-[var(--admin-card-bg)]  ">
                    <AnimatePresence mode="wait">
                      {isAnonymous ? (
                        <motion.img
                          key="icmu"
                          initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
                          animate={{ opacity: 1, scale: 1, rotate: 0 }}
                          exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
                          transition={{ duration: 0.2 }}
                          src="/web-app-manifest-192x192.png"
                          alt="ICMU"
                          className="w-full h-full object-cover  bg-white"
                        />
                      ) : user?.profile_picture ||
                        user?.profile_image ||
                        user?.image ? (
                        <motion.img
                          key="user-img"
                          initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
                          animate={{ opacity: 1, scale: 1, rotate: 0 }}
                          exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
                          transition={{ duration: 0.2 }}
                          src={
                            user.profile_picture ||
                            user.profile_image ||
                            user.image
                          }
                          alt="User"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <motion.div
                          key="user-initial"
                          initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
                          animate={{ opacity: 1, scale: 1, rotate: 0 }}
                          exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
                          transition={{ duration: 0.2 }}
                          className="w-full h-full bg-white/5 flex items-center justify-center text-sm font-bold text-white uppercase">
                          {user?.name?.charAt(0) ||
                            user?.indexNumber?.charAt(0) ||
                            "U"}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="flex flex-col text-left min-w-0">
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-0.5">
                      Publishing As
                    </span>
                    <span className="text-sm font-bold text-white truncate transition-colors group-hover:text-[var(--accent)]">
                      {isAnonymous
                        ? "Isipathana College Media Unit"
                        : user?.name || user?.username || "You"}
                    </span>
                    <span className="text-[10px] text-theme-accent/ mt-0.5 opacity-50 group-hover:opacity-100 transition-opacity">
                      Click to switch identity
                    </span>
                  </div>
                </label>

                <div className="w-full max-w-sm mb-6 flex flex-col gap-2 text-left">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">
                    Visibility
                  </label>
                  <select
                    value={formData.visibility || 'public'}
                    onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                    className="w-full bg-[#0a0a0a] border border-theme-base rounded-2xl px-4 py-3 text-sm text-theme-primary focus:outline-none focus:border-theme-accent/40 transition-all cursor-pointer">
                    <option value="public">  Public</option>
                    <option value="private"> Private </option>
                    <option value="unlisted"> Unlisted</option>
                  </select>
                </div>
              </div>

              <div className="p-3 pt-2 mt-auto border-t border-white/[0.06] flex flex-col sm:flex-row gap-2">
                {formData.status === "published" ? (
                  <button
                    onClick={() => handleSave("published")}
                    disabled={saving}
                    className="w-full py-3 rounded-2xl text-[13px] font-bold text-black bg-[var(--accent)] hover:scale-[1.02] active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50">
                    <CheckCircle2 size={16} />
                    {saving ? "Saving Changes..." : "Save Changes"}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => handleSave(id ? formData.status : "draft")}
                      disabled={saving}
                      className="w-full sm:w-1/2 py-3 rounded-2xl text-[13px] font-bold text-white/70 bg-white/5 hover:bg-white/10 transition-all disabled:opacity-50 border border-white/5">
                      {saving ? "Saving..." : id ? "Save Changes" : "Save Draft"}
                    </button>
                    {isAdmin ? (
                      <button
                        onClick={() => handleSave("published")}
                        disabled={saving}
                        className="w-full sm:w-1/2 py-3 rounded-2xl text-[13px] font-bold text-black bg-[var(--accent)] hover:scale-[1.02] active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50">
                        <CheckCircle2 size={16} />{" "}
                        {saving ? "Publishing..." : "Publish"}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSave("pending")}
                        disabled={saving}
                        className="w-full sm:w-1/2 py-3 rounded-2xl text-[13px] font-bold text-white bg-blue-500 hover:bg-blue-600 active:scale-95 transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50">
                        <SendIcon size={16} />{" "}
                        {saving ? "Submitting..." : "Submit for Review"}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </MorphingModal>

      <MediaLibrary
        isOpen={mediaLibraryOpen}
        onClose={() => setMediaLibraryOpen(false)}
        onSelect={handleMediaSelect}
        uploadImage={uploadImage}
        defaultFolder="articles"
      />

      <ImageCropperModal
        isOpen={cropModalOpen}
        imageSrc={imageToCrop}
        onClose={() => {
          setCropModalOpen(false);
          setImageToCrop(null);
        }}
        onCropComplete={handleCropComplete}
        aspectRatio={16 / 9}
        aspectRatioLabel="16:9 Widescreen Ratio (Article)"
      />

      <DiscardChangesModal
        isOpen={showDiscardModal}
        onDiscard={() => {
          setShowDiscardModal(false);
          navigate(-1);
        }}
        onKeepEditing={() => setShowDiscardModal(false)}
        title="Discard Article?"
        description="Your article is currently in progress. If you leave now, your unsaved changes will be lost."
      />
    </div>
  );
};

export default CreateArticle;

