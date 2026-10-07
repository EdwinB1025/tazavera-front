"use client";

import { createContext, useContext, useId, useState } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/shared/lib/utils";
import { ChevronDown } from "./icons";

// ─── UI-specific types (declared before the components) ───
// A disclosure built from sibling parts that read shared state from a
// context, the `Card` pattern. No generated API type is involved (design.md D2).

export type CollapsibleProps = {
  /** Controlled open state. */
  open?: boolean;
  /** Initial open state when uncontrolled. Default `false`. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
};

export type CollapsibleHeaderProps = {
  /** The title: the header button's accessible name. */
  children: ReactNode;
  /** Optional header content beside the title, exposed as its description. */
  aside?: ReactNode;
  /** Optional: wraps the button in a heading of that level. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  /** Class extension, merged with `cn`. */
  className?: string;
};

export type CollapsibleBodyProps = HTMLAttributes<HTMLDivElement>;

// ─── Settled classes (design.md D4–D6) ───
// Full-width row: title block at the start, chevron at the end. `group` lets
// the chevron rise to full opacity on hover and keyboard focus.
const HEADER_CLASSES = [
  "group",
  "flex",
  "w-full",
  "min-h-10",
  "items-center",
  "justify-between",
  "gap-2",
  "p-2",
  "[text-align:start]",
  "rounded-field",
  "focus-visible:focus-ring",
].join(" ");

const TITLE_BLOCK_CLASSES = [
  "flex",
  "min-w-0",
  "flex-wrap",
  "items-center",
  "gap-x-3",
  "gap-y-1",
].join(" ");

const TITLE_CLASSES = "type-subheading";

const CHEVRON_CLASSES = [
  "size-4",
  "shrink-0",
  "text-text-accent",
  "opacity-80",
  "group-hover:opacity-100",
  "group-focus-visible:opacity-100",
  "transition-[rotate,opacity]",
  "duration-250",
  "ease-out",
  "motion-reduce:transition-none",
].join(" ");

// The body is a one-row grid whose row animates from 0fr to 1fr, so no script
// measures its content. The clip follows the animated height exactly; once
// open it widens by the 4px focus ring so a control at the edge keeps its
// ring. Opening switches the clip at the end (`step-end`), closing at once
// (`step-start`); `visibility` stays visible until a close finishes. While
// collapsed the inner wrapper clips its overflow, so the hidden content adds
// nothing to the page's scrollable area (clip-path only clips the paint).
const BODY_CLASSES = ["grid", "motion-reduce:[transition:none]"].join(" ");
const BODY_COLLAPSED_CLASSES = [
  "grid-rows-[0fr]",
  "invisible",
  "[clip-path:inset(0)]",
  "[transition:grid-template-rows_250ms_ease-out,visibility_250ms,clip-path_250ms_step-start]",
].join(" ");
const BODY_EXPANDED_CLASSES = [
  "grid-rows-[1fr]",
  "[clip-path:inset(-4px)]",
  "[transition:grid-template-rows_250ms_ease-out,visibility_250ms,clip-path_250ms_step-end]",
].join(" ");

type CollapsibleContextValue = {
  open: boolean;
  toggle: () => void;
  bodyId: string;
};

const CollapsibleContext = createContext<CollapsibleContextValue | null>(null);

function useCollapsible(): CollapsibleContextValue {
  const context = useContext(CollapsibleContext);
  if (!context) {
    throw new Error("Collapsible parts must render inside <Collapsible>.");
  }
  return context;
}

/**
 * Shared collapsible section (the `content-structure` spec: "Collapsible
 * section"). Renders no element of its own: it provides the open state and the
 * body id to its header and body, which the consumer places freely (for
 * example the header in `CardAside` and the body around `CardContent`).
 * Controlled with `open`, uncontrolled from `defaultOpen` otherwise.
 */
export function Collapsible({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  children,
}: CollapsibleProps): ReactNode {
  const [openState, setOpenState] = useState(defaultOpen);
  const bodyId = useId();
  const controlled = openProp !== undefined;
  const open = controlled ? openProp : openState;

  function toggle(): void {
    if (!controlled) setOpenState(!open);
    onOpenChange?.(!open);
  }

  return (
    <CollapsibleContext.Provider value={{ open, toggle, bodyId }}>
      {children}
    </CollapsibleContext.Provider>
  );
}

/**
 * The header button. Its accessible name is the title only; the optional
 * `aside` is its description. The chevron points down while collapsed and is
 * turned to point up while expanded; `aria-expanded` carries the state.
 */
export function CollapsibleHeader({
  children,
  aside,
  headingLevel,
  className,
}: CollapsibleHeaderProps): ReactNode {
  const { open, toggle, bodyId } = useCollapsible();
  const titleId = useId();
  const asideId = useId();
  const hasAside = aside !== undefined && aside !== null;

  const button = (
    <button
      type="button"
      aria-expanded={open}
      aria-controls={bodyId}
      aria-labelledby={titleId}
      aria-describedby={hasAside ? asideId : undefined}
      onClick={toggle}
      className={cn(HEADER_CLASSES, className)}
    >
      <span className={TITLE_BLOCK_CLASSES}>
        <span id={titleId} className={TITLE_CLASSES}>
          {children}
        </span>
        {hasAside && <span id={asideId}>{aside}</span>}
      </span>
      <ChevronDown
        aria-hidden="true"
        className={cn(CHEVRON_CLASSES, open && "rotate-180")}
      />
    </button>
  );

  if (!headingLevel) return button;
  const Heading = `h${headingLevel}` as const;
  return <Heading>{button}</Heading>;
}

/**
 * The region the header shows and hides. It stays mounted while collapsed
 * (inert, zero height, nothing shown), so the header's `aria-controls` always
 * resolves and the consumer's state inside it survives a collapse.
 */
export function CollapsibleBody({
  className,
  children,
  ...rest
}: CollapsibleBodyProps): ReactNode {
  const { open, bodyId } = useCollapsible();
  return (
    <div
      {...rest}
      id={bodyId}
      inert={!open}
      className={cn(
        BODY_CLASSES,
        open ? BODY_EXPANDED_CLASSES : BODY_COLLAPSED_CLASSES,
        className,
      )}
    >
      <div className={cn("min-h-0", !open && "overflow-hidden")}>
        {children}
      </div>
    </div>
  );
}
