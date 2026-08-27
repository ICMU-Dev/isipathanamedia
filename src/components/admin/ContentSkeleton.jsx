import React from "react";

const ContentSkeleton = () => {
  return (
    <div className="relative py-8 space-y-6 md:space-y-8 max-w-7xl mx-auto px-4 md:pt-8 md:px-8 pb-8 w-full animate-fade-in">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-3 w-full max-w-sm">
          <div className="h-8 md:h-10 w-2/3 bg-white/10 rounded-2xl animate-pulse"></div>
          <div className="h-4 w-1/2 bg-white/5 rounded-2xl animate-pulse"></div>
        </div>
        <div className="h-12 w-full md:w-32 bg-theme-accent/ rounded-full animate-pulse"></div>
      </div>

      {/* Toolbar & Search */}
      <div className="flex flex-col gap-4 border-b border-white/5 pb-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
          <div className="h-12 w-full flex-1 bg-white/[0.03] rounded-2xl animate-pulse"></div>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="h-12 w-12 bg-white/[0.03] rounded-2xl animate-pulse"></div>
            <div className="h-12 w-12 bg-white/[0.03] rounded-2xl animate-pulse"></div>
          </div>
        </div>
        {/* Tabs */}
        <div className="flex gap-3">
          <div className="h-8 w-20 bg-white/10 rounded-full animate-pulse"></div>
          <div className="h-8 w-24 bg-white/5 rounded-full animate-pulse"></div>
          <div className="h-8 w-20 bg-white/5 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* List Items */}
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-4 admin-card border-theme rounded-2xl w-full">
            <div className="w-12 h-12 rounded-2xl bg-white/10 animate-pulse shrink-0"></div>
            <div className="flex-1 space-y-3">
              <div className="h-5 w-3/4 md:w-1/3 bg-white/10 rounded-2xl animate-pulse"></div>
              <div className="flex gap-3">
                <div className="h-3 w-20 bg-white/5 rounded-2xl animate-pulse"></div>
                <div className="h-3 w-24 bg-white/5 rounded-2xl animate-pulse"></div>
              </div>
            </div>
            <div className="hidden sm:block h-8 w-24 bg-white/5 rounded-2xl animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContentSkeleton;
