import type { MouseEvent } from "react";

const POPUP_NAME = "tazavera-security";
const CLOSED_POLL_MS = 250;

/**
 * Opens one of the API's security pages in a popup window
 * (open-security-pages-in-popup design.md D1), an anchor's click handler: a
 * plain primary click is kept from navigating the tab, which would drop the
 * in-memory tokens, and opens the anchor's `href` in a popup synchronously
 * inside the click; a blocked popup falls back to a new tab. Any other click
 * keeps the browser's native behaviour. When the popup closes, `onClosed`
 * runs once.
 */
export function openSecurityPopup(
  event: MouseEvent<HTMLAnchorElement>,
  onClosed?: () => void,
): void {
  if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) {
    return;
  }
  event.preventDefault();
  const url = event.currentTarget.href;
  const popup = window.open(url, POPUP_NAME, "popup");
  if (!popup) {
    window.open(url, "_blank", "noopener");
    return;
  }
  if (!onClosed) return;
  const timer = window.setInterval(() => {
    if (!popup.closed) return;
    window.clearInterval(timer);
    onClosed();
  }, CLOSED_POLL_MS);
}
