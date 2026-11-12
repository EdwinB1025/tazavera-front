"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { FieldErrors } from "@/shared/lib/field-errors";
import type { GeocodeOutcome } from "@/shared/lib/geocoding";
import type { LocationFormValues } from "../model/location-form";
import { submitLocation } from "../model/submit-location";
import type { SubmitState } from "../model/types";
import { LocationForm, type LocationFormTexts } from "./LocationForm";

// ─── UI-specific types (declared before the component) ───

export type NewLocationFormProps = {
  texts: LocationFormTexts;
  /** The caller's per-page lookup cache (offering-management "Address geocoding"). */
  geocodeCache: Map<string, GeocodeOutcome>;
  onCancel: () => void;
  /** Called once on a `201`; `hadCoordinates` as `SubmitOutcome` gives it. */
  onCreated: (hadCoordinates: boolean) => void;
};

/**
 * The new-location form with its submit handling (require-first-location-on-
 * registration D2): the submit state, the geocoded create request, the `422`
 * hand-back and the `201` outcome, shared by Manage locations and the first
 * location step. On a `201` the form stays busy while the caller closes it
 * or navigates.
 */
export function NewLocationForm({
  texts,
  geocodeCache,
  onCancel,
  onCreated,
}: NewLocationFormProps): ReactNode {
  const mounted = useRef(true);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  /** Sends the form; resolves the messages of a `422` (show-field-validation-errors D6). */
  async function handleSubmit(values: LocationFormValues): Promise<FieldErrors | null> {
    setSubmitState("submitting");
    const outcome = await submitLocation(values, geocodeCache);
    if (!mounted.current) return null;
    if (outcome.status === "invalid") {
      setSubmitState("idle");
      return outcome.errors;
    }
    if (outcome.status === "error") {
      setSubmitState("error");
      return null;
    }
    onCreated(outcome.hadCoordinates);
    return null;
  }

  return (
    <LocationForm
      texts={texts}
      submitState={submitState}
      onSubmit={handleSubmit}
      onCancel={onCancel}
    />
  );
}
