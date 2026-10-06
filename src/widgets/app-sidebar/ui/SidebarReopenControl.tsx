"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { SIDEBAR_ID, SidebarTrigger, useSidebar } from "@/shared/ui";
import { useAppSidebar, useFocusIntent } from "./AppSidebarContext";

/**
 * The header's sidebar re-open control (design.md D6; spec "Sidebar re-open
 * control"). Shown only while a sidebar is mounted and either the viewport is
 * below `md` (the sheet covers it while open, and staying mounted lets the
 * dialog return focus to it) or the column is collapsed from `md`.
 */
export function SidebarReopenControl(): ReactNode {
  const { present, isMobile, open, toggleSidebar } = useSidebar();
  const { toggleLabel } = useAppSidebar();
  const focusIntentRef = useFocusIntent();
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const shown = present && (isMobile || !open);

  // Collapsed from the sidebar's own control: focus moves here (spec
  // "Control shown while collapsed").
  useEffect(() => {
    if (shown && focusIntentRef.current === "reopen") {
      focusIntentRef.current = null;
      wrapperRef.current?.querySelector("button")?.focus();
    }
  }, [shown, focusIntentRef]);

  if (!shown) return null;

  const handleToggle = () => {
    if (!isMobile) focusIntentRef.current = "collapse";
    toggleSidebar();
  };

  return (
    <span ref={wrapperRef} className="contents">
      <SidebarTrigger
        aria-label={toggleLabel}
        aria-controls={SIDEBAR_ID}
        onClick={handleToggle}
      />
    </span>
  );
}
