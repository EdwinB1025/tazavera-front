"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import type { Contact } from "@/shared/api";
import { Button, FormStatus, LoadingStatus, StepUpNotice } from "@/shared/ui";
import { Plus } from "@/shared/ui/icons";
import {
  ContactDetails,
  ContactFields,
  type ContactFieldErrors,
  type ContactFieldKey,
  type ContactFieldValues,
  type ContactTexts,
} from "@/entities/contact";
import { createContact, fetchContact } from "../api/contacts";
import {
  checkContact,
  toContactPayload,
  type ContactCheckTexts,
} from "../model/contact-checks";
import { AccountSection } from "./AccountSection";

// ─── UI-specific types (declared before the component) ───

export type ContactSectionTexts = ContactTexts &
  ContactCheckTexts & {
    stepUpText: string;
    stepUpButton: string;
    contactHeading: string;
    contactDescription: string;
    contactEmptyText: string;
    contactAddButton: string;
    contactLoadError: string;
    contactSaved: string;
    contactExists: string;
    retry: string;
    loading: string;
    save: string;
    cancel: string;
    genericError: string;
  };

export type ContactSectionProps = {
  ulid: string;
  locale: string;
  texts: ContactSectionTexts;
  /** Starts the write-scope sign in (user-account D6). */
  requestProfileWrite: (returnRoute: string) => void;
};

/** The status shown above the contact after a write (design.md D3). */
type DetailsStatus = "saved" | "exists";

type SectionState =
  | { kind: "reading" }
  | { kind: "readError" }
  | { kind: "empty" }
  | { kind: "form" }
  | { kind: "details"; contact: Contact; status?: DetailsStatus };

type FormOutcome = "error" | "stepUp" | null;

/** Where focus goes once the next state has rendered (design.md D3). */
type FocusTarget = "address" | "add" | null;

type ContactListBody = { data?: Contact[] };
type ContactCreatedBody = { data?: Contact };

const EMPTY_VALUES: ContactFieldValues = {
  address: "",
  postalCode: "",
  city: "",
  country: "",
  phone: "",
  email: "",
  web: "",
  social: "",
};

const FIELD_ORDER = Object.keys(EMPTY_VALUES) as ContactFieldKey[];

/** The state a read's response leads to (design.md D3). */
async function readOutcome(ulid: string): Promise<SectionState> {
  try {
    const response = await fetchContact(ulid);
    if (response.status !== 200) return { kind: "readError" };
    const body = (await response.json()) as ContactListBody;
    const primary = body.data?.find((item) => item.isPrimary === true);
    if (!primary || FIELD_ORDER.every((key) => primary[key] == null)) {
      return { kind: "empty" };
    }
    return { kind: "details", contact: primary };
  } catch {
    return { kind: "readError" };
  }
}

/**
 * The Contact details section (specs "Contact details" and "Contact details
 * form"; design.md D3, D4, D6 and D7). It reads the session user's contacts
 * on mount and shows the primary one read-only, the empty state with "Add
 * contact details", or the read error with "Try again". The add form sends
 * `POST /users/{ulid}/contacts`: a `201` shows the created contact, a `409`
 * reads again, a `403` shows the step-up notice, anything else the generic
 * error. Focus moves to the heading whenever the focused control disappears.
 */
