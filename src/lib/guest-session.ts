const GUEST_SESSION_STORAGE_KEY = "hambola-ai-guest-session-id";
const LEGACY_GUEST_SESSION_STORAGE_KEY = "ai-app-guest-session-id";

export function getOrCreateGuestSessionId() {
  const existingSessionId =
    window.localStorage.getItem(GUEST_SESSION_STORAGE_KEY) ??
    window.localStorage.getItem(LEGACY_GUEST_SESSION_STORAGE_KEY);

  if (existingSessionId) {
    // Preserve older guest sessions after the app rename.
    window.localStorage.setItem(GUEST_SESSION_STORAGE_KEY, existingSessionId);
  }

  if (existingSessionId) {
    return existingSessionId;
  }

  const nextSessionId = crypto.randomUUID();
  window.localStorage.setItem(GUEST_SESSION_STORAGE_KEY, nextSessionId);

  return nextSessionId;
}
