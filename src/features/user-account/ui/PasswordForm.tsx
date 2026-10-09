"use client";

import { useRef, useState, type FormEvent, type ReactNode } from "react";
import type { PasswordUpdatePayload } from "@/shared/api";
import {
  Button,
  Field,
  PasswordInput,
  FormStatus,
  StepUpNotice,
} from "@/shared/ui";
import { useServerFieldErrors } from "@/shared/lib/hooks";
import { updatePassword } from "../api/account";
import { ExternalLink } from "./ExternalLink";
import { NewPasswordFields } from "./NewPasswordFields";

// ─── UI-specific types (declared before the component) ───

export type PasswordFormTexts = {
  stepUpText: string;
  stepUpButton: string;
  currentPasswordLabel: string;
  newPasswordLabel: string;
  passwordConfirmationLabel: string;
  passwordHelp: string;
  showPassword: string;
  hidePassword: string;
  requiredError: string;
  passwordMismatchError: string;
  forgotPasswordLink: string;
  save: string;
  passwordUpdated: string;
  genericError: string;
};

export type PasswordFormProps = {
  /** `data.ulid` of the session user. */
  ulid: string;
  locale: string;
  /** The id of the section heading that names the form (design.md D9). */
  labelledBy: string;
  texts: PasswordFormTexts;
  /** Starts the write-scope sign in (design.md D6). */
  requestProfileWrite: (returnRoute: string) => void;
};

type PasswordField = keyof PasswordUpdatePayload;

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

type Outcome = "success" | "error" | "stepUp" | null;

/** The checks `updateUserPassword` documents (design.md D2). */
function check(
  values: PasswordUpdatePayload,
  texts: PasswordFormTexts,
): Partial<Record<PasswordField, string>> {
  const errors: Partial<Record<PasswordField, string>> = {};
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
 * The Password section's content (specs "Password change" and "Writes and
 * the step-up"; design.md D2, D6, D9 and D10): the current password with the
 * API's password-reset link, the new password with its help and the
 * confirmation. It sends `PUT /users/{ulid}/password`; a `200` clears the
 * fields and shows the success status, a `403` shows the step-up notice, a
 * `422` its messages under their fields (show-field-validation-errors D3)
 * and the generic error only for a key that names no field, and anything
 * else the generic error; every failure but a `403` clears the fields.
 */
export function PasswordForm({
  ulid,
  locale,
  labelledBy,
  texts,
  requestProfileWrite,
}: PasswordFormProps): ReactNode {
  const formRef = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState<PasswordUpdatePayload>(EMPTY_VALUES);
  const [errors, setErrors] = useState<Partial<Record<PasswordField, string>>>(
    {},
  );
  const [pending, setPending] = useState(false);
  const [outcome, setOutcome] = useState<Outcome>(null);
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
    if (!result.ok && result.kind === "validation") {
      setOutcome(server.show(result.errors) ? "error" : null);
    } else {
      setOutcome(result.ok ? "success" : result.kind === "forbidden" ? "stepUp" : "error");
    }
    if (!result.ok && result.kind === "forbidden") return;
    setValues(EMPTY_VALUES);
  }

  return (
    <form
      ref={formRef}
      noValidate
      aria-labelledby={labelledBy}
      onSubmit={handleSubmit}
      className="flex flex-col gap-6"
    >
      <div className="flex flex-col gap-2">
        <Field
          label={texts.currentPasswordLabel}
          error={errors.currentPassword ?? server.errors.currentPassword}
          required
        >
          <PasswordInput
            name="currentPassword"
            autoComplete="current-password"
            showPasswordLabel={texts.showPassword}
            hidePasswordLabel={texts.hidePassword}
            value={values.currentPassword}
            onChange={(event) => update("currentPassword", event.target.value)}
          />
        </Field>
        <p className="type-body">
          <ExternalLink href={`${process.env.NEXT_PUBLIC_API_URL}/forgot-password`}>
            {texts.forgotPasswordLink}
          </ExternalLink>
        </p>
      </div>
      <NewPasswordFields
        texts={{ ...texts, passwordLabel: texts.newPasswordLabel }}
        password={values.password}
        passwordConfirmation={values.passwordConfirmation}
        passwordError={errors.password ?? server.errors.password}
        passwordConfirmationError={
          errors.passwordConfirmation ?? server.errors.passwordConfirmation
        }
        onChange={update}
      />
      {outcome === "success" && (
        <FormStatus kind="success" text={texts.passwordUpdated} />
      )}
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
      </div>
    </form>
  );
}
