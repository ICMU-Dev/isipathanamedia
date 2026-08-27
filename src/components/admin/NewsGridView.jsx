import React, { useState, useEffect } from "react";
import {
  Calendar,
  Link as LinkIcon,
  EyeOff,
  CheckSquare,
  Square,
  Eye,
  Globe,
  BadgeCheck,
  MoreHorizontal,
  ExternalLink,
  Clock,
  FileEdit,
  XCircle,
  BarChart2,
  Copy,
  Edit2,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  getCategoryColor,
  getStatusColor,
  getRelativeDateLabel,
  resolveAuthorInfo,
  resolveBadgeInfo,
  getSourcePlatform,
  PlatformIcon,
} from "./NewsUtils";
import ImageWithLoader from "../ui/ImageWithLoader";
import iconLogo from "../../assets/image.png";

const NewsGridView = ({
  filteredData,
  isSelecting,
  selectedIds,
  toggleSelection,
  setViewingArticle,
  webUsers = [],
  activeTab,
  handleApprove,
  handleEdit,
  handleReject,
  handleDelete,
}) => {
  const [openDropdownId, setOpenDropdownId] = useState(null);

  useEffect(() => {
    const handleClickOutside = () => setOpenDropdownId(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleCopyLink = (e, item) => {
    e.stopPropagation();
    const url = `${window.location.origin}/news/${item.id}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied!");
    setOpenDropdownId(null);
  };

  // Group the data
  const groupedData = filteredData.reduce((acc, item) => {
    const label = getRelativeDateLabel(item.date);
    if (!acc[label]) {
      acc[label] = { label, items: [], maxDate: new Date(item.date).getTime() };
    }
    acc[label].items.push(item);
    acc[label].maxDate = Math.max(
      acc[label].maxDate,
      new Date(item.date).getTime(),
    );
    return acc;
  }, {});

  const sortedGroups = Object.values(groupedData).sort(
    (a, b) => b.maxDate - a.maxDate,
  );

  return (
    <div className="flex flex-col gap-6">
      {sortedGroups.map(({ label, items: dateItems }) => {
        return (
          <div key={label} className="flex flex-col gap-2.5">
            {/* Date Group Header */}
            <div className="flex items-center gap-2 border-b border-white/[0.06] pb-1.5 mb-0.5">
              <Calendar size={14} className="text-theme-accent" />
              <h2 className="text-xs font-bold text-white/80 uppercase tracking-widest">
                {label}
              </h2>
              <span className="text-[10px] bg-white/[0.06] border border-white/[0.06] px-2 py-0.5 rounded-full text-white/50 font-mono font-medium">
                {dateItems.length}
              </span>
            </div>

            {/* Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {dateItems.map((item) => {
                const isArticle = item.type !== "update";
                const { isICMU, authorName, submitterName, avatarUrl, initials } =
                  resolveAuthorInfo(item, webUsers);
                const badge = resolveBadgeInfo(item);
                const sourcePlatform = getSourcePlatform(item.original_link);

                // Submitter initials
                const submitterInitials = submitterName
                  ? submitterName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()
                  : "U";

                return (
                  <div
                    key={item.id}
                    className={`group relative bg-[#0c0c0e]/20 hover:bg-[#0c0c0e]/50 border border-white/[0.08] hover:border-white/[0.18] rounded-2xl sm:rounded-3xl flex flex-col overflow-hidden transition-all duration-300 shadow-md hover:shadow-2xl ${
                      isSelecting && selectedIds.includes(item.id)
                        ? "ring-2 ring-theme-accent border-theme-accent"
                        : "cursor-pointer"
                    }`}
                    onClick={() => {
                      if (isSelecting) {
                        toggleSelection(item.id);
                      } else {
                        setViewingArticle(item);
                      }
                    }}
                  >
                    {/* Selection Checkbox overlay */}
                    {isSelecting && (
                      <div className="absolute top-3 left-3 z-30">
                        <button className="w-7 h-7 rounded-3xl  bg-black/70 backdrop-blur-md flex items-center justify-center transition-all hover:bg-white/20 focus:outline-none border border-white/20">
                          {selectedIds.includes(item.id) ? (
                            <CheckSquare size={17} className="text-theme-accent" />
                          ) : (
                            <Square size={17} className="text-white/40" />
                          )}
                        </button>
                      </div>
                    )}

                    {/* Edge-to-Edge Image Section */}
                    {item.image ? (
                      <div className="w-full aspect-video overflow-hidden relative bg-black/50 shrink-0 border-b border-white/[0.05]">
                        <ImageWithLoader
                          src={item.image}
                          alt={item.title || "Cover"}
                          fallbackIconClassName="w-10 h-10 opacity-20 object-contain grayscale"
                          imageClassName="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-transform duration-700 group-hover:scale-105"
                        />
                      </div>
                    ) : null}

                    {/* Readable Content Container */}
                    <div className="p-4 sm:p-4.5 flex flex-col flex-1 gap-2.5">
                      {/* Header: Title / Caption & Menu */}
                      <div className="flex justify-between items-start gap-2.5 w-full">
                        <h3 className="text-sm sm:text-[15px] font-bold text-white line-clamp-2 leading-snug group-hover:text-theme-accent transition-colors">
                          {isArticle 
                            ? item.title || "Untitled Article" 
                            : (item.content ? item.content.replace(/<[^>]*>?/gm, '') : "Quick Update")}
                        </h3>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setTimeout(() => {
                                setOpenDropdownId(openDropdownId === item.id ? null : item.id);
                              }, 0);
                            }}
                            aria-label="More options"
                            className={`transition-colors shrink-0 p-1 rounded-3xl  hover:bg-white/[0.08] ${openDropdownId === item.id ? 'text-white bg-white/10' : 'text-white/35 hover:text-white'}`}
                          >
                            <MoreHorizontal size={16} />
                          </button>

                          {/* Dropdown Menu */}
                          {openDropdownId === item.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl py-1 z-[100]" onClick={e => e.stopPropagation()}>
                    
                              
                              <button onClick={(e) => handleCopyLink(e, item)} className="w-full text-left px-3 py-2 text-[13px] font-medium text-white/70 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-colors">
                                <Copy size={14} className="opacity-70" /> Copy Public Link
                              </button>
                              <button onClick={() => { setOpenDropdownId(null); handleEdit(item.id); }} className="w-full text-left px-3 py-2 text-[13px] font-medium text-white/70 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-colors">
                                <Edit2 size={14} className="opacity-70" /> Edit {isArticle ? 'Article' : 'Update'}
                              </button>
                              <button onClick={() => { setOpenDropdownId(null); handleDelete(item.id); }} className="w-full text-left px-3 py-2 text-[13px] font-medium text-red-400/80 hover:text-red-400 hover:bg-red-400/10 flex items-center gap-2 transition-colors">
                                <Trash2 size={14} className="opacity-70" /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Line 2: Visibility | Date | Source */}
                      <div className="flex items-center gap-2 flex-wrap text-white/55 text-xs font-medium">
                        {/* Visibility Badge */}
                        {badge.type === "private" ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-rose-400">
                            <EyeOff size={12} /> Private
                          </span>
                        ) : badge.type === "unlisted" ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-purple-400">
                            <LinkIcon size={12} /> Unlisted
                          </span>
                        ) : badge.type === "draft" ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-yellow-400">
                            <FileEdit size={12} /> Draft
                          </span>
                        ) : badge.type === "pending" ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-blue-400">
                            <Clock size={12} /> Pending
                          </span>
                        ) : badge.type === "needs_attention" ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-orange-400">
                            <XCircle size={12} /> Needs Attention
                          </span>
                        ) : badge.type === "public" && isArticle ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
                            <Globe size={12} /> Public
                          </span>
                        ) : null}

                        {badge.type !== "public" || isArticle ? (
                          <span className="text-white/25">•</span>
                        ) : null}

                        {/* Date */}
                        <span className="text-[11px] text-white/50 font-mono">
                          {new Date(item.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>

                        {/* Social Media / Source Brand Icon (No text) */}
                        {sourcePlatform && (
                          <>
                            <span className="text-white/25">•</span>
                            <span
                              className={`inline-flex items-center justify-center w-5 h-5 rounded-3xl  ${sourcePlatform.color} shadow-sm shrink-0`}
                              title={`Source: ${sourcePlatform.name}`}
                            >
                              <PlatformIcon platform={sourcePlatform} size={11} />
                            </span>
                          </>
                        )}

                        {/* Category tag for articles */}
                        {isArticle && item.category && (
                          <>
                            <span className="text-white/25">•</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-white/75 bg-white/[0.06] px-2 py-0.5 rounded-3xl  border border-white/[0.08]">
                              {item.category}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Content Preview */}
                      {item.content && (
                        <p className="text-xs sm:text-[13px] text-white/30 line-clamp-2 leading-relaxed flex-grow font-normal">
                          {item.content.replace(/<[^>]*>?/gm, "").trim()}
                        </p>
                      )}

                      {/* Footer: Author / Submitter (Left) + Views (Right) */}
                      <div className="flex items-center justify-between gap-2.5 mt-auto pt-3 border-t border-white/[0.06] shrink-0">
                        {/* Left: Author / Submitter */}
                        <div className="flex items-center gap-2 min-w-0">
                          {isArticle ? (
                            isICMU ? (
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="w-6 h-6 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                                  <img
                                    src={iconLogo}
                                    alt="ICMU"
                                    className="w-full h-full object-cover opacity-95"
                                  />
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <span className="text-xs font-semibold text-white/90 truncate flex items-center gap-1 leading-tight">
                                    Isipathana College Media Unit
                                    <BadgeCheck
                                      size={12}
                                      className="text-[#050505] fill-theme-accent shrink-0"
                                    />
                                  </span>
                                  {submitterName && (
                                    <span className="text-[10px] text-white/45 font-normal leading-tight truncate mt-0.5">
                                      {submitterName}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="w-5 h-5 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                                  {avatarUrl ? (
                                    <img
                                      src={avatarUrl}
                                      alt={authorName}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <span className="text-[7.5px] font-bold text-white/80">
                                      {initials}
                                    </span>
                                  )}
                                </div>
                                <span className="text-xs font-semibold text-white/90 truncate">
                                  {authorName}
                                </span>
                              </div>
                            )
                          ) : (
                            /* For Updates: Hide ICMU, show submitter directly */
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-5 h-5 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                                {avatarUrl ? (
                                  <img
                                    src={avatarUrl}
                                    alt={submitterName || authorName}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="text-[7.5px] font-bold text-white/80">
                                    {submitterInitials || initials}
                                  </span>
                                )}
                              </div>
                              <span className="text-xs font-semibold text-white/90 truncate">
                                {submitterName || authorName || "ICMU Member"}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Right: Views Counter */}
                        <div
                          className="flex items-center gap-1.5 text-white/50 shrink-0 bg-white/[0.04] px-2 py-1 rounded-3xl border border-white/[0.06]"
                          title={`${item.views || 0} Views`}
                        >
                          <Eye size={14} className="text-white/40" />
                          <span className="text-xs font-mono font-medium text-white/70">
                            {item.views ?? 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default React.memo(NewsGridView);
