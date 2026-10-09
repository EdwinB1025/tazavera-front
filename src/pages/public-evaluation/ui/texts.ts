import { getMessages } from "@/shared/lib/i18n";
import { evaluationSheetTexts } from "@/widgets/evaluation-sheet";
import type { EvaluationViewTexts } from "@/widgets/evaluation-sheet";

/** The view's texts in the route's locale (design.md D3). */
export function viewTexts(locale: string): EvaluationViewTexts {
  const own = getMessages("public-evaluations", locale);
  const evaluations = getMessages("evaluations", locale);
  const landing = getMessages("landing", locale);
  return {
    ...evaluationSheetTexts({
      publicEvaluations: own,
      evaluations,
      scales: getMessages("scales", locale),
      landing,
    }),
    eyebrow: own.viewEyebrow,
    coffeeshopCaption: landing.cardCoffeeshopCaption,
    roasterCaption: landing.cardRoasterCaption,
    closedOnLabel: evaluations.closedOnLabel,
    viewOfferingLabel: own.viewOfferingLabel,
    offeringUnavailableLabel: own.offeringUnavailable,
    offeringMissingLabel: evaluations.offeringMissingLabel,
    errorMessage: own.viewErrorMessage,
    retryLabel: landing.listRetryLabel,
    notFoundTitle: own.viewNotFoundTitle,
    notFoundLine: own.viewNotFoundLine,
  };
}
