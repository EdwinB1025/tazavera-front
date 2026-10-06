"use client";

import { useRef, type ReactNode } from "react";
import { requestProfileWrite, signIn, useSession } from "@/features/auth";
import {
  InventoryField,
  LocationsFieldset,
  ManagementGate,
  useCreateFlow,
  type InventoryFieldTexts,
  type LocationsFieldsetTexts,
  type ManagementGateTexts,
} from "@/features/offering-management";
import { Button, Link } from "@/shared/ui";

// ─── UI-specific types (declared before the component) ───

export type NewOfferingFormTexts = ManagementGateTexts &
  InventoryFieldTexts &
  LocationsFieldsetTexts & {
    inventoryRequired: string;
    submitLabel: string;
    cancelLabel: string;
    createError: string;
    createdStatus: string;
    viewMyOfferings: string;
    stepUpMessage: string;
    stepUpLabel: string;
  };

export type NewOfferingFormProps = {
  locale: string;
  texts: NewOfferingFormTexts;
};

// ─── Layout (summary §6.3) ───
// The form panel: full width below `md`, at most 40rem from `md`; padding
// 1rem with 1.25rem at the bottom below `md`, 1.5rem from `md`; its children
// a column 1.5rem apart.
const PANEL_CLASSES = [
  "flex",
  "flex-col",
  "gap-6",
  "w-full",
  "md:max-w-160",
  "bg-surface-form",
  "border-2",
  "border-border-subtle",
  "rounded-container",
  "shadow-lg",
  "p-4",
  "pb-5",
  "md:p-6",
].join(" ");
// The error or the step-up: a column of the text and its button 0.75rem
// apart, no box.
const ALERT_CLASSES = ["type-error", "flex", "flex-col", "items-start", "gap-3"].join(" ");
// The success status: the message, then the link, 0.5rem apart, no box.
const STATUS_CLASSES = ["type-body", "flex", "flex-col", "items-start", "gap-2"].join(" ");
// Submit, then Cancel: a wrapping row 0.75rem apart, aligned to the end from
// `sm`.
const ACTIONS_CLASSES = [
  "flex",
  "flex-wrap",
  "items-center",
  "gap-3",
  "sm:justify-end",
].join(" ");

type CreateFormProps = {
  locale: string;
  route: string;
  /** While the session resolves, every control is unavailable. */
  disabled?: boolean;
  texts: NewOfferingFormTexts;
};

/** The form panel of a signed-in coffeeshop, or its unavailable copy while loading. */
function CreateForm({ locale, route, disabled = false, texts }: CreateFormProps): ReactNode {
  const flow = useCreateFlow({ enabled: !disabled });
  const fieldRef = useRef<HTMLDivElement>(null);
  const listRoute = `/${locale}/manage/offerings` as const;
  const { status } = flow;
  const created =
    status.state === "created" ? `${texts.createdStatus} ${status.count}` : null;

  let alert: ReactNode = null;
  if (status.state === "failed") {
    alert = texts.createError;
  } else if (status.state === "step-up") {
    alert = (
      <>
        <span>{texts.stepUpMessage}</span>
        <Button variant="primary" size="sm" onClick={() => requestProfileWrite(route)}>
          {texts.stepUpLabel}
        </Button>
      </>
    );
  }

  return (
    <form
      noValidate
      className={PANEL_CLASSES}
      onSubmit={(event) => {
        event.preventDefault();
        if (disabled) return;
        if (!flow.submit()) fieldRef.current?.querySelector("input")?.focus();
      }}
    >
      <InventoryField
        ref={fieldRef}
        value={flow.item}
        onChange={flow.choose}
        error={flow.itemMissing ? texts.inventoryRequired : undefined}
        disabled={disabled}
        texts={texts}
      />
      <LocationsFieldset
        locations={flow.locations}
        selected={flow.selectedLocations}
        onToggle={flow.toggleLocation}
        onRetry={flow.reloadLocations}
        disabled={disabled}
        texts={texts}
      />
      {alert !== null ? (
        <div role="alert" className={ALERT_CLASSES}>
          {alert}
        </div>
      ) : null}
      {created !== null ? (
        <div role="status" className={STATUS_CLASSES}>
          <span>{created}</span>
          <Link href={listRoute}>{texts.viewMyOfferings}</Link>
        </div>
      ) : null}
      <div className={ACTIONS_CLASSES}>
        <Button
          type="submit"
          variant="primary"
          disabled={disabled || flow.submitBlocked}
          loading={status.state === "pending"}
        >
          {texts.submitLabel}
        </Button>
        <Link href={listRoute}>{texts.cancelLabel}</Link>
      </div>
    </form>
  );
}

/**
 * The client composition of "New offering" (design.md D5, D6, D10; spec
 * "Creating offerings" and "Access to the management area"). The gate
 * renders the form panel for a signed-in coffeeshop, its unavailable copy
 * while the session resolves, the signed-out branch in its place for an
 * anonymous visitor and the 404 for another role. The form's error area is
 * its single `role="alert"` region: the generic error or the step-up, whose
 * text and action carry no role of their own.
 */
export function NewOfferingForm({ locale, texts }: NewOfferingFormProps): ReactNode {
  const session = useSession();
  const route = `/${locale}/manage/offerings/new`;
  return (
    <ManagementGate
      session={session}
      route={route}
      texts={texts}
      onSignIn={signIn}
      loading={<CreateForm locale={locale} route={route} disabled texts={texts} />}
    >
      {() => <CreateForm locale={locale} route={route} texts={texts} />}
    </ManagementGate>
  );
}
