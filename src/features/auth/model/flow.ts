/**
 * The pending-flow record and the sign-in marker (design.md D3; spec
 * "Credential handling").
 *
 * A pending flow keeps what completes it — the PKCE verifier, the `state` and
 * the return route. A popup flow's record lives in the opener's module memory
 * and never reaches browser storage (design.md D3); a full-page flow (the
 * popup-blocked fallback of design.md D10 and the silent restore of design.md
 * D5) writes the same record to `sessionStorage` under one key and reads it
 * back at the callback. The marker records only that the user had signed in,
 * carries no credential and lives in `localStorage`.
 */

export type PendingFlow = {
  verifier: string;
  state: string;
  returnRoute: string;
  /**
   * A step-up's expected user (secure-step-up design.md D2): the `ulid` of the
   * session user when it started. Absent for sign in and the silent restore.
   */
  expectedUlid?: string;
};

const FLOW_KEY = "tazavera.pending-flow";
const MARKER_KEY = "tazavera.signed-in";

/** The popup flow's record, kept in the opener's memory (design.md D3). */
let held: PendingFlow | null = null;

/** Holds a popup flow's record in memory; nothing is written to storage. */
export function holdFlow(pending: PendingFlow): void {
  held = pending;
}

/** The popup flow's record held in memory, or `null` when none is pending. */
export function readHeldFlow(): PendingFlow | null {
  return held;
}

/**
 * Discards the popup flow's record once its result arrives, or once the popup
 * closes without one (design.md D3 and D10).
 */
export function releaseFlow(): void {
  held = null;
}

/** Writes a full-page flow's record to `sessionStorage` (design.md D3). */
export function saveFlow(pending: PendingFlow): void {
  sessionStorage.setItem(FLOW_KEY, JSON.stringify(pending));
}

/** The full-page flow's record, or `null` when no full-page flow is pending. */
export function readFlow(): PendingFlow | null {
  const raw = sessionStorage.getItem(FLOW_KEY);
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as PendingFlow;
  } catch {
    return null;
  }
}

/** Deletes the full-page flow's record (spec: During a sign-in flow). */
export function clearFlow(): void {
  sessionStorage.removeItem(FLOW_KEY);
}

/** Records that the user had signed in — a value carrying no credential. */
export function setMarker(): void {
  localStorage.setItem(MARKER_KEY, "1");
}

/** Whether the user had signed in in this browser (design.md D3). */
export function hasMarker(): boolean {
  return localStorage.getItem(MARKER_KEY) !== null;
}

/** Removes the marker (spec: After sign out). */
export function removeMarker(): void {
  localStorage.removeItem(MARKER_KEY);
}
