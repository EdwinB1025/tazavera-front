import type { ReactNode } from "react";
import type { OfferingDetail } from "@/shared/api";
import { ROAST_LEVELS } from "@/entities/evaluation";
import type { EvaluationFormState } from "@/entities/evaluation";
import { Card, CardContent, Field, Select } from "@/shared/ui";
import { withExtractionMethod, withRoastLevel } from "../model/form-updates";
import type { FormStateUpdate } from "../model/form-updates";

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

export type ContextFieldsTexts = {
  roastLevelLabel: string;
  roastLevelPlaceholder: string;
  extractionMethodLabel: string;
  extractionMethodPlaceholder: string;
  extractionLabels: Record<ExtractionMethod, string>;
  actions: { roastLevelRequired: string };
};

export type ContextFieldsCardProps = {
  /** The evaluation's offering; `null` once it was deleted (design.md D17). */
  offering: OfferingDetail | null;
  values: EvaluationFormState;
  readOnly: boolean;
  roastLevelMissing: boolean;
  onEdit: FormStateUpdate;
  texts: ContextFieldsTexts;
};

// ─── Layout end states (design.md D14; the summary §9) ───
const CONTEXT_FIELDS_CLASSES = ["grid", "gap-4", "md:grid-cols-2", "md:gap-6"].join(" ");

/**
 * The context card (design.md D11, D12, D14): the roast level of an existing
 * offering and the extraction method, with a stored method outside the nine.
 */
export function ContextFieldsCard({
  offering,
  values,
  readOnly,
  roastLevelMissing,
  onEdit,
  texts,
}: ContextFieldsCardProps): ReactNode {
  // A stored method outside the nine is shown as-is and sent back unchanged
  // (design.md D12).
  const storedMethod = values.extractionMethod;
  const customMethod =
    storedMethod !== null && !EXTRACTION_METHODS.some((method) => method === storedMethod)
      ? storedMethod
      : null;
  return (
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
              value={values.roastLevel ?? ""}
              disabled={readOnly}
              onChange={(event) => onEdit(withRoastLevel(event.target.value))}
            >
              {values.roastLevel === null ? (
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
            onChange={(event) => onEdit(withExtractionMethod(event.target.value))}
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
  );
}
