/**
 * Return-route validation (fix-auth-return-query design.md D2; spec "Return
 * through the callback"). The return destination is a route of the
 * application — path plus query, no hash — and anything else is refused, so the
 * callback never opens a destination outside the application.
 */
import { isSupportedLocale } from "@/shared/config/locales";

/** A placeholder origin the route is resolved against; it never reaches the URL. */
const BASE = "http://app.invalid";

/** Backslashes and control characters, which the URL parser strips or rewrites. */
const UNSAFE = /[\\\u0000-\u001f\u007f]/;

/** The route's `pathname + search` when it is an application route, otherwise `null`. */
export function toAppRoute(route: unknown): string | null {
  if (typeof route !== "string" || UNSAFE.test(route)) return null;
  if (!route.startsWith("/") || route.startsWith("//") || route.includes("#")) {
    return null;
  }
  const url = new URL(route, BASE);
  if (url.origin !== BASE || url.pathname.startsWith("//")) return null;
  if (!isSupportedLocale(url.pathname.split("/")[1] ?? "")) return null;
  return url.pathname + url.search;
}
