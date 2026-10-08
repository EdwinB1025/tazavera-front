import type { ReactNode, RefObject } from "react";
import type { Contact } from "@/shared/api";
import { Button, FormStatus } from "@/shared/ui";
import { Plus } from "@/shared/ui/icons";
import { ContactDetails, type ContactTexts } from "@/entities/contact";

// ─── UI-specific types (declared before the components) ───

export type ContactReadErrorProps = {
  text: string;
  retryLabel: string;
  onRetry: () => void;
};

export type ContactEmptyProps = {
  text: string;
  addLabel: string;
  onAdd: () => void;
  /** The add button's row: `Button` takes no ref, focus returns here on Cancel. */
  actionsRef: RefObject<HTMLDivElement | null>;
};

export type ContactSavedProps = {
  contact: Contact;
  /** The status shown above the contact after a write (design.md D3). */
  status: "saved" | "exists" | undefined;
  texts: ContactTexts & { contactSaved: string; contactExists: string };
};

/** The contact read error with "Try again" (design.md D3). */
export function ContactReadError({
  text,
  retryLabel,
  onRetry,
}: ContactReadErrorProps): ReactNode {
  return (
    <div className="flex flex-col gap-4">
      <p className="type-body">{text}</p>
      <div className="flex flex-wrap gap-3">
        <Button variant="action-4" size="base" onClick={onRetry}>
          {retryLabel}
        </Button>
      </div>
    </div>
  );
}

/** The empty state with "Add contact details" (design.md D3). */
export function ContactEmpty({
  text,
  addLabel,
  onAdd,
  actionsRef,
}: ContactEmptyProps): ReactNode {
  return (
    <div className="flex flex-col gap-4">
      <p className="type-body">{text}</p>
      <div ref={actionsRef} className="flex flex-wrap gap-3">
        <Button variant="primary" size="base" icon={Plus} onClick={onAdd}>
          {addLabel}
        </Button>
      </div>
    </div>
  );
}

/** The read-only contact, with the saved or exists status above it. */
export function ContactSaved({ contact, status, texts }: ContactSavedProps): ReactNode {
  return (
    <div className="flex flex-col gap-6">
      {status !== undefined && (
        <FormStatus
          kind="success"
          text={status === "saved" ? texts.contactSaved : texts.contactExists}
        />
      )}
      <ContactDetails contact={contact} texts={texts} />
    </div>
  );
}
