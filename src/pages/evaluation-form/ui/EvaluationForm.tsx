"use client";

import type { ReactNode } from "react";
import type { EvaluationItem, OfferingDetail, TaxonomyNode } from "@/shared/api";
import type { DescriptorBlockKey } from "@/entities/evaluation";
import { useEvaluationForm } from "../model/use-evaluation-form";
import { ContextFieldsCard } from "./ContextFieldsCard";
import type { ExtractionMethod } from "./ContextFieldsCard";
import { EvaluationFormHeader } from "./EvaluationFormHeader";
import { EvaluationGroupList } from "./EvaluationGroupList";
import { FormActions } from "./FormActions";
import type { EvaluationGroupTexts } from "./group-texts";
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
    savedMessage: string;
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
};

// ─── Layout end states (design.md D14; the summary §9) ───
// Below `md` the page keeps room for the sticky actions bar.
const FORM_CLASSES = ["flex", "flex-col", "gap-8", "pb-28", "md:pb-0"].join(" ");

/**
 * The CVA combined form (design.md D3, D11, D12, D14; spec "Evaluation
 * form"): one state object for the whole form, the page header block, the
 * context card with the roast level and the extraction method, and the eight
 * group cards in CVA order with their completeness indicators, and the
 * actions with their status region (design.md D4).
 */
export function EvaluationForm({
  locale,
  offering,
  taxonomies,
  texts,
  evaluation,
}: EvaluationFormProps): ReactNode {
  const form = useEvaluationForm({
    locale,
    offering,
    evaluation,
    taxonomies,
    messages: texts.actions,
  });
  const { model, readOnly } = form;

  return (
    <form noValidate className={FORM_CLASSES} onSubmit={(event) => event.preventDefault()}>
      <EvaluationFormHeader locale={locale} offering={offering} texts={texts} />
      <ContextFieldsCard
        offering={offering}
        values={model.values}
        readOnly={readOnly}
        roastLevelMissing={model.roastLevelMissing}
        onEdit={form.edit}
        texts={texts}
      />
      <EvaluationGroupList locale={locale} taxonomies={taxonomies} form={form} texts={texts} />
      {readOnly ? (
        <p role="status" className="type-body">
          {model.message}
        </p>
      ) : (
        <FormActions
          saveLabel={texts.actions.saveLabel}
          closeLabel={texts.actions.closeLabel}
          onSave={form.onSave}
          onClose={form.onClose}
          busy={model.busy}
          message={model.message}
        />
      )}
    </form>
  );
}
