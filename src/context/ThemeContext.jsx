import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { buildM3Theme } from "../lib/m3roles";

const CUSTOM_THEME_LS_KEY = 'icmu_custom_theme';
const M3_SEEDS_LS_KEY = 'icmu_m3_seeds';

export const DEFAULT_M3_SEEDS = {
  primary:       '#6750a4',
  secondary:     '#625b71',
  tertiary:      '#7d5260',
  error:         '#b3261e',
  neutral:       '#605d62',
};

function hexToRgb(hex) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r ? `${parseInt(r[1],16)}, ${parseInt(r[2],16)}, ${parseInt(r[3],16)}` : '75, 196, 51';
}

function hexLuminance(hex) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!r) return 0;
  const [R, G, B] = [parseInt(r[1],16)/255, parseInt(r[2],16)/255, parseInt(r[3],16)/255];
  return 0.2126*R + 0.7152*G + 0.0722*B;
}

function deriveThemeExtras(partial) {
  const bg = partial.bg || '#000000';
  const lum = hexLuminance(bg);
  const isDark = lum < 0.5;
  // inputBg: slightly lighter than bg for dark themes, slightly darker for light
  const inputBg = isDark ? blendHex(bg, '#ffffff', 0.04) : blendHex(bg, '#000000', 0.04);
  const border = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const accentRgb = hexToRgb(partial.accent || '#4bc433');
  
  let textPrimary = partial.textPrimary || (isDark ? '#ffffff' : '#000000');
  let textSecondary = partial.textSecondary || (isDark ? '#a1a1aa' : '#475569');
  
  const textLum = hexLuminance(textPrimary);
  if (!isDark && textLum > 0.5) {
      textPrimary = '#000000';
      textSecondary = '#475569';
  }
  if (isDark && textLum < 0.5) {
      textPrimary = '#ffffff';
      textSecondary = '#a1a1aa';
  }

  return { inputBg, border, accentRgb, textPrimary, textSecondary };
}

function blendHex(hex, with_, t) {
  const parse = (h) => { const r=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(h); return r?[parseInt(r[1],16),parseInt(r[2],16),parseInt(r[3],16)]:[0,0,0]; };
  const [r1,g1,b1]=parse(hex); const [r2,g2,b2]=parse(with_);
  const r=Math.round(r1+(r2-r1)*t); const g=Math.round(g1+(g2-g1)*t); const b=Math.round(b1+(b2-b1)*t);
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
}

export const DEFAULT_CUSTOM_THEME = {
  id: 'custom',
  name: 'My Custom Theme',
  bg: '#030303',
  cardBg: '#0a0a0a',
  accent: '#3ad900',
  textPrimary: '#ffffff',
  textSecondary: '#a1a1aa',
  fontFamily: "'Montserrat', sans-serif",
  isCustom: true,
};

