import React, { useState } from "react";
import { ChevronUp, ChevronDown, Sparkles, Clock, Zap, ArrowRight } from "lucide-react";

const ChangelogPanel = ({
  changelogs,
  expandedLogs: propExpandedLogs,
  toggleLog: propToggleLog,
  onMajorClick,
  onLogClick,
}) => {
  const [localExpandedLogs, setLocalExpandedLogs] = useState(new Set([1]));
  const expandedLogs = propExpandedLogs || localExpandedLogs;

  const toggleLog = (log) => {
    if (log.isMajor && onMajorClick) {
      onMajorClick(log);
      return;
    }
    if (onLogClick) {
      onLogClick(log);
      return;
    }
    if (propToggleLog) {
      propToggleLog(log);
    } else {
      setLocalExpandedLogs((prev) => {
        if (prev.has(log.id)) return new Set();
        return new Set([log.id]);
      });
    }
  };

  return (
    <div className="bg-[var(--admin-card-bg)] border border-[var(--admin-border)] rounded-2xl p-5 flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-2xl bg-theme-accent/ text-[var(--accent)] flex items-center justify-center shrink-0">
            <Sparkles size={16} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--admin-text-primary)]">
              Changelog
            </h3>
            <p className="text-[10px] text-[var(--admin-text-secondary)]">
              System releases & updates
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
        {changelogs.map((log) => {
          const isExpanded = expandedLogs.has(log.id);
          const isMajor = log.isMajor;
          const cleanTitle = log.title.replace("MAJOR UPDATE: ", "").trim();

          return (
            <button
              key={log.id}
              onClick={() => toggleLog(log)}
              className={`w-full text-left p-3.5 transition-all duration-200 relative overflow-hidden rounded-2xl border flex flex-col group ${
                isMajor
                  ? "bg-theme-accent/[0.04] border-theme-accent/30 hover:border-theme-accent/60 shadow-[0_0_15px_rgba(var(--accent-rgb),0.05)]"
                  : "bg-[var(--admin-input-bg)] border-[var(--admin-border)] hover:border-theme-accent/30"
              }`}
            >
              <div className="flex justify-between items-center mb-1 w-full gap-3 relative z-10">
                <div className="flex items-center gap-2 min-w-0">
                  {isMajor && (
                    <span className="shrink-0 p-1 rounded-md bg-theme-accent/ text-[var(--accent)]">
                      <Zap size={11} />
                    </span>
                  )}
                  <h4
                    className={`text-xs font-semibold truncate ${
                      isMajor
                        ? "text-[var(--accent)]"
                        : "text-[var(--admin-text-primary)] group-hover:text-[var(--accent)] transition-colors"
                    }`}
                  >
                    {cleanTitle}
                  </h4>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="flex items-center gap-1 text-[10px] text-[var(--admin-text-secondary)]">
                    <Clock size={10} />
                    {log.date}
                  </span>
                  {!isMajor &&
                    (isExpanded ? (
                      <ChevronUp size={13} className="text-[var(--admin-text-secondary)]" />
                    ) : (
                      <ChevronDown
                        size={13}
                        className="text-[var(--admin-text-secondary)] group-hover:text-[var(--admin-text-primary)] transition-colors"
                      />
                    ))}
                </div>
              </div>

              <p
                className={`text-[11px] text-[var(--admin-text-secondary)] leading-relaxed transition-all duration-200 text-left relative z-10 ${
                  isExpanded || isMajor ? "line-clamp-none mt-1" : "line-clamp-1"
                }`}
              >
                {log.desc}
              </p>

              {isMajor && (
                <div className="mt-2 text-[10px] font-bold text-[var(--accent)] group-hover:underline flex items-center gap-1">
                  <span>Learn more</span>
                  <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ChangelogPanel;

