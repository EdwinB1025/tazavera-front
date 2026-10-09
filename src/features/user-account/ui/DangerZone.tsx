"use client";

import { useState, type ReactNode } from "react";
import { Button, ConfirmDialog, StepUpNotice } from "@/shared/ui";
import { deactivateAccount, deleteAccount } from "../api/account";

// ─── UI-specific types (declared before the component) ───

export type DangerZoneTexts = {
  stepUpText: string;
  stepUpButton: string;
  deactivateHeading: string;
  deactivateText: string;
  deleteHeading: string;
  deleteText: string;
  deactivateConfirmTitle: string;
  deleteConfirmTitle: string;
  confirmDeactivate: string;
  confirmDelete: string;
  cancel: string;
  genericError: string;
};

export type DangerZoneProps = {
  /** `data.ulid` of the session user. */
  ulid: string;
  locale: string;
  texts: DangerZoneTexts;
  /** Signs out after the account is deactivated or deleted (design.md D7). */
  signOut: () => void;
  /** Starts the write-scope sign in (design.md D6). */
  requestProfileWrite: (returnRoute: string) => void;
  /** Ends the write permission of a granted step-up when a dialog is cancelled (scope-write-token-to-action design.md D4). */
  endProfileWrite?: () => void;
};

type DangerAction = "deactivate" | "delete";

type DialogError = "generic" | "stepUp" | null;

type DangerBlockContent = {
  action: DangerAction;
  heading: string;
  text: string;
  title: string;
  label: string;
};

/** The deactivation block, then the deletion block. */
function dangerBlocks(texts: DangerZoneTexts): DangerBlockContent[] {
  return [
    {
      action: "deactivate",
      heading: texts.deactivateHeading,
      text: texts.deactivateText,
      title: texts.deactivateConfirmTitle,
      label: texts.confirmDeactivate,
    },
    {
      action: "delete",
      heading: texts.deleteHeading,
      text: texts.deleteText,
      title: texts.deleteConfirmTitle,
      label: texts.confirmDelete,
    },
  ];
}

/** One block: its heading, explanation and trigger, and its `ConfirmDialog`. */
function DangerBlock({
  block,
  first,
  open,
  pending,
  error,
  cancelLabel,
  onOpen,
  onOpenChange,
  onConfirm,
}: {
  block: DangerBlockContent;
  first: boolean;
  open: boolean;
  pending: boolean;
  error: ReactNode;
  cancelLabel: string;
  onOpen: () => void;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}): ReactNode {
  return (
    <div
      className={
        first
          ? "flex flex-col"
          : "flex flex-col border-t border-border-subtle pt-6"
      }
    >
      <h3 className="type-card-heading">{block.heading}</h3>
      <p className="type-body mt-2">{block.text}</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button
          variant="action-2"
          size="base"
          onClick={onOpen}
        >
          {block.label}
        </Button>
      </div>
      <ConfirmDialog
        open={open}
        onOpenChange={onOpenChange}
        title={block.title}
        description={block.text}
        confirmLabel={block.label}
        cancelLabel={cancelLabel}
        onConfirm={onConfirm}
        pending={pending}
        error={open ? error : undefined}
      />
    </div>
  );
}

/**
 * The Danger zone (spec "Account deactivation and deletion"; design.md D6, D7
 * and D10): two blocks, each with its heading, explanation and `action-2`
 * trigger opening its `ConfirmDialog`. Nothing is sent before the confirm; a
 * `200` signs out, a `403` shows the step-up notice in the dialog and any
 * other outcome the generic error, the dialog staying open for a retry.
 */
export function DangerZone({
  ulid,
  locale,
  texts,
  signOut,
  requestProfileWrite,
  endProfileWrite,
}: DangerZoneProps): ReactNode {
  const [openAction, setOpenAction] = useState<DangerAction | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<DialogError>(null);

  function openDialog(action: DangerAction): void {
    setError(null);
    setOpenAction(action);
  }

  function handleOpenChange(open: boolean): void {
    if (!open) {
      setOpenAction(null);
      setError(null);
      endProfileWrite?.();
    }
  }

  async function confirm(action: DangerAction): Promise<void> {
    if (pending) return;
    setPending(true);
    setError(null);
    const send = action === "delete" ? deleteAccount : deactivateAccount;
    const result = await send(ulid);
    setPending(false);
    if (result.ok) {
      signOut();
      return;
    }
    setError(result.kind === "forbidden" ? "stepUp" : "generic");
  }

  const errorContent =
    error === "stepUp" ? (
      <StepUpNotice
        text={texts.stepUpText}
        actionLabel={texts.stepUpButton}
        onConfirm={() => requestProfileWrite(`/${locale}/account`)}
      />
    ) : error === "generic" ? (
      texts.genericError
    ) : undefined;

  return (
    <div className="flex flex-col gap-6">
      {dangerBlocks(texts).map((block, index) => (
        <DangerBlock
          key={block.action}
          block={block}
          first={index === 0}
          open={openAction === block.action}
          pending={pending}
          error={errorContent}
          cancelLabel={texts.cancel}
          onOpen={() => openDialog(block.action)}
          onOpenChange={handleOpenChange}
          onConfirm={() => void confirm(block.action)}
        />
      ))}
    </div>
  );
}
