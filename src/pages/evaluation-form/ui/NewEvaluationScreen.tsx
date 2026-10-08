import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { fetchOffering } from "@/entities/offering";
import { fetchTaxonomies } from "@/entities/taxonomy";
import { EvaluationsGate } from "@/widgets/evaluations-gate";
import { getMessages } from "@/shared/lib/i18n";
import { PageSection } from "@/shared/ui";
import { EvaluationForm } from "./EvaluationForm";
import { LoadFailure } from "./LoadFailure";
import { formTextsFrom } from "./form-texts";

// ─── UI-specific types (declared before the component) ───

export type NewEvaluationScreenProps = {
  locale: string;
  /** The `offering` query value of `/new?offering={ulid}`. */
  offering?: string | string[];
};

/**
 * The new-evaluation screen (design.md D1, D13; spec "Evaluation form").
 * Thin: the two public reads run on the server — the offering of the
 * `offering` query value and the taxonomy tree — and a missing or unknown
 * offering is the 404 page. A failed read shows the failure message with a
 * retry; otherwise the form renders inside the access gate.
 */
export async function NewEvaluationScreen({
  locale,
  offering,
}: NewEvaluationScreenProps): Promise<ReactNode> {
  const ulid = typeof offering === "string" ? offering : undefined;
  if (!ulid) {
    notFound();
  }
  const catalog = getMessages("evaluations", locale);
  const [result, taxonomies] = await Promise.all([
    fetchOffering(ulid),
    fetchTaxonomies().catch(() => null),
  ]);
  if (result.status === "not-found") {
    notFound();
  }

  return (
    <div className="flex-1">
      <PageSection surface="page">
        <EvaluationsGate
          texts={{ message: catalog.accessMessage, signInLabel: catalog.signInLabel }}
        >
          {result.status === "found" && taxonomies ? (
            <EvaluationForm
              locale={locale}
              offering={result.offering}
              taxonomies={taxonomies.data}
              texts={formTextsFrom(catalog)}
            />
          ) : (
            <LoadFailure message={catalog.formLoadErrorMessage} retryLabel={catalog.retryLabel} />
          )}
        </EvaluationsGate>
      </PageSection>
    </div>
  );
}
