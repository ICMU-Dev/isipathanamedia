import React, { useState } from "react";
import {
  Copy,
  Check,
  Wand2,
  RotateCcw,
  AlertCircle,
  FileCode,
  CheckCircle2,
} from "lucide-react";

const ConfigJsonEditor = ({
  rawJsonText,
  onChangeRawText,
  jsonError,
  onPrettify,
  onResetDefault,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(rawJsonText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lineCount = rawJsonText ? rawJsonText.split("\n").length : 0;
  const byteSize = new Blob([rawJsonText || ""]).size;

  return (
    <div className=" border-theme rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col h-full max-h-[60vh] sm:max-h-[65vh]">
      {/* Code Editor Header */}
      <div className="bg-[#181818] px-4 sm:px-6 py-3 border-b border-white/[0.06] flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-600/60"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/60"></div>
          </div>
          <div className="flex items-center gap-2">
            <FileCode size={14} className="text-theme-accent " />
            <span className="text-xs font-mono font-bold text-theme-primary opacity-90">
              site_config.json
            </span>
            <span className="text-[10px] font-mono text-theme-primary opacity-40">
              ({lineCount} lines • {(byteSize / 1024).toFixed(2)} KB)
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {jsonError ? (
            <div className="flex items-center gap-1.5 text-xs text-red-400 font-mono px-2.5 py-1 rounded-2xl bg-red-600/10 border border-red-600/20">
              <AlertCircle size={13} className="shrink-0 animate-pulse" />
              <span className="truncate max-w-[180px] sm:max-w-xs">
                {jsonError}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono px-2 py-0.5 rounded bg-emerald-500/10">
              <CheckCircle2 size={12} /> Valid JSON
            </div>
          )}

          <button
            type="button"
            onClick={onPrettify}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] text-theme-primary text-xs font-medium transition-all"
            title="Prettify / Format JSON">
            <Wand2 size={13} className="text-theme-accent " />
            <span className="hidden sm:inline">Format</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] text-theme-primary text-xs font-medium transition-all"
            title="Copy JSON text">
            {copied ? (
              <Check size={13} className="text-emerald-400" />
            ) : (
              <Copy size={13} />
            )}
            <span className="hidden sm:inline">
              {copied ? "Copied" : "Copy"}
            </span>
          </button>

          <button
            type="button"
            onClick={onResetDefault}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-600/20 text-xs font-medium transition-all"
            title="Reset default configuration">
            <RotateCcw size={13} />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 relative flex admin-input min-h-0 overflow-hidden">
        {/* Line Numbers Column */}
        <div className="py-4 px-2 sm:px-3 bg-[#0d0d0d] border-r border-white/[0.06] text-right font-mono text-xs text-theme-primary opacity-30 select-none hidden sm:block overflow-hidden">
          {Array.from({ length: Math.max(lineCount, 10) }, (_, i) => (
            <div key={i + 1} className="leading-relaxed">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Scrollable Text Area */}
        <textarea
          spellCheck="false"
          value={rawJsonText}
          onChange={(e) => onChangeRawText(e.target.value)}
          className="flex-1 bg-transparent p-3 sm:p-4 text-theme-accent /90 font-mono text-xs sm:text-sm leading-relaxed focus:outline-none resize-none overflow-y-auto overflow-x-auto whitespace-pre scrollbar-thin"
          placeholder="Paste or write valid JSON configuration here..."
        />
      </div>
    </div>
  );
};

export default ConfigJsonEditor;
