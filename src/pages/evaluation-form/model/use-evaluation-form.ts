import { useReducer } from "react";
import type { EvaluationItem, OfferingDetail, TaxonomyNode } from "@/shared/api";
import {
  EVALUATION_GROUPS,
  buildCreateBody,
  buildUpdateBody,
  closeAnEvaluation,
  completenessOf,
  createAnEvaluation,
  updateAnEvaluation,
} from "@/entities/evaluation";
import type { EvaluationCallResult, GroupKey } from "@/entities/evaluation";
import { formReducer, initialFormModel } from "./form-model";
import type { FormModel } from "./form-model";
import type { FormStateUpdate } from "./form-updates";

/** The messages of the actions (design.md D4 and its error table). */
export type FormMessages = {
  savedMessage: string;
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
  /** The `GET /taxonomies` tree a draft's ancestors come from (cascade-evaluation-descriptors D7). */
  taxonomies: TaxonomyNode[];
  messages: FormMessages;
};

export type EvaluationFormModel = {
  model: FormModel;
  /** The closed form's read-only presentation. */
  readOnly: boolean;
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
  taxonomies,
  messages,
}: EvaluationFormInput): EvaluationFormModel {
  const [model, dispatch] = useReducer(formReducer, undefined, () =>
    initialFormModel(offering, evaluation, taxonomies),
  );
  const { values, ulid } = model;
  const completeness = completenessOf(values);

  /** The failure message of a write (design.md's error table). */
  const failureFor = (status: number | null, conflict: string) =>
    status === 403 ? messages.notYoursMessage : status === 409 ? conflict : messages.failureMessage;

  /**
   * Save draft (design.md D4): creates the evaluation the first time and
   * updates it afterwards. The contract's required roast level is the only
   * client validation. On the first success the URL becomes the evaluation's
   * own route, replaced in place so the form and its message stay.
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
      dispatch({ type: "fail", message: failureFor(result.status, messages.alreadyClosedMessage) });
      return null;
    }
    const saved = ulid ?? result.data.ulid ?? null;
    if (!ulid && saved) {
      dispatch({ type: "create", ulid: saved });
      window.history.replaceState(null, "", `/${locale}/manage/evaluations/${saved}`);
    }
    return saved;
  };

  const onSave = async () => {
    dispatch({ type: "start", busy: "save" });
    const saved = await save();
    dispatch({ type: "settle", message: saved ? messages.savedMessage : null });
  };

  /**
   * Close evaluation (design.md D4): saves first, then closes. A `409` names
   * the incomplete groups the completeness rule reports (design.md D10).
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
      dispatch({ type: "close", message: messages.closedMessage });
      return;
    }
    // The incomplete groups expand so their highlight is in view (D15).
    const incomplete =
      result.status === 409
        ? EVALUATION_GROUPS.filter((group) => completeness[group.key] === false).map(
            (group) => group.key,
          )
        : null;
    dispatch({
      type: "refuse",
      message: failureFor(result.status, messages.incompleteMessage),
      incomplete,
    });
  };

  return {
    model,
    readOnly: model.closed,
    completeness,
    edit: (update) => dispatch({ type: "edit", update }),
    setGroupOpen: (group, open) => dispatch({ type: "groupOpen", group, open }),
    setLegendOpen: (open) => dispatch({ type: "legendOpen", open }),
    onSave,
    onClose,
  };
}
