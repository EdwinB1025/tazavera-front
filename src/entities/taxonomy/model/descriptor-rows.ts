import type { TaxonomyNode } from "@/shared/api";
import type { ChipOption, ChipRow } from "@/shared/ui";

/**
 * Descriptor-row builder (add-offering-catalog design.md D13, the settled
 * descriptor rule). Pure: it turns one category of `GET /taxonomies` into the
 * `DescriptorChipGroup` rows — a row per level-0 node with level-1 children in
 * the category, those children as its chips, then one shared row of the
 * level-0 nodes of the category without such a child. Level 2 is never shown.
 */

const SHARED_ROW_ID = "shared";

function nameIn(node: TaxonomyNode, locale: string): string {
  return (
    (locale === "ca"
      ? node.nameCa
      : locale === "es"
        ? node.nameEs
        : node.nameEn) ?? ""
  );
}

function inCategory(node: TaxonomyNode, category: string): boolean {
  return node.categories?.includes(category) ?? false;
}

function option(node: TaxonomyNode, locale: string, level: 0 | 1): ChipOption {
  return {
    value: node.ulid ?? "",
    label: nameIn(node, locale),
    color: node.color ?? "",
    level,
  };
}

/** The descriptor rows of one taxonomy category, named in the locale. */
export function buildDescriptorRows(
  nodes: TaxonomyNode[],
  category: string,
  locale: string,
): ChipRow[] {
  const rows: ChipRow[] = [];
  const shared: ChipOption[] = [];
  for (const root of nodes) {
    const children = (root.children ?? []).filter((child) =>
      inCategory(child, category),
    );
    if (children.length > 0) {
      rows.push({
        id: root.ulid ?? "",
        title: nameIn(root, locale),
        options: children.map((child) => option(child, locale, 1)),
      });
    } else if (inCategory(root, category)) {
      shared.push(option(root, locale, 0));
    }
  }
  if (shared.length > 0) {
    rows.push({ id: SHARED_ROW_ID, options: shared });
  }
  return rows;
}
