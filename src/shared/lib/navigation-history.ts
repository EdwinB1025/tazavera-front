"use client";

import { useSyncExternalStore } from "react";

/**
 * The record of in-application navigation behind the back link
 * (fix-production-aut-findings design.md D5; the base-controls spec "Back link
 * to the previous page"). The shell records every URL the user reaches (path
 * plus query); the back link reads the previous page from here.
 *
 * - Same path as the current entry: only the query changed (a tab, a filter,
 *   a page), so the current entry takes the new URL and the previous stays.
 * - Same path except its first segment: a language change, so the current
 *   entry takes the new URL and the previous entry moves to the new locale.
 * - Anything else: the current entry becomes the previous one.
 */

type Entry = { path: string; url: string };

let current: Entry | null = null;
let previous: string | null = null;
const listeners = new Set<() => void>();

function pathOf(url: string): string {
  return url.split("?")[0];
}

function firstSegment(path: string): string {
  return path.split("/")[1] ?? "";
}

function withoutFirstSegment(path: string): string {
  return path.split("/").slice(2).join("/");
}

/** Records the URL the user is on now (path plus query). */
export function recordNavigation(url: string): void {
  const path = pathOf(url);
  if (current !== null && current.path !== path) {
    if (withoutFirstSegment(current.path) === withoutFirstSegment(path)) {
      if (previous !== null) {
        previous = previous.replace(/^\/[^/?]*/, `/${firstSegment(path)}`);
      }
    } else {
      previous = current.url;
    }
  }
  current = { path, url };
  listeners.forEach((listener) => listener());
}

/** The page the user came from, or `null` when there is none. */
export function previousUrl(): string | null {
  return previous;
}

/** Clears the record (tests only). */
export function resetNavigationHistory(): void {
  current = null;
  previous = null;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** The previous page, re-rendering on every recorded navigation; `null` on the server. */
export function usePreviousUrl(): string | null {
  return useSyncExternalStore(subscribe, previousUrl, () => null);
}
