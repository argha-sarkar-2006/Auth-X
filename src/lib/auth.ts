import { PREFIX, SESSION_KEY, readKey, writeKey } from "./localdb";

// Local email/password auth, fully offline. Credentials live in localStorage.
// NOTE: passwords are salted + SHA-256 hashed, which is fine for a local demo
// but is NOT a substitute for real server-side auth.

export interface LocalUser {
  uid: string;
  email: string;
  displayName: string | null;
}

interface UserRecord {
  uid: string;
  email: string;
  salt: string;
  passwordHash: string;
}

const USERS_KEY = "users";

type Listener = (user: LocalUser | null) => void;
const listeners = new Set<Listener>();

function getUsers(): Record<string, UserRecord> {
  return readKey<Record<string, UserRecord>>(USERS_KEY, {});
}
function saveUsers(users: Record<string, UserRecord>): void {
  writeKey(USERS_KEY, users);
}

function toPublic(u: UserRecord | undefined | null): LocalUser | null {
  if (!u) return null;
  return { uid: u.uid, email: u.email, displayName: null };
}

export function getCurrentUser(): LocalUser | null {
  const session = readKey<{ uid: string } | null>(SESSION_KEY, null);
  if (!session) return null;
  return toPublic(getUsers()[session.uid]);
}

function setSession(uid: string | null): void {
  writeKey(SESSION_KEY, uid ? { uid } : null);
  notify();
}

function notify(): void {
  const u = getCurrentUser();
  listeners.forEach((l) => l(u));
}

// Subscribe to auth changes. Fires immediately with the current user, then on
// every sign-in/out (this tab) and on session changes from other tabs.
export function onAuthChange(cb: Listener): () => void {
  listeners.add(cb);
  cb(getCurrentUser());
  const onStorage = (e: StorageEvent) => {
    if (e.key === PREFIX + SESSION_KEY) cb(getCurrentUser());
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

// ── password hashing ───────────────────────────────────────────────────────
async function hashPassword(password: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function randomHex(bytes = 16): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return [...arr].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function signUp(
  email: string,
  password: string
): Promise<LocalUser> {
  const normEmail = email.trim().toLowerCase();
  const users = getUsers();
  if (Object.values(users).some((u) => u.email === normEmail)) {
    throw new Error("An account with this email already exists.");
  }
  const salt = randomHex();
  const record: UserRecord = {
    uid: crypto.randomUUID(),
    email: normEmail,
    salt,
    passwordHash: await hashPassword(password, salt),
  };
  users[record.uid] = record;
  saveUsers(users);
  setSession(record.uid);
  return toPublic(record)!;
}

export async function signIn(
  email: string,
  password: string
): Promise<LocalUser> {
  const normEmail = email.trim().toLowerCase();
  const record = Object.values(getUsers()).find((u) => u.email === normEmail);
  if (!record) throw new Error("No account found with this email.");
  const attempt = await hashPassword(password, record.salt);
  if (attempt !== record.passwordHash) throw new Error("Incorrect password.");
  setSession(record.uid);
  return toPublic(record)!;
}

export function signOutUser(): void {
  setSession(null);
}
