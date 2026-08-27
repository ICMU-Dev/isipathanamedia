import React from "react";
import {
  X,
  FileText,
  UserPen,
  Calendar,
  CheckCircle,
  Edit2,
  Trash2,
  Globe,
  EyeOff,
  Link as LinkIcon,
} from "lucide-react";
import DOMPurify from 'dompurify';
import ImageWithLoader from "../ui/ImageWithLoader";
import { resolveBadgeInfo } from "./NewsUtils";

const QuickViewModal = ({
  viewingArticle,
  setViewingArticle,
  isAdmin,
  activeTab,
  getStatusColor,
  getCategoryColor,
  handleApprove,
  handleEdit,
  handleReject,
  handleDelete,
}) => {
  if (!viewingArticle) return null;

  const badge = resolveBadgeInfo(viewingArticle);

  return (
    <div className="fixed inset-0 z-[100] touch-none flex items-center justify-center md:p-4 lg:p-6 bg-black/80 backdrop-blur-sm">
      <div
        className="absolute inset-0"
        onClick={() => setViewingArticle(null)}></div>
      <div className="scale-[0.75] sm:scale-[0.85] rounded-2xl sm:rounded-2xl md:scale-[0.95] lg:scale-[1] relative w-full max-w-6xl h-[100dvh] md:h-[90vh] bg-theme-bg border-0 md:border border-theme-base md:rounded-3xl shadow-2xl flex flex-col animate-in zoom-in-95 fade-in duration-300 overflow-hidden">
        {/* Header */}
        <div className="flex  items-center justify-between px-3 py-4 border-b border-theme-base bg-[var(--admin-border)] shrink-0">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-theme-primary opacity-90 text-xs sm:text-sm uppercase tracking-widest">
              Article Preview
            </h3>
            <span
              className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-2xl border flex items-center gap-1.5 ${badge.className}`}>
              {badge.type === "private" ? (
                <EyeOff size={11} />
              ) : badge.type === "unlisted" ? (
                <LinkIcon size={11} />
              ) : badge.type === "public" ? (
                <Globe size={11} />
              ) : null}
              <span>{badge.label}</span>
            </span>
          </div>
          <button
            onClick={() => setViewingArticle(null)}
            className="p-2 rounded-full bg-[var(--admin-bg)] hover:bg-[var(--admin-border)] text-theme-primary opacity-50 hover:text-theme-primary transition-all shrink-0">
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col md:flex-row flex-1 overflow-y-auto md:overflow-hidden min-h-0 custom-scrollbar">
          {/* Left Column - Fixed Width, Image, Meta, Actions */}
          <div className="w-full md:w-[350px] lg:w-[400px] shrink-0 md:border-r border-theme-base bg-[var(--admin-input-bg)] flex flex-col md:overflow-y-auto custom-scrollbar">
            {/* Image Section */}
            {viewingArticle.image ? (
              <div className="relative w-full bg-black/40 flex items-center justify-center p-3 shrink-0 border-b border-[var(--admin-border)]">
                <ImageWithLoader
                  src={viewingArticle.image}
                  alt={viewingArticle.title}
                  imageClassName="w-full h-auto max-h-[45vh] object-contain rounded-xl shadow-lg"
                />
                <div className="absolute bottom-4 left-4 z-10">
                  <span
                    className={`backdrop-blur-md bg-black/60 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border shadow-sm ${getCategoryColor(viewingArticle.category)}`}>
                    {viewingArticle.category || "Uncategorized"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="w-full aspect-video md:aspect-[4/3] bg-theme-bg flex items-center justify-center shrink-0 border-b border-theme-base">
                <div className="text-center">
                  <FileText
                    size={32}
                    className="mx-auto text-theme-primary opacity-20 mb-2"
                  />
                  <span
                    className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1   !rounded-2xl border ${getCategoryColor(viewingArticle.category)}`}>
                    {viewingArticle.category || "Uncategorized"}
                  </span>
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="p-5 md:p-6 flex-1 flex flex-col gap-5 border-b border-theme-base md:border-b-0">
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-theme-primary opacity-40">
                  Article Details
                </h4>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-[var(--admin-border)] rounded-2xl shrink-0">
                    <UserPen size={14} className="text-theme-accent/80" />
                  </div>
                  <div>
                    <p className="text-[10px] text-theme-primary opacity-50 uppercase tracking-widest font-semibold mb-0.5">
                      Author / Submitter
                    </p>
                    <p className="text-xs text-theme-primary opacity-90 font-medium">
                      {viewingArticle.author ||
                        viewingArticle.submitted_by ||
                        "Anonymous"}
                    </p>
                    {!viewingArticle.author && viewingArticle.submitted_by && (
                      <span className="inline-block mt-1 text-[9px] bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded text-amber-400 font-bold uppercase tracking-widest">
                        Hidden Author
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-[var(--admin-border)] rounded-2xl shrink-0">
                    <Calendar size={14} className="text-theme-accent/80" />
                  </div>
                  <div>
                    <p className="text-[10px] text-theme-primary opacity-50 uppercase tracking-widest font-semibold mb-0.5">
                      Created Date
                    </p>
                    <p className="text-xs text-theme-primary opacity-90 font-medium">
                      {new Date(viewingArticle.date).toLocaleDateString(
                        "en-US",
                        { year: "numeric", month: "long", day: "numeric" },
                      )}
                    </p>
                  </div>
                </div>

                {isAdmin &&
                  !viewingArticle.author &&
                  viewingArticle.submitted_by && (
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-red-600/10 rounded-2xl shrink-0 border border-red-600/20">
                        <UserPen size={14} className="text-red-400" />
                      </div>
                      <div>
                        <p className="text-[10px] text-red-400/60 uppercase tracking-widest font-semibold mb-0.5">
                          System Submitter
                        </p>
                        <p className="text-xs text-theme-primary opacity-90 font-medium">
                          {viewingArticle.submitted_by}
                        </p>
                      </div>
                    </div>
                  )}
              </div>

              <div className="mt-auto pt-6">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-theme-primary opacity-40 mb-3">
                  Actions
                </h4>
                <div className="flex flex-col gap-2.5">
                  {activeTab === "pending" ? (
                    <>
                      {isAdmin && (
                        <button
                          onClick={() => {
                            handleApprove(viewingArticle.id);
                            setViewingArticle(null);
                          }}
                          className="w-full px-4 py-3 rounded-2xl bg-[var(--accent)] text-black text-xs font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(var(--accent-rgb),0.2)] hover:shadow-[0_0_30px_rgba(var(--accent-rgb),0.4)]">
                          <CheckCircle size={16} /> Approve & Publish
                        </button>
                      )}
                      <button
                        onClick={() => {
                          handleEdit(viewingArticle.id);
                          setViewingArticle(null);
                        }}
                        className="w-full px-4 py-3 rounded-2xl bg-[var(--admin-border)] border border-theme-base text-theme-primary opacity-80 text-xs font-bold hover:bg-[var(--admin-border)] transition-colors flex items-center justify-center gap-2">
                        <Edit2 size={16} />{" "}
                        Edit Article
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => {
                            handleReject(viewingArticle.id);
                            setViewingArticle(null);
                          }}
                          className="w-full px-4 py-3 rounded-2xl bg-transparent border border-red-600/30 text-red-400 text-xs font-bold hover:bg-red-600/10 transition-colors flex items-center justify-center gap-2">
                          <X size={16} /> Decline
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          handleEdit(viewingArticle.id);
                          setViewingArticle(null);
                        }}
                        className="w-full px-4 py-3 rounded-2xl bg-[var(--admin-border)] border border-theme-base text-theme-primary opacity-80 text-xs font-bold hover:bg-[var(--admin-border)] transition-colors flex items-center justify-center gap-2">
                        <Edit2 size={16} /> Edit Article
                      </button>
                      <button
                        onClick={() => {
                          handleDelete(viewingArticle.id);
                          setViewingArticle(null);
                        }}
                        className="w-full px-4 py-3 rounded-2xl bg-transparent border border-red-600/30 text-red-400 text-xs font-bold hover:bg-red-600/10 transition-colors flex items-center justify-center gap-2">
                        <Trash2 size={16} /> Delete Article
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Title and Prose Content */}
          <div className="flex-none md:flex-1 md:overflow-y-auto custom-scrollbar p-6 md:p-10 lg:p-12">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-theme-primary mb-8 leading-tight tracking-tight">
              {viewingArticle.title}
            </h1>

            <div className="prose prose-invert prose-lg max-w-none text-theme-primary opacity-70 leading-relaxed font-light prose-p:mb-6 prose-headings:text-theme-primary prose-headings:opacity-90 prose-a:text-theme-accent prose-a:no-underline hover:prose-a:underline">
              <div
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(viewingArticle.content || "No content available."),
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
