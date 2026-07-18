import { PREFIX, setWriteHook } from "./localdb";

// Dev-only bridge that keeps ./accounts.json and the app's localStorage in sync,
// via the /__db endpoint provided by vite-plugin-local-db.
//
//   file  -> app : on load we read accounts.json into localStorage; manual edits
//                  emit an HMR event that reloads the page (re-reading the file).
//   app   -> file: every localStorage write is mirrored back to accounts.json.
//
// In a production build (no dev server) this is a no-op and the app uses plain
// localStorage.

const KEYS = ["users", "profiles", "accounts", "session"] as const;
const ENDPOINT = "/__db";

// Build the on-disk shape { users, profiles, accounts, session } from whatever
// the app currently has in localStorage.
function snapshot(): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const k of KEYS) {
    const raw = localStorage.getItem(PREFIX + k);
    if (raw != null) {
      try {
        out[k] = JSON.parse(raw);
      } catch {
        /* skip malformed key */
      }
    }
  }
  return out;
}

async function pushDb(): Promise<void> {
  try {
    await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(snapshot(), null, 2) + "\n",
    });
  } catch {
    /* bridge unavailable — ignore */
  }
}

let pushTimer: ReturnType<typeof setTimeout> | null = null;
function schedulePush(): void {
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    pushTimer = null;
    void pushDb();
  }, 150);
}

export async function bootstrapDb(): Promise<void> {
  if (!import.meta.env.DEV) return;

  // Register the reload-on-edit listener first so it survives fetch/parse errors.
  if (import.meta.hot) {
    import.meta.hot.on("local-db:changed", () => {
      window.location.reload();
    });
  }

  let remote: Record<string, unknown> = {};
  try {
    const res = await fetch(ENDPOINT);
    if (!res.ok) return; // bridge not available — stay on plain localStorage
    remote = await res.json();
  } catch {
    return;
  }

  // The file wins for any key it defines; keys only present locally are kept and
  // then seeded back into the file below.
  for (const k of KEYS) {
    if (remote && Object.prototype.hasOwnProperty.call(remote, k)) {
      localStorage.setItem(PREFIX + k, JSON.stringify(remote[k]));
    }
  }

  // Normalise / seed accounts.json with the merged current state.
  await pushDb();

  // Mirror all future app writes to the file.
  setWriteHook(schedulePush);
}
