import React from "react";

const LiveSkeleton = () => {
  return (
    <div className="relative py-8 text-theme-primary space-y-6 md:space-y-8 font-sans max-w-[1200px] mx-auto px-4 md:pt-8 md:px-8 pb-32 animate-fade-in w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-3 w-full max-w-sm">
          <div className="h-8 md:h-10 w-48 bg-white/10 rounded-2xl animate-pulse"></div>
        </div>
        <div className="h-10 w-24 bg-white/5 rounded-full animate-pulse"></div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column */}
        <div className="lg:col-span-7 space-y-6">
          <div className="admin-card border-theme rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-white/[0.06]  pb-4">
              <div className="w-5 h-5 bg-white/10 rounded animate-pulse"></div>
              <div className="h-5 w-32 bg-white/10 rounded animate-pulse"></div>
            </div>

            {/* Video Placeholder */}
            <div className="w-full aspect-video bg-white/[0.02] rounded-2xl border border-white/[0.06]  flex items-center justify-center animate-pulse">
              <div className="w-16 h-12 bg-white/5 rounded-2xl"></div>
            </div>

            <div className="flex gap-4">
              <div className="h-12 w-1/2 bg-white/5 rounded-2xl animate-pulse"></div>
              <div className="h-12 w-1/2 bg-white/5 rounded-2xl animate-pulse"></div>
            </div>
          </div>

          <div className="admin-card border-theme rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-white/[0.06]  pb-4">
              <div className="w-5 h-5 bg-white/10 rounded animate-pulse"></div>
              <div className="h-5 w-32 bg-white/10 rounded animate-pulse"></div>
            </div>
            <div className="space-y-4">
              <div className="h-12 w-full bg-white/5 rounded-2xl animate-pulse"></div>
              <div className="h-12 w-full bg-white/5 rounded-2xl animate-pulse"></div>
              <div className="h-32 w-full bg-white/5 rounded-2xl animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="admin-card border-theme rounded-2xl p-6 space-y-6">
            <div className="flex justify-between border-b border-white/[0.06]  pb-4">
              <div className="h-5 w-32 bg-white/10 rounded animate-pulse"></div>
              <div className="h-6 w-12 bg-white/10 rounded-full animate-pulse"></div>
            </div>
            <div className="space-y-4">
              <div className="h-14 w-full bg-white/5 rounded-2xl animate-pulse"></div>
              <div className="h-4 w-3/4 bg-white/5 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveSkeleton;
