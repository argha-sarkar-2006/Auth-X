// Tiny localStorage-backed persistence layer. Every key lives under the
// "authx:" namespace and is JSON-serialised. This replaces Firebase/Firestore
// with a completely local, offline store (scoped to a single browser).

export const PREFIX = "authx:";
export const SESSION_KEY = "session";

export function readKey<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeKey(key: string, value: unknown): void {
  localStorage.setItem(PREFIX + key, JSON.stringify(value));
}
