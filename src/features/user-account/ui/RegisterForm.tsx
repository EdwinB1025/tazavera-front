"use client";

import { useRef, useState, type FormEvent, type ReactNode } from "react";
import type { RegisterPayload, RegistrationToken } from "@/shared/api";
import { Button, Field, Input, FormStatus, RouteButton } from "@/shared/ui";
import { useServerFieldErrors } from "@/shared/lib/hooks";
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
  cancelLabel: string;
  genericError: string;
};

export type RegisterFormProps = {
  role: RegisterRole;
  /** The id of the page heading that names the form (design.md D9). */
  labelledBy: string;
  texts: RegisterFormTexts;
  /** Starts sign in from the success panel (design.md D1). */
  signIn: () => void;
  /**
   * Signs in with a `201`'s token block and resolves whether it succeeded
   * (sign-in-after-registration design.md D4); the page navigates on success.
   */
  signInWithToken: (token: RegistrationToken) => Promise<boolean>;
  /** Where Cancel leads; sends nothing (add-form-cancel-actions D3). */
  cancelHref: `/${string}`;
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
 * route's role, and on a `201` signs in with its token block through
 * `signInWithToken` or, without a block or when that fails, gives way to the
 * success panel. A `422` shows its messages under their fields
 * (show-field-validation-errors D3); every outcome but a `201` shows the
 * generic error, a `422` only for a key that names no field, and clears the
 * two password fields.
 */
export function RegisterForm({
  role,
  labelledBy,
  texts,
  signIn,
  signInWithToken,
  cancelHref,
}: RegisterFormProps): ReactNode {
  const formRef = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState<RegisterValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<Partial<Record<RegisterField, string>>>(
    {},
  );
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);
  const [created, setCreated] = useState(false);
  const server = useServerFieldErrors(FIELD_ORDER);

  if (created) {
    return <RegisterSuccessPanel texts={texts} signIn={signIn} />;
  }

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

  return (
    <form
      ref={formRef}
      noValidate
      aria-labelledby={labelledBy}
      onSubmit={handleSubmit}
      className="flex flex-col gap-6"
    >
      <Field label={texts.nameLabel} error={errors.name ?? server.errors.name} required>
        <Input
          name="name"
          type="text"
          autoComplete="given-name"
          value={values.name}
          onChange={(event) => update("name", event.target.value)}
        />
      </Field>
      <Field label={texts.surnameLabel} error={errors.surname ?? server.errors.surname} required>
        <Input
          name="surname"
          type="text"
          autoComplete="family-name"
          value={values.surname}
          onChange={(event) => update("surname", event.target.value)}
        />
      </Field>
      <Field label={texts.emailLabel} error={errors.email ?? server.errors.email} required>
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
        passwordError={errors.password ?? server.errors.password}
        passwordConfirmationError={
          errors.passwordConfirmation ?? server.errors.passwordConfirmation
        }
        onChange={update}
      />
      {failed && <FormStatus kind="error" text={texts.genericError} />}
      <div className="flex flex-col items-center gap-3">
        <Button
          type="submit"
          variant="primary"
          size="base"
          loading={pending}
          className="w-full"
        >
          {texts.registerSubmit}
        </Button>
        <RouteButton href={cancelHref} variant="action-4" size="base">
          {texts.cancelLabel}
        </RouteButton>
      </div>
    </form>
  );
}
