const GUEST_SESSION_STORAGE_KEY = "ai-app-guest-session-id";

export function getOrCreateGuestSessionId() {
  const existingSessionId = window.localStorage.getItem(
    GUEST_SESSION_STORAGE_KEY,
  );

  if (existingSessionId) {
    return existingSessionId;
  }

  const nextSessionId = crypto.randomUUID();
  window.localStorage.setItem(GUEST_SESSION_STORAGE_KEY, nextSessionId);

  return nextSessionId;
}
