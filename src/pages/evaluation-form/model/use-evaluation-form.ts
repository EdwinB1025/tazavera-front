import { useReducer } from "react";
import { useRouter } from "next/navigation";
import type { EvaluationItem, OfferingDetail, TaxonomyNode } from "@/shared/api";
import {
  EVALUATION_GROUPS,
  buildCreateBody,
  buildUpdateBody,
  closeAnEvaluation,
  completenessOf,
  createAnEvaluation,
  isReadyForClosing,
  updateAnEvaluation,
} from "@/entities/evaluation";
import type { EvaluationCallResult, GroupKey } from "@/entities/evaluation";
import { formReducer, initialFormModel } from "./form-model";
import type { FormModel } from "./form-model";
import type { FormStateUpdate } from "./form-updates";

/** The messages of the actions (design.md D4 and its error table). */
export type FormMessages = {
  closedMessage: string;
  incompleteMessage: string;
  notYoursMessage: string;
  alreadyClosedMessage: string;
  failureMessage: string;
};

export type EvaluationFormInput = {
  locale: string;
  offering: OfferingDetail | null;
  evaluation?: EvaluationItem;
  /** `?mode=view`: read-only whatever the status (refine-evaluation-flow D4). */
  viewOnly?: boolean;
  /** The `GET /taxonomies` tree a draft's ancestors come from (cascade-evaluation-descriptors D7). */
  taxonomies: TaxonomyNode[];
  messages: FormMessages;
};

export type EvaluationFormModel = {
  model: FormModel;
  /** The closed form's read-only presentation. */
  readOnly: boolean;
  /** The saved evaluation passes the contract's close rule (refine-evaluation-flow D3). */
  closable: boolean;
  completeness: ReturnType<typeof completenessOf>;
  edit: FormStateUpdate;
  setGroupOpen: (group: GroupKey, open: boolean) => void;
  setLegendOpen: (open: boolean) => void;
  onSave: () => Promise<void>;
  onClose: () => Promise<void>;
};

/**
 * The state and actions of the CVA combined form (design.md D1–D3): one
 * reducer for the whole form, and the draft-save and close flows.
 */
export function useEvaluationForm({
  locale,
  offering,
  evaluation,
  viewOnly = false,
  taxonomies,
  messages,
}: EvaluationFormInput): EvaluationFormModel {
  const router = useRouter();
  const [model, dispatch] = useReducer(formReducer, undefined, () =>
    initialFormModel(offering, evaluation, taxonomies, viewOnly),
  );
  const { values, ulid } = model;
  const completeness = completenessOf(values);

  /** The failure message of a write (design.md's error table). */
  const failureFor = (kind: Extract<EvaluationCallResult<unknown>, { ok: false }>["kind"], conflict: string) =>
    kind === "forbidden" ? messages.notYoursMessage : kind === "conflict" ? conflict : messages.failureMessage;

  /**
   * Save draft (design.md D4): creates the evaluation the first time and
   * updates it afterwards. The contract's required roast level is the only
   * client validation.
   */
  const save = async (): Promise<string | null> => {
    const roastLevel = values.roastLevel;
    if (roastLevel === null) {
      dispatch({ type: "roastLevelMissing" });
      return null;
    }
    dispatch({ type: "send" });
    const sendable = { ...values, roastLevel };
    const result: EvaluationCallResult<{ ulid?: string }> = ulid
      ? await updateAnEvaluation(ulid, buildUpdateBody(sendable))
      : await createAnEvaluation(buildCreateBody(sendable, offering?.ulid ?? ""));
    if (!result.ok) {
      dispatch({ type: "fail", message: failureFor(result.kind, messages.alreadyClosedMessage) });
      return null;
    }
    const saved = ulid ?? result.data.ulid ?? null;
    if (!ulid && saved) dispatch({ type: "create", ulid: saved });
    return saved;
  };

  /** A successful save returns to My evaluations through the app router. */
  const onSave = async () => {
    dispatch({ type: "start", busy: "save" });
    const saved = await save();
    dispatch({ type: "settle", message: null });
    if (saved) router.push(`/${locale}/manage/evaluations`);
  };

  /**
   * Close evaluation (design.md D4): saves first, then closes, and a success
   * returns to My evaluations as a save does (refine-evaluation-flow D1). A
   * `409` names the incomplete groups the completeness rule reports (design.md D10).
   */
  const onClose = async () => {
    dispatch({ type: "start", busy: "close" });
    const saved = await save();
    if (!saved) {
      dispatch({ type: "settle", message: null });
      return;
    }
    const result = await closeAnEvaluation(saved);
    if (result.ok) {
      dispatch({ type: "settle", message: null });
      router.push(`/${locale}/manage/evaluations`);
      return;
    }
    // The incomplete groups expand so their highlight is in view (D15).
    const incomplete =
      result.kind === "conflict"
        ? EVALUATION_GROUPS.filter((group) => completeness[group.key] === false).map(
            (group) => group.key,
          )
        : null;
    dispatch({
      type: "refuse",
      message: failureFor(result.kind, messages.incompleteMessage),
      incomplete,
    });
  };

  return {
    model,
    readOnly: model.closed,
    // The form loads the evaluation once and leaves after a save: the loaded
    // evaluation is the saved state the API checks.
    closable: evaluation !== undefined && isReadyForClosing(evaluation),
    completeness,
    edit: (update) => dispatch({ type: "edit", update }),
    setGroupOpen: (group, open) => dispatch({ type: "groupOpen", group, open }),
    setLegendOpen: (open) => dispatch({ type: "legendOpen", open }),
    onSave,
    onClose,
  };
}
