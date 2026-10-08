import { geocodeAddress, type GeocodeOutcome } from "@/shared/lib/geocoding";
import { createLocation } from "../api/locations";
import {
  geocodeCacheKey,
  toCreateLocationPayload,
  toGeocodeQuery,
  type LocationFormValues,
} from "./location-form";

// ─── UI-specific types (declared before the function) ───

export type SubmitOutcome =
  | { status: "created"; hadCoordinates: boolean }
  | { status: "error" };

/** design.md D6: the lookup is aborted after 5 s. */
export const GEOCODE_TIMEOUT_MS = 5000;

async function lookUp(
  values: LocationFormValues,
  cache: Map<string, GeocodeOutcome>,
): Promise<GeocodeOutcome> {
  const query = toGeocodeQuery(values);
  const key = geocodeCacheKey(query);
  const cached = cache.get(key);
  if (cached) return cached;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), GEOCODE_TIMEOUT_MS);
  const outcome = await geocodeAddress(query, controller.signal);
  clearTimeout(timer);
  // Only `found` and `not-found` are kept: a failed lookup may be retried.
  if (outcome.status !== "failed") cache.set(key, outcome);
  return outcome;
}

/**
 * The submit sequence (design.md D4, D6): the cached or fresh lookup, then
 * the create request with the coordinates when found. It never throws.
 */
export async function submitLocation(
  values: LocationFormValues,
  cache: Map<string, GeocodeOutcome>,
): Promise<SubmitOutcome> {
  const outcome = await lookUp(values, cache);
  const coordinates =
    outcome.status === "found" ? { lat: outcome.lat, lon: outcome.lon } : null;
  try {
    const response = await createLocation(toCreateLocationPayload(values, coordinates));
    if (response.status === 201) return { status: "created", hadCoordinates: coordinates !== null };
    return { status: "error" };
  } catch {
    return { status: "error" };
  }
}
