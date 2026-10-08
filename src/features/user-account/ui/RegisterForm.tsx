"use client";

import { useRef, useState, type FormEvent, type ReactNode } from "react";
import type { RegisterPayload } from "@/shared/api";
import { Button, Field, Input, FormStatus } from "@/shared/ui";
import { isValidEmail } from "@/entities/contact";
import { registerUser } from "../api/register";
import { NewPasswordFields } from "./NewPasswordFields";
import {
  RegisterSuccessPanel,
  type RegisterSuccessPanelTexts,
} from "./RegisterSuccessPanel";

// ─── UI-specific types (declared before the component) ───

/** The roles a registration route sends (spec "Registration routes"). */
export type RegisterRole = Extract<
  NonNullable<RegisterPayload["role"]>,
  "specialist" | "coffeeshop"
>;

export type RegisterFormTexts = RegisterSuccessPanelTexts & {
  nameLabel: string;
  surnameLabel: string;
  emailLabel: string;
  passwordLabel: string;
  passwordConfirmationLabel: string;
  passwordHelp: string;
  showPassword: string;
  hidePassword: string;
  requiredError: string;
  emailFormatError: string;
  passwordMismatchError: string;
  registerSubmit: string;
  genericError: string;
};

export type RegisterFormProps = {
  role: RegisterRole;
  /** The id of the page heading that names the form (design.md D9). */
  labelledBy: string;
  texts: RegisterFormTexts;
  /** Starts sign in from the success panel (design.md D1). */
  signIn: () => void;
};

type RegisterField =
  | "name"
  | "surname"
  | "email"
  | "password"
  | "passwordConfirmation";

type RegisterValues = Record<RegisterField, string>;

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
function check(
  values: RegisterValues,
  texts: RegisterFormTexts,
): Partial<Record<RegisterField, string>> {
  const errors: Partial<Record<RegisterField, string>> = {};
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
 * The registration form (specs "Registration form" and "Registration
 * result"; design.md D2, D9 and D10). It checks only what `registerAUser`
 * documents, sends `POST /register` through the public client with the
 * route's role, and on a `201` gives way to the success panel. Every other
 * outcome shows the generic error and clears the two password fields.
 */
export function RegisterForm({
  role,
  labelledBy,
  texts,
  signIn,
}: RegisterFormProps): ReactNode {
  const formRef = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState<RegisterValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<Partial<Record<RegisterField, string>>>(
    {},
  );
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);
  const [created, setCreated] = useState(false);

  if (created) {
    return <RegisterSuccessPanel texts={texts} signIn={signIn} />;
  }

  function update(field: RegisterField, value: string): void {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (pending) return;
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
    setPending(false);
    if (result === "created") {
      setCreated(true);
      return;
    }
    setFailed(true);
    setValues((current) => ({
      ...current,
      password: "",
      passwordConfirmation: "",
    }));
  }

  return (
    <form
      ref={formRef}
      noValidate
      aria-labelledby={labelledBy}
      onSubmit={handleSubmit}
      className="flex flex-col gap-6"
    >
      <Field label={texts.nameLabel} error={errors.name} required>
        <Input
          name="name"
          type="text"
          autoComplete="given-name"
          value={values.name}
          onChange={(event) => update("name", event.target.value)}
        />
      </Field>
      <Field label={texts.surnameLabel} error={errors.surname} required>
        <Input
          name="surname"
          type="text"
          autoComplete="family-name"
          value={values.surname}
          onChange={(event) => update("surname", event.target.value)}
        />
      </Field>
      <Field label={texts.emailLabel} error={errors.email} required>
        <Input
          name="email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={(event) => update("email", event.target.value)}
        />
      </Field>
      <NewPasswordFields
        texts={texts}
        password={values.password}
        passwordConfirmation={values.passwordConfirmation}
        passwordError={errors.password}
        passwordConfirmationError={errors.passwordConfirmation}
        onChange={update}
      />
      {failed && <FormStatus kind="error" text={texts.genericError} />}
      <div className="flex flex-wrap gap-3">
        <Button
          type="submit"
          variant="primary"
          size="base"
          loading={pending}
          className="w-full"
        >
          {texts.registerSubmit}
        </Button>
      </div>
    </form>
  );
}
