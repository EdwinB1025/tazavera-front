import type { ReactNode } from "react";
import { getMessages } from "@/shared/lib/i18n";
import { EvaluationsAccess } from "@/features/manage-evaluations";
import { PageSection } from "@/shared/ui";
import { EvaluationsList } from "./EvaluationsList";
import type { EvaluationsListTexts } from "./EvaluationsList";

// ─── UI-specific types (declared before the component) ───

export type EvaluationsListScreenProps = {
  locale: string;
};

/**
 * "My evaluations" screen (design.md D1, D13, D14). Thin: it resolves the
 * `evaluations` catalog for the route's locale — and the rating tier words the
 * offering card already shows, from `landing` — and renders the client list
 * inside the access gate. Every evaluation read runs on the client.
 */
export function EvaluationsListScreen({ locale }: EvaluationsListScreenProps): ReactNode {
  const catalog = getMessages("evaluations", locale);
  const landing = getMessages("landing", locale);

  const texts: EvaluationsListTexts = {
    heading: catalog.listHeading,
    openLabel: catalog.statusOpen,
    closedLabel: catalog.statusClosed,
    createdOnLabel: catalog.createdOnLabel,
    closedOnLabel: catalog.closedOnLabel,
    coffeeshopCaption: catalog.coffeeshopCaption,
    roasterCaption: catalog.roasterCaption,
    editLabel: catalog.editLabel,
    viewLabel: catalog.viewLabel,
    ratingExceptionalLabel: landing.cardRatingExceptionalLabel,
    ratingExcellentLabel: landing.cardRatingExcellentLabel,
    ratingGoodLabel: landing.cardRatingGoodLabel,
    ratingCommercialLabel: landing.cardRatingCommercialLabel,
    previousLabel: catalog.previousLabel,
    nextLabel: catalog.nextLabel,
    emptyMessage: catalog.listEmptyMessage,
    loadErrorMessage: catalog.listLoadErrorMessage,
    retryLabel: catalog.retryLabel,
    deleteLabel: catalog.deleteLabel,
    deleteTitle: catalog.deleteTitle,
    deleteDescription: catalog.deleteDescription,
    deleteConfirmLabel: catalog.deleteConfirmLabel,
    deleteCancelLabel: catalog.deleteCancelLabel,
    notYoursMessage: catalog.notYoursMessage,
    failureMessage: catalog.failureMessage,
  };

  return (
    <div className="flex-1">
      <PageSection surface="page">
        <EvaluationsAccess
          texts={{ message: catalog.accessMessage, signInLabel: catalog.signInLabel }}
        >
          <EvaluationsList locale={locale} texts={texts} />
        </EvaluationsAccess>
      </PageSection>
    </div>
  );
}
