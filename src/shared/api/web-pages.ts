/**
 * The address of one of the API's web pages (route-api-web-pages-through-front
 * design.md D4): `{NEXT_PUBLIC_APP_URL}{path}`, on the front's origin, which
 * forwards it to the API. Read per call like every env value in the segment.
 */
export function apiWebPageUrl(path: string): string {
  return `${process.env.NEXT_PUBLIC_APP_URL ?? ""}${path}`;
}
