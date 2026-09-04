/**
 * ICMU & FM-Vibhavi Broadcasting SSO & Cookie Management Utility
 * 
 * Provides architecture-friendly cookie synchronization and SSO handoff
 * between icmu-web and the broadcasting terminal (fm-vibhavi at https://vibhavi-tommy.netlify.app).
 * Both repositories share the exact same Supabase database.
 */

export const PROD_BROADCASTER_BASE_URL = 'https://vibhavi-tommy.netlify.app';
export const LOCAL_BROADCASTER_BASE_URL = 'http://localhost:5174';

export function getBroadcasterBaseUrl() {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return LOCAL_BROADCASTER_BASE_URL;
    }
  }
  return PROD_BROADCASTER_BASE_URL;
}

export const BROADCASTER_BASE_URL = PROD_BROADCASTER_BASE_URL;

export const AUTH_COOKIE_KEYS = {
  SESSION: 'icmu_session',
  USER_INDEX: 'icmu_user_index',
  USER_ROLE: 'icmu_role',
  SSO_TOKEN: 'icmu_sso_token',
};

/**
 * Determines appropriate cookie domain attribute.
 * - Localhost / IP: returns empty string (standard origin cookie)
 * - Public cloud providers (*.netlify.app, *.vercel.app): returns empty string to comply with PSL
 * - Production custom domains (*.isipathanamedia.online): returns wildcard domain (.isipathanamedia.online) for seamless subdomain sharing
 */
function getCookieDomain() {
  if (typeof window === 'undefined') return '';
  const hostname = window.location.hostname;

  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    /^(\d+\.){3}\d+$/.test(hostname)
  ) {
    return '';
  }

  // Public suffix list domains cannot set wildcard cookies across subdomains
  if (hostname.endsWith('.netlify.app') || hostname.endsWith('.vercel.app')) {
    return '';
  }

  const parts = hostname.split('.');
  if (parts.length >= 2) {
    // Returns e.g. '; domain=.isipathanamedia.online'
    return `; domain=.${parts.slice(-2).join('.')}`;
  }

  return '';
}

/**
 * Set an HTTP cookie with modern SameSite and security flags.
 */
export function setAuthCookie(name, value, days = 30) {
  if (typeof document === 'undefined') return;
  try {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
    const domain = getCookieDomain();
    const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value ?? '');
    const encoded = encodeURIComponent(stringValue);

    document.cookie = `${name}=${encoded}; expires=${expires}; path=/; SameSite=Lax${domain}${isSecure ? '; Secure' : ''}`;
  } catch (err) {
    console.warn('[SSO] Failed to set cookie:', name, err);
  }
}

/**
 * Retrieve a cookie value by name.
 */
export function getAuthCookie(name) {
  if (typeof document === 'undefined') return null;
  try {
    const match = document.cookie.match(new RegExp('(^|;\\s*)' + name + '=([^;]*)'));
    if (!match) return null;
    const decoded = decodeURIComponent(match[2]);
    try {
      return JSON.parse(decoded);
    } catch {
      return decoded;
    }
  } catch {
    return null;
  }
}

/**
 * Remove an HTTP cookie.
 */
export function removeAuthCookie(name) {
  if (typeof document === 'undefined') return;
  try {
    const domain = getCookieDomain();
    // Clear with domain attribute
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domain}`;
    // Clear without domain attribute (standard fallback)
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  } catch (err) {
    console.warn('[SSO] Failed to remove cookie:', name, err);
  }
}

/**
 * Encodes a URL-safe Base64 SSO token representing the verified operator.
 */
export function createSsoToken(session, ttlMs = 30 * 24 * 60 * 60 * 1000) {
  if (!session) return null;
  try {
    const payload = {
      indexNumber: session.indexNumber || session.index_number || '',
      id: session.id || '',
      name: session.name || session.full_name || 'Operator',
      role: session.role || 'broadcaster',
      email: session.email || null,
      iat: Date.now(),
      exp: Date.now() + ttlMs,
    };
    const json = JSON.stringify(payload);
    // URL-safe Base64
    const base64 = btoa(unescape(encodeURIComponent(json)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    return base64;
  } catch (err) {
    console.warn('[SSO] Failed to create SSO token:', err);
    return null;
  }
}

/**
 * Decodes a URL-safe Base64 SSO token.
 */
export function decodeSsoToken(token) {
  if (!token || typeof token !== 'string') return null;
  try {
    let base64 = token.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const json = decodeURIComponent(escape(atob(base64)));
    const payload = JSON.parse(json);
    if (payload.exp && Date.now() > payload.exp) {
      console.warn('[SSO] Token has expired');
      return null;
    }
    return payload;
  } catch (err) {
    console.warn('[SSO] Failed to decode SSO token:', err);
    return null;
  }
}

/**
 * Synchronizes all auth cookies for cross-repo sharing.
 */
export function syncAuthCookies(session) {
  if (!session) return;
  try {
    const userIndex = session.indexNumber || session.index_number || '';
    const userRole = session.role || '';
    const ssoToken = createSsoToken(session);

    setAuthCookie(AUTH_COOKIE_KEYS.USER_INDEX, userIndex);
    setAuthCookie(AUTH_COOKIE_KEYS.USER_ROLE, userRole);
    setAuthCookie(AUTH_COOKIE_KEYS.SESSION, {
      id: session.id,
      name: session.name,
      role: session.role,
      indexNumber: userIndex,
      email: session.email,
      avatarUrl: session.avatarUrl || session.profile_picture,
      expiresAt: session.expiresAt || (Date.now() + 30 * 864e5),
    });

    if (ssoToken) {
      setAuthCookie(AUTH_COOKIE_KEYS.SSO_TOKEN, ssoToken);
    }
  } catch (err) {
    console.warn('[SSO] Failed to sync auth cookies:', err);
  }
}

/**
 * Clears all auth cookies upon sign out or session termination.
 */
export function clearAuthCookies() {
  removeAuthCookie(AUTH_COOKIE_KEYS.SESSION);
  removeAuthCookie(AUTH_COOKIE_KEYS.USER_INDEX);
  removeAuthCookie(AUTH_COOKIE_KEYS.USER_ROLE);
  removeAuthCookie(AUTH_COOKIE_KEYS.SSO_TOKEN);
}

/**
 * Constructs the dynamic redirect URL for the external Broadcasting Admin panel.
 * 
 * Format:
 *   https://vibhavi-tommy.netlify.app/<indexNumber>?sso_token=<token>
 * 
 * @param {string} indexNumber 
 * @param {object} session 
 * @param {boolean} includeSso 
 * @returns {string}
 */
export function getBroadcasterAdminUrl(indexNumber, session = null, includeSso = true) {
  const cleanIndex = (indexNumber || '000000').toString().trim().replace(/^\/+/, '');
  const baseUrl = getBroadcasterBaseUrl().replace(/\/+$/, '');
  const targetUrl = new URL(`${baseUrl}/${cleanIndex}`);

  if (includeSso) {
    let token = null;
    if (session) {
      token = createSsoToken(session);
    } else {
      // Fallback: check existing cookie or localStorage
      token = getAuthCookie(AUTH_COOKIE_KEYS.SSO_TOKEN);
      if (!token && typeof window !== 'undefined') {
        try {
          const raw = localStorage.getItem('icmu_session') || sessionStorage.getItem('icmu_session');
          if (raw) token = createSsoToken(JSON.parse(raw));
        } catch (_) {}
      }
    }

    if (token) {
      targetUrl.searchParams.set('sso_token', token);
    }
  }

  return targetUrl.toString();
}
