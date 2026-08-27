import React from "react";
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
} from "lucide-react";
import {
  getRelativeDateLabel,
  resolveAuthorInfo,
  resolveBadgeInfo,
  getSourcePlatform,
  PlatformIcon,
} from "./NewsUtils";
import ImageWithLoader from "../ui/ImageWithLoader";
import iconLogo from "../../assets/image.png";

const NewsListView = ({
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
    <div className="flex flex-col gap-5">
      {sortedGroups.map(({ label, items: dateItems }) => (
        <div key={label} className="flex flex-col gap-2">
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

          <div className="flex flex-col gap-2">
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
                  className={`group relative flex flex-row items-center gap-3 p-2 sm:p-3 rounded-2xl border border-white/[0.07] hover:border-white/[0.16] bg-[#0c0c0e]/20 hover:bg-[#0c0c0e]/50 transition-all duration-200 shadow-sm hover:shadow-md ${
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
                  {/* Selection Checkbox */}
                  {isSelecting && (
                    <button
                      type="button"
                      aria-label="Select item"
                      className="shrink-0 flex items-center justify-center text-white/40 hover:text-theme-accent transition-colors focus:outline-none p-1"
                    >
                      {selectedIds.includes(item.id) ? (
                        <CheckSquare size={17} className="text-theme-accent" />
                      ) : (
                        <Square size={17} className="text-white/40" />
                      )}
                    </button>
                  )}

                  {/* Clean Thumbnail (No overlays) */}
                  <div
                    className={`w-[80px] sm:w-[100px] ${
                      isArticle ? "aspect-video" : "aspect-[3/4]"
                    } rounded-xl bg-black/40 overflow-hidden shrink-0 border border-white/[0.06] relative shadow-sm`}
                  >
                    <ImageWithLoader
                      src={item.image}
                      alt={item.title || "Cover"}
                      fallbackIconClassName="w-7 h-7 opacity-20 object-contain grayscale"
                      imageClassName="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  {/* Content Body */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    {/* Line 1: Text / Caption / Title */}
                    <h3 className="text-sm sm:text-[15px] font-bold text-white line-clamp-2 leading-snug group-hover:text-theme-accent transition-colors">
                      {isArticle 
                        ? item.title || "Untitled Article" 
                        : (item.content ? item.content.replace(/<[^>]*>?/gm, '') : "Quick Update")}
                    </h3>

                    {/* Line 2: Visibility | Date | Source */}
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap text-white/55 text-xs font-medium my-1">
                      {/* Visibility Badge */}
                      {badge.type === "private" ? (
                        <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-rose-400">
                          <EyeOff size={11} /> Private
                        </span>
                      ) : badge.type === "unlisted" ? (
                        <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-purple-400">
                          <LinkIcon size={11} /> Unlisted
                        </span>
                      ) : badge.type === "draft" ? (
                        <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-yellow-400">
                          <FileEdit size={11} /> Draft
                        </span>
                      ) : badge.type === "pending" ? (
                        <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-blue-400">
                          <Clock size={11} /> Pending
                        </span>
                      ) : badge.type === "needs_attention" ? (
                        <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-orange-400">
                          <XCircle size={11} /> Needs Attention
                        </span>
                      ) : badge.type === "public" && isArticle ? (
                        <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
                          <Globe size={11} /> Public
                        </span>
                      ) : null}

                      {/* Separator if we showed a badge */}
                      {badge.type !== "public" || isArticle ? (
                        <span className="hidden sm:inline opacity-30 mx-1">
                          •
                        </span>
                      ) : null}
                      
                      {/* Date */}
                      <span className="text-[10px] sm:text-[11px] text-white/50 font-mono">
                        {new Date(item.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>

                      {/* Social Media / Source Brand Icon (No text) */}
                      {sourcePlatform && (
                        <>
                          <span className="text-white/20 font-mono">•</span>
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
                          <span className="text-white/20 font-mono">•</span>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-white/75 bg-white/[0.06] px-1.5 py-0.5 rounded border border-white/[0.08]">
                            {item.category}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Line 3: Author / Submitter | Views | Actions */}
                    <div className="flex items-center justify-between gap-2.5 mt-1 pt-1.5 border-t border-white/[0.05]">
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

                      {/* Right: Views & Action Menu */}
                      <div className="flex items-center gap-2 text-white/40 shrink-0">
                        {/* Views */}
                        <div
                          className="flex items-center gap-1 text-white/50"
                          title={`${item.views || 0} Views`}
                        >
                          <Eye size={13} className="text-white/40" />
                          <span className="text-xs font-mono font-medium text-white/70">
                            {item.views ?? 0}
                          </span>
                        </div>

                        <button
                          type="button"
                          aria-label="More options"
                          className="text-white/35 hover:text-white transition-colors p-1 rounded-3xl  hover:bg-white/[0.06]"
                        >
                          <MoreHorizontal size={15} />
                        </button>
                      </div>
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

export default React.memo(NewsListView);
