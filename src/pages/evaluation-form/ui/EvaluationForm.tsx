"use client";

import { Fragment } from "react";
import type { ReactNode } from "react";
import type { EvaluationItem, OfferingDetail, TaxonomyNode } from "@/shared/api";
import { EVALUATION_GROUPS, ROAST_LEVELS } from "@/entities/evaluation";
import type { DescriptorBlockKey } from "@/entities/evaluation";
import { Card, CardContent, Checkbox, Field, Link, Select } from "@/shared/ui";
import {
  withDescriptors,
  withExtractionMethod,
  withFragranceNotEvaluated,
  withRoastLevel,
} from "../model/form-updates";
import { useEvaluationForm } from "../model/use-evaluation-form";
import { DescriptorBlock } from "./DescriptorBlock";
import { EvaluationGroupCard } from "./EvaluationGroupCard";
import type { EvaluationGroupTexts } from "./EvaluationGroupCard";
import { FormActions } from "./FormActions";
import { ScaleLegend } from "./ScaleLegend";
import type { ScaleLegendTexts } from "./ScaleLegend";

// ─── UI-specific types (declared before the component) ───

/** The nine extraction methods of the MVC (design.md D12). */
export const EXTRACTION_METHODS = [
  "espresso",
  "v60",
  "chemex",
  "aeropress",
  "french_press",
  "moka",
  "cold_brew",
  "siphon",
  "kalita",
] as const;

export type ExtractionMethod = (typeof EXTRACTION_METHODS)[number];

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
const HEADER_CLASSES = ["flex", "flex-col", "items-start"].join(" ");
const CAPTIONS_CLASSES = ["flex", "flex-col", "gap-1"].join(" ");
const CONTEXT_FIELDS_CLASSES = ["grid", "gap-4", "md:grid-cols-2", "md:gap-6"].join(" ");
const GROUPS_CLASSES = ["flex", "flex-col", "gap-4"].join(" ");

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
  const form = useEvaluationForm({ locale, offering, evaluation, messages: texts.actions });
  const { model, readOnly, completeness, edit: setState } = form;
  const { values: state, busy, message, roastLevelMissing, highlighted, openGroups, legendOpen } =
    model;
  const coffeeshopCaption = `${texts.coffeeshopCaption} ${offering?.location?.name ?? ""}`.trim();
  const roasterCaption =
    `${texts.roasterCaption} ${offering?.coffeeInventory?.roastery?.name ?? ""}`.trim();
  // A stored method outside the nine is shown as-is and sent back unchanged
  // (design.md D12).
  const storedMethod = state.extractionMethod;
  const customMethod =
    storedMethod !== null && !EXTRACTION_METHODS.some((method) => method === storedMethod)
      ? storedMethod
      : null;

  return (
    <form noValidate className={FORM_CLASSES} onSubmit={(event) => event.preventDefault()}>
      <div className={HEADER_CLASSES}>
        <Link href={`/${locale}/manage/evaluations`} variant="back">
          {texts.backLabel}
        </Link>
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
      <Card variant="section">
        <CardContent className={CONTEXT_FIELDS_CLASSES}>
          {/* The roast level comes from the offering's coffee (design.md D11, D17). */}
          {offering ? (
            <Field
              label={texts.roastLevelLabel}
              required
              error={roastLevelMissing ? texts.actions.roastLevelRequired : undefined}
            >
              <Select
                value={state.roastLevel ?? ""}
                disabled={readOnly}
                onChange={(event) => setState(withRoastLevel(event.target.value))}
              >
                {state.roastLevel === null ? (
                  <option value="">{texts.roastLevelPlaceholder}</option>
                ) : null}
                {ROAST_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </Select>
            </Field>
          ) : null}
          <Field label={texts.extractionMethodLabel}>
            <Select
              value={storedMethod ?? ""}
              disabled={readOnly}
              onChange={(event) => setState(withExtractionMethod(event.target.value))}
            >
              <option value="">{texts.extractionMethodPlaceholder}</option>
              {EXTRACTION_METHODS.map((method) => (
                <option key={method} value={method}>
                  {texts.extractionLabels[method]}
                </option>
              ))}
              {customMethod !== null ? <option value={customMethod}>{customMethod}</option> : null}
            </Select>
          </Field>
        </CardContent>
      </Card>
      <div className={GROUPS_CLASSES}>
        {EVALUATION_GROUPS.map((group) => (
          <Fragment key={group.key}>
            <EvaluationGroupCard
              group={group}
              state={state}
              onChange={setState}
              texts={texts.group}
              complete={completeness[group.key]}
              readOnly={readOnly}
              highlighted={highlighted && completeness[group.key] === false}
              open={openGroups[group.key]}
              onOpenChange={(open) => form.setGroupOpen(group.key, open)}
              top={
                group.key === "fragranceAroma" && !readOnly ? (
                  <Checkbox
                    label={texts.fragranceNotEvaluatedLabel}
                    checked={state.fragranceNotEvaluated}
                    onChange={(event) => setState(withFragranceNotEvaluated(event.target.checked))}
                  />
                ) : undefined
              }
              renderBlock={(block) =>
                readOnly ? (
                  <DescriptorBlock
                    legend={texts.blockLabels[block.key]}
                    nodes={taxonomies}
                    category={block.key}
                    locale={locale}
                    value={state.descriptors[block.selection]}
                    readOnly
                  />
                ) : (
                  <DescriptorBlock
                    legend={texts.blockLabels[block.key]}
                    nodes={taxonomies}
                    category={block.key}
                    locale={locale}
                    value={state.descriptors[block.selection]}
                    onValueChange={(value) => setState(withDescriptors(block.selection, value))}
                  />
                )
              }
            />
            {/* The legend follows the group holding Main tastes (design.md D16). */}
            {group.key === "flavorAftertaste" ? (
              <ScaleLegend texts={texts.legend} open={legendOpen} onOpenChange={form.setLegendOpen} />
            ) : null}
          </Fragment>
        ))}
      </div>
      {readOnly ? (
        <p role="status" className="type-body">
          {message}
        </p>
      ) : (
        <FormActions
          saveLabel={texts.actions.saveLabel}
          closeLabel={texts.actions.closeLabel}
          onSave={form.onSave}
          onClose={form.onClose}
          busy={busy}
          message={message}
        />
      )}
    </form>
  );
}
