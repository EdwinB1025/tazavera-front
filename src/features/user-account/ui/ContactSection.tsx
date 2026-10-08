"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Contact } from "@/shared/api";
import { LoadingStatus } from "@/shared/ui";
import { readPrimaryContact } from "../api/contacts";
import { isEmptyContact } from "../model/contact-checks";
import { AccountSection } from "./AccountSection";
import { ContactForm, type ContactFormTexts } from "./ContactForm";
import { ContactEmpty, ContactReadError, ContactSaved } from "./ContactSectionStates";

// ─── UI-specific types (declared before the component) ───

export type ContactSectionTexts = ContactFormTexts & {
  contactHeading: string;
  contactDescription: string;
  contactEmptyText: string;
  contactAddButton: string;
  contactLoadError: string;
  contactSaved: string;
  contactExists: string;
  retry: string;
  loading: string;
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

/** The state a read's response leads to (design.md D3). */
async function readOutcome(ulid: string): Promise<SectionState> {
  const read = await readPrimaryContact(ulid);
  if (!read.ok) return { kind: "readError" };
  if (!read.primary || isEmptyContact(read.primary)) return { kind: "empty" };
  return { kind: "details", contact: read.primary };
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
  // `Button` takes no ref: the empty state's actions row holds the add button.
  const emptyActionsRef = useRef<HTMLDivElement>(null);
  const mounted = useRef(true);
  const [state, setState] = useState<SectionState>({ kind: "reading" });
  // Set by Cancel: "Add contact details" takes focus once the empty state renders.
  const focusAdd = useRef(false);

  const read = useCallback(async (status?: DetailsStatus): Promise<void> => {
    const next = await readOutcome(ulid);
    if (!mounted.current) return;
    // The `409` status shows only above a re-read contact (design.md D3).
    setState(next.kind === "details" ? { ...next, status } : next);
  }, [ulid]);

  useEffect(() => {
    mounted.current = true;
    void read();
    return () => {
      mounted.current = false;
    };
  }, [read]);

  // Runs once the state the focus target belongs to has rendered.
  useEffect(() => {
    if (focusAdd.current) emptyActionsRef.current?.querySelector("button")?.focus();
    focusAdd.current = false;
  }, [state.kind]);

  function readAgain(status?: DetailsStatus): void {
    setState({ kind: "reading" });
    headingRef.current?.focus();
    void read(status);
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
        <ContactReadError
          text={texts.contactLoadError}
          retryLabel={texts.retry}
          onRetry={() => readAgain()}
        />
      )}
      {state.kind === "empty" && (
        <ContactEmpty
          text={texts.contactEmptyText}
          addLabel={texts.contactAddButton}
          onAdd={() => setState({ kind: "form" })}
          actionsRef={emptyActionsRef}
        />
      )}
      {state.kind === "form" && (
        <ContactForm
          ulid={ulid}
          locale={locale}
          headingId={headingId}
          texts={texts}
          requestProfileWrite={requestProfileWrite}
          onCreated={(contact) => {
            setState({ kind: "details", contact, status: "saved" });
            headingRef.current?.focus();
          }}
          onExists={() => readAgain("exists")}
          onCancel={() => {
            focusAdd.current = true;
            setState({ kind: "empty" });
          }}
        />
      )}
      {state.kind === "details" && (
        <ContactSaved contact={state.contact} status={state.status} texts={texts} />
      )}
    </AccountSection>
  );
}
