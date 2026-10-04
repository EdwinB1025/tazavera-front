import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

// ─── UI-specific types (declared before the components) ───
// Generic region containers: the consumer supplies every child, attribute and
// class extension. No generated API type is involved (design.md D2).

export type CardProps = HTMLAttributes<HTMLDivElement>;
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

/**
 * Tazavera content card (the `content-structure` spec: "Card regions", "Card
 * stacking on narrow viewports"). Shadcn base rewired to the settled classes
 * above and composed with `cn`; no `class-variance-authority`. The card
 * contributes no text or data of its own: the consumer fills its regions.
 */
export function Card({ className, ...rest }: CardProps): ReactNode {
  return <div {...rest} className={cn(CARD_CLASSES, className)} />;
}

export function CardAside({ className, ...rest }: CardAsideProps): ReactNode {
  return <div {...rest} className={cn(ASIDE_CLASSES, className)} />;
}

export function CardContent({
  className,
  ...rest
}: CardContentProps): ReactNode {
  return <div {...rest} className={cn(CONTENT_CLASSES, className)} />;
}

export function CardFooter({ className, ...rest }: CardFooterProps): ReactNode {
  return <div {...rest} className={cn(FOOTER_CLASSES, className)} />;
}
