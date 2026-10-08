/**
 * The focus to restore after the full-screen map closes
 * (add-coffeeshop-directory design.md D13): closing navigates back to the
 * list, which renders its controls again, so the request waits here until the
 * opener — `card:{ulid}` for a card's map action, `toggle` for the view
 * control's Map item — takes it.
 */

let pending: string | null = null;

/** Records the opener to focus once the list renders again. */
export function requestFocus(target: string): void {
  pending = target;
}

/** The pending request, cleared as it is read. */
export function takeFocusRequest(): string | null {
  const target = pending;
  pending = null;
  return target;
}

/** Takes the request only when it names `target`. */
export function takeFocusRequestFor(target: string): boolean {
  if (pending !== target) return false;
  pending = null;
  return true;
}
