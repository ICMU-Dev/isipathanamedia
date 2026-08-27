import React from "react";

const DashboardSkeleton = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in w-full">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="space-y-3 w-full max-w-sm">
          <div className="h-8 md:h-10 w-48 bg-white/10 rounded-2xl animate-pulse"></div>
          <div className="h-4 w-64 bg-white/5 rounded-2xl animate-pulse"></div>
        </div>
        <div className="h-10 w-32 bg-theme-accent/ rounded-full animate-pulse"></div>
      </div>

      {/* Grid of Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="admin-card border-theme rounded-2xl p-6 h-36 flex flex-col justify-between relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-2xl bg-white/10 animate-pulse"></div>
              <div className="w-16 h-6 rounded-full bg-white/5 animate-pulse"></div>
            </div>
            <div className="space-y-2 mt-4">
              <div className="h-6 w-24 bg-white/10 rounded animate-pulse"></div>
              <div className="h-4 w-32 bg-white/5 rounded animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="admin-card border-theme rounded-2xl p-6 min-h-[300px]">
            <div className="h-6 w-48 bg-white/10 rounded mb-6 animate-pulse"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((j) => (
                <div
                  key={j}
                  className="h-16 w-full bg-white/5 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
        <div className="lg:col-span-1 space-y-6">
          <div className="admin-card border-theme rounded-2xl p-6 min-h-[300px]">
            <div className="h-6 w-32 bg-white/10 rounded mb-6 animate-pulse"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((j) => (
                <div
                  key={j}
                  className="h-12 w-full bg-white/5 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
