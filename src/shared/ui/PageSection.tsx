import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

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

// ─── Settled classes (design.md D3) ───
// The section: 3rem vertical padding below `md` (768px), 4rem from `md`.
const SECTION_CLASSES = ["py-12", "md:py-16"].join(" ");

// The container: centered, at most 72rem wide, 1rem side padding below `md`
// and 2rem from it.
const CONTAINER_CLASSES = [
  "mx-auto",
  "w-full",
  "max-w-6xl",
  "px-4",
  "md:px-8",
].join(" ");

// The two backgrounds a section may sit on (design.md D2).
const SURFACE_CLASSES: Record<PageSectionSurface, string> = {
  page: "bg-surface-page",
  section: "bg-surface-section",
};

/**
 * Tazavera page section (the `content-structure` spec: "Page sections"). The
 * outermost content container: a full-width section on the page or the section
 * background, holding exactly one centered container. The primitive
 * contributes no text or data of its own: the consumer fills it.
 */
export function PageSection({
  surface = "page",
  containerClassName,
  children,
}: PageSectionProps): ReactNode {
  return (
    <section className={cn(SECTION_CLASSES, SURFACE_CLASSES[surface])}>
      <div className={cn(CONTAINER_CLASSES, containerClassName)}>
        {children}
      </div>
    </section>
  );
}
