import type { TaxonomyNode } from "@/shared/api";
import type { CascadeNode } from "@/shared/ui";

/**
 * Descriptor tree builder (cascade-evaluation-descriptors D4; spec
 * evaluations "Descriptor blocks"). Pure: it turns one category of
 * `GET /taxonomies` into the descriptor cascade's tree, levels 0 to 2 by
 * depth, in API order. A node is offered only when its `categories` contain
 * the category and its parent is offered.
 */

function nameIn(node: TaxonomyNode, locale: string): string {
  return (locale === "ca" ? node.nameCa : locale === "es" ? node.nameEs : node.nameEn) ?? "";
}

function build(nodes: TaxonomyNode[], category: string, locale: string, depth: number): CascadeNode[] {
  if (depth > 2) return [];
  return nodes
    .filter((node) => node.categories?.includes(category) ?? false)
    .map((node) => ({
      value: node.ulid ?? "",
      label: nameIn(node, locale),
      color: node.color ?? "",
      level: depth as 0 | 1 | 2,
      children: build((node.children ?? []) as TaxonomyNode[], category, locale, depth + 1),
    }));
}

/** The descriptor cascade tree of one taxonomy category, named in the locale. */
export function buildDescriptorTree(
  nodes: TaxonomyNode[],
  category: string,
  locale: string,
): CascadeNode[] {
  return build(nodes, category, locale, 0);
}
