"use client";

import { useState } from "react";
import { deleteOffering, deleteOfferings } from "../api/management";
import type { OwnOfferingsState } from "./own-offerings";

/**
 * The single and bulk delete flows (design.md D5, D7; spec "Deleting
 * offerings"). A delete starts by opening its confirmation and sends nothing
 * until it is confirmed. While the request is pending the confirmation cannot
 * be cancelled. A success closes it and reports the number deleted; a failure,
 * a 422 or a 403 keeps it open with its error so the confirm can be tried
 * again: the delete is a plain write with no identity check
 * (drop-step-up-for-offerings).
 */

// ─── State (declared before the hook) ───

export type DeleteTarget =
  | { kind: "one"; ulid: string }
  | { kind: "many"; ulids: string[] };

export type DeleteError = "none" | "failed";

export type DeleteFlow = {
  target: DeleteTarget | null;
  pending: boolean;
  error: DeleteError;
  /** Opens the confirmation for a target; nothing is sent. */
  start: (target: DeleteTarget) => void;
  /** Closes the confirmation; ignored while the request is pending. */
  cancel: () => void;
  /** Sends the delete of the open confirmation. */
  confirm: () => void;
};

export type DeleteFlowOptions = {
  /** A delete succeeded: the number of deleted offerings. */
  onDeleted: (count: number) => void;
};

export function useDeleteFlow({ onDeleted }: DeleteFlowOptions): DeleteFlow {
  const [target, setTarget] = useState<DeleteTarget | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<DeleteError>("none");

  const start = (next: DeleteTarget) => {
    setTarget(next);
    setError("none");
  };

  const cancel = () => {
    if (pending) return;
    setTarget(null);
    setError("none");
  };

  const confirm = () => {
    if (target === null || pending) return;
    setPending(true);
    const sent =
      target.kind === "one" ? deleteOffering(target.ulid) : deleteOfferings(target.ulids);
    sent.then((result) => {
      setPending(false);
      if (result.ok) {
        setTarget(null);
        setError("none");
        onDeleted(target.kind === "one" ? 1 : target.ulids.length);
      } else {
        setError("failed");
      }
    });
  };

  return { target, pending, error, start, cancel, confirm };
}

/**
 * The page to move to after a delete: the previous one when the reloaded page
 * beyond the first came back empty, otherwise none (spec "Last page
 * emptied").
 */
export function previousPageAfterDelete(
  state: OwnOfferingsState["state"],
  page: number,
): number | null {
  return state === "empty" && page > 1 ? page - 1 : null;
}
