"use client";

import { useRef, useState, type FormEvent, type RefObject } from "react";
import type { PasswordUpdatePayload } from "@/shared/api";
import { useServerFieldErrors } from "@/shared/lib/hooks";
import { updatePassword } from "../api/account";

// ─── UI-specific types (declared before the hook) ───

/** The messages of the client checks (design.md D2). */
export type PasswordCheckTexts = {
  requiredError: string;
  passwordMismatchError: string;
};

export type PasswordField = keyof PasswordUpdatePayload;

type PasswordErrors = Partial<Record<PasswordField, string>>;

export type PasswordOutcome = "success" | "error" | "stepUp" | null;

export type PasswordFormInput = {
  ulid: string;
  texts: PasswordCheckTexts;
  endProfileWrite?: () => void;
};

export type PasswordFormState = {
  formRef: RefObject<HTMLFormElement | null>;
  values: PasswordUpdatePayload;
  /** The client checks' messages. */
  errors: PasswordErrors;
  /** The API's `422` messages (show-field-validation-errors D3). */
  serverErrors: PasswordErrors;
  pending: boolean;
  outcome: PasswordOutcome;
  update: (field: PasswordField, value: string) => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
};

/** The fields in form order: focus goes to the first failing one (design.md D9). */
const FIELD_ORDER: PasswordField[] = [
  "currentPassword",
  "password",
  "passwordConfirmation",
];

const EMPTY_VALUES: PasswordUpdatePayload = {
  currentPassword: "",
  password: "",
  passwordConfirmation: "",
};

/** The checks `updateUserPassword` documents (design.md D2). */
function check(values: PasswordUpdatePayload, texts: PasswordCheckTexts): PasswordErrors {
  const errors: PasswordErrors = {};
  for (const field of FIELD_ORDER) {
    if (values[field].trim() === "") errors[field] = texts.requiredError;
  }
  if (
    !errors.passwordConfirmation &&
    values.passwordConfirmation !== values.password
  ) {
    errors.passwordConfirmation = texts.passwordMismatchError;
  }
  return errors;
}

/**
 * The password form's state and submit (design.md D2, D6, D9 and D10): the
 * client checks, `PUT /users/{ulid}/password`, and the outcome it shows.
 */
export function usePasswordForm({
  ulid,
  texts,
  endProfileWrite,
}: PasswordFormInput): PasswordFormState {
  const formRef = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState<PasswordUpdatePayload>(EMPTY_VALUES);
  const [errors, setErrors] = useState<PasswordErrors>({});
  const [pending, setPending] = useState(false);
  const [outcome, setOutcome] = useState<PasswordOutcome>(null);
  const server = useServerFieldErrors(FIELD_ORDER);

  function update(field: PasswordField, value: string): void {
    setValues((current) => ({ ...current, [field]: value }));
    server.clear(field);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (pending) return;
    server.reset();
    const found = check(values, texts);
    setErrors(found);
    const firstInvalid = FIELD_ORDER.find((field) => found[field]);
    if (firstInvalid) {
      const control = formRef.current?.elements.namedItem(firstInvalid);
      if (control instanceof HTMLElement) control.focus();
      return;
    }

    setPending(true);
    setOutcome(null);
    const result = await updatePassword(ulid, values);
    setPending(false);
    if (result.ok) endProfileWrite?.();
    if (!result.ok && result.kind === "validation") {
      setOutcome(server.show(result.errors) ? "error" : null);
    } else {
      setOutcome(result.ok ? "success" : result.kind === "forbidden" ? "stepUp" : "error");
    }
    if (!result.ok && result.kind === "forbidden") return;
    setValues(EMPTY_VALUES);
  }

  return {
    formRef,
    values,
    errors,
    serverErrors: server.errors,
    pending,
    outcome,
    update,
    handleSubmit,
  };
}
