"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

// ─── UI-specific types (declared before the component) ───

type SidebarAnnouncement = {
  announcement: string;
  setAnnouncement: (text: string) => void;
};

export type ResultStatusProps = {
  /** The list's result count text; `null` while there is none to announce. */
  text: string | null;
};

const SidebarAnnouncementContext = createContext<SidebarAnnouncement | null>(null);

/**
 * Holds the result count of the list in view for the sidebar overlay
 * (label-landmarks-and-headings design.md D5); rendered by `SidebarProvider`.
 */
export function SidebarAnnouncementProvider({ children }: { children: ReactNode }): ReactNode {
  const [announcement, setAnnouncement] = useState("");
  return (
    <SidebarAnnouncementContext.Provider value={{ announcement, setAnnouncement }}>
      {children}
    </SidebarAnnouncementContext.Provider>
  );
}

/**
 * A list's visually hidden polite result count (D5). It also hands the text to
 * the sidebar overlay, which hides the page from assistive technology while it
 * is open; outside a `SidebarProvider` it is only the status region.
 */
export function ResultStatus({ text }: ResultStatusProps): ReactNode {
  const setAnnouncement = useContext(SidebarAnnouncementContext)?.setAnnouncement;
  useEffect(() => {
    if (!setAnnouncement) return;
    setAnnouncement(text ?? "");
    return () => setAnnouncement("");
  }, [setAnnouncement, text]);
  return (
    <div role="status" className="sr-only">
      {text}
    </div>
  );
}

/** The overlay's copy of the result count, rendered inside the sheet (D5). */
export function OverlayStatus(): ReactNode {
  const announcement = useContext(SidebarAnnouncementContext)?.announcement;
  return (
    <div role="status" className="sr-only">
      {announcement}
    </div>
  );
}
