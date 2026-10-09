"use client";

import { useRef, useState, type FormEvent, type RefObject } from "react";
import type { RegisterPayload, RegistrationToken } from "@/shared/api";
import { useServerFieldErrors } from "@/shared/lib/hooks";
import { isValidEmail } from "@/entities/contact";
import { registerUser } from "../api/register";

// ─── UI-specific types (declared before the hook) ───

/** The messages of the client checks (design.md D2). */
export type RegisterCheckTexts = {
  requiredError: string;
  emailFormatError: string;
  passwordMismatchError: string;
};

export type RegisterField =
  | "name"
  | "surname"
  | "email"
  | "password"
  | "passwordConfirmation";

type RegisterValues = Record<RegisterField, string>;

type RegisterErrors = Partial<Record<RegisterField, string>>;

export type RegisterFormInput = {
  role: RegisterPayload["role"];
  texts: RegisterCheckTexts;
  signInWithToken: (token: RegistrationToken) => Promise<boolean>;
};

export type RegisterFormState = {
  formRef: RefObject<HTMLFormElement | null>;
  values: RegisterValues;
  /** The client checks' messages. */
  errors: RegisterErrors;
  /** The API's `422` messages (show-field-validation-errors D3). */
  serverErrors: RegisterErrors;
  pending: boolean;
  failed: boolean;
  created: boolean;
  update: (field: RegisterField, value: string) => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
};

/** The fields in form order: focus goes to the first failing one (design.md D9). */
const FIELD_ORDER: RegisterField[] = [
  "name",
  "surname",
  "email",
  "password",
  "passwordConfirmation",
];

const EMPTY_VALUES: RegisterValues = {
  name: "",
  surname: "",
  email: "",
  password: "",
  passwordConfirmation: "",
};

/** The checks `registerAUser` documents (design.md D2). */
function check(values: RegisterValues, texts: RegisterCheckTexts): RegisterErrors {
  const errors: RegisterErrors = {};
  for (const field of FIELD_ORDER) {
    if (values[field].trim() === "") errors[field] = texts.requiredError;
  }
  if (!errors.email && !isValidEmail(values.email)) {
    errors.email = texts.emailFormatError;
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
 * The registration form's state and submit (design.md D2, D9 and D10): the
 * client checks, `POST /register` with the route's role, and on a `201` the
 * sign in with its token block or the success panel.
 */
export function useRegisterForm({
  role,
  texts,
  signInWithToken,
}: RegisterFormInput): RegisterFormState {
  const formRef = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState<RegisterValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);
  const [created, setCreated] = useState(false);
  const server = useServerFieldErrors(FIELD_ORDER);

  function update(field: RegisterField, value: string): void {
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
    setFailed(false);
    const payload: RegisterPayload = { ...values, role };
    const result = await registerUser(payload);
    if (result.ok) {
      // Signed in: the submit stays loading while the page navigates.
      if (result.data !== null && (await signInWithToken(result.data))) return;
      setPending(false);
      setCreated(true);
      return;
    }
    setPending(false);
    setFailed(result.kind === "validation" ? server.show(result.errors) : true);
    setValues((current) => ({
      ...current,
      password: "",
      passwordConfirmation: "",
    }));
  }

  return {
    formRef,
    values,
    errors,
    serverErrors: server.errors,
    pending,
    failed,
    created,
    update,
    handleSubmit,
  };
}
