import React from "react";
import { EditorContent } from "@tiptap/react";
import { UserPen, AlertCircle } from "lucide-react";
import MenuBar from "./MenuBar";

const ArticleContentStep = ({
  formData,
  setFormData,
  errors,
  setErrors,
  canEditMetadata,
  editor,
  openMediaLibrary,
}) => {
  return (
    <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="p-4 md:p-8 border-b border-theme-base bg-[#050505]/50 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-theme-accent/5 flex items-center justify-center text-theme-accent shrink-0">
          <UserPen size={18} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-theme-primary">
            Write Content
          </h2>
          <p className="text-theme-primary opacity-40 text-xs font-medium">
            Give your article a catchy title and write the main content.
          </p>
        </div>
      </div>
      <div className="p-4 md:p-8 flex-1 flex flex-col gap-4 md:gap-6">
        <div className="space-y-2">
          <label className="block text-[10px] font-bold text-theme-primary opacity-50 uppercase tracking-widest ml-1">
            Article / Post Heading (Title) *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => {
              setFormData({ ...formData, title: e.target.value });
              if (errors.title) setErrors((p) => ({ ...p, title: null }));
            }}
            disabled={!canEditMetadata}
            placeholder="Enter manual heading / title for this update..."
            className={`w-full bg-[#050505] border ${errors.title ? "border-red-600/50" : "border-theme-base"} rounded-2xl px-4 md:px-5 py-3 md:py-4 text-base md:text-xl font-bold text-theme-primary focus:outline-none focus:border-theme-accent/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
          />
          {errors.title && (
            <p className="text-red-400 text-xs ml-1 flex items-center gap-1 mt-1">
              <AlertCircle size={12} />
              {errors.title}
            </p>
          )}
        </div>
        <div className="flex-1 flex flex-col min-h-[300px] md:min-h-[400px]">
          <label className="block text-[10px] font-bold text-theme-primary opacity-50 uppercase tracking-widest ml-1 mb-2">
            Content *
          </label>
          <div
            className={`flex flex-col flex-1 border ${errors.content ? "border-red-600/50" : "border-theme-base"} rounded-2xl overflow-hidden focus-within:border-theme-accent/40 transition-colors bg-[#050505]`}>
            <MenuBar
              editor={editor}
              onInsertImage={() => openMediaLibrary("inline")}
            />
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <EditorContent editor={editor} className="h-full" />
            </div>
          </div>
          {errors.content && (
            <p className="text-red-400 text-xs ml-1 flex items-center gap-1 mt-2">
              <AlertCircle size={12} />
              {errors.content}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArticleContentStep;
