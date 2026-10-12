/**
 * The address of one of the API's web pages (route-api-web-pages-through-front
 * design.md D4): `{NEXT_PUBLIC_APP_URL}{path}`, on the front's origin, which
 * forwards it to the API. Read per call like every env value in the segment.
 * A non-empty `loginHint` names the signed-in user in `login_hint`, so the API
 * serves the page only to that user (hint-user-on-security-links design.md D1).
 */
export function apiWebPageUrl(path: string, loginHint?: string): string {
  const address = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}${path}`;
  if (!loginHint) return address;
  return `${address}?${new URLSearchParams({ login_hint: loginHint })}`;
}
