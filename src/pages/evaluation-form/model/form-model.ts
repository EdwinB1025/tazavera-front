import type { EvaluationItem, OfferingDetail } from "@/shared/api";
import {
  EVALUATION_GROUPS,
  emptyFormState,
  formStateFromEvaluation,
  toRoastLevel,
} from "@/entities/evaluation";
import type { EvaluationFormState, GroupKey } from "@/entities/evaluation";
import type { FormValuesUpdate } from "./form-updates";

/** Which action is in flight, if any. */
export type FormBusy = "save" | "close" | null;

/** The whole state of the evaluation form (design.md D2). */
export type FormModel = {
  values: EvaluationFormState;
  /** The evaluation's `ulid` once it exists: absent until the first save. */
  ulid: string | null;
  busy: FormBusy;
  message: string | null;
  roastLevelMissing: boolean;
  closed: boolean;
  highlighted: boolean;
  openGroups: Record<GroupKey, boolean>;
  legendOpen: boolean;
};

export type FormAction =
  | { type: "edit"; update: FormValuesUpdate }
  | { type: "groupOpen"; group: GroupKey; open: boolean }
  | { type: "legendOpen"; open: boolean }
  /** An action starts: busy set, highlight cleared. */
  | { type: "start"; busy: "save" | "close" }
  | { type: "roastLevelMissing" }
  /** A save is sent: roast-level error and message cleared. */
  | { type: "send" }
  | { type: "fail"; message: string }
  | { type: "create"; ulid: string }
  /** An action ends: busy cleared; the message set unless `null`. */
  | { type: "settle"; message: string | null }
  /** The close succeeded: busy cleared, read-only, every group and the legend open. */
  | { type: "close"; message: string }
  /**
   * The close failed: busy cleared and the message set; on a `409`
   * (`incomplete` not `null`) those groups open and the form is highlighted.
   */
  | { type: "refuse"; message: string; incomplete: GroupKey[] | null };

/** Every group's open state set to `open`. */
function allGroups(open: boolean): Record<GroupKey, boolean> {
  return Object.fromEntries(EVALUATION_GROUPS.map((group) => [group.key, open])) as Record<
    GroupKey,
    boolean
  >;
}

export function initialFormModel(
  offering: OfferingDetail | null,
  evaluation: EvaluationItem | undefined,
): FormModel {
  // The read carries no roast level: the offering's prefills it (design.md D11).
  const roastLevel = toRoastLevel(offering?.coffeeInventory?.coffee?.roastLevel);
  // Without its offering the evaluation can be neither updated nor closed:
  // it opens read-only, as a closed one (design.md D17).
  const closed = evaluation?.status === "closed" || offering === null;
  return {
    values: evaluation
      ? formStateFromEvaluation(evaluation, roastLevel)
      : emptyFormState(roastLevel),
    ulid: evaluation?.ulid ?? null,
    busy: null,
    message: null,
    roastLevelMissing: false,
    closed,
    highlighted: false,
    // Every group starts collapsed when editable and expanded when closed
    // (design.md D15); the 1–9 legend follows the same rule (design.md D16).
    openGroups: allGroups(closed),
    legendOpen: closed,
  };
}

/** The open groups with the incomplete ones expanded (design.md D15). */
function expanded(
  openGroups: Record<GroupKey, boolean>,
  incomplete: GroupKey[],
): Record<GroupKey, boolean> {
  const next = { ...openGroups };
  for (const key of incomplete) next[key] = true;
  return next;
}

export function formReducer(model: FormModel, action: FormAction): FormModel {
  switch (action.type) {
    case "edit":
      return { ...model, values: action.update(model.values) };
    case "groupOpen":
      return { ...model, openGroups: { ...model.openGroups, [action.group]: action.open } };
    case "legendOpen":
      return { ...model, legendOpen: action.open };
    case "start":
      return { ...model, busy: action.busy, highlighted: false };
    case "roastLevelMissing":
      return { ...model, roastLevelMissing: true };
    case "send":
      return { ...model, roastLevelMissing: false, message: null };
    case "fail":
      return { ...model, message: action.message };
    case "create":
      return { ...model, ulid: action.ulid };
    case "settle":
      return { ...model, busy: null, message: action.message ?? model.message };
    case "close":
      return {
        ...model,
        busy: null,
        closed: true,
        openGroups: allGroups(true),
        legendOpen: true,
        message: action.message,
      };
    case "refuse":
      return {
        ...model,
        busy: null,
        openGroups: action.incomplete
          ? expanded(model.openGroups, action.incomplete)
          : model.openGroups,
        highlighted: action.incomplete !== null,
        message: action.message,
      };
  }
}
