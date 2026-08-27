import React from "react";
import { X, ChevronDown } from "lucide-react";

const AddUserModal = ({ isOpen, onClose, newUser, setNewUser, onSubmit }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md sm:p-4 animate-in fade-in duration-300">
      <div className="bg-zinc-950 border border-white/5 rounded-t-[2rem] sm:rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-4 sm:zoom-in-95 duration-300">
        <div className="p-6 sm:p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-1 tracking-tight">
                New Identity
              </h3>
              <p className="text-sm text-zinc-400">
                Register a new protocol operator.
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
                Full Name
              </label>
              <input
                type="text"
                required
                value={newUser.full_name}
                onChange={(e) =>
                  setNewUser({ ...newUser, full_name: e.target.value })
                }
                placeholder="John Doe"
                className="w-full bg-[#000000] border border-white/5 rounded-2xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-white/5focus:ring-1 focus:ring-white/50 transition-all shadow-inner"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-white">
                Index Key
              </label>
              <input
                type="text"
                required
                value={newUser.index_number}
                onChange={(e) =>
                  setNewUser({ ...newUser, index_number: e.target.value })
                }
                placeholder="e.g. 25000"
                className="w-full bg-[#000000] border border-white/5 rounded-2xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-white/5focus:ring-1 focus:ring-white/50 transition-all shadow-inner"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-white">
                Clearance Level
              </label>
              <div className="relative">
                <select
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser({ ...newUser, role: e.target.value })
                  }
                  className="w-full appearance-none bg-[#000000] border border-white/5 rounded-2xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-white/5focus:ring-1 focus:ring-white/50 transition-all cursor-pointer shadow-inner">
                  <option className="bg-[#000000] text-white" value="writer">
                    Writer
                  </option>
                  <option className="bg-[#000000] text-white" value="admin">
                    Admin
                  </option>
                  <option
                    className="bg-[#000000] text-white"
                    value="super-admin">
                    Super Admin
                  </option>
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
                />
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-white/[0.06] ">
              <button
                type="submit"
                className="w-full px-4 py-4 text-sm font-bold bg-white text-black hover:bg-zinc-200 rounded-2xl transition-all shadow-md hover:shadow-lg uppercase tracking-wider">
                Authorize Identity
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddUserModal;
