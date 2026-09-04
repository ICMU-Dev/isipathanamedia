import React from "react";
import { X, Check } from "lucide-react";

const EditUserModal = ({
  isOpen,
  onClose,
  editingUser,
  setEditingUser,
  onSubmit,
}) => {
  if (!isOpen) return null;

  const isFormValid = Boolean(editingUser?.full_name?.trim());

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md sm:p-4 animate-in fade-in duration-300">
      <div className="bg-[#121215] border border-white/[0.1] rounded-t-[2rem] sm:rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-4 sm:zoom-in-95 duration-300">
        <div className="p-6 sm:p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-1 tracking-tight">
                Update Name
              </h3>
              <p className="text-sm text-zinc-400">
                Change user's display name.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-all cursor-pointer">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={editingUser?.full_name || ""}
                onChange={(e) =>
                  setEditingUser({
                    ...editingUser,
                    full_name: e.target.value,
                  })
                }
                placeholder="e.g. John Doe"
                className="w-full bg-[#0a0a0d] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/30 transition-all shadow-inner"
              />
            </div>

            <div className="pt-6 mt-4 border-t border-white/[0.06]">
              <button
                type="submit"
                disabled={!isFormValid}
                className="w-full flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-bold bg-green-500 hover:bg-green-400 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none text-zinc-950 rounded-xl transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.45)] uppercase tracking-wider cursor-pointer active:scale-95">
                <Check size={16} strokeWidth={2.5} />
                Update Name
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditUserModal;
