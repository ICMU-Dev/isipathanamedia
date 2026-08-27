export const ROLES = {
  SUPER_ADMIN: 'super-admin',
  ADMIN: 'admin',
  WRITER: 'writer'
};

export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: {
    canManageUsers: true,
    canManageNews: true,
    canManageTeam: true,
    canManageAssets: true,
    canManageSchools: true,
    canManageMessages: true,
    canManageRegistrations: true,
    canManageInvitations: true
  },
  [ROLES.ADMIN]: {
    canManageUsers: false, // Only super-admin manages users usually
    canManageNews: true,
    canManageTeam: true,
    canManageAssets: true,
    canManageSchools: true,
    canManageMessages: true,
    canManageRegistrations: true,
    canManageInvitations: true
  },
  [ROLES.WRITER]: {
    canManageUsers: false,
    canManageNews: true, // Writers can write news
    canManageTeam: false,
    canManageAssets: true, // Need to upload images for news
    canManageSchools: false,
    canManageMessages: false,
    canManageRegistrations: false,
    canManageInvitations: false
  }
};

/**
 * Helper to check if a role has a specific permission
 * @param {string} role - The user's role (e.g. 'super-admin')
 * @param {string} permission - The permission to check (e.g. 'canManageNews')
 * @returns {boolean}
 */
export const hasPermission = (role, permission) => {
  if (!role || !ROLE_PERMISSIONS[role]) return false;
  return !!ROLE_PERMISSIONS[role][permission];
};
