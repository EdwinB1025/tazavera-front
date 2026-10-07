/**
 * The concordance scale (add-offering-catalog design.md D12; spec "Consensus
 * counts and concordances" — "Band boundaries"): below 0.50 low, 0.50 to
 * below 0.75 moderate, 0.75 to below 0.90 high, 0.90 and above excellent.
 */

// ─── UI-specific types (declared before the function) ───

export type ConcordanceBand = "low" | "moderate" | "high" | "excellent";

/** The band of a 0–1 concordance decimal string like `'0.812'`. */
export function concordanceBand(value: string): ConcordanceBand {
  const parsed = Number(value);
  if (parsed < 0.5) {
    return "low";
  }
  if (parsed < 0.75) {
    return "moderate";
  }
  if (parsed < 0.9) {
    return "high";
  }
  return "excellent";
}
