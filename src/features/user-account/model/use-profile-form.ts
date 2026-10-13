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
  /** The messages of the client checks (design.md D2; add-coffeeshop-business-name D3). */
  texts: { emailFormatError: string; requiredError: string };
  refreshProfile: () => Promise<void>;
  endProfileWrite?: () => void;
};

export type ProfileFormState = {
  formRef: RefObject<HTMLFormElement | null>;
  values: ProfileValues;
  /** The email format check's message. */
  emailError: string | undefined;
  /** A coffee shop's required business name check's message. */
  businessNameError: string | undefined;
  /** The API's `422` messages (show-field-validation-errors D3). */
  serverErrors: Partial<Record<keyof ProfileValues, string>>;
  pending: boolean;
  outcome: ProfileOutcome;
  update: (field: keyof ProfileValues, value: string) => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
};

const PROFILE_FIELDS: (keyof ProfileValues)[] = ["name", "surname", "email"];

/** A coffee shop's fields: the business name too (add-coffeeshop-business-name D3). */
const COFFEESHOP_FIELDS: (keyof ProfileValues)[] = [...PROFILE_FIELDS, "businessName"];

/** The request body: `businessName` only for a coffee shop (add-coffeeshop-business-name D3). */
function payloadOf(values: ProfileValues, coffeeshop: boolean): ProfileUpdatePayload {
  const { businessName, ...rest } = values;
  return coffeeshop ? { ...rest, businessName } : rest;
}

/** Moves focus to the named control of the form. */
function focusField(form: HTMLFormElement | null, name: string): void {
  const control = form?.elements.namedItem(name);
  if (control instanceof HTMLElement) control.focus();
}

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
  const coffeeshop = user.role === "coffeeshop";
  const [values, setValues] = useState<ProfileValues>({
    name: user.name ?? "",
    surname: user.surname ?? "",
    businessName: user.businessName ?? "",
    email: user.email ?? "",
  });
  const [emailError, setEmailError] = useState<string | undefined>();
  const [businessNameError, setBusinessNameError] = useState<string | undefined>();
  const [pending, setPending] = useState(false);
  const [outcome, setOutcome] = useState<ProfileOutcome>(null);
  const server = useServerFieldErrors(coffeeshop ? COFFEESHOP_FIELDS : PROFILE_FIELDS);

  function update(field: keyof ProfileValues, value: string): void {
    setValues((current) => ({ ...current, [field]: value }));
    server.clear(field);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (pending) return;
    server.reset();
    // A coffee shop's business name is required; it comes before the email
    // in the form (add-coffeeshop-business-name D3).
    const businessNameEmpty = coffeeshop && values.businessName.trim() === "";
    // An empty email is not a format failure: it is sent like any emptied
    // field (design.md D2).
    const emailInvalid = values.email !== "" && !isValidEmail(values.email);
    setBusinessNameError(businessNameEmpty ? texts.requiredError : undefined);
    setEmailError(emailInvalid ? texts.emailFormatError : undefined);
    if (businessNameEmpty || emailInvalid) {
      focusField(formRef.current, businessNameEmpty ? "businessName" : "email");
      return;
    }

    setPending(true);
    setOutcome(null);
    const result = await updateProfile(String(user.ulid), payloadOf(values, coffeeshop));
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
    businessNameError,
    serverErrors: server.errors,
    pending,
    outcome,
    update,
    handleSubmit,
  };
}
