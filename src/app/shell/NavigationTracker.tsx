"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { recordNavigation } from "@/shared/lib/navigation-history";

/**
 * Feeds the navigation record behind the back link with every URL the user
 * reaches, path plus query (fix-production-aut-findings design.md D5). It
 * renders nothing; the shell mounts it inside `Suspense` because it reads the
 * search params (`use-search-params.md`).
 */
export function NavigationTracker(): ReactNode {
  const pathname = usePathname();
  const search = useSearchParams()?.toString() ?? "";
  useEffect(() => {
    if (pathname) {
      recordNavigation(search ? `${pathname}?${search}` : pathname);
    }
  }, [pathname, search]);
  return null;
}
