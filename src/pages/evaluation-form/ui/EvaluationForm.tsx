"use client";

import type { ReactNode } from "react";
import type { EvaluationItem, OfferingDetail, TaxonomyNode } from "@/shared/api";
import type { DescriptorBlockKey } from "@/entities/evaluation";
import { BackButton } from "@/shared/ui";
import { useEvaluationForm } from "../model/use-evaluation-form";
import { ContextFieldsCard } from "./ContextFieldsCard";
import type { ExtractionMethod } from "./ContextFieldsCard";
import { EvaluationFormHeader } from "./EvaluationFormHeader";
import { EvaluationGroupList } from "./EvaluationGroupList";
import { FormActions } from "./FormActions";
import type { EvaluationGroupTexts } from "./group-texts";
import { ScaleLegend } from "./ScaleLegend";
import type { ScaleLegendTexts } from "./ScaleLegend";

// ─── UI-specific types (declared before the component) ───

/** Every text of the form, from the `evaluations` catalog (design.md D14). */
export type EvaluationFormTexts = {
  eyebrow: string;
  backLabel: string;
  coffeeshopCaption: string;
  roasterCaption: string;
  roastLevelLabel: string;
  roastLevelPlaceholder: string;
  extractionMethodLabel: string;
  extractionMethodPlaceholder: string;
  extractionLabels: Record<ExtractionMethod, string>;
  /** The actions and their messages (design.md D4 and its error table). */
  actions: {
    saveLabel: string;
    closeLabel: string;
    cancelLabel: string;
    closedMessage: string;
    incompleteMessage: string;
    notYoursMessage: string;
    alreadyClosedMessage: string;
    failureMessage: string;
    roastLevelRequired: string;
  };
  /** The option of design.md D9. */
  fragranceNotEvaluatedLabel: string;
  /** Shown in place of the offering when it was deleted (design.md D17). */
  offeringMissingLabel: string;
  /** The 1–9 legend (design.md D16). */
  legend: ScaleLegendTexts;
  /** The legends of the four descriptor blocks. */
  blockLabels: Record<DescriptorBlockKey, string>;
  group: EvaluationGroupTexts;
};

export type EvaluationFormProps = {
  locale: string;
  /** The evaluation's offering; `null` once it was deleted (design.md D17). */
  offering: OfferingDetail | null;
  /** The `GET /taxonomies` tree the descriptor blocks filter (design.md D7). */
  taxonomies: TaxonomyNode[];
  texts: EvaluationFormTexts;
  /** The evaluation being edited or read; absent for a new one. */
  evaluation?: EvaluationItem;
  /** Shows the evaluation read-only whatever its status (refine-evaluation-flow D4). */
  viewOnly?: boolean;
};

// ─── Layout end states (design.md D14; the summary §9) ───
// Below `md` the page keeps room for the sticky actions bar.
const FORM_CLASSES = ["flex", "flex-col", "gap-8", "pb-36", "md:pb-0"].join(" ");

/**
 * The CVA combined form (design.md D3, D11, D12, D14; spec "Evaluation
 * form"): one state object for the whole form, the page header block, the
 * 1–9 legend, the context card with the roast level and the extraction
 * method, and the eight group cards in CVA order with their completeness indicators, and the
 * actions with their status region (design.md D4).
 */
export function EvaluationForm({
  locale,
  offering,
  taxonomies,
  texts,
  evaluation,
  viewOnly = false,
}: EvaluationFormProps): ReactNode {
  const form = useEvaluationForm({
    locale,
    offering,
    evaluation,
    viewOnly,
    taxonomies,
    messages: texts.actions,
  });
  const { model, readOnly } = form;

  return (
    <form noValidate className={FORM_CLASSES} onSubmit={(event) => event.preventDefault()}>
      <EvaluationFormHeader locale={locale} offering={offering} texts={texts} />
      {/* The legend is the form's first section (move-scale-legend-first D1). */}
      <ScaleLegend texts={texts.legend} open={model.legendOpen} onOpenChange={form.setLegendOpen} />
      <ContextFieldsCard
        offering={offering}
        values={model.values}
        readOnly={readOnly}
        roastLevelMissing={model.roastLevelMissing}
        fieldErrors={form.fieldErrors}
        onFieldEdit={form.clearFieldError}
        onEdit={form.edit}
        texts={texts}
      />
      <EvaluationGroupList locale={locale} taxonomies={taxonomies} form={form} texts={texts} />
      {readOnly ? (
        <>
          <p role="status" className="type-body">
            {model.message}
          </p>
          {/* No action bar: the header's back control again, as a button (add-bottom-back-links D4; apply-header-link-rule). */}
          <div>
            <BackButton fallback={`/${locale}/manage/evaluations`}>
              {texts.backLabel}
            </BackButton>
          </div>
        </>
      ) : (
        <FormActions
          saveLabel={texts.actions.saveLabel}
          closeLabel={texts.actions.closeLabel}
          cancelLabel={texts.actions.cancelLabel}
          cancelHref={`/${locale}/manage/evaluations`}
          onSave={form.onSave}
          // Close only once the evaluation exists (close-evaluation-only-when-saved)
          // and its saved state is complete (refine-evaluation-flow D3).
          onClose={model.ulid && form.closable ? form.onClose : undefined}
          busy={model.busy}
          message={model.message}
        />
      )}
    </form>
  );
}
