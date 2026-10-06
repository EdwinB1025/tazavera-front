"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import type { EvaluationItem, OfferingDetail, TaxonomyNode } from "@/shared/api";
import {
  EVALUATION_GROUPS,
  ROAST_LEVELS,
  completenessOf,
  emptyFormState,
  formStateFromEvaluation,
  toRoastLevel,
} from "@/entities/evaluation";
import type { EvaluationFormState } from "@/entities/evaluation";
import { Card, CardContent, Field, Link, Select } from "@/shared/ui";
import { EvaluationGroupCard } from "./EvaluationGroupCard";
import type { EvaluationGroupTexts } from "./EvaluationGroupCard";

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
  group: EvaluationGroupTexts;
};

export type EvaluationFormProps = {
  locale: string;
  offering: OfferingDetail;
  /** The `GET /taxonomies` tree the descriptor blocks filter (design.md D7). */
  taxonomies: TaxonomyNode[];
  texts: EvaluationFormTexts;
  /** The evaluation being edited or read; absent for a new one. */
  evaluation?: EvaluationItem;
};

// ─── Layout end states (design.md D14; the summary §9) ───
const FORM_CLASSES = ["flex", "flex-col", "gap-8"].join(" ");
const HEADER_CLASSES = ["flex", "flex-col", "items-start"].join(" ");
const CAPTIONS_CLASSES = ["flex", "flex-col", "gap-1"].join(" ");
const CONTEXT_FIELDS_CLASSES = ["grid", "gap-4", "md:grid-cols-2", "md:gap-6"].join(" ");
const GROUPS_CLASSES = ["flex", "flex-col", "gap-4"].join(" ");

function initialState(
  offering: OfferingDetail,
  evaluation: EvaluationItem | undefined,
): EvaluationFormState {
  // The read carries no roast level: the offering's prefills it (design.md D11).
  const roastLevel = toRoastLevel(offering.coffeeInventory?.coffee?.roastLevel);
  return evaluation ? formStateFromEvaluation(evaluation, roastLevel) : emptyFormState(roastLevel);
}

/**
 * The CVA combined form (design.md D3, D11, D12, D14; spec "Evaluation
 * form"): one state object for the whole form, the page header block, the
 * context card with the roast level and the extraction method, and the eight
 * group cards in CVA order with their completeness indicators.
 */
export function EvaluationForm({
  locale,
  offering,
  texts,
  evaluation,
}: EvaluationFormProps): ReactNode {
  const [state, setState] = useState<EvaluationFormState>(() =>
    initialState(offering, evaluation),
  );
  const readOnly = evaluation?.status === "closed";
  const completeness = completenessOf(state);
  const coffeeshopCaption = `${texts.coffeeshopCaption} ${offering.location?.name ?? ""}`.trim();
  const roasterCaption =
    `${texts.roasterCaption} ${offering.coffeeInventory?.roastery?.name ?? ""}`.trim();
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
        <h1 className="type-heading mt-4">{offering.coffeeInventory?.coffee?.name}</h1>
        <div className={CAPTIONS_CLASSES}>
          <p className="type-label">{coffeeshopCaption}</p>
          <p className="type-label">{roasterCaption}</p>
        </div>
      </div>
      <Card layout="stacked">
        <CardContent className={CONTEXT_FIELDS_CLASSES}>
          <Field label={texts.roastLevelLabel} required>
            <Select
              value={state.roastLevel ?? ""}
              disabled={readOnly}
              onChange={(event) =>
                setState((current) => ({
                  ...current,
                  roastLevel: toRoastLevel(event.target.value),
                }))
              }
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
          <Field label={texts.extractionMethodLabel}>
            <Select
              value={storedMethod ?? ""}
              disabled={readOnly}
              onChange={(event) =>
                setState((current) => ({
                  ...current,
                  extractionMethod: event.target.value === "" ? null : event.target.value,
                }))
              }
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
          <EvaluationGroupCard
            key={group.key}
            group={group}
            state={state}
            onChange={setState}
            texts={texts.group}
            complete={completeness[group.key]}
            readOnly={readOnly}
          />
        ))}
      </div>
    </form>
  );
}
