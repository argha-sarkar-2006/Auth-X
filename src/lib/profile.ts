import { readKey, writeKey } from "./localdb";

// Per-user application profile (name, avatar, linked wallet address). This is
// the local equivalent of the old Firestore `users/{uid}` document.
export interface Profile {
  displayName?: string;
  photoDataUrl?: string;
  accountAddress?: string;
}

const PROFILES_KEY = "profiles";

function all(): Record<string, Profile> {
  return readKey<Record<string, Profile>>(PROFILES_KEY, {});
}

export function getProfile(uid: string): Profile {
  return all()[uid] ?? {};
}

export function mergeProfile(uid: string, patch: Profile): void {
  const profiles = all();
  profiles[uid] = { ...(profiles[uid] ?? {}), ...patch };
  writeKey(PROFILES_KEY, profiles);
}
