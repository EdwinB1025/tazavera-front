import type { ReactNode } from "react";
import { fetchTaxonomies } from "@/entities/taxonomy";
import { EvaluationsAccess } from "@/features/manage-evaluations";
import { getMessages } from "@/shared/lib/i18n";
import { PageSection } from "@/shared/ui";
import { EvaluationDetail } from "./EvaluationDetail";
import { LoadFailure } from "./LoadFailure";
import { formTextsFrom } from "./form-texts";

// ─── UI-specific types (declared before the component) ───

export type EvaluationScreenProps = {
  locale: string;
  ulid: string;
};

/**
 * The existing-evaluation screen (design.md D1, D13). Thin: the public
 * taxonomy read runs on the server; the evaluation and its offering load on
 * the client inside the access gate (the evaluation needs the token). A
 * failed taxonomy read shows the failure message with a retry.
 */
export async function EvaluationScreen({ locale, ulid }: EvaluationScreenProps): Promise<ReactNode> {
  const catalog = getMessages("evaluations", locale);
  const taxonomies = await fetchTaxonomies().catch(() => null);

  return (
    <div className="flex-1">
      <PageSection surface="page">
        <EvaluationsAccess
          texts={{ message: catalog.accessMessage, signInLabel: catalog.signInLabel }}
        >
          {taxonomies ? (
            <EvaluationDetail
              locale={locale}
              ulid={ulid}
              taxonomies={taxonomies.data}
              texts={{
                ...formTextsFrom(catalog),
                loadErrorMessage: catalog.formLoadErrorMessage,
                retryLabel: catalog.retryLabel,
              }}
            />
          ) : (
            <LoadFailure message={catalog.formLoadErrorMessage} retryLabel={catalog.retryLabel} />
          )}
        </EvaluationsAccess>
      </PageSection>
    </div>
  );
}
