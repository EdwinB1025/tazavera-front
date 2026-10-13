"use client";

import type { ReactNode } from "react";
import type { SessionUser } from "@/shared/api";
import { Button, Field, Input, FormStatus, StepUpNotice } from "@/shared/ui";
import { useProfileForm } from "../model/use-profile-form";
import { BusinessNameField } from "./BusinessNameField";

// ─── UI-specific types (declared before the component) ───

export type ProfileFormTexts = {
  stepUpText: string;
  stepUpButton: string;
  nameLabel: string;
  surnameLabel: string;
  businessNameLabel: string;
  emailLabel: string;
  emailFormatError: string;
  requiredError: string;
  save: string;
  profileUpdated: string;
  genericError: string;
};

export type ProfileFormProps = {
  user: SessionUser;
  locale: string;
  /** The id of the section heading that names the form (design.md D9). */
  labelledBy: string;
  texts: ProfileFormTexts;
  /** Refreshes the session profile from `GET /user` after a `200` (design.md D5). */
  refreshProfile: () => Promise<void>;
  /** Starts the write-scope sign in (design.md D6). */
  requestProfileWrite: (returnRoute: string) => void;
  /** Ends the write permission of a granted step-up (scope-write-token-to-action design.md D4). */
  endProfileWrite?: () => void;
};

/**
 * The Edit profile section's content (specs "Profile settings" and "Writes
 * and the step-up"; design.md D2, D6, D9 and D10): the form for name,
 * surname and email, and a coffee shop's business name, prefilled from the
 * session. Only the email format and a coffee shop's required business name
 * are checked (add-coffeeshop-business-name D3); the form sends
 * `PUT /users/{ulid}` and,
 * on a `200`, keeps the values, shows the success status and refreshes the
 * session profile. A `403` shows the step-up notice, a `422` its messages
 * under their fields (show-field-validation-errors D3) and the generic error
 * only for a key that names no field, anything else the generic error.
 */
export function ProfileForm({
  user,
  locale,
  labelledBy,
  texts,
  refreshProfile,
  requestProfileWrite,
  endProfileWrite,
}: ProfileFormProps): ReactNode {
  const state = useProfileForm({ user, texts, refreshProfile, endProfileWrite });
  const { formRef, values, emailError, businessNameError, serverErrors } = state;
  const { pending, outcome, update, handleSubmit } = state;

  return (
    <form
      ref={formRef}
      noValidate
      aria-labelledby={labelledBy}
      onSubmit={handleSubmit}
      className="flex flex-col gap-6"
    >
      <Field label={texts.nameLabel} error={serverErrors.name}>
        <Input
          name="name"
          type="text"
          autoComplete="given-name"
          value={values.name}
          onChange={(event) => update("name", event.target.value)}
        />
      </Field>
      <Field label={texts.surnameLabel} error={serverErrors.surname}>
        <Input
          name="surname"
          type="text"
          autoComplete="family-name"
          value={values.surname}
          onChange={(event) => update("surname", event.target.value)}
        />
      </Field>
      {user.role === "coffeeshop" && (
        <BusinessNameField
          label={texts.businessNameLabel}
          value={values.businessName}
          error={businessNameError ?? serverErrors.businessName}
          onChange={(value) => update("businessName", value)}
        />
      )}
      <Field label={texts.emailLabel} error={emailError ?? serverErrors.email}>
        <Input
          name="email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={(event) => update("email", event.target.value)}
        />
      </Field>
      {outcome === "success" && (
        <FormStatus kind="success" text={texts.profileUpdated} />
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
