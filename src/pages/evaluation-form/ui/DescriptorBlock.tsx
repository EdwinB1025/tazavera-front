"use client";

import type { ReactNode } from "react";
import type { TaxonomyNode } from "@/shared/api";
import type { DescriptorBlockKey } from "@/entities/evaluation";
import { DescriptorChipGroup } from "@/shared/ui";
import type { ChipOption, ChipRow } from "@/shared/ui";

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

const SHARED_ROW_ID = "shared";

function nameIn(node: TaxonomyNode, locale: string): string {
  return (locale === "ca" ? node.nameCa : locale === "es" ? node.nameEs : node.nameEn) ?? "";
}

function matches(node: TaxonomyNode, category: DescriptorBlockKey): boolean {
  return node.categories?.includes(category) ?? false;
}

function option(node: TaxonomyNode, locale: string, level: 0 | 1): ChipOption {
  return { value: node.ulid ?? "", label: nameIn(node, locale), color: node.color ?? "", level };
}

/**
 * The rows of one block (design.md D7; spec "Descriptor blocks"): a row per
 * level-0 node with matching level-1 children, those children as its options,
 * then one shared row of the matching level-0 nodes without a matching child.
 * Level 2 is never shown.
 */
function descriptorRows(
  nodes: TaxonomyNode[],
  category: DescriptorBlockKey,
  locale: string,
): ChipRow[] {
  const rows: ChipRow[] = [];
  const shared: ChipOption[] = [];
  for (const root of nodes) {
    const children = (root.children ?? []).filter((child) => matches(child, category));
    if (children.length > 0) {
      rows.push({
        id: root.ulid ?? "",
        title: nameIn(root, locale),
        options: children.map((child) => option(child, locale, 1)),
      });
    } else if (matches(root, category)) {
      shared.push(option(root, locale, 0));
    }
  }
  if (shared.length > 0) {
    rows.push({ id: SHARED_ROW_ID, options: shared });
  }
  return rows;
}

/**
 * One descriptor block of the form (design.md D7): the taxonomy options of its
 * category as a `DescriptorChipGroup`, multiple selection with no limit, the
 * chosen options alone when read-only.
 */
export function DescriptorBlock(props: DescriptorBlockProps): ReactNode {
  const { legend, nodes, category, locale, value } = props;
  const rows = descriptorRows(nodes, category, locale);
  return props.readOnly ? (
    <DescriptorChipGroup legend={legend} rows={rows} value={value} readOnly />
  ) : (
    <DescriptorChipGroup
      legend={legend}
      rows={rows}
      value={value}
      onValueChange={props.onValueChange}
    />
  );
}
