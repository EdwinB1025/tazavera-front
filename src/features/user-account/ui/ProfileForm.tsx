"use client";

import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { request } from "@/shared/api";
import type { ProfileUpdatePayload, SessionUser } from "@/shared/api";
import { Button, Field, Input } from "@/shared/ui";
import { isValidEmail } from "../model/email";
import { FormStatus } from "./FormStatus";
import { RoleRow } from "./RoleRow";
import { StepUpNotice, type StepUpNoticeTexts } from "./StepUpNotice";

// ─── UI-specific types (declared before the component) ───

export type ProfileFormTexts = StepUpNoticeTexts & {
  roleLabel: string;
  nameLabel: string;
  surnameLabel: string;
  emailLabel: string;
  emailFormatError: string;
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
};

type ProfileValues = Required<ProfileUpdatePayload>;

type Outcome = "success" | "error" | "stepUp" | null;

/**
 * The Profile section's content (specs "Profile settings" and "Writes and
 * the step-up"; design.md D2, D6, D9 and D10): the role row and the form for
 * name, surname and email, prefilled from the session. Only the email format
 * is checked (no field is required); the form sends `PUT /users/{ulid}` and,
 * on a `200`, keeps the values, shows the success status and refreshes the
 * session profile. A `403` shows the step-up notice, anything else the
 * generic error.
 */
export function ProfileForm({
  user,
  locale,
  labelledBy,
  texts,
  refreshProfile,
  requestProfileWrite,
}: ProfileFormProps): ReactNode {
  const formRef = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState<ProfileValues>({
    name: user.name ?? "",
    surname: user.surname ?? "",
    email: user.email ?? "",
  });
  const [emailError, setEmailError] = useState<string | undefined>();
  const [pending, setPending] = useState(false);
  const [outcome, setOutcome] = useState<Outcome>(null);

  function update(field: keyof ProfileValues, value: string): void {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (pending) return;
    // An empty email is not a format failure: it is sent like any emptied
    // field (design.md D2).
    if (values.email !== "" && !isValidEmail(values.email)) {
      setEmailError(texts.emailFormatError);
      const control = formRef.current?.elements.namedItem("email");
      if (control instanceof HTMLElement) control.focus();
      return;
    }
    setEmailError(undefined);

    setPending(true);
    setOutcome(null);
    const payload: ProfileUpdatePayload = values;
    let status: number | null = null;
    try {
      const response = await request(`/users/${user.ulid}`, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      status = response.status;
    } catch {
      // A network failure shows the generic error (spec "Profile settings").
    }
    setPending(false);
    if (status === 200) {
      setOutcome("success");
      void refreshProfile();
      return;
    }
    setOutcome(status === 403 ? "stepUp" : "error");
  }

  return (
    <div className="flex flex-col gap-6">
      <RoleRow label={texts.roleLabel} role={user.role ?? ""} />
      <form
        ref={formRef}
        noValidate
        aria-labelledby={labelledBy}
        onSubmit={handleSubmit}
        className="flex flex-col gap-6"
      >
        <Field label={texts.nameLabel}>
          <Input
            name="name"
            type="text"
            autoComplete="given-name"
            value={values.name}
            onChange={(event) => update("name", event.target.value)}
          />
        </Field>
        <Field label={texts.surnameLabel}>
          <Input
            name="surname"
            type="text"
            autoComplete="family-name"
            value={values.surname}
            onChange={(event) => update("surname", event.target.value)}
          />
        </Field>
        <Field label={texts.emailLabel} error={emailError}>
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
            locale={locale}
            texts={texts}
            requestProfileWrite={requestProfileWrite}
          />
        )}
        <div className="flex flex-wrap gap-3">
          <Button type="submit" variant="primary" size="base" loading={pending}>
            {texts.save}
          </Button>
        </div>
      </form>
    </div>
  );
}
