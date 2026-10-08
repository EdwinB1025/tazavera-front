"use client";

import { useId, useRef, useState } from "react";
import { descendantIds } from "./flavor-wheel-tree";
import type { FlavorWheelNode } from "./FlavorWheel";

export type FlavorWheelState = {
  expanded: ReadonlySet<string>;
  activeId: string | null;
  idPrefix: string;
  setActiveId: (id: string) => void;
  setExpansion: (node: FlavorWheelNode, open: boolean) => void;
  toggle: (node: FlavorWheelNode) => void;
  activate: (node: FlavorWheelNode) => void;
  collapseAll: () => void;
  focusRow: (id: string) => void;
  registerRow: (id: string, element: HTMLLIElement | null) => void;
};

/** The wheel's expansion, active note, id prefix and row refs (design.md D6). */
export function useFlavorWheelState(): FlavorWheelState {
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(new Set());
  const [activeId, setActiveId] = useState<string | null>(null);
  const idPrefix = useId();
  const rowElements = useRef(new Map<string, HTMLLIElement>());

  /** Expand or collapse a parent; collapsing also collapses its descendants. */
  const setExpansion = (node: FlavorWheelNode, open: boolean): void => {
    setExpanded((current) => {
      const next = new Set(current);
      if (open) {
        next.add(node.id);
      } else {
        next.delete(node.id);
        for (const id of descendantIds(node)) next.delete(id);
      }
      return next;
    });
  };

  const toggle = (node: FlavorWheelNode): void => {
    if (node.children.length > 0) setExpansion(node, !expanded.has(node.id));
  };

  /** Activate a note and, when it has children, toggle its expansion. */
  const activate = (node: FlavorWheelNode): void => {
    setActiveId(node.id);
    toggle(node);
  };

  return {
    expanded,
    activeId,
    idPrefix,
    setActiveId,
    setExpansion,
    toggle,
    activate,
    collapseAll: () => setExpanded(new Set()),
    focusRow: (id) => {
      rowElements.current.get(id)?.focus();
    },
    registerRow: (id, element) => {
      if (element) rowElements.current.set(id, element);
      else rowElements.current.delete(id);
    },
  };
}
