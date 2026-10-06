import type { ReactNode } from "react";

// ─── UI-specific types (declared before the component) ───
// The page section primitive: the consumer supplies every child and the
// layout of the container's children. No generated API type is involved
// (design.md D2).

/** `page`: the page background. `section`: the section background (design.md D2). */
export type PageSectionSurface = "page" | "section";

export type PageSectionProps = {
  surface?: PageSectionSurface;
  /**
   * Added to the container's classes for the layout of the container's
   * children only (display, gap, grid columns, alignment). It never carries
   * padding, width or margin.
   */
  containerClassName?: string;
  children: ReactNode;
};
