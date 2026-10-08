import type { ReactNode } from "react";
import { LINK_CLASSES } from "@/shared/ui";

// ─── UI-specific types (declared before the component) ───

export type ExternalLinkProps = {
  /** An absolute URL of one of the API's own pages. */
  href: string;
  children: ReactNode;
};

/**
 * A link to one of the API's pages (design.md D4): a native anchor, since
 * `Link` refuses external destinations, carrying the link treatment `Link`
 * exports. It opens in the same tab and is named by its visible text.
 */
export function ExternalLink({ href, children }: ExternalLinkProps): ReactNode {
  return (
    <a href={href} className={LINK_CLASSES}>
      {children}
    </a>
  );
}
