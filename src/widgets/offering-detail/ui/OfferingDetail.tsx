import type { ReactNode } from "react";
import type { Session } from "@/shared/api";
import { fetchOffering } from "@/entities/offering";
import { fetchTaxonomies } from "@/entities/taxonomy";
import type { DetailTab } from "../lib/tab";
import { OfferingDetailContent } from "./OfferingDetailContent";
import type {
  OfferingDetailResult,
  OfferingDetailTexts,
} from "./OfferingDetailContent";

// ─── UI-specific types (declared before the component) ───

export type OfferingDetailProps = {
  locale: string;
  ulid: string;
  tab: DetailTab;
  session: Session;
  texts: OfferingDetailTexts;
  /** The provisional tab's panel, composed by the page (add-public-evaluations D9). */
  provisional: ReactNode;
};

/**
 * The offering detail block as a thin async Server Component
 * (add-offering-catalog design.md D8). It holds only the two public reads and
 * the result mapping — one `error` result for a not-found or failed offering
 * or a taxonomy failure — and delegates every branch to the sync presentation.
 */
export async function OfferingDetail({
  locale,
  ulid,
  tab,
  session,
  texts,
  provisional,
}: OfferingDetailProps): Promise<ReactNode> {
  let result: OfferingDetailResult;
  const offering = await fetchOffering(ulid);
  if (!offering.ok) {
    result = { state: "error" };
  } else {
    try {
      const taxonomies = await fetchTaxonomies();
      result = taxonomies.ok
        ? { state: "success", offering: offering.data, taxonomies: taxonomies.data.data }
        : { state: "error" };
    } catch {
      result = { state: "error" };
    }
  }

  return (
    <OfferingDetailContent
      result={result}
      locale={locale}
      ulid={ulid}
      tab={tab}
      session={session}
      texts={texts}
      provisional={provisional}
    />
  );
}
