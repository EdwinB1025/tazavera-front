import { usePreviousUrl } from "@/shared/lib/navigation-history";
import type { LinkProps } from "./Link";

/**
 * The back controls' destination (fix-production-aut-findings design.md D5;
 * the base-controls spec "Back link to the previous page"): the page the user
 * came from, with its query, or the fallback when there is none. The first
 * render, on the server and at hydration, addresses the fallback.
 */
export function useBackHref(fallback: LinkProps["href"]): LinkProps["href"] {
  const previous = usePreviousUrl();
  return (previous ?? fallback) as LinkProps["href"];
}
