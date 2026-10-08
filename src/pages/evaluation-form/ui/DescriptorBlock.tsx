"use client";

import type { ReactNode } from "react";
import type { TaxonomyNode } from "@/shared/api";
import type { DescriptorBlockKey } from "@/entities/evaluation";
import { buildDescriptorTree } from "@/entities/taxonomy";
import { DescriptorCascade } from "@/shared/ui";

// ─── UI-specific types (declared before the component) ───

export type DescriptorBlockProps = {
  legend: string;
  /** The `GET /taxonomies` tree. */
  nodes: TaxonomyNode[];
  category: DescriptorBlockKey;
  locale: string;
  value: string[];
} & (
  | { readOnly: true; onValueChange?: never }
  | { readOnly?: false; onValueChange: (value: string[]) => void }
);

/**
 * One descriptor block of the form (design.md D7; cascade-evaluation-descriptors
 * D5): the taxonomy nodes of its category, levels 0 to 2, as a descriptor
 * cascade, multiple selection with no limit, the read-only cascade when
 * read-only.
 */
export function DescriptorBlock(props: DescriptorBlockProps): ReactNode {
  const { legend, nodes, category, locale, value } = props;
  const tree = buildDescriptorTree(nodes, category, locale);
  return props.readOnly ? (
    <DescriptorCascade legend={legend} nodes={tree} value={value} readOnly />
  ) : (
    <DescriptorCascade
      legend={legend}
      nodes={tree}
      value={value}
      onValueChange={props.onValueChange}
    />
  );
}
