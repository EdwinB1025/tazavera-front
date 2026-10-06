"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import type { EvaluationItem, OfferingDetail, TaxonomyNode } from "@/shared/api";
import {
  EVALUATION_GROUPS,
  ROAST_LEVELS,
  buildCreateBody,
  buildUpdateBody,
  closeAnEvaluation,
  completenessOf,
  createAnEvaluation,
  emptyFormState,
  formStateFromEvaluation,
  toRoastLevel,
  updateAnEvaluation,
} from "@/entities/evaluation";
import type {
  DescriptorBlockKey,
  EvaluationCallResult,
  EvaluationFormState,
  GroupKey,
} from "@/entities/evaluation";
import { Card, CardContent, Checkbox, Field, Link, Select } from "@/shared/ui";
import { DescriptorBlock } from "./DescriptorBlock";
import { EvaluationGroupCard } from "./EvaluationGroupCard";
import type { EvaluationGroupTexts } from "./EvaluationGroupCard";
import { FormActions } from "./FormActions";
import type { FormBusy } from "./FormActions";

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
  /** The legends of the four descriptor blocks. */
  blockLabels: Record<DescriptorBlockKey, string>;
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
// Below `md` the page keeps room for the sticky actions bar.
const FORM_CLASSES = ["flex", "flex-col", "gap-8", "pb-28", "md:pb-0"].join(" ");
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

/** Every group's open state set to `open`. */
function allGroups(open: boolean): Record<GroupKey, boolean> {
  return Object.fromEntries(EVALUATION_GROUPS.map((group) => [group.key, open])) as Record<
    GroupKey,
    boolean
  >;
}

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
  const [state, setState] = useState<EvaluationFormState>(() =>
    initialState(offering, evaluation),
  );
  // The evaluation's `ulid` once it exists: absent until the first save.
  const [ulid, setUlid] = useState<string | null>(evaluation?.ulid ?? null);
  const [busy, setBusy] = useState<FormBusy>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [roastLevelMissing, setRoastLevelMissing] = useState(false);
  const [closed, setClosed] = useState(evaluation?.status === "closed");
  const [highlighted, setHighlighted] = useState(false);
  // Every group starts collapsed when editable and expanded when closed
  // (design.md D15).
  const [openGroups, setOpenGroups] = useState<Record<GroupKey, boolean>>(() =>
    allGroups(evaluation?.status === "closed"),
  );
  const readOnly = closed;
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

  /** The failure message of a write (design.md's error table). */
  const failureFor = (status: number | null, conflict: string) =>
    status === 403
      ? texts.actions.notYoursMessage
      : status === 409
        ? conflict
        : texts.actions.failureMessage;

  /**
   * Save draft (design.md D4): creates the evaluation the first time and
   * updates it afterwards. The contract's required roast level is the only
   * client validation. On the first success the URL becomes the evaluation's
   * own route, replaced in place so the form and its message stay.
   */
  const save = async (): Promise<string | null> => {
    const roastLevel = state.roastLevel;
    if (roastLevel === null) {
      setRoastLevelMissing(true);
      return null;
    }
    setRoastLevelMissing(false);
    setMessage(null);
    const sendable = { ...state, roastLevel };
    const result: EvaluationCallResult<{ ulid?: string }> = ulid
      ? await updateAnEvaluation(ulid, buildUpdateBody(sendable))
      : await createAnEvaluation(buildCreateBody(sendable, offering.ulid ?? ""));
    if (!result.ok) {
      setMessage(failureFor(result.status, texts.actions.alreadyClosedMessage));
      return null;
    }
    const saved = ulid ?? result.data.ulid ?? null;
    if (!ulid && saved) {
      setUlid(saved);
      window.history.replaceState(null, "", `/${locale}/manage/evaluations/${saved}`);
    }
    return saved;
  };

  const onSave = async () => {
    setBusy("save");
    setHighlighted(false);
    const saved = await save();
    setBusy(null);
    if (saved) setMessage(texts.actions.savedMessage);
  };

  /**
   * Close evaluation (design.md D4): saves first, then closes. A `409` names
   * the incomplete groups the completeness rule reports (design.md D10).
   */
  const onClose = async () => {
    setBusy("close");
    setHighlighted(false);
    const saved = await save();
    if (!saved) {
      setBusy(null);
      return;
    }
    const result = await closeAnEvaluation(saved);
    setBusy(null);
    if (result.ok) {
      setClosed(true);
      setOpenGroups(allGroups(true));
      setMessage(texts.actions.closedMessage);
      return;
    }
    if (result.status === 409) {
      // The incomplete groups expand so their highlight is in view (D15).
      setOpenGroups((current) => {
        const next = { ...current };
        for (const group of EVALUATION_GROUPS) {
          if (completeness[group.key] === false) next[group.key] = true;
        }
        return next;
      });
    }
    setHighlighted(result.status === 409);
    setMessage(failureFor(result.status, texts.actions.incompleteMessage));
  };

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
          <Field
            label={texts.roastLevelLabel}
            required
            error={roastLevelMissing ? texts.actions.roastLevelRequired : undefined}
          >
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
            highlighted={highlighted && completeness[group.key] === false}
            open={openGroups[group.key]}
            onOpenChange={(open) =>
              setOpenGroups((current) => ({ ...current, [group.key]: open }))
            }
            top={
              group.key === "fragranceAroma" && !readOnly ? (
                <Checkbox
                  label={texts.fragranceNotEvaluatedLabel}
                  checked={state.fragranceNotEvaluated}
                  onChange={(event) =>
                    setState((current) => ({
                      ...current,
                      fragranceNotEvaluated: event.target.checked,
                    }))
                  }
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
                  onValueChange={(value) =>
                    setState((current) => ({
                      ...current,
                      descriptors: { ...current.descriptors, [block.selection]: value },
                    }))
                  }
                />
              )
            }
          />
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
          onSave={onSave}
          onClose={onClose}
          busy={busy}
          message={message}
        />
      )}
    </form>
  );
}
