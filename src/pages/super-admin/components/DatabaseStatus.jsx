import React, { useState, useEffect } from "react";
import {
  Database,
  HardDrive,
  Server,
  Activity,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Archive,
  Cloud,
  Users,
  Image as ImageIcon,
} from "lucide-react";
import MediaLibrary from "../../../components/admin/MediaLibrary";
import { supabase } from "../../../lib/supabaseClient";

const StorageMetricCard = ({
  title,
  used,
  total,
  unitUsed,
  unitTotal,
  icon: Icon,
  color,
  percent,
}) => {
  return (
    <div className="bg-[#121215]/80 border border-white/[0.08] backdrop-blur-xl rounded-[22px] p-3 sm:p-6 flex flex-col relative overflow-hidden shadow-lg group hover:border-white/20 transition-all duration-500">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-[50px] -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-white/10 transition-all duration-700"></div>

      <div className="flex justify-between items-start mb-6">
        <div
          className={`w-8 h-8 rounded-2xl flex items-center justify-center bg-white/5 border border-white/5 ${color} shadow-sm group-hover:scale-110 transition-transform duration-500`}>
          <Icon size={16} strokeWidth={1.5} />
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xl font-bold text-white tracking-tight">
            {used}{" "}
            {unitUsed && (
              <span className="text-sm font-medium text-zinc-500">
                {unitUsed}
              </span>
            )}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold mt-1">
            / {total} {unitTotal}
          </span>
        </div>
      </div>

      <div className="mt-auto">
        <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2">
          <span className="text-zinc-400">{title}</span>
          <span
            className={
              percent > 80
                ? "text-red-400"
                : percent > 60
                  ? "text-amber-400"
                  : "text-green-400"
            }>
            {percent < 1 && percent > 0 ? "< 1" : percent.toFixed(1)}%
          </span>
        </div>
        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/[0.06] ">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-out ${
              percent > 80
                ? "bg-red-500"
                : percent > 60
                  ? "bg-amber-500"
                  : "bg-green-500"
            }`}
            style={{
              width: `${Math.min(Math.max(percent, 2), 100)}%`,
            }} /* Min 2% so the bar is at least visible if > 0 */
          />
        </div>
      </div>
    </div>
  );
};

const DatabaseStatus = () => {
  const [loading, setLoading] = useState(true);
  const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);
  const [metrics, setMetrics] = useState({
    egress: 0,
    dbSize: 0,
    mau: 0,
    storageSize: 0,
  });

  const uploadImage = async (file, bucket) => {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);

      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
      return data.publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      return null;
    }
  };

  // Free tier limits
  const LIMITS = {
    egress: 5, // 5 GB
    db: 500, // 500 MB
    mau: 50000,
    storage: 1, // 1 GB
  };

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      // Provide mock data for the UI demonstration to match the exact Supabase free tier plan snapshot.
      setTimeout(() => {
        setMetrics({
          egress: 254, // MB
          dbSize: 28, // MB
          mau: 6, // users
          storageSize: 17, // MB
        });
        setLoading(false);
      }, 800);
      return;
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const egressPercent = (metrics.egress / (LIMITS.egress * 1024)) * 100;
  const dbPercent = (metrics.dbSize / LIMITS.db) * 100;
  const mauPercent = (metrics.mau / LIMITS.mau) * 100;
  const storagePercent = (metrics.storageSize / (LIMITS.storage * 1024)) * 100;

  const totalPercent = Math.max(
    egressPercent,
    dbPercent,
    mauPercent,
    storagePercent,
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-2 mb-2">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <Server size={24} className="text-green-400" />
            Infrastructure Status
          </h3>
          <p className="text-zinc-400 text-sm mt-1 max-w-md">
            Monitoring Supabase free-tier limits. Keep database and storage
            below quotas to prevent service interruption.
          </p>
        </div>

        <button
          onClick={fetchMetrics}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-white/[0.06] border border-white/[0.1] hover:bg-white/[0.12] text-zinc-200 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed">
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          {loading ? "Scanning..." : "Refresh Data"}
        </button>
      </div>

      <div className="grid lg:grid-cols-4 sm:grid-cols-2 grid-cols-2 gap-4 sm:gap-5">
        <StorageMetricCard
          title="Egress"
          used={metrics.egress}
          total={LIMITS.egress}
          unitUsed="MB"
          unitTotal="GB"
          icon={Activity}
          color="text-amber-400"
          percent={egressPercent}
        />
        <StorageMetricCard
          title="Database Size"
          used={metrics.dbSize}
          total={LIMITS.db}
          unitUsed="MB"
          unitTotal="MB"
          icon={Database}
          color="text-green-400"
          percent={dbPercent}
        />
        <StorageMetricCard
          title="Active Users"
          used={metrics.mau}
          total={LIMITS.mau.toLocaleString()}
          unitUsed=""
          unitTotal=""
          icon={Users}
          color="text-sky-400"
          percent={mauPercent}
        />
        <StorageMetricCard
          title="File Storage"
          used={metrics.storageSize}
          total={LIMITS.storage}
          unitUsed="MB"
          unitTotal="GB"
          icon={HardDrive}
          color="text-cyan-400"
          percent={storagePercent}
        />
      </div>

      {/* Detail breakdown or advice */}
      <div className="grid grid-cols-1 text-balance md:grid-cols-2 gap-5 mt-6">
        <div className="bg-[#121215]/80 border border-white/[0.08] backdrop-blur-xl rounded-[24px] p-6 flex flex-col shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <ImageIcon size={20} className="text-zinc-400" />
            <h4 className="text-sm font-medium tracking-wider text-white">
              Media Management
            </h4>
          </div>
          <p className="text-sm text-zinc-400 mb-6 flex-1">
            Access the global media library to upload, browse, or remove files
            stored in your Supabase buckets.
          </p>
          <button
            onClick={() => setIsMediaLibraryOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-green-500 hover:bg-green-400 text-zinc-950 rounded-2xl text-sm font-bold transition-all shadow-[0_0_20px_rgba(34,197,94,0.2)] active:scale-[0.99]">
            <ImageIcon size={18} />
            Open Media Library
          </button>
        </div>
      </div>

      <MediaLibrary
        isOpen={isMediaLibraryOpen}
        onClose={() => setIsMediaLibraryOpen(false)}
        onSelect={(url) => {
          setIsMediaLibraryOpen(false);
        }}
        uploadImage={uploadImage}
      />
    </div>
  );
};

export default DatabaseStatus;

