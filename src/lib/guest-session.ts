const GUEST_SESSION_STORAGE_KEY = "velox-ai-guest-session-id";
const LEGACY_GUEST_SESSION_STORAGE_KEYS = [
  "hambola-ai-guest-session-id",
  "ai-app-guest-session-id",
] as const;

export function getOrCreateGuestSessionId() {
  const existingSessionId =
    window.localStorage.getItem(GUEST_SESSION_STORAGE_KEY) ??
    LEGACY_GUEST_SESSION_STORAGE_KEYS.map((key) =>
      window.localStorage.getItem(key),
    ).find(Boolean);

  if (existingSessionId) {
    // Preserve guest sessions created before previous app names.
    window.localStorage.setItem(GUEST_SESSION_STORAGE_KEY, existingSessionId);
  }

  if (existingSessionId) {
    return existingSessionId;
  }

  const nextSessionId = crypto.randomUUID();
  window.localStorage.setItem(GUEST_SESSION_STORAGE_KEY, nextSessionId);

  return nextSessionId;
}
