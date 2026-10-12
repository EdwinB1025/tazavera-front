"use client";

import { useRef, type ReactNode } from "react";
import { signIn, useSession } from "@/features/auth";
import {
  InventoryField,
  LocationsFieldset,
  useCreateFlow,
  type InventoryFieldTexts,
  type LocationsFieldsetTexts,
} from "@/features/offering-management";
import {
  ActionGroup,
  Button,
  Card,
  CardContent,
  RouteButton,
  SessionGate,
  SignedOutPrompt,
} from "@/shared/ui";

// ─── UI-specific types (declared before the component) ───

export type NewOfferingFormTexts = InventoryFieldTexts &
  LocationsFieldsetTexts & {
    signedOutMessage: string;
    signInLabel: string;
    inventoryRequired: string;
    submitLabel: string;
    cancelLabel: string;
    createError: string;
    createdStatus: string;
    viewMyOfferings: string;
  };

export type NewOfferingFormProps = {
  locale: string;
  /** The inventory item's `ulid` to choose on arrival (add-coffee-inventory-explorer D8). */
  inventory?: string;
  texts: NewOfferingFormTexts;
};

// ─── Layout (summary §6.3; design.md D15) ───
// The form panel is the shared section card with no header band, whose body
// supplies the padding; it fills the container (widen-location-and-offering-forms D1).
const PANEL_CLASSES = "w-full";
// The form's wrapper: full width, at most 40rem from `md`, start-aligned.
const CONTENT_CLASSES = ["w-full", "md:max-w-160"].join(" ");
// The form's children: a column 1.5rem apart.
const FORM_CLASSES = ["flex", "flex-col", "gap-6"].join(" ");
// The generic error: a column, no box.
const ALERT_CLASSES = ["type-error", "flex", "flex-col", "items-start", "gap-3"].join(" ");
// The success status: the message, no box.
const STATUS_CLASSES = ["type-body", "flex", "flex-col", "items-start", "gap-2"].join(" ");

type CreateFormProps = {
  locale: string;
  /** While the session resolves, every control is unavailable. */
  disabled?: boolean;
  inventory?: string;
  texts: NewOfferingFormTexts;
};

/** The form panel of a signed-in coffeeshop, or its unavailable copy while loading. */
function CreateForm({ locale, disabled = false, inventory, texts }: CreateFormProps): ReactNode {
  const flow = useCreateFlow({ enabled: !disabled, preselected: inventory });
  const fieldRef = useRef<HTMLDivElement>(null);
  const listRoute = `/${locale}/manage/offerings` as const;
  const { status } = flow;
  const created =
    status.state === "created" ? `${texts.createdStatus} ${status.count}` : null;
  // After a create, until an item is chosen again, the list replaces the submit (R80).
  const showList = created !== null && flow.item === null;

  const alert = status.state === "failed" || flow.serverUnmatched ? texts.createError : null;

  return (
    <Card variant="section" className={PANEL_CLASSES}>
      <CardContent>
        <div className={CONTENT_CLASSES}>
          <form
            noValidate
            className={FORM_CLASSES}
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
              error={flow.itemMissing ? texts.inventoryRequired : flow.fieldErrors.coffeeInventoryId}
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
              </div>
            ) : null}
            {/* Submit (or the list after a create), then Cancel: one end-aligned action group (unify-action-button-widths D3). */}
            <ActionGroup align="end">
              {showList ? (
                <RouteButton href={listRoute} variant="action-3" size="base">
                  {texts.viewMyOfferings}
                </RouteButton>
              ) : (
                <Button
                  type="submit"
                  variant="primary"
                  disabled={disabled || flow.submitBlocked}
                  loading={status.state === "pending"}
                >
                  {texts.submitLabel}
                </Button>
              )}
              <RouteButton href={listRoute} variant="action-4" size="base">
                {texts.cancelLabel}
              </RouteButton>
            </ActionGroup>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * The client composition of "New offering" (design.md D5, D6, D10; spec
 * "Creating offerings" and "Access to the management area"). The gate
 * renders the form panel for a signed-in coffeeshop, its unavailable copy
 * while the session resolves, the signed-out branch in its place for an
 * anonymous visitor and the 404 for another role. The form's error area is
 * its single `role="alert"` region, which holds the generic error.
 */
export function NewOfferingForm({ locale, inventory, texts }: NewOfferingFormProps): ReactNode {
  const session = useSession();
  const route = `/${locale}/manage/offerings/new`;
  return (
    <SessionGate
      session={session}
      loading={<CreateForm locale={locale} disabled texts={texts} />}
      signedOut={
        <SignedOutPrompt
          text={texts.signedOutMessage}
          signInLabel={texts.signInLabel}
          onSignIn={() => signIn(route)}
        />
      }
      allows={(user) => user.role === "coffeeshop"}
    >
      {() => <CreateForm locale={locale} inventory={inventory} texts={texts} />}
    </SessionGate>
  );
}