// Full Complex Theme Presets defining backgrounds, card surfaces, text, fonts, borders & accents
export const THEMES = {
  // --- DARK MODES (OLED OPTIMIZED) ---
  green: {
    id: "green",
    name: "Isipathana Emerald",
    category: "Dark Mode",
    bg: "#030303",
    cardBg: "#080808",
    inputBg: "#050505",
    border: "rgba(12, 12, 12, 0.1)",
    textPrimary: "#ffffff",
    textSecondary: "#a1a1aa",
    accent: "#3ad900",
    accentRgb: "75, 196, 51",
    fontFamily: "'Montserrat', sans-serif",
    description: "Classic OLED dark mode with signature green accents",
  },
  crypto_green: {
    id: "crypto_green",
    name: "Crypto Neon Green",
    category: "Dark Mode",
    bg: "#0b100e",
    cardBg: "#131a17",
    inputBg: "#1c2521",
    border: "rgba(255, 255, 255, 0.05)",
    textPrimary: "#ffffff",
    textSecondary: "#8b9c94",
    accent: "#d4fa3c",
    accentRgb: "212, 250, 60",
    fontFamily: "'Inter', 'Montserrat', sans-serif",
    description: "Modern crypto aesthetic with neon chartreuse accents",
  },
  dragon_red: {
    id: "dragon_red",
    name: "Dragon Red",
    category: "Dark Mode",
    bg: "#030203",
    cardBg: "#050305",
    inputBg: "#010504",
    border: "rgba(255, 0, 0, 0.04)",
    textPrimary: "#ffffff",
    textSecondary: "#a3a3a3",
    accent: "#dc2626",
    accentRgb: "220, 38, 38",
    fontFamily: "'Montserrat', sans-serif",
    description: "Deep crimson red with a matching dark crimson canvas",
  },
  dragon_green: {
    id: "dragon_green",
    name: "Dragon Green",
    category: "Dark Mode",
    bg: "#080f0c",
    cardBg: "#121915",
    inputBg: "#18221c",
    border: "rgba(0, 255, 163, 0.1)",
    textPrimary: "#ffffff",
    textSecondary: "#9ca3af",
    accent: "#00ffa3",
    accentRgb: "0, 255, 163",
    fontFamily: "'Inter', 'Montserrat', sans-serif",
    description: "Sleek and modern dark green with bright mint neon accents",
  },
  emerald_luxe: {
    id: "emerald_luxe",
    name: "Emerald Luxe",
    category: "Dark Mode",
    bg: "#010a05",
    cardBg: "#082114",
    inputBg: "#04150d",
    border: "rgba(255, 255, 255, 0.04)",
    textPrimary: "#f0fdf4",
    textSecondary: "#86efac",
    accent: "#10b981",
    accentRgb: "16, 185, 129",
    fontFamily: "'Montserrat', sans-serif",
    description: "Deep emerald background paired with vibrant green highlights",
  },
  oled_gold: { id: 'oled_gold', name: 'OLED Gold', category: 'Dark Mode', bg: '#000000', cardBg: '#11100d', inputBg: '#0a0907', border: 'rgba(255, 255, 255, 0.06)', textPrimary: '#ffffff', textSecondary: '#a1a1aa', accent: '#eab308', accentRgb: '234, 179, 8', fontFamily: '\'Montserrat\', sans-serif', description: 'Pure black background with premium gold accents' }, oled_monochrome: {
    id: "oled_monochrome",
    name: "OLED Stealth",
    category: "Dark Mode",
    bg: "#000000",
    cardBg: "#141417",
    inputBg: "#050505",
    border: "rgba(255, 255, 255, 0.04)",
    textPrimary: "#ffffff",
    textSecondary: "#a1a1aa",
    accent: "#38bdf8",
    accentRgb: "56, 189, 248",
    fontFamily: "'Montserrat', sans-serif",
    description: "True OLED black canvas designed for crisp focus",
  },

  // --- WARM & RICH DARK (OLED OPTIMIZED) ---
  nordic_amber: {
    id: "nordic_amber",
    name: "Nordic Amber",
    category: "Warm Dark",
    bg: "#0a0502",
    cardBg: "#1c1108",
    inputBg: "#110b05",
    border: "rgba(255, 255, 255, 0.04)",
    textPrimary: "#fafafa",
    textSecondary: "#a1a1aa",
    accent: "#f59e0b",
    accentRgb: "245, 158, 11",
    fontFamily: "'Montserrat', sans-serif",
    description: "Rich amber dark background paired with warm orange accents",
  },
  midnight_indigo: {
    id: "midnight_indigo",
    name: "Midnight Slate",
    category: "Rich Dark",
    bg: "#04060a",
    cardBg: "#111826",
    inputBg: "#0b101a",
    border: "rgba(255, 255, 255, 0.04)",
    textPrimary: "#f8fafc",
    textSecondary: "#94a3b8",
    accent: "#38bdf8",
    accentRgb: "56, 189, 248",
    fontFamily: "'Montserrat', sans-serif",
    description: "Deep slate blue palette with bright sky highlights",
  },
  blue: {
    id: "blue",
    name: "Ocean Sapphire",
    category: "Rich Dark",
    bg: "#02050a",
    cardBg: "#0c182a",
    inputBg: "#060d19",
    border: "rgba(255, 255, 255, 0.04)",
    textPrimary: "#f3f4f6",
    textSecondary: "#9ca3af",
    accent: "#3b82f6",
    accentRgb: "59, 130, 246",
    fontFamily: "'Montserrat', sans-serif",
    description: "Ocean deep blue canvas with bright sapphire illumination",
  },
  navy_gold: {
    id: "navy_gold",
    name: "Navy & Gold",
    category: "Rich Dark",
    bg: "#020308",
    cardBg: "#0b1126",
    inputBg: "#060916",
    border: "rgba(255, 255, 255, 0.04)",
    textPrimary: "#f8fafc",
    textSecondary: "#94a3b8",
    accent: "#fbbf24",
    accentRgb: "251, 191, 36",
    fontFamily: "'Montserrat', sans-serif",
    description: "Dark navy blue paired with luxury golden yellow accents",
  },

  // --- FUTURISTIC & RETRO (OLED OPTIMIZED) ---
  terminal: {
    id: "terminal",
    name: "Terminal Hacker",
    category: "Retro Monospace",
    bg: "#000000",
    cardBg: "#051405",
    inputBg: "#010501",
    border: "rgba(255, 255, 255, 0.04)",
    textPrimary: "#4bc433",
    textSecondary: "rgba(75, 196, 51, 0.75)",
    accent: "#4bc433",
    accentRgb: "75, 196, 51",
    fontFamily: "'VT323', monospace",
    description: "OLED CRT green phosphor hacker terminal style",
  },
  cyberpunk: { id: 'cyberpunk', name: 'Neon Cyberpunk', category: 'Futuristic', bg: '#000000', cardBg: '#14000b', inputBg: '#0d0006', border: 'rgba(255, 255, 255, 0.04)', textPrimary: '#ffffff', textSecondary: '#fca5a5', accent: '#ff007f', accentRgb: '255, 0, 127', fontFamily: '\'Montserrat\', sans-serif', description: 'True black void with hot neon pink glow' },
  dracula_ruby: { id: 'dracula_ruby', name: 'Vampire Ruby', category: 'Futuristic', bg: '#000000', cardBg: '#160808', inputBg: '#050202', border: 'rgba(255, 255, 255, 0.04)', textPrimary: '#ffe8e8', textSecondary: '#fc8484', accent: '#ef4646', accentRgb: '239, 70, 70', fontFamily: '\'Montserrat\', sans-serif', description: 'Pitch black canvas illuminated by vibrant ruby glow' },
  synthwave: { id: 'synthwave', name: 'Cyber Sunset', category: 'Futuristic', bg: '#000000', cardBg: '#140a00', inputBg: '#0a0500', border: 'rgba(255, 255, 255, 0.04)', textPrimary: '#ffffff', textSecondary: '#fdba74', accent: '#f97316', accentRgb: '249, 115, 22', fontFamily: '\'Montserrat\', sans-serif', description: 'OLED synthwave blending dark space with sunrise orange' },
  nethinethera: {
    id: "nethinethera",
    name: "Nethinethera",
    category: "Dark Mode",
    bg: "#000000",
    cardBg: "#0a0a0a",
    inputBg: "#020202",
    border: "rgba(255, 255, 255, 0.04)",
    textPrimary: "#ffffff",
    textSecondary: "#ffffff",
    accent: "#fff",
    accentRgb: "255, 255, 255",
    fontFamily: "'Konexy', sans-serif",
    description: "Perspective shapes reality",
  },

  // --- LIGHT MODES (UNCHANGED) ---
  light_clean: {
    id: "light_clean",
    name: "Minimalist White",
    category: "Light Mode",
    bg: "#ffffff",
    cardBg: "#f8fafc",
    inputBg: "#ffffff",
    border: "rgba(0, 0, 0, 0.06)",
    textPrimary: "#0f172a",
    textSecondary: "#475569",
    accent: "#2563eb",
    accentRgb: "37, 99, 235",
    fontFamily: "'Montserrat', sans-serif",
    description: "High contrast pure white mode with royal blue accents",
  },
  high_contrast_light: {
    id: "high_contrast_light",
    name: "High Contrast Light",
    category: "Light Mode",
    bg: "#ffffff",
    cardBg: "#f4f4f5",
    inputBg: "#ffffff",
    border: "rgba(0, 0, 0, 0.06)",
    textPrimary: "#000000",
    textSecondary: "#27272a",
    accent: "#dc2626",
    accentRgb: "220, 38, 38",
    fontFamily: "'Montserrat', sans-serif",
    description: "Pure white light background with sharp crimson details",
  },
  paper_sepia: {
    id: "paper_sepia",
    name: "Warm Editorial",
    category: "Light Mode",
    bg: "#fbf9f5",
    cardBg: "#f3efe6",
    inputBg: "#ffffff",
    border: "rgba(0, 0, 0, 0.06)",
    textPrimary: "#291e14",
    textSecondary: "#78350f",
    accent: "#c2410c",
    accentRgb: "194, 65, 12",
    fontFamily: "'Montserrat', sans-serif",
    description: "Comfortable sepia paper theme designed for extended reading",
  },
  nordic_frost: {
    id: "nordic_frost",
    name: "Nordic Frost",
    category: "Light Mode",
    bg: "#f0f9ff",
    cardBg: "#e0f2fe",
    inputBg: "#ffffff",
    border: "rgba(0, 0, 0, 0.06)",
    textPrimary: "#0c4a6e",
    textSecondary: "#0369a1",
    accent: "#0284c7",
    accentRgb: "2, 132, 199",
    fontFamily: "'Montserrat', sans-serif",
    description:
      "Cool arctic light theme featuring slate cyan and ice blue tones",
  },
};
const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [themeId, setThemeId] = useState(() => {
    try {
      return localStorage.getItem("icmu_admin_theme") || "green";
    } catch {
      return "green";
    }
  });

  const [customTheme, setCustomThemeState] = useState(() => {
    try {
      const raw = localStorage.getItem(CUSTOM_THEME_LS_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  });

  const [m3Seeds, setM3Seeds] = useState(() => {
    try {
      const raw = localStorage.getItem(M3_SEEDS_LS_KEY);
      return raw ? JSON.parse(raw) : DEFAULT_M3_SEEDS;
    } catch { return DEFAULT_M3_SEEDS; }
  });

  const [m3Mode, setM3Mode] = useState(() => {
    try {
      return localStorage.getItem('icmu_m3_mode') || 'dark';
    } catch { return 'dark'; }
  });

  const [themeTrigger, setThemeTrigger] = useState(0);

  const theme = themeId === 'custom' ? (customTheme || DEFAULT_CUSTOM_THEME) : (THEMES[themeId] || THEMES.green);

  // Apply complete CSS custom properties to root dynamically
  useEffect(() => {
    const root = document.documentElement;
    let t;
    if (themeId === 'custom' && customTheme) {
      const extras = deriveThemeExtras(customTheme);
      t = { ...customTheme, ...extras };
    } else {
      t = THEMES[themeId] || THEMES.green;
    }
    root.style.setProperty("--admin-bg", t.bg);
    root.style.setProperty("--admin-card-bg", t.cardBg);
    root.style.setProperty("--admin-input-bg", t.inputBg || t.bg);
    root.style.setProperty("--admin-border", t.border || 'rgba(255,255,255,0.06)');
    root.style.setProperty("--admin-text-primary", t.textPrimary);
    root.style.setProperty("--admin-text-secondary", t.textSecondary);
    root.style.setProperty("--accent", t.accent);
    root.style.setProperty("--accent-rgb", t.accentRgb || hexToRgb(t.accent));
    root.style.setProperty("--admin-font", t.fontFamily || "'Montserrat', sans-serif");

    try {
      localStorage.setItem("icmu_admin_theme", themeId);
    } catch {
      // Storage unavailable
    }
  }, [themeId, customTheme, themeTrigger]);

  useEffect(() => {
    const handleSync = () => {
      try {
        const savedCustomRaw = localStorage.getItem('icmu_custom_theme');
        if (savedCustomRaw) {
          try {
            const savedCustom = JSON.parse(savedCustomRaw);
            setCustomThemeState(savedCustom);
          } catch (e) {}
        }
        const saved = localStorage.getItem("icmu_admin_theme");
        if (saved) {
           setThemeId(saved);
           setThemeTrigger(t => t + 1);
        }
      } catch (e) {}
    };
    window.addEventListener('theme_sync', handleSync);
    return () => window.removeEventListener('theme_sync', handleSync);
  }, [themeId]);

  // Apply draft live (no save) — for real-time preview
  const applyCustomTheme = useCallback((draft) => {
    const extras = deriveThemeExtras(draft);
    const root = document.documentElement;
    const t = { ...draft, ...extras };
    root.style.setProperty('--admin-bg', t.bg);
    root.style.setProperty('--admin-card-bg', t.cardBg);
    root.style.setProperty('--admin-input-bg', t.inputBg);
    root.style.setProperty('--admin-border', t.border);
    root.style.setProperty('--admin-text-primary', t.textPrimary);
    root.style.setProperty('--admin-text-secondary', t.textSecondary);
    root.style.setProperty('--accent', t.accent);
    root.style.setProperty('--accent-rgb', t.accentRgb);
  }, []);

  // Save custom theme to state + localStorage + optionally DB
  const persistCustomTheme = useCallback((themeObj) => {
    setCustomThemeState(themeObj);
    setThemeId('custom');
    setThemeTrigger(t => t + 1);
    try {
      localStorage.setItem(CUSTOM_THEME_LS_KEY, JSON.stringify(themeObj));
      localStorage.setItem('icmu_admin_theme', 'custom');
    } catch {}
  }, []);

  const setTheme = (id) => {
    if (THEMES[id] || id === 'custom') {
      setThemeId(id);
      setThemeTrigger(t => t + 1);
    }
  };

  const contextValue = useMemo(
    () => ({ theme, themeId, setTheme, themes: THEMES, customTheme, applyCustomTheme, persistCustomTheme }),
    [theme, themeId, customTheme, applyCustomTheme, persistCustomTheme, themeTrigger],
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return {
      theme: THEMES.green,
      themeId: "green",
      setTheme: () => {},
      themes: THEMES,
    };
  }
  return ctx;
};

export default ThemeContext;

