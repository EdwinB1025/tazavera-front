import type { UserLocation } from "@/shared/api";

/**
 * UI-specific types of the locations panel (design.md "Derived and
 * UI-specific types"); the form's own types live in `location-form.ts`.
 */

/** The list read: pending, failed, or the locations in the order returned. */
export type ListState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; locations: UserLocation[] };

/** The form's write state (design.md D4). */
export type SubmitState = "idle" | "submitting" | "error" | "step-up";
