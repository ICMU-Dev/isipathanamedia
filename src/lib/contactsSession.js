const KEY = 'icmu_contacts_session';

// Keep the bearer credential separate from the profile shared with broadcast SSO.
export function readContactsSession() {
  try {
    const value = JSON.parse(sessionStorage.getItem(KEY) || localStorage.getItem(KEY) || 'null');
    if (value?.token && Date.parse(value.expires_at) > Date.now()) return value;
  } catch { /* Storage may be unavailable. Fail closed. */ }
  return null;
}

export function storeContactsSession(value, rememberMe) {
  clearContactsSession();
  if (!value?.token) return;
  try {
    (rememberMe ? localStorage : sessionStorage).setItem(KEY, JSON.stringify(value));
  } catch { /* Contacts will remain unavailable if credentials cannot be stored. */ }
}

export function clearContactsSession() {
  try {
    sessionStorage.removeItem(KEY);
    localStorage.removeItem(KEY);
  } catch { /* Storage may be unavailable. */ }
}
