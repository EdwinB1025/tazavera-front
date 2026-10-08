"use client";

import type { ReactNode } from "react";
import { DescriptorChipGroup } from "./DescriptorChipGroup";
import { cascadeRows, cascadeValue, type CascadeNode } from "./descriptor-cascade";

// ─── UI-specific types (declared before the component) ───
// The tree arrives already built by the consumer; no generated API type is used.

export type DescriptorCascadeProps = {
  legend: ReactNode;
  nodes: CascadeNode[];
  value: string[];
  disabled?: boolean;
  help?: ReactNode;
  error?: ReactNode;
  emptyText?: ReactNode; // readOnly only
} & (
  | { readOnly: true; onValueChange?: never }
  | { readOnly?: false; onValueChange: (value: string[]) => void }
);

function hasChosen(node: CascadeNode, chosen: Set<string>): boolean {
  return chosen.has(node.value) || node.children.some((child) => hasChosen(child, chosen));
}

/**
 * Tazavera descriptor cascade (spec form-fields "Descriptor cascade";
 * cascade-evaluation-descriptors D2): a descriptor chip group whose children
 * render only while their parent is chosen. Read-only, a node's children row
 * shows when the node or a descendant is chosen, so a chosen child of an
 * unchosen parent sits under the parent's title.
 */
export function DescriptorCascade(props: DescriptorCascadeProps): ReactNode {
  const { legend, nodes, value, disabled, help, error, emptyText } = props;
  const chosen = new Set(value);
  const field = { legend, value, disabled, help, error };
  if (props.readOnly) {
    const rows = cascadeRows(nodes, (node) => hasChosen(node, chosen));
    return <DescriptorChipGroup {...field} rows={rows} emptyText={emptyText} readOnly />;
  }
  const { onValueChange } = props;
  return (
    <DescriptorChipGroup
      {...field}
      rows={cascadeRows(nodes, (node) => chosen.has(node.value))}
      onValueChange={(next) => onValueChange(cascadeValue(nodes, next))}
    />
  );
}