export function ContactSection({
  ulid,
  locale,
  texts,
  requestProfileWrite,
}: ContactSectionProps): ReactNode {
  const headingId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  // `Button` takes no ref: the empty state's actions row holds the add button.
  const emptyActionsRef = useRef<HTMLDivElement>(null);
  const mounted = useRef(true);
  const [state, setState] = useState<SectionState>({ kind: "reading" });
  const [values, setValues] = useState<ContactFieldValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<ContactFieldErrors>({});
  const [pending, setPending] = useState(false);
  const [outcome, setOutcome] = useState<FormOutcome>(null);
  const focusTarget = useRef<FocusTarget>(null);

  const read = useCallback(
    async (status?: DetailsStatus): Promise<void> => {
      const next = await readOutcome(ulid);
      if (!mounted.current) return;
      // The `409` status shows only above a re-read contact (design.md D3).
      setState(next.kind === "details" ? { ...next, status } : next);
    },
    [ulid],
  );

  useEffect(() => {
    mounted.current = true;
    void read();
    return () => {
      mounted.current = false;
    };
  }, [read]);

  // Runs once the state the focus target belongs to has rendered.
  useEffect(() => {
    if (focusTarget.current === "address") {
      const control = formRef.current?.elements.namedItem("address");
      if (control instanceof HTMLElement) control.focus();
    } else if (focusTarget.current === "add") {
      emptyActionsRef.current?.querySelector("button")?.focus();
    }
    focusTarget.current = null;
  }, [state.kind]);

  function retry(): void {
    setState({ kind: "reading" });
    headingRef.current?.focus();
    void read();
  }

  function openForm(): void {
    setValues(EMPTY_VALUES);
    setErrors({});
    setOutcome(null);
    focusTarget.current = "address";
    setState({ kind: "form" });
  }

  function cancel(): void {
    focusTarget.current = "add";
    setState({ kind: "empty" });
  }

  function update(key: ContactFieldKey, value: string): void {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (pending) return;
    const failed = checkContact(values, texts);
    setErrors(failed);
    const first = FIELD_ORDER.find((key) => failed[key] !== undefined);
    if (first !== undefined) {
      const control = formRef.current?.elements.namedItem(first);
      if (control instanceof HTMLElement) control.focus();
      return;
    }

    setPending(true);
    setOutcome(null);
    let status: number | null = null;
    let created: Contact | undefined;
    try {
      const response = await createContact(ulid, toContactPayload(values));
      status = response.status;
      if (status === 201) {
        created = ((await response.json()) as ContactCreatedBody).data;
      }
    } catch {
      // A network failure, or a `201` body that cannot be read, shows the
      // generic error (design.md D4).
    }
    if (!mounted.current) return;
    setPending(false);

    if (status === 201 && created !== undefined) {
      setState({ kind: "details", contact: created, status: "saved" });
      headingRef.current?.focus();
      return;
    }
    if (status === 409) {
      setState({ kind: "reading" });
      headingRef.current?.focus();
      void read("exists");
      return;
    }
    setOutcome(status === 403 ? "stepUp" : "error");
  }

  return (
    <AccountSection
      heading={texts.contactHeading}
      headingId={headingId}
      description={texts.contactDescription}
      headingRef={headingRef}
    >
      {state.kind === "reading" && <LoadingStatus text={texts.loading} />}
      {state.kind === "readError" && (
        <div className="flex flex-col gap-4">
          <p className="type-body">{texts.contactLoadError}</p>
          <div className="flex flex-wrap gap-3">
            <Button variant="action-4" size="base" onClick={retry}>
              {texts.retry}
            </Button>
          </div>
        </div>
      )}
      {state.kind === "empty" && (
        <div className="flex flex-col gap-4">
          <p className="type-body">{texts.contactEmptyText}</p>
          <div ref={emptyActionsRef} className="flex flex-wrap gap-3">
            <Button
              variant="primary"
              size="base"
              icon={Plus}
              onClick={openForm}
            >
              {texts.contactAddButton}
            </Button>
          </div>
        </div>
      )}
      {state.kind === "form" && (
        <form
          ref={formRef}
          noValidate
          aria-labelledby={headingId}
          onSubmit={handleSubmit}
          className="flex flex-col gap-6"
        >
          <ContactFields
            values={values}
            errors={errors}
            onChange={update}
            texts={texts}
          />
          {outcome === "error" && (
            <FormStatus kind="error" text={texts.genericError} />
          )}
          {outcome === "stepUp" && (
            <StepUpNotice
              text={texts.stepUpText}
              actionLabel={texts.stepUpButton}
              onConfirm={() => requestProfileWrite(`/${locale}/account`)}
            />
          )}
          <div className="flex flex-wrap gap-3">
            <Button type="submit" variant="primary" size="base" loading={pending}>
              {texts.save}
            </Button>
            <Button
              variant="action-4"
              size="base"
              disabled={pending}
              onClick={cancel}
            >
              {texts.cancel}
            </Button>
          </div>
        </form>
      )}
      {state.kind === "details" && (
        <div className="flex flex-col gap-6">
          {state.status !== undefined && (
            <FormStatus
              kind="success"
              text={
                state.status === "saved" ? texts.contactSaved : texts.contactExists
              }
            />
          )}
          <ContactDetails contact={state.contact} texts={texts} />
        </div>
      )}
    </AccountSection>
  );
}
