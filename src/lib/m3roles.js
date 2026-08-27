/**
 * m3roles.js — Material 3 Color Role Mapping
 *
 * Defines which tone from which palette fills each semantic role,
 * for both Light and Dark modes (per M3 spec).
 *
 * Also provides buildM3CssVars() which maps roles → the CSS custom
 * properties used by the existing ICMU admin panel.
 */

import { generateAllPalettes } from './m3palette';

// ─── Tone mapping table (M3 spec) ─────────────────────────────────────────────
//
// Format: [paletteName, tone]
//
const LIGHT_ROLES = {
  primary:               ['primary',       40],
  onPrimary:             ['primary',      100],
  primaryContainer:      ['primary',       90],
  onPrimaryContainer:    ['primary',       10],

  secondary:             ['secondary',     40],
  onSecondary:           ['secondary',    100],
  secondaryContainer:    ['secondary',     90],
  onSecondaryContainer:  ['secondary',     10],

  tertiary:              ['tertiary',      40],
  onTertiary:            ['tertiary',     100],
  tertiaryContainer:     ['tertiary',      90],
  onTertiaryContainer:   ['tertiary',      10],

  error:                 ['error',         40],
  onError:               ['error',        100],
  errorContainer:        ['error',         90],
  onErrorContainer:      ['error',         10],

  background:            ['neutral',       98],
  onBackground:          ['neutral',       10],
  surface:               ['neutral',       98],
  onSurface:             ['neutral',       10],
  surfaceVariant:        ['neutralVariant',90],
  onSurfaceVariant:      ['neutralVariant',30],

  outline:               ['neutralVariant',50],
  outlineVariant:        ['neutralVariant',80],

  inverseSurface:        ['neutral',       20],
  inverseOnSurface:      ['neutral',       95],
  inversePrimary:        ['primary',       80],

  // Extra surface tones used for layering
  surfaceContainerLowest:  ['neutral', 100],
  surfaceContainerLow:     ['neutral',  96],
  surfaceContainer:        ['neutral',  94],
  surfaceContainerHigh:    ['neutral',  92],
  surfaceContainerHighest: ['neutral',  90],
};

const DARK_ROLES = {
  primary:               ['primary',       80],
  onPrimary:             ['primary',       20],
  primaryContainer:      ['primary',       30],
  onPrimaryContainer:    ['primary',       90],

  secondary:             ['secondary',     80],
  onSecondary:           ['secondary',     20],
  secondaryContainer:    ['secondary',     30],
  onSecondaryContainer:  ['secondary',     90],

  tertiary:              ['tertiary',      80],
  onTertiary:            ['tertiary',      20],
  tertiaryContainer:     ['tertiary',      30],
  onTertiaryContainer:   ['tertiary',      90],

  error:                 ['error',         80],
  onError:               ['error',         20],
  errorContainer:        ['error',         30],
  onErrorContainer:      ['error',         80],

  background:            ['neutral',        6],
  onBackground:          ['neutral',       90],
  surface:               ['neutral',        6],
  onSurface:             ['neutral',       90],
  surfaceVariant:        ['neutralVariant',30],
  onSurfaceVariant:      ['neutralVariant',80],

  outline:               ['neutralVariant',60],
  outlineVariant:        ['neutralVariant',30],

  inverseSurface:        ['neutral',       90],
  inverseOnSurface:      ['neutral',       20],
  inversePrimary:        ['primary',       40],

  surfaceContainerLowest:  ['neutral',  4],
  surfaceContainerLow:     ['neutral', 10],
  surfaceContainer:        ['neutral', 12],
  surfaceContainerHigh:    ['neutral', 17],
  surfaceContainerHighest: ['neutral', 22],
};

// ─── Role resolver ────────────────────────────────────────────────────────────

/**
 * Resolve all M3 color roles from generated palettes.
 * @param {Object} palettes — output of generateAllPalettes()
 * @param {'light'|'dark'} mode
 * @returns {Object} — { primary: '#hex', onPrimary: '#hex', … }
 */
export function resolveRoles(palettes, mode = 'dark') {
  const map = mode === 'light' ? LIGHT_ROLES : DARK_ROLES;
  const roles = {};
  for (const [role, [paletteName, tone]] of Object.entries(map)) {
    roles[role] = palettes[paletteName]?.[tone] ?? '#000000';
  }
  return roles;
}

// ─── CSS variable builder ─────────────────────────────────────────────────────

/**
 * Convert resolved M3 roles → the CSS custom properties used
 * by the existing ICMU admin panel theme system.
 *
 * Additive: also writes new --m3-* vars for richer future use.
 */
export function buildM3CssVars(roles, mode = 'dark') {
  const isDark = mode === 'dark';
  return {
    // ── Core admin vars (existing system) ──
    '--admin-bg':             isDark ? roles.background : roles.background,
    '--admin-card-bg':        isDark ? roles.surfaceContainer : roles.surfaceContainerLow,
    '--admin-input-bg':       isDark ? roles.surfaceContainerHigh : roles.surfaceContainerHighest,
    '--admin-border':         roles.outlineVariant,
    '--admin-text-primary':   roles.onSurface,
    '--admin-text-secondary': roles.onSurfaceVariant,
    '--accent':               roles.primary,
    '--accent-rgb':           hexToRgbStr(roles.primary),

    // ── Extended M3 vars ──
    '--m3-primary':                  roles.primary,
    '--m3-on-primary':               roles.onPrimary,
    '--m3-primary-container':        roles.primaryContainer,
    '--m3-on-primary-container':     roles.onPrimaryContainer,
    '--m3-secondary':                roles.secondary,
    '--m3-secondary-container':      roles.secondaryContainer,
    '--m3-tertiary':                 roles.tertiary,
    '--m3-tertiary-container':       roles.tertiaryContainer,
    '--m3-error':                    roles.error,
    '--m3-error-container':          roles.errorContainer,
    '--m3-on-error-container':       roles.onErrorContainer,
    '--m3-surface':                  roles.surface,
    '--m3-surface-variant':          roles.surfaceVariant,
    '--m3-on-surface-variant':       roles.onSurfaceVariant,
    '--m3-outline':                  roles.outline,
    '--m3-outline-variant':          roles.outlineVariant,
    '--m3-inverse-surface':          roles.inverseSurface,
    '--m3-inverse-primary':          roles.inversePrimary,
  };
}

function hexToRgbStr(hex) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return '0,0,0';
  return `${parseInt(m[1],16)}, ${parseInt(m[2],16)}, ${parseInt(m[3],16)}`;
}

// ─── All-in-one ───────────────────────────────────────────────────────────────

/**
 * From seeds → CSS vars object, ready to apply to document.documentElement.
 */
export function buildM3Theme(seeds, mode = 'dark') {
  const palettes = generateAllPalettes(seeds);
  const roles = resolveRoles(palettes, mode);
  const cssVars = buildM3CssVars(roles, mode);
  return { palettes, roles, cssVars };
}
