/**
 * ICMU Roles & Permissions Utility
 * 
 * Supports multi-role assignments stored as comma-separated values (e.g. "admin,broadcaster").
 * 
 * Role hierarchy & combo rules:
 * - super-admin: Unrestricted full access to all panels (super admin hub, admin, broadcast).
 * - admin: Standard admin dashboard access. Can optionally be combined with broadcaster ("admin,broadcaster").
 * - broadcaster: Access to broadcasting operator panel. Can optionally be combined with admin ("admin,broadcaster").
 * - writer: Restricted newsroom access within admin dashboard. Standalone only.
 */

export const ROLES = {
  SUPER_ADMIN: 'super-admin',
  ADMIN: 'admin',
  WRITER: 'writer',
  BROADCASTER: 'broadcaster',
};

/**
 * Parses a role string (which could be single or comma-separated) into an array of lowercase role tokens.
 * @param {string} roleStr 
 * @returns {string[]}
 */
export function parseRoles(roleStr) {
  if (!roleStr) return [];
  if (Array.isArray(roleStr)) {
    return roleStr.flatMap((r) => parseRoles(r));
  }
  if (typeof roleStr !== 'string') {
    try {
      roleStr = String(roleStr);
    } catch {
      return [];
    }
  }
  const cleaned = roleStr.replace(/[\[\]{}"';]/g, '');
  // Normalize compound tokens like "admin_broadcaster" or "admin + broadcaster"
  const normalized = cleaned
    .replace(/admin_broadcaster/gi, 'admin,broadcaster')
    .replace(/broadcaster_admin/gi, 'admin,broadcaster');

  return normalized
    .split(/[,+&/]+/)
    .map((r) => r.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Normalizes an array or string of roles into standard stored string format.
 * Automatically sorts and de-duplicates.
 * @param {string|string[]} roles 
 * @returns {string}
 */
export function formatStoredRole(roles) {
  const roleList = Array.isArray(roles) ? roles : parseRoles(roles);
  const unique = Array.from(new Set(roleList.map((r) => r.toLowerCase())));

  // If super-admin is present, it supersedes all other combinations
  if (unique.includes('super-admin') || unique.includes('superadmin') || unique.includes('super_admin')) {
    return ROLES.SUPER_ADMIN;
  }

  // If writer is present alone (or prioritized)
  if (unique.includes(ROLES.WRITER) && !unique.includes(ROLES.ADMIN) && !unique.includes(ROLES.BROADCASTER)) {
    return ROLES.WRITER;
  }

  // Admin + Broadcaster combination
  if (unique.includes(ROLES.ADMIN) && unique.includes(ROLES.BROADCASTER)) {
    return 'admin,broadcaster';
  }

  if (unique.includes(ROLES.BROADCASTER)) {
    return ROLES.BROADCASTER;
  }

  if (unique.includes(ROLES.ADMIN)) {
    return ROLES.ADMIN;
  }

  if (unique.includes(ROLES.WRITER)) {
    return ROLES.WRITER;
  }

  return unique[0] || ROLES.ADMIN;
}

/**
 * Check if the role is Super Admin
 */
export function isSuperAdmin(roleStr) {
  const roles = parseRoles(roleStr);
  return roles.some((r) => r === 'super-admin' || r === 'superadmin' || r === 'super_admin');
}

/**
 * Check if user has Admin role (super-admin also counts)
 */
export function isAdmin(roleStr) {
  if (isSuperAdmin(roleStr)) return true;
  const roles = parseRoles(roleStr);
  return roles.includes(ROLES.ADMIN);
}

/**
 * Check if user is Writer
 */
export function isWriter(roleStr) {
  const roles = parseRoles(roleStr);
  return roles.includes(ROLES.WRITER);
}

/**
 * Check if user has Broadcaster role (super-admin also counts)
 */
export function isBroadcaster(roleStr) {
  if (isSuperAdmin(roleStr)) return true;
  const roles = parseRoles(roleStr);
  return roles.includes(ROLES.BROADCASTER);
}

/**
 * Permission checks for specific dashboard panels
 */
export function canAccessSuperAdminDashboard(roleStr) {
  return isSuperAdmin(roleStr);
}

export function isComboAdminBroadcaster(roleStr) {
  if (isSuperAdmin(roleStr)) return false;
  const roles = parseRoles(roleStr);
  return roles.includes(ROLES.ADMIN) && roles.includes(ROLES.BROADCASTER);
}

/**
 * Access check for the main Hub (/:adminPath)
 * Super Admin OR Admin + Broadcaster dual clearance operators
 */
export function canAccessHub(roleStr) {
  if (isSuperAdmin(roleStr)) return true;
  const roles = parseRoles(roleStr);
  return roles.includes(ROLES.ADMIN) && roles.includes(ROLES.BROADCASTER);
}

export function canAccessAdminDashboard(roleStr) {
  if (isSuperAdmin(roleStr)) return true;
  const roles = parseRoles(roleStr);
  return roles.includes(ROLES.ADMIN) || roles.includes(ROLES.WRITER);
}

export function canAccessBroadcastDashboard(roleStr) {
  if (isSuperAdmin(roleStr)) return true;
  const roles = parseRoles(roleStr);
  return roles.includes(ROLES.BROADCASTER);
}

/**
 * Get default landing dashboard path for a user's role
 * @param {string} roleStr 
 * @param {string} userIndex 
 * @returns {string}
 */
export function getDefaultDashboardPath(roleStr, userIndex) {
  if (!userIndex) return '/';
  // Super Admin and Admin+Broadcaster dual operators land on the Hub
  if (canAccessSuperAdminDashboard(roleStr) || isComboAdminBroadcaster(roleStr)) {
    return `/${userIndex}`;
  }
  if (canAccessAdminDashboard(roleStr)) {
    return `/${userIndex}/dashboard`;
  }
  if (canAccessBroadcastDashboard(roleStr)) {
    return `/${userIndex}/broadcast`;
  }
  return `/${userIndex}/dashboard`;
}

/**
 * Human-readable label for a role value
 * @param {string} roleStr 
 * @returns {string}
 */
export function getRoleLabel(roleStr) {
  if (isSuperAdmin(roleStr)) return 'Super Admin';
  const roles = parseRoles(roleStr);
  const hasAdmin = roles.includes(ROLES.ADMIN);
  const hasBroadcaster = roles.includes(ROLES.BROADCASTER);
  const hasWriter = roles.includes(ROLES.WRITER);

  if (hasAdmin && hasBroadcaster) return 'Admin + Broadcaster';
  if (hasAdmin) return 'Admin';
  if (hasBroadcaster) return 'Broadcaster';
  if (hasWriter) return 'Writer';
  return 'Unknown Role';
}

/**
 * Predefined selectable role options for UI dropdowns
 */
export const AVAILABLE_ROLE_OPTIONS = [
  { value: 'writer', label: 'Writer', description: 'Limited newsroom & article authoring only' },
  { value: 'broadcaster', label: 'Broadcaster', description: 'Broadcasting operations terminal access only' },
  { value: 'admin', label: 'Admin', description: 'Full admin portal & content management' },
  { value: 'admin,broadcaster', label: 'Admin + Broadcaster', description: 'Both admin dashboard & broadcasting terminal' },
  { value: 'super-admin', label: 'Super Admin', description: 'Full access to all terminals and user clearance matrix' },
];

/**
 * Known baseline admin profiles to ensure author, reporter, and team lookups
 * always resolve gracefully even if database RLS limits user enumeration.
 */
export const KNOWN_ADMIN_PROFILES_LIST = [
  {
    id: '557bcaa8-39fd-41fc-84b2-4738127e0b00',
    index_number: '25433',
    role: 'admin',
    full_name: 'Tharuka Dihen',
    avatar_url: null,
  },
  {
    id: 'aa61f4d9-8f0c-4caf-a47e-6242404e4aa4',
    index_number: '25000',
    role: 'admin,broadcaster',
    full_name: 'ICMU Broadcaster',
    avatar_url: null,
  },
  {
    id: '9bd0a073-8d2f-4d61-a904-877c66963b1c',
    index_number: '25363',
    role: 'admin,broadcaster',
    full_name: 'Sandupa Sansana',
    avatar_url: null,
  },
  {
    id: 'fb2a880f-7b25-4957-9c61-d3fb61b39118',
    index_number: '24929',
    role: 'super-admin',
    full_name: 'Thamindu Hasarinda',
    avatar_url: null,
  },
  {
    id: '64b0e19e-5f72-4b3e-b83d-5cc70a38e317',
    index_number: '9932',
    role: 'admin',
    full_name: 'ICMU Admin',
    avatar_url: null,
  },
  {
    id: '6bc30e58-7cd3-4a39-9919-b8913cebb28a',
    index_number: '25473',
    role: 'super-admin',
    full_name: 'Rusath Sri Nejan',
    avatar_url: null,
  },
  {
    id: '87d02cb7-c8d8-4ac6-ada3-59a4bb235b0a',
    index_number: '00000',
    role: 'writer',
    full_name: 'ICMU Writer',
    avatar_url: null,
  },
];

export function getAdminProfile(identifier) {
  if (!identifier) return null;
  const clean = String(identifier).trim().toLowerCase();
  return (
    KNOWN_ADMIN_PROFILES_LIST.find(
      (u) =>
        u.id.toLowerCase() === clean ||
        String(u.index_number).toLowerCase() === clean ||
        u.full_name.toLowerCase() === clean
    ) || null
  );
}

export { isSuperAdmin as isSuper };
export { BROADCASTER_BASE_URL, getBroadcasterAdminUrl, getBroadcasterBaseUrl } from './broadcasterSso';


