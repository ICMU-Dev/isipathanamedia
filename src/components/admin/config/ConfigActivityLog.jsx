import React, { useState } from "react";
import {
  Activity,
  CheckCircle2,
  XCircle,
  Search,
  ChevronDown,
  ChevronUp,
  Clock,
} from "lucide-react";

const ConfigActivityLog = ({ activityLogs = [] }) => {
  const [filter, setFilter] = useState("ALL");
  const [logSearch, setLogSearch] = useState("");
  const [isExpanded, setIsExpanded] = useState(true);

  const filteredLogs = activityLogs.filter((log) => {
    if (filter === "SUCCESS" && log.status !== "SUCCESS") return false;
    if (filter === "ERROR" && log.status !== "ERROR") return false;
    if (logSearch.trim()) {
      const searchQuery = logSearch.toLowerCase();
      return (
        log.action?.toLowerCase().includes(searchQuery) ||
        log.details?.toLowerCase().includes(searchQuery) ||
        log.timestamp?.toLowerCase().includes(searchQuery)
      );
    }
    return true;
  });

  return (
    <div className=" border-theme rounded-2xl sm:rounded-3xl overflow-hidden transition-all">
      {/* Log Feed Header */}
      <div className="bg-[#181818] px-4 sm:px-6 py-3.5 border-b border-white/[0.06] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-2xl bg-theme-accent/10 text-theme-accent ">
            <Activity size={16} className="animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-theme-primary tracking-wide">
              Real-time Activity Audit Feed
            </h3>
            <span className="text-[10px] text-theme-primary opacity-40">
              {activityLogs.length} total entries recorded
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Filter Tabs */}
          <div className="hidden sm:flex items-center gap-1 admin-input p-1 rounded-2xl border border-white/[0.06]">
            {["ALL", "SUCCESS", "ERROR"].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-2.5 py-1 rounded-2xl text-[10px] font-bold uppercase transition-colors ${
                  filter === status
                    ? "bg-theme-accent/20 text-theme-accent "
                    : "text-theme-primary opacity-50 hover:text-theme-primary"
                }`}>
                {status}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-theme-primary opacity-60 hover:text-theme-primary rounded-2xl hover:bg-white/5 transition-colors"
            title={
              isExpanded ? "Collapse Activity Feed" : "Expand Activity Feed"
            }>
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-2 sm:p-3 space-y-3">
          {/* Log Search input on mobile */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-primary opacity-30"
              />
              <input
                type="text"
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                placeholder="Search activity audit logs..."
                className="w-full admin-input border border-white/5 focus:border-theme-accent/50 rounded-2xl pl-8 pr-3 py-1.5 text-xs text-theme-primary placeholder-white/20 focus:outline-none"
              />
            </div>

            {/* Mobile Filter select */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="sm:hidden admin-input border border-white/5 rounded-2xl px-2 py-1.5 text-xs text-theme-primary focus:outline-none">
              <option value="ALL">ALL ({activityLogs.length})</option>
              <option value="SUCCESS">SUCCESS</option>
              <option value="ERROR">ERROR</option>
            </select>
          </div>

          {/* Logs List Container */}
          <div className="max-h-56 sm:max-h-64 overflow-y-auto font-mono text-[11px] space-y-2 pr-1 scrollbar-hide">
            {filteredLogs.length === 0 ? (
              <div className="py-8 text-center text-theme-primary opacity-30 text-xs">
                No activity logs matching criteria
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div
                  key={log.id || `${log.timestamp}-${log.action}`}
                  className="p-2.5 rounded-2xl admin-input border border-white/[0.06]  flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-2 overflow-hidden">
                    {log.status === "SUCCESS" ? (
                      <CheckCircle2
                        size={13}
                        className="text-theme-accent  shrink-0"
                      />
                    ) : (
                      <XCircle size={13} className="text-red-400 shrink-0" />
                    )}
                    <span
                      className={`font-black tracking-wide shrink-0 ${
                        log.status === "SUCCESS"
                          ? "text-theme-accent "
                          : "text-red-400"
                      }`}>
                      {log.action}
                    </span>
                    <span className="text-theme-primary opacity-70 truncate">
                      » {log.details}
                    </span>
                  </div>

                  <span className="text-[10px] text-theme-primary opacity-40 flex items-center gap-1 shrink-0 self-end sm:self-auto">
                    <Clock size={10} />
                    {log.timestamp}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfigActivityLog;
