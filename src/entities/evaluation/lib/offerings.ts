import type { EvaluationItem, OfferingDetail } from "@/shared/api";

/**
 * The offering read the loader calls: `fetchOffering` of `entities/offering`,
 * passed in by the caller so this slice does not import another entity.
 */
export type OfferingReader = (
  ulid: string,
) => Promise<{ status: "found"; offering: OfferingDetail } | { status: "not-found" | "failed" }>;

export type EvaluationWithOffering = {
  evaluation: EvaluationItem;
  offering: OfferingDetail | null;
};

/**
 * Pairs each evaluation of a page with its offering (share-evaluation-offerings-loader
 * design.md D1): one read per distinct non-null `offeringId`, all in parallel.
 * A `null` id is a deleted offering and is never requested; a read that is not
 * `found` leaves its rows without an offering. Rows keep the page's order.
 */
export async function loadEvaluationOfferings(
  evaluations: EvaluationItem[],
  readOffering: OfferingReader,
): Promise<EvaluationWithOffering[]> {
  const ids = [
    ...new Set(evaluations.flatMap((item) => (item.offeringId ? [item.offeringId] : []))),
  ];
  const offerings = new Map<string, OfferingDetail>();
  await Promise.all(
    ids.map(async (id) => {
      const read = await readOffering(id);
      if (read.status === "found") offerings.set(id, read.offering);
    }),
  );
  return evaluations.map((evaluation) => ({
    evaluation,
    offering: evaluation.offeringId ? (offerings.get(evaluation.offeringId) ?? null) : null,
  }));
}
