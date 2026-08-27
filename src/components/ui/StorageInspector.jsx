import React, { useState, useEffect } from "react";
import {  AnimatePresence } from "framer-motion";
import { motion } from "framer-motion";
import { X, RefreshCcw, Copy, Trash2, Database, Search } from "lucide-react";

const StorageInspector = ({ isOpen, onClose }) => {
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedKey, setCopiedKey] = useState(null);

  const loadStorage = () => {
    const storageItems = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      storageItems.push({ key, value });
    }
    setItems(storageItems.sort((a, b) => a.key.localeCompare(b.key)));
  };

  useEffect(() => {
    if (isOpen) {
      loadStorage();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleCopy = (key, value) => {
    navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const filteredItems = items.filter(
    (item) =>
      item.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.value.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/90 backdrop-blur-md"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl max-h-[85vh] bg-[#0c0c0e] border border-white/[0.06] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-white/[0.06] flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/[0.05] borderborder-white/[0.06]  flex items-center justify-center text-white/70">
                <Database size={20} />
              </div>
              <div>
                <h3 className="font-sans text-base font-bold tracking-wider text-white uppercase">
                  Storage Inspector
                </h3>
                <p className="font-konexy text-[9px] tracking-[0.2em] text-white/40 uppercase">
                  Dev Mode • Local Storage
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={loadStorage}
                className="p-2.5 rounded-2xl hover:bg-white/5 text-white/40 hover:text-white transition-all active:scale-95"
                title="Refresh">
                <RefreshCcw size={18} />
              </button>
              <button
                onClick={onClose}
                className="p-2.5 rounded-2xl hover:bg-white/5 text-white/40 hover:text-white transition-all active:scale-95">
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="px-6 py-4 border-b border-white/[0.06] ">
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20"
                size={16}
              />
              <input
                type="text"
                placeholder="Search keys or values..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/[0.03] borderborder-white/[0.06]  rounded-2xl py-3 pl-12 pr-4 text-sm font-sans text-white placeholder-white/20 focus:outline-none focus:border-white/20 transition-all"
              />
            </div>
          </div>

          {/* List Content */}
          <div className="flex-grow overflow-y-auto p-6 space-y-3 custom-scrollbar">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <div
                  key={item.key}
                  className="group p-4 rounded-2xl border border-white/[0.06]  bg-white/[0.01] hover:bg-white/[0.03] transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[11px] font-bold text-white/60 tracking-wider uppercase truncate max-w-[70%]">
                      {item.key}
                    </span>
                    <button
                      onClick={() => handleCopy(item.key, item.value)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-[10px] font-konexy tracking-wider uppercase transition-all ${
                        copiedKey === item.key
                          ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : "bg-white/[0.05] text-white/40 hover:text-white border border-white/[0.06] "
                      }`}>
                      {copiedKey === item.key ? (
                        "Copied"
                      ) : (
                        <>
                          <Copy size={12} /> Copy
                        </>
                      )}
                    </button>
                  </div>
                  <div className="p-3 rounded-2xl bg-black border border-white/[0.06]  overflow-x-auto">
                    <code className="font-mono text-xs text-white/80 whitespace-pre-wrap break-all">
                      {item.value || "(empty)"}
                    </code>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-40 flex flex-col items-center justify-center text-center">
                <p className="font-sans text-sm text-white/20">
                  No items found in local storage
                </p>
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="px-6 py-4 border-t border-white/[0.06] bg-white/[0.01]">
            <p className="font-konexy text-[8px] tracking-[0.3em] text-white/20 text-center uppercase">
              Items: {filteredItems.length} | Total: {items.length}
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default StorageInspector;
