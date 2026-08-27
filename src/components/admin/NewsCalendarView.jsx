import React from "react";
import {
  Calendar,
  Link as LinkIcon,
  CheckCircle,
  Edit2,
  X,
  Trash2,
  BadgeCheck,
} from "lucide-react";
import {
  resolveAuthorInfo,
} from "./NewsUtils";
import iconLogo from "../../assets/image.png";

const NewsCalendarView = ({
  filteredData,
  isAdmin,
  activeTab,
  setViewingArticle,
  webUsers = [],
  handleApprove,
  handleEdit,
  handleReject,
  handleDelete,
}) => {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar min-h-[50vh]">
      {[
        ...new Set(
          filteredData.map((i) => new Date(i.date).toLocaleDateString()),
        ),
      ]
        .sort((a, b) => new Date(b) - new Date(a))
        .map((dateStr) => (
          <div
            key={dateStr}
            className="min-w-[300px] w-[300px] flex flex-col gap-3 bg-[#0c0c0e]/80 rounded-2xl p-3 border border-white/[0.06] shadow-xl">
            <div className="flex items-center justify-between px-1 mb-1 border-b border-white/[0.06] pb-2">
              <h3 className="font-bold text-xs text-theme-accent uppercase tracking-wider flex items-center gap-1.5">
                <Calendar size={13} />
                {dateStr}
              </h3>
              <span className="text-[10px] font-bold font-mono bg-theme-accent/10 px-2 py-0.5 rounded-full text-theme-accent border border-theme-accent/20">
                {
                  filteredData.filter(
                    (i) => new Date(i.date).toLocaleDateString() === dateStr,
                  ).length
                }
              </span>
            </div>
            <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[60vh] custom-scrollbar pr-1">
              {filteredData
                .filter(
                  (i) => new Date(i.date).toLocaleDateString() === dateStr,
                )
                .map((item) => {
                  const isArticle = item.type !== "update";
                  const { isICMU, authorName, submitterName, avatarUrl, initials } =
                    resolveAuthorInfo(item, webUsers);

                  return (
                    <div
                      key={item.id}
                      className="relative flex flex-col p-3.5 rounded-2xl bg-[#121216] border border-white/[0.06] hover:border-white/[0.14] transition-all group shadow-sm cursor-pointer"
                      onClick={() => setViewingArticle(item)}>
                      {/* Compact Card Header */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        {isArticle ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-3xl  text-[9px] font-bold uppercase tracking-wider bg-white/[0.06] text-white/90 border border-white/[0.08]">
                            {item.category || "General"}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-3xl  text-[9px] font-bold uppercase tracking-wider bg-theme-accent/10 text-theme-accent border border-theme-accent/20">
                            <LinkIcon size={9} /> Update
                          </span>
                        )}
                      </div>
                      <h4 className="text-[13px] font-bold text-white line-clamp-2 mb-2.5 leading-snug">
                        {isArticle 
                          ? item.title || "Untitled Article" 
                          : (item.content ? item.content.replace(/<[^>]*>?/gm, '') : "Quick Update")}
                      </h4>

                      <div className="mt-auto flex items-center justify-between pt-2 border-t border-white/[0.05] gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-5 h-5 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                            {isICMU ? (
                              <img
                                src={iconLogo}
                                alt="ICMU"
                                className="w-full h-full object-cover opacity-95"
                              />
                            ) : avatarUrl ? (
                              <img
                                src={avatarUrl}
                                alt={authorName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-[8px] font-bold text-white/80">
                                {initials}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-[10px] font-semibold text-white/90 truncate flex items-center gap-1 leading-tight">
                              {authorName}
                              {isICMU && (
                                <BadgeCheck
                                  size={11}
                                  className="text-[#050505] fill-theme-accent shrink-0"
                                />
                              )}
                            </span>
                            {isICMU && submitterName && (
                              <span className="text-[8px] text-white/40 font-mono truncate leading-none mt-0.5">
                                Sub: {submitterName}
                              </span>
                            )}
                          </div>
                        </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {activeTab === "pending" ? (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApprove(item.id);
                              }}
                              className="p-1 hover:bg-theme-accent/20 rounded text-theme-accent "
                              title="Accept">
                              <CheckCircle size={12} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReject(item.id);
                              }}
                              className="p-1 hover:bg-orange-600/20 rounded text-orange-400"
                              title="Needs Attention">
                              <X size={12} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(item.id);
                              }}
                              className="p-1 hover:bg-[var(--admin-input-bg)] rounded text-[var(--admin-text-secondary)] hover:text-white"
                              title="Edit">
                              <Edit2 size={12} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(item.id);
                              }}
                              className="p-1 hover:bg-red-600/20 rounded text-red-400"
                              title="Delete">
                              <Trash2 size={12} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
    </div>
  );
};

export default React.memo(NewsCalendarView);
