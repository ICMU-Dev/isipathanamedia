import React from "react";
import { X } from "lucide-react";

const EditUserModal = ({
  isOpen,
  onClose,
  editingUser,
  setEditingUser,
  onSubmit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md sm:p-4 animate-in fade-in duration-300">
      <div className="bg-zinc-950 border border-white/5 rounded-t-[2rem] sm:rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-4 sm:zoom-in-95 duration-300">
        <div className="p-6 sm:p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-1 tracking-tight">
                Modify Protocol
              </h3>
              <p className="text-sm text-zinc-400">
                Update identity designation.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-all">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-white">
                Designation Name
              </label>
              <input
                type="text"
                required
                value={editingUser.full_name}
                onChange={(e) =>
                  setEditingUser({
                    ...editingUser,
                    full_name: e.target.value,
                  })
                }
                className="w-full bg-[#000000] border border-white/5 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/5focus:ring-1 focus:ring-white/50 transition-all shadow-inner"
              />
            </div>

            <div className="pt-6 mt-4 border-t border-white/[0.06] ">
              <button
                type="submit"
                className="w-full px-4 py-4 text-sm font-bold bg-white text-black hover:bg-zinc-200 rounded-2xl transition-all shadow-md hover:shadow-lg uppercase tracking-wider">
                Commit Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditUserModal;
