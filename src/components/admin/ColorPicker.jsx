import React, { useState, useRef, useEffect } from 'react';
import { Pipette, Check } from 'lucide-react';

// Comprehensive 10-column palette matrix across all hues from deep dark to vivid neons and light pastels
const PALETTE = [
  // 1. OLED Blacks & Neutrals (0% -> 100%)
  ["#000000", "#080808", "#121212", "#18181b", "#27272a", "#3f3f46", "#52525b", "#71717a", "#a1a1aa", "#ffffff"],
  // 2. Slate & Cool Grays
  ["#020617", "#0f172a", "#1e293b", "#334155", "#475569", "#64748b", "#94a3b8", "#cbd5e1", "#e2e8f0", "#f8fafc"],
  // 3. Warm Sepia & Stone Grays
  ["#0c0a09", "#1c1917", "#292524", "#44403c", "#57534e", "#78716c", "#a8a29e", "#d6d3d1", "#e7e5e4", "#fafaf9"],
  // 4. Ruby & Deep Reds
  ["#450a0a", "#7f1d1d", "#991b1b", "#b91c1c", "#dc2626", "#ef4444", "#f87171", "#fca5a5", "#fecaca", "#fee2e2"],
  // 5. Amber & Warm Orange
  ["#431407", "#7c2d12", "#9a3412", "#c2410c", "#ea580c", "#f97316", "#fb923c", "#fdba74", "#fed7aa", "#ffedd5"],
  // 6. Gold & Sun Yellow
  ["#422006", "#713f12", "#92400e", "#b45309", "#d97706", "#eab308", "#facc15", "#fde047", "#fef08a", "#fef9c3"],
  // 7. Lime & Neon Chartreuse
  ["#1a2e05", "#365314", "#4d7c0f", "#65a30d", "#84cc16", "#a3e635", "#bef264", "#d4fa3c", "#d9f99d", "#f7fee7"],
  // 8. Emerald & Isipathana Green
  ["#022c22", "#064e3b", "#065f46", "#047857", "#059669", "#10b981", "#3ad900", "#34d399", "#6ee7b7", "#d1fae5"],
  // 9. Cyan & Turquoise
  ["#042f2e", "#134e4a", "#115e59", "#0f766e", "#0d9488", "#14b8a6", "#06b6d4", "#22d3ee", "#67e8f9", "#cffafe"],
  // 10. Sky & Royal Blue
  ["#082f49", "#0c4a6e", "#075985", "#0369a1", "#0284c7", "#0ea5e9", "#38bdf8", "#7dd3fc", "#bae6fd", "#e0f2fe"],
  // 11. Indigo & Deep Cobalt
  ["#172554", "#1e3a8a", "#1e40af", "#1d4ed8", "#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe", "#dbeafe"],
  // 12. Violet & Deep Purple
  ["#1e1b4b", "#312e81", "#3730a3", "#4338ca", "#4f46e5", "#6366f1", "#818cf8", "#a5b4fc", "#c7d2fe", "#e0e7ff"],
  // 13. Purple & Magenta
  ["#3b0764", "#581c87", "#6b21a8", "#7e22ce", "#9333ea", "#a855f7", "#c084fc", "#d8b4fe", "#e9d5ff", "#f3e8ff"],
  // 14. Rose & Vibrant Pink
  ["#4c0519", "#831843", "#9f1239", "#be123c", "#e11d48", "#f43f5e", "#fb7185", "#fda4af", "#fecdd3", "#ffe4e6"],
];

const isValidHex = (h) => /^#[0-9a-fA-F]{6}$/.test(h);

