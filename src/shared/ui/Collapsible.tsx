"use client";

import type { HTMLAttributes, ReactNode } from "react";

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
