"use client";

import type { ReactNode } from "react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/shared/ui";

// ─── UI-specific types (declared before the component) ───

/** The entry's label: the shell catalog's `manageEvaluations` (design.md D5). */
export type SidebarEntryTexts = {
  label: string;
};

export type EvaluationsSidebarEntryProps = {
  locale: string;
  texts: SidebarEntryTexts;
};

/**
 * The specialist area's one management sidebar entry (design.md D5; spec
 * "Management sidebar entry"): "My evaluations", a link to the list, marked
 * as the current page while the list is in view. The link renders through
 * the menu button's link form so it carries the sidebar entry treatment, not
 * the inline link one.
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
    </SidebarMenu>
  );
}
