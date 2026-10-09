import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { fetchOffering } from "@/entities/offering";
import { fetchTaxonomies } from "@/entities/taxonomy";
import { EvaluationsGate } from "@/widgets/evaluations-gate";
import { getMessages } from "@/shared/lib/i18n";
import { PageSection } from "@/shared/ui";
import { EvaluationForm } from "./EvaluationForm";
import { LoadFailure } from "./LoadFailure";
import { NotFoundNotice } from "./NotFoundNotice";
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
 * `offering` query value and the taxonomy tree — and a missing `offering`
 * value is the 404 page. Inside the access gate, an unknown offering shows
 * the not-found title and line (show-item-not-found-message design.md D4), a
 * failed read the failure message with a retry, and otherwise the form.
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
  const offerings = getMessages("catalog", locale);
  const [result, taxonomies] = await Promise.all([
    fetchOffering(ulid),
    fetchTaxonomies(),
  ]);
  return (
    <div className="flex-1">
      <PageSection surface="page">
        <EvaluationsGate
          texts={{ message: catalog.accessMessage, signInLabel: catalog.signInLabel }}
        >
          {!result.ok && result.kind === "not-found" ? (
            <NotFoundNotice
              locale={locale}
              title={offerings.detailNotFoundTitle}
              line={offerings.detailNotFoundLine}
              backLabel={catalog.backLabel}
            />
          ) : result.ok && taxonomies.ok ? (
            <EvaluationForm
              locale={locale}
              offering={result.data}
              taxonomies={taxonomies.data.data}
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
