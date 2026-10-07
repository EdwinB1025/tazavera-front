"use client";

import { createContext, useContext } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

// ─── UI-specific types (declared before the components) ───
// Generic region containers: the consumer supplies every child, attribute and
// class extension. No generated API type is involved (design.md D2).

/** `default`: side column beside the content from `lg`. `stacked`: parts stacked at every width (design.md D14). */
export type CardLayout = "default" | "stacked";

/** `content`: the content card. `section`: a section with a header band, always stacked (refine-page-surfaces D2). */
export type CardVariant = "content" | "section";

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  layout?: CardLayout;
  variant?: CardVariant;
};
export type CardAsideProps = HTMLAttributes<HTMLDivElement>;
export type CardContentProps = HTMLAttributes<HTMLDivElement>;
export type CardFooterProps = HTMLAttributes<HTMLDivElement>;

// ─── Settled classes (design.md D6) ───
// The card renders on the card surface with the container radius, an accent
// border on its leading edge and the theme's shadow treatment.
const CARD_CLASSES = [
  "bg-surface-card",
  "rounded-container",
  "border-l-4",
  "border-border-accent",
  "shadow-lg",
].join(" ");

// The side column's separator lies on the boundary with the content in both
// layouts: its bottom edge while the parts stack below `lg` (1024px), its
// right edge at `lg` where the side column sits beside the content.
const ASIDE_CLASSES = [
  "p-6",
  "border-b",
  "border-border-subtle",
  "lg:float-left",
  "lg:w-1/4",
  "lg:border-r",
  "lg:border-b-0",
].join(" ");

// `lg:flow-root` keeps the content box beside the floating side column at `lg`
// and lets it fill the card when no side column renders.
const CONTENT_CLASSES = ["p-6", "lg:flow-root"].join(" ");

// Below both regions at `lg`.
const FOOTER_CLASSES = ["p-6", "lg:clear-both"].join(" ");

// ─── Stacked layout (design.md D14) ───
// The parts stack at every width; the card fills the height its container
// gives it, the content takes the free space and the footer sits at the bottom.
const STACKED_CARD_CLASSES = ["flex", "flex-col", "h-full"].join(" ");
const STACKED_ASIDE_CLASSES = ["p-6", "border-b", "border-border-subtle"].join(
  " ",
);
const STACKED_CONTENT_CLASSES = ["p-6", "flex-1"].join(" ");
const STACKED_FOOTER_CLASSES = ["p-6", "mt-auto"].join(" ");

// ─── Section variant (refine-page-surfaces D2–D4) ───
// Always stacked, whatever `layout` says. The root clips its parts to its own
// container-radius corners (D3), so the band needs no directional radius.
const SECTION_CARD_CLASSES = [
  "bg-surface-card",
  "rounded-container",
  "border",
  "border-border-subtle",
  "shadow-lg",
  "overflow-hidden",
].join(" ");

// The band tells a static header from a collapsible one by the element with
// `aria-expanded` it holds (the CollapsibleHeader button), through `:has()`
// (D4): tighter padding, the hover surface, and no separator while collapsed.
const SECTION_ASIDE_CLASSES = [
  "flex",
  "flex-col",
  "gap-2",
  "bg-surface-section",
  "border-b",
  "border-border-subtle",
  "p-4",
  "md:px-6",
  "has-[[aria-expanded]]:p-2",
  "md:has-[[aria-expanded]]:px-4",
  "has-[[aria-expanded]]:hover:bg-surface-section-hover",
  "has-[[aria-expanded=false]]:border-b-0",
].join(" ");

// Body and footer: no fill of their own (the card's), no separator.
const SECTION_BODY_CLASSES = ["px-4", "pt-4", "pb-5", "md:p-6"].join(" ");

/**
 * Tazavera content card (the `content-structure` spec: "Card regions", "Card
 * stacking on narrow viewports", "Section card"). Shadcn base rewired to the
 * settled classes above and composed with `cn`; no `class-variance-authority`.
 * The card contributes no text or data of its own: the consumer fills its
 * regions.
 */
// The parts are siblings the consumer composes, so they read the layout and
// the variant from the card rather than from a prop of their own (design.md
// D14; refine-page-surfaces D2).
type CardContextValue = { layout: CardLayout; variant: CardVariant };

const CardContext = createContext<CardContextValue>({
  layout: "default",
  variant: "content",
});

export function Card({
  layout = "default",
  variant = "content",
  className,
  ...rest
}: CardProps): ReactNode {
  const isSection = variant === "section";
  return (
    <CardContext.Provider value={{ layout, variant }}>
      <div
        {...rest}
        className={cn(
          isSection ? SECTION_CARD_CLASSES : CARD_CLASSES,
          !isSection && layout === "stacked" && STACKED_CARD_CLASSES,
          className,
        )}
      />
    </CardContext.Provider>
  );
}

/** The classes of a part for the card's variant and layout. */
function partClasses(
  { layout, variant }: CardContextValue,
  section: string,
  stacked: string,
  row: string,
): string {
  if (variant === "section") return section;
  return layout === "stacked" ? stacked : row;
}

export function CardAside({ className, ...rest }: CardAsideProps): ReactNode {
  const context = useContext(CardContext);
  return (
    <div
      {...rest}
      className={cn(
        partClasses(
          context,
          SECTION_ASIDE_CLASSES,
          STACKED_ASIDE_CLASSES,
          ASIDE_CLASSES,
        ),
        className,
      )}
    />
  );
}

export function CardContent({
  className,
  ...rest
}: CardContentProps): ReactNode {
  const context = useContext(CardContext);
  return (
    <div
      {...rest}
      className={cn(
        partClasses(
          context,
          SECTION_BODY_CLASSES,
          STACKED_CONTENT_CLASSES,
          CONTENT_CLASSES,
        ),
        className,
      )}
    />
  );
}

export function CardFooter({ className, ...rest }: CardFooterProps): ReactNode {
  const context = useContext(CardContext);
  return (
    <div
      {...rest}
      className={cn(
        partClasses(
          context,
          SECTION_BODY_CLASSES,
          STACKED_FOOTER_CLASSES,
          FOOTER_CLASSES,
        ),
        className,
      )}
    />
  );
}
