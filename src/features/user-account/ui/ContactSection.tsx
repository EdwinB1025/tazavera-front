"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { Contact } from "@/shared/api";
import { Button } from "@/shared/ui";
import { ContactDetails, type ContactTexts } from "@/entities/contact";
import { fetchContact } from "../api/contacts";
import { AccountSection } from "./AccountSection";
import { LoadingStatus } from "./LoadingStatus";
import type { StepUpNoticeTexts } from "./StepUpNotice";

// ─── UI-specific types (declared before the component) ───

export type ContactSectionTexts = ContactTexts &
  StepUpNoticeTexts & {
    contactHeading: string;
    contactDescription: string;
    contactEmptyText: string;
    contactAddButton: string;
    contactLoadError: string;
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

type SectionState =
  | { kind: "reading" }
  | { kind: "readError" }
  | { kind: "empty" }
  | { kind: "details"; contact: Contact };

type ContactListBody = { data?: Contact[] };

const CONTACT_KEYS = [
  "address",
  "postalCode",
  "city",
  "country",
  "phone",
  "email",
  "web",
  "social",
] as const;

/** The state a read's response leads to (design.md D3). */
async function readOutcome(ulid: string): Promise<SectionState> {
  try {
    const response = await fetchContact(ulid);
    if (response.status !== 200) return { kind: "readError" };
    const body = (await response.json()) as ContactListBody;
    const primary = body.data?.find((item) => item.isPrimary === true);
    if (!primary || CONTACT_KEYS.every((key) => primary[key] == null)) {
      return { kind: "empty" };
    }
    return { kind: "details", contact: primary };
  } catch {
    return { kind: "readError" };
  }
}

/**
 * The Contact details section (spec "Contact details"; design.md D3, D6 and
 * D7). It reads the session user's contacts on mount and shows the primary
 * one read-only, the empty state, or the read error with "Try again". "Try
 * again" moves focus to the heading, because the control that had it
 * disappears.
 */
export function ContactSection({ ulid, texts }: ContactSectionProps): ReactNode {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const mounted = useRef(true);
  const [state, setState] = useState<SectionState>({ kind: "reading" });

  const read = useCallback(async (): Promise<void> => {
    const next = await readOutcome(ulid);
    if (mounted.current) setState(next);
  }, [ulid]);

  useEffect(() => {
    mounted.current = true;
    void read();
    return () => {
      mounted.current = false;
    };
  }, [read]);

  function retry(): void {
    setState({ kind: "reading" });
    headingRef.current?.focus();
    void read();
  }

  return (
    <AccountSection
      heading={texts.contactHeading}
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
          <div className="flex flex-wrap gap-3">
            <Button variant="primary" size="base">
              {texts.contactAddButton}
            </Button>
          </div>
        </div>
      )}
      {state.kind === "details" && (
        <ContactDetails contact={state.contact} texts={texts} />
      )}
    </AccountSection>
  );
}
