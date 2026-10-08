import type { ReactNode } from "react";
import { Field, PasswordInput } from "@/shared/ui";

// ─── UI-specific types (declared before the component) ───

export type NewPasswordFieldsTexts = {
  passwordLabel: string;
  passwordConfirmationLabel: string;
  passwordHelp: string;
  showPassword: string;
  hidePassword: string;
};

export type NewPasswordFieldsProps = {
  texts: NewPasswordFieldsTexts;
  password: string;
  passwordConfirmation: string;
  passwordError?: string;
  passwordConfirmationError?: string;
  onChange: (field: "password" | "passwordConfirmation", value: string) => void;
};

/**
 * The new password with its help and its confirmation (design.md D4), shared
 * by the password and registration forms. It renders a fragment so both
 * fields stay direct children of the form.
 */
export function NewPasswordFields({
  texts,
  password,
  passwordConfirmation,
  passwordError,
  passwordConfirmationError,
  onChange,
}: NewPasswordFieldsProps): ReactNode {
  return (
    <>
      <Field
        label={texts.passwordLabel}
        help={texts.passwordHelp}
        error={passwordError}
        required
      >
        <PasswordInput
          name="password"
          autoComplete="new-password"
          showPasswordLabel={texts.showPassword}
          hidePasswordLabel={texts.hidePassword}
          value={password}
          onChange={(event) => onChange("password", event.target.value)}
        />
      </Field>
      <Field
        label={texts.passwordConfirmationLabel}
        error={passwordConfirmationError}
        required
      >
        <PasswordInput
          name="passwordConfirmation"
          autoComplete="new-password"
          showPasswordLabel={texts.showPassword}
          hidePasswordLabel={texts.hidePassword}
          value={passwordConfirmation}
          onChange={(event) =>
            onChange("passwordConfirmation", event.target.value)
          }
        />
      </Field>
    </>
  );
}
