"use client";

import type { ReactNode } from "react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/shared/ui";

// ─── UI-specific types (declared before the component) ───

/**
 * The entries' labels: the shell catalog's `manageEvaluations` (design.md D5)
 * and `exploreOfferings` (refine-header-aut D5).
 */
export type SidebarEntryTexts = {
  label: string;
  explore: string;
};

export type EvaluationsSidebarEntryProps = {
  locale: string;
  texts: SidebarEntryTexts;
};

/**
 * The specialist area's management sidebar entries (design.md D5; spec
 * "Management sidebar entry"): "My evaluations", a link to the list, marked
 * as the current page while the list is in view, then "Explore offerings",
 * the full offerings list, never marked (refine-header-aut D5). The links
 * render through the menu button's link form so they carry the sidebar entry
 * treatment, not the inline link one.
 */
export function EvaluationsSidebarEntry({ locale, texts }: EvaluationsSidebarEntryProps): ReactNode {
  const href = `/${locale}/manage/evaluations`;
  const current = usePathname() === href;
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={current}>
          <NextLink href={href} aria-current={current ? "page" : undefined}>
            {texts.label}
          </NextLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <NextLink href={`/${locale}/offerings`}>{texts.explore}</NextLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
