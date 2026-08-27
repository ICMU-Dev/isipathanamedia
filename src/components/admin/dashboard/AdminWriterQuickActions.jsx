import React from "react";
import { Link } from "react-router-dom";
import { Zap, Plus, PenSquare } from "lucide-react";

const AdminWriterQuickActions = ({ basePath }) => {
  return (
    <div className="bg-[var(--admin-card-bg)] border border-[var(--admin-border)] rounded-2xl p-5 flex flex-col gap-4">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-2xl bg-theme-accent/ text-[var(--accent)] flex items-center justify-center shrink-0">
          <Zap size={16} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[var(--admin-text-primary)]">
            Quick Actions
          </h3>
          <p className="text-[10px] text-[var(--admin-text-secondary)]">
            Writer tools & shortcuts
          </p>
        </div>
      </div>
      <div className="space-y-2.5">
        <Link
          to={`${basePath}/dashboard/news/create`}
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-[var(--accent)] text-black text-xs font-bold rounded-2xl hover:opacity-95 shadow-[0_2px_12px_rgba(var(--accent-rgb),0.2)] transition-all active:scale-98"
        >
          <Plus size={16} />
          <span>Write New Article</span>
        </Link>
        <Link
          to={`${basePath}/dashboard/news`}
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-[var(--admin-input-bg)] border border-[var(--admin-border)] text-[var(--admin-text-primary)] hover:border-theme-accent/ text-xs font-semibold rounded-2xl transition-all active:scale-98"
        >
          <PenSquare size={15} />
          <span>View My Articles</span>
        </Link>
      </div>
    </div>
  );
};

export default AdminWriterQuickActions;

