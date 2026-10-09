"use client";

import type { ReactNode } from "react";
import type { RegisterPayload, RegistrationToken } from "@/shared/api";
import { ActionGroup, Button, Field, Input, FormStatus, RouteButton } from "@/shared/ui";
import { useRegisterForm } from "../model/use-register-form";
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
  const { formRef, values, errors, serverErrors, pending, failed, created, update, handleSubmit } =
    useRegisterForm({ role, texts, signInWithToken });

  if (created) {
    return <RegisterSuccessPanel texts={texts} signIn={signIn} />;
  }

  return (
    <form
      ref={formRef}
      noValidate
      aria-labelledby={labelledBy}
      onSubmit={handleSubmit}
      className="flex flex-col gap-6"
    >
      <Field label={texts.nameLabel} error={errors.name ?? serverErrors.name} required>
        <Input
          name="name"
          type="text"
          autoComplete="given-name"
          value={values.name}
          onChange={(event) => update("name", event.target.value)}
        />
      </Field>
      <Field label={texts.surnameLabel} error={errors.surname ?? serverErrors.surname} required>
        <Input
          name="surname"
          type="text"
          autoComplete="family-name"
          value={values.surname}
          onChange={(event) => update("surname", event.target.value)}
        />
      </Field>
      <Field label={texts.emailLabel} error={errors.email ?? serverErrors.email} required>
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
        passwordError={errors.password ?? serverErrors.password}
        passwordConfirmationError={
          errors.passwordConfirmation ?? serverErrors.passwordConfirmation
        }
        onChange={update}
      />
      {failed && <FormStatus kind="error" text={texts.genericError} />}
      <ActionGroup>
        <Button type="submit" variant="primary" size="base" loading={pending}>
          {texts.registerSubmit}
        </Button>
        <RouteButton href={cancelHref} variant="action-4" size="base">
          {texts.cancelLabel}
        </RouteButton>
      </ActionGroup>
    </form>
  );
}
