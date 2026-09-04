import React from "react";
import { X, Shield, Radio, PenTool, ShieldCheck, ShieldAlert } from "lucide-react";

const RoleGuidelinesModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const roles = [
    {
      title: "Admin",
      desc: "Manages news, team members, messages, and site content.",
      icon: Shield,
      color: "text-zinc-200",
    },
    {
      title: "Broadcaster",
      desc: "Controls live stream broadcasts and streaming settings.",
      icon: Radio,
      color: "text-amber-400",
    },
    {
      title: "Admin + Broadcaster",
      desc: "Dual role with access to both Admin and Live Broadcast dashboards.",
      icon: ShieldCheck,
      color: "text-emerald-400",
    },
    {
      title: "Writer",
      desc: "Restricted to creating, editing, and publishing news articles.",
      icon: PenTool,
      color: "text-purple-400",
    },
    {
      title: "Super Admin",
      desc: "Full master access across all panels, database, and accounts.",
      icon: ShieldAlert,
      color: "text-red-400",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-[#0c0c0f] border border-white/10 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-white/[0.08] flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Role Guidelines
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Overview of user roles and permissions.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* Minimal Guidelines List */}
        <div className="p-5 space-y-2.5">
          {roles.map((r) => {
            const Icon = r.icon;
            return (
              <div
                key={r.title}
                className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <div className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0 mt-0.5">
                  <Icon size={15} className={r.color} />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-semibold text-white tracking-tight">
                    {r.title}
                  </h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
                    {r.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/[0.08] flex justify-end bg-black/40">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-white/[0.08] hover:bg-white/[0.14] text-zinc-200 hover:text-white font-medium text-xs rounded-xl border border-white/10 transition-all cursor-pointer">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleGuidelinesModal;