export const ColorPicker = ({ value, onChange, label }) => {
  const [open, setOpen] = useState(false);
  const [hex, setHex] = useState(value || '#000000');
  const [placement, setPlacement] = useState('bottom');
  const wrapRef = useRef(null);
  const popoverRef = useRef(null);
  const nativeColorRef = useRef(null);

  useEffect(() => {
    if (value && isValidHex(value) && value.toLowerCase() !== hex.toLowerCase()) {
      setHex(value);
    }
  }, [value]);

  useEffect(() => {
    if (!open) return;

    // Check viewport space to flip upward if bottom space is constrained
    if (wrapRef.current) {
      const rect = wrapRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      if (spaceBelow < 340 && rect.top > 340) {
        setPlacement('top');
      } else {
        setPlacement('bottom');
      }
    }

    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const pick = (color) => {
    setHex(color);
    onChange(color);
  };

  const handleHexInput = (e) => {
    let v = e.target.value;
    if (!v.startsWith('#')) v = '#' + v;
    setHex(v);
    if (isValidHex(v)) onChange(v);
  };

  return (
    <div ref={wrapRef} className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between w-full p-2 bg-[var(--admin-input-bg)] rounded-2xl border border-[var(--admin-border)] hover:border-theme-accent/ transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-6 h-6 rounded-3xl  shrink-0 border border-[var(--admin-border)] shadow-sm transition-transform hover:scale-105"
            style={{ backgroundColor: isValidHex(hex) ? hex : '#000' }}
          />
          <span className="text-[11px] font-bold text-[var(--admin-text-primary)] uppercase tracking-wider">{label}</span>
        </div>
        <span className="text-xs font-mono text-[var(--admin-text-secondary)] font-medium">{(isValidHex(hex) ? hex : value || '').toUpperCase()}</span>
      </button>

      {/* Popover */}
      {open && (
        <div
          ref={popoverRef}
          className={`absolute z-[999] left-0 sm:left-auto sm:right-0 w-[260px] sm:w-[280px] bg-[var(--admin-card-bg,#121212)] border border-[var(--admin-border)] rounded-2xl shadow-[0_12px_36px_rgba(0,0,0,0.6)] p-3 animate-in fade-in zoom-in-95 duration-150 ${
            placement === 'top' ? 'bottom-full mb-2 origin-bottom-left sm:origin-bottom-right' : 'top-full mt-2 origin-top-left sm:origin-top-right'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--admin-border)]">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--admin-text-secondary)]">
              Color Shaders & Spectrum
            </span>
            <span className="text-[10px] font-mono font-bold text-[var(--accent)]">
              {hex.toUpperCase()}
            </span>
          </div>

          {/* Swatch Matrix Grid */}
          <div className="grid gap-[2.5px] max-h-[220px] overflow-y-auto pr-0.5 custom-scrollbar" style={{ gridTemplateColumns: 'repeat(10, 1fr)' }}>
            {PALETTE.flat().map((color, i) => (
              <button
                key={i}
                type="button"
                title={color}
                onClick={() => pick(color)}
                className="w-full aspect-square rounded-[3px] transition-transform hover:scale-125 hover:z-20 relative focus:outline-none focus:ring-1 focus:ring-white ring-offset-1 ring-offset-black/50"
                style={{ backgroundColor: color }}
              >
                {hex.toLowerCase() === color.toLowerCase() && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white shadow ring-1 ring-black/50" />
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Hex & Custom Picker Controls */}
          <div className="mt-3 pt-2.5 border-t border-[var(--admin-border)] flex items-center gap-2">
            {/* Native Color Picker Trigger */}
            <div className="relative">
              <input
                ref={nativeColorRef}
                type="color"
                value={isValidHex(hex) ? hex : '#000000'}
                onChange={(e) => pick(e.target.value)}
                className="sr-only"
              />
              <button
                type="button"
                title="Open system color picker"
                onClick={() => nativeColorRef.current?.click()}
                className="w-7 h-7 rounded-3xl  border border-[var(--admin-border)] flex items-center justify-center bg-[var(--admin-input-bg)] hover:border-theme-accent/ transition-colors"
                style={{ backgroundColor: isValidHex(hex) ? hex : '#000' }}
              >
                <Pipette size={12} className="text-white mix-blend-difference" />
              </button>
            </div>

            {/* Hex text input */}
            <input
              type="text"
              value={hex.toUpperCase()}
              onChange={handleHexInput}
              maxLength={7}
              spellCheck={false}
              className="flex-1 min-w-0 bg-[var(--admin-input-bg)] border border-[var(--admin-border)] rounded-2xl px-2.5 py-1 text-xs font-mono text-[var(--admin-text-primary)] outline-none focus:border-[var(--accent)] transition-colors"
              placeholder="#000000"
            />

            {/* Close Button */}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-[11px] font-bold px-3 py-1 rounded-2xl bg-[var(--accent)] text-black hover:opacity-95 transition-all shrink-0"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorPicker;

