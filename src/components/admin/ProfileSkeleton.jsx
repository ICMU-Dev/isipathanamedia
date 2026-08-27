import React from "react";
import { Loader2 } from "lucide-react";

const ProfileSkeleton = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 animate-fade-in font-sans pb-24 sm:pb-10 w-full space-y-12">
      {/* Top Profile Header */}
      <div className="flex flex-col items-center text-center space-y-4 pt-4">
        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-white/5 animate-pulse border border-white/5 relative">
          <div className="absolute bottom-1 right-1 w-7 h-7 rounded-full bg-white/10 animate-pulse border border-[#050505]"></div>
        </div>
        <div className="space-y-2 flex flex-col items-center">
          <div className="h-7 w-48 bg-white/10 rounded-2xl animate-pulse"></div>
          <div className="h-4 w-32 bg-white/5 rounded-2xl animate-pulse"></div>
        </div>
        <div className="h-10 w-28 bg-white/5 rounded-2xl animate-pulse mt-2"></div>
      </div>

      {/* Tabs Skeleton */}
      <div className="flex justify-center gap-2 overflow-x-auto pb-2">
        <div className="h-10 w-28 bg-white/5 rounded-full animate-pulse"></div>
        <div className="h-10 w-24 bg-white/5 rounded-full animate-pulse"></div>
        <div className="h-10 w-32 bg-white/5 rounded-full animate-pulse"></div>
      </div>

      {/* Card Skeleton */}
      <div className="space-y-6">
        <div>
          <div className="h-5 w-40 bg-white/10 rounded-2xl animate-pulse mb-1"></div>
          <div className="h-3 w-48 bg-white/5 rounded-2xl animate-pulse"></div>
        </div>

        <div className="admin-card border-theme rounded-2xl p-2 space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 bg-white/[0.01] rounded-2xl">
              <div className="h-4 w-24 bg-white/5 rounded-2xl animate-pulse"></div>
              <div className="h-4 w-32 bg-white/10 rounded-2xl animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Centered generic loader for good measure */}
      <div className="flex justify-center py-4">
        <Loader2 className="w-5 h-5 text-white/20 animate-spin" />
      </div>
    </div>
  );
};

export default ProfileSkeleton;
