/**
 * Values kept for the browser tab (remember-list-preferences design.md D1):
 * `sessionStorage`, with every access failure-safe. A missing `window`, a
 * blocked storage (private mode), a quota error or any other exception falls
 * back silently: a read gives `null`, a write or a removal does nothing.
 */

/** The value kept under `key`, or `null` when absent or unreadable. */
export function readTabValue(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

/** Keeps `value` under `key`; does nothing when the storage refuses it. */
export function writeTabValue(key: string, value: string): void {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    // The storage is unavailable: the value is not kept.
  }
}

/** Removes every value whose key starts with `prefix`. */
export function removeTabValues(prefix: string): void {
  try {
    const keys: string[] = [];
    for (let index = 0; index < sessionStorage.length; index += 1) {
      const key = sessionStorage.key(index);
      if (key?.startsWith(prefix)) keys.push(key);
    }
    for (const key of keys) sessionStorage.removeItem(key);
  } catch {
    // The storage is unavailable: nothing to remove.
  }
}
