"use client";

import type { ReactNode } from "react";
import { apiWebPageUrl } from "@/shared/api";
import {
  Button,
  Field,
  PasswordInput,
  FormStatus,
  StepUpNotice,
} from "@/shared/ui";
import { usePasswordForm } from "../model/use-password-form";
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
  /** Ends the write permission of a granted step-up (scope-write-token-to-action design.md D4). */
  endProfileWrite?: () => void;
};

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
  endProfileWrite,
}: PasswordFormProps): ReactNode {
  const { formRef, values, errors, serverErrors, pending, outcome, update, handleSubmit } =
    usePasswordForm({ ulid, texts, endProfileWrite });

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
          error={errors.currentPassword ?? serverErrors.currentPassword}
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
          <ExternalLink href={apiWebPageUrl("/forgot-password")}>
            {texts.forgotPasswordLink}
          </ExternalLink>
        </p>
      </div>
      <NewPasswordFields
        texts={{ ...texts, passwordLabel: texts.newPasswordLabel }}
        password={values.password}
        passwordConfirmation={values.passwordConfirmation}
        passwordError={errors.password ?? serverErrors.password}
        passwordConfirmationError={
          errors.passwordConfirmation ?? serverErrors.passwordConfirmation
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
