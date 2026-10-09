import type { ReactNode } from "react";
import type { OfferingDetail } from "@/shared/api";
import { ArrowLeft, RouteButton } from "@/shared/ui";

// ─── UI-specific types (declared before the component) ───

export type EvaluationFormHeaderTexts = {
  eyebrow: string;
  backLabel: string;
  coffeeshopCaption: string;
  roasterCaption: string;
  offeringMissingLabel: string;
};

export type EvaluationFormHeaderProps = {
  locale: string;
  /** The evaluation's offering; `null` once it was deleted (design.md D17). */
  offering: OfferingDetail | null;
  texts: EvaluationFormHeaderTexts;
};

// ─── Layout end states (design.md D14; the summary §9) ───
const HEADER_CLASSES = ["flex", "flex-col", "items-start"].join(" ");
const CAPTIONS_CLASSES = ["flex", "flex-col", "gap-1"].join(" ");

/**
 * The form's page header block (design.md D14, D17): the back link, the
 * eyebrow, the coffee name or the offering-missing label, and the coffeeshop
 * and roaster captions of an existing offering.
 */
export function EvaluationFormHeader({
  locale,
  offering,
  texts,
}: EvaluationFormHeaderProps): ReactNode {
  const coffeeshopCaption = `${texts.coffeeshopCaption} ${offering?.location?.name ?? ""}`.trim();
  const roasterCaption =
    `${texts.roasterCaption} ${offering?.coffeeInventory?.roastery?.name ?? ""}`.trim();
  return (
    <div className={HEADER_CLASSES}>
      <RouteButton
        href={`/${locale}/manage/evaluations`}
        variant="action-3"
        size="sm"
        icon={ArrowLeft}
      >
        {texts.backLabel}
      </RouteButton>
      <p className="type-eyebrow mt-4">{texts.eyebrow}</p>
      <h1 className="type-heading mt-4">
        {offering ? offering.coffeeInventory?.coffee?.name : texts.offeringMissingLabel}
      </h1>
      {offering ? (
        <div className={CAPTIONS_CLASSES}>
          <p className="type-label">{coffeeshopCaption}</p>
          <p className="type-label">{roasterCaption}</p>
        </div>
      ) : null}
    </div>
  );
}
