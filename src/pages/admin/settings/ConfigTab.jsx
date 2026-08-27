import React from "react";
import ConfigFormEditor from "../../../components/admin/config/ConfigFormEditor";
import { Search, X } from "lucide-react";

const ConfigTab = ({
  searchQuery,
  setSearchQuery,
  configState,
  handleFormChange,
  activeTab,
}) => {
  return (
    <div className="space-y-4">
      <div className="relative group max-w-full mb-8">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
        />
        <input
          id="settings-search-input"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search settings fields..."
          className="w-full bg-white/[0.03] border border-[var(--admin-border)] focus:border-white/20 rounded-2xl pl-12 pr-10 py-4 text-[14px] text-white placeholder-white/20 focus:outline-none transition-all shadow-sm"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white opacity-30 hover:opacity-60 transition-colors">
            <X size={14} />
          </button>
        )}
      </div>

      <ConfigFormEditor
        config={configState}
        onChange={handleFormChange}
        searchQuery={searchQuery}
        parentTab={activeTab}
      />
    </div>
  );
};

export default ConfigTab;
