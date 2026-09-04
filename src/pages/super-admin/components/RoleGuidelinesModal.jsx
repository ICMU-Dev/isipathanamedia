import React from "react";
import { X, Shield, ShieldCheck, ShieldAlert, Radio, PenTool, Check, AlertCircle } from "lucide-react";

const RoleGuidelinesModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-zinc-950 border border-white/10 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
              <ShieldCheck size={20} className="text-cyan-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Clearance Matrix Guidelines
              </h3>
              <p className="text-xs text-zinc-400">
                Multi-role hierarchy, dashboard assignments, and safety rules.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-zinc-300">
          {/* Dashboards Matrix */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">
              1. The 4 Operational Dashboards
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-3.5 rounded-2xl bg-black/50 border border-white/[0.08]">
                <div className="flex items-center gap-2 mb-1">
                  <ShieldAlert size={14} className="text-red-400" />
                  <span className="font-bold text-white text-xs">Super Admin Hub</span>
                </div>
                <span className="text-[11px] text-zinc-400 font-mono block mb-1">/:adminPath</span>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  User accounts, database status, system audit documentation. Only for Super Admins.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/50 border border-white/[0.08]">
                <div className="flex items-center gap-2 mb-1">
                  <Shield size={14} className="text-white" />
                  <span className="font-bold text-white text-xs">Main Admin Portal</span>
                </div>
                <span className="text-[11px] text-zinc-400 font-mono block mb-1">/:adminPath/dashboard</span>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Global CMS: newsroom, messages, team management, site configurations.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/50 border border-white/[0.08]">
                <div className="flex items-center gap-2 mb-1">
                  <Radio size={14} className="text-amber-400" />
                  <span className="font-bold text-white text-xs">Broadcaster Terminal</span>
                </div>
                <span className="text-[11px] text-zinc-400 font-mono block mb-1">/:adminPath/broadcast</span>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Dedicated broadcasting operator terminal, stream ingest, live telemetry.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/50 border border-white/[0.08]">
                <div className="flex items-center gap-2 mb-1">
                  <PenTool size={14} className="text-blue-400" />
                  <span className="font-bold text-white text-xs">Writer Newsroom</span>
                </div>
                <span className="text-[11px] text-zinc-400 font-mono block mb-1">/:adminPath/dashboard/news</span>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Restricted workspace strictly isolated to authoring articles and drafts.
                </p>
              </div>
            </div>
          </div>

          {/* Rules & Combinations */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">
              2. Selection & Combination Rules
            </h4>
            <div className="space-y-2">
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-start gap-3">
                <Check size={16} className="text-red-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white text-xs block">Super Admin (Solo)</strong>
                  <span className="text-xs text-zinc-400">
                    Already possesses master clearance across all systems. Selecting Super Admin disables all other options.
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-start gap-3">
                <Check size={16} className="text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white text-xs block">Admin + Broadcaster (Dual Clearance)</strong>
                  <span className="text-xs text-zinc-400">
                    Admin can optionally be granted Broadcaster clearance (`admin,broadcaster`). Grants simultaneous access to both the Admin Dashboard and Broadcaster Terminal.
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-start gap-3">
                <Check size={16} className="text-zinc-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white text-xs block">Writer (Strictly Isolated)</strong>
                  <span className="text-xs text-zinc-400">
                    Writers cannot be broadcasters or admins. Selecting Writer locks out all other options to prevent security privilege leaks.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-start gap-3 text-cyan-200 text-xs leading-relaxed">
            <AlertCircle size={18} className="text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold text-white block mb-0.5">Automated Post-Login Routing:</strong>
              When an operator signs in, the system automatically redirects them to their designated panel (`/` for Super Admin, `/dashboard` for Admin/Writer, `/broadcast` for Broadcaster).
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/[0.08] flex justify-end bg-black/40">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-white text-black font-bold text-xs rounded-xl hover:bg-zinc-200 transition-all uppercase tracking-wider cursor-pointer">
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleGuidelinesModal;
