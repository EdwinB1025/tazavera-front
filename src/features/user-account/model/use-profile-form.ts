"use client";

import { useRef, useState, type FormEvent, type RefObject } from "react";
import type { ProfileUpdatePayload, SessionUser } from "@/shared/api";
import { useServerFieldErrors } from "@/shared/lib/hooks";
import { isValidEmail } from "@/entities/contact";
import { updateProfile } from "../api/account";

// ─── UI-specific types (declared before the hook) ───

type ProfileValues = Required<ProfileUpdatePayload>;

export type ProfileOutcome = "success" | "error" | "stepUp" | null;

export type ProfileFormInput = {
  user: SessionUser;
  /** The message of the email format check (design.md D2). */
  texts: { emailFormatError: string };
  refreshProfile: () => Promise<void>;
  endProfileWrite?: () => void;
};

export type ProfileFormState = {
  formRef: RefObject<HTMLFormElement | null>;
  values: ProfileValues;
  /** The email format check's message. */
  emailError: string | undefined;
  /** The API's `422` messages (show-field-validation-errors D3). */
  serverErrors: Partial<Record<keyof ProfileValues, string>>;
  pending: boolean;
  outcome: ProfileOutcome;
  update: (field: keyof ProfileValues, value: string) => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
};

const PROFILE_FIELDS: (keyof ProfileValues)[] = ["name", "surname", "email"];

/**
 * The profile form's state and submit (design.md D2, D5, D6 and D10): the
 * values prefilled from the session, the email format check,
 * `PUT /users/{ulid}` and the outcome it shows.
 */
export function useProfileForm({
  user,
  texts,
  refreshProfile,
  endProfileWrite,
}: ProfileFormInput): ProfileFormState {
  const formRef = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState<ProfileValues>({
    name: user.name ?? "",
    surname: user.surname ?? "",
    email: user.email ?? "",
  });
  const [emailError, setEmailError] = useState<string | undefined>();
  const [pending, setPending] = useState(false);
  const [outcome, setOutcome] = useState<ProfileOutcome>(null);
  const server = useServerFieldErrors(PROFILE_FIELDS);

  function update(field: keyof ProfileValues, value: string): void {
    setValues((current) => ({ ...current, [field]: value }));
    server.clear(field);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (pending) return;
    server.reset();
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
    const result = await updateProfile(String(user.ulid), values);
    setPending(false);
    if (result.ok) {
      endProfileWrite?.();
      setOutcome("success");
      void refreshProfile();
      return;
    }
    if (result.kind === "validation") {
      setOutcome(server.show(result.errors) ? "error" : null);
      return;
    }
    setOutcome(result.kind === "forbidden" ? "stepUp" : "error");
  }

  return {
    formRef,
    values,
    emailError,
    serverErrors: server.errors,
    pending,
    outcome,
    update,
    handleSubmit,
  };
}
