"use client";

import { useEffect, useRef, useState, type FormEvent, type RefObject } from "react";
import type { Contact } from "@/shared/api";
import type {
  ContactFieldErrors,
  ContactFieldKey,
  ContactFieldValues,
} from "@/entities/contact";
import { submitContact } from "../api/contacts";
import {
  CONTACT_FIELD_ORDER,
  EMPTY_CONTACT_VALUES,
  checkContact,
  toContactPayload,
  type ContactCheckTexts,
} from "./contact-checks";

// ─── UI-specific types (declared before the hook) ───

/** What the section does after a `201` or a `409` (design.md D3). */
export type ContactFormHandlers = {
  onCreated: (contact: Contact) => void;
  onExists: () => void;
};

export type ContactFormOutcome = "error" | "stepUp" | null;

export type ContactFormState = {
  values: ContactFieldValues;
  errors: ContactFieldErrors;
  pending: boolean;
  outcome: ContactFormOutcome;
  update: (key: ContactFieldKey, value: string) => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
};

/**
 * The add form's state and submit (spec "Contact details form"; design.md
 * D3, D4): the client checks with focus on the first failing field, then
 * `POST /users/{ulid}/contacts`; a `201` and a `409` go to the section's
 * handlers, a `403` shows the step-up notice, anything else the generic error.
 */
export function useContactForm(
  ulid: string,
  texts: ContactCheckTexts,
  formRef: RefObject<HTMLFormElement | null>,
  { onCreated, onExists }: ContactFormHandlers,
): ContactFormState {
  const mounted = useRef(true);
  const [values, setValues] = useState<ContactFieldValues>(EMPTY_CONTACT_VALUES);
  const [errors, setErrors] = useState<ContactFieldErrors>({});
  const [pending, setPending] = useState(false);
  const [outcome, setOutcome] = useState<ContactFormOutcome>(null);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  function update(key: ContactFieldKey, value: string): void {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (pending) return;
    const failed = checkContact(values, texts);
    setErrors(failed);
    const first = CONTACT_FIELD_ORDER.find((key) => failed[key] !== undefined);
    if (first !== undefined) {
      const control = formRef.current?.elements.namedItem(first);
      if (control instanceof HTMLElement) control.focus();
      return;
    }

    setPending(true);
    setOutcome(null);
    const result = await submitContact(ulid, toContactPayload(values));
    if (!mounted.current) return;
    setPending(false);
    if (result.ok) onCreated(result.data);
    else if (result.kind === "conflict") onExists();
    else setOutcome(result.kind === "forbidden" ? "stepUp" : "error");
  }

  return { values, errors, pending, outcome, update, handleSubmit };
}
