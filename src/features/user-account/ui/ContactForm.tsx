"use client";

import { useEffect, useRef, type ReactNode } from "react";
import type { Contact } from "@/shared/api";
import { ActionGroup, Button, FormStatus } from "@/shared/ui";
import { ContactFields, type ContactTexts } from "@/entities/contact";
import type { ContactCheckTexts } from "../model/contact-checks";
import { useContactForm } from "../model/use-contact-form";

// ─── UI-specific types (declared before the component) ───

export type ContactFormTexts = ContactTexts &
  ContactCheckTexts & {
    save: string;
    cancel: string;
    genericError: string;
  };

export type ContactFormProps = {
  ulid: string;
  /** The section heading's id: it names the form. */
  headingId: string;
  texts: ContactFormTexts;
  onCreated: (contact: Contact) => void;
  onExists: () => void;
  onCancel: () => void;
};

/**
 * The contact add form (spec "Contact details form"; design.md D3, D4): the
 * fields, the generic error, Save and Cancel. Address
 * takes focus when the form opens.
 */
export function ContactForm({
  ulid,
  headingId,
  texts,
  onCreated,
  onExists,
  onCancel,
}: ContactFormProps): ReactNode {
  const formRef = useRef<HTMLFormElement>(null);
  const form = useContactForm(ulid, texts, formRef, { onCreated, onExists });

  useEffect(() => {
    const control = formRef.current?.elements.namedItem("address");
    if (control instanceof HTMLElement) control.focus();
  }, []);

  return (
    <form
      ref={formRef}
      noValidate
      aria-labelledby={headingId}
      onSubmit={form.handleSubmit}
      className="flex flex-col gap-6"
    >
      <ContactFields
        values={form.values}
        errors={form.errors}
        onChange={form.update}
        texts={texts}
      />
      {form.outcome === "error" && (
        <FormStatus kind="error" text={texts.genericError} />
      )}
      <ActionGroup>
        <Button type="submit" variant="primary" size="base" loading={form.pending}>
          {texts.save}
        </Button>
        <Button
          variant="action-4"
          size="base"
          disabled={form.pending}
          onClick={onCancel}
        >
          {texts.cancel}
        </Button>
      </ActionGroup>
    </form>
  );
}
