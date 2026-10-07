/**
 * The single geocoding entry point (design.md D5): a structured Nominatim
 * search through plain `fetch`, with no credentials and no custom header, so
 * the browser sends a simple CORS request. It never throws.
 */

/** The Nominatim origin; `proxy.ts` adds it to `connect-src` (design.md D10). */
export const NOMINATIM_ORIGIN = "https://nominatim.openstreetmap.org";

// ─── UI-specific types (declared before the function) ───

export type GeocodeQuery = {
  street: string;
  postalCode: string;
  city: string;
  country: string;
};

export type GeocodeOutcome =
  | { status: "found"; lat: string; lon: string }
  | { status: "not-found" }
  | { status: "failed" };

/** design.md D6: the query parameters, empty values omitted. */
function searchUrl(query: GeocodeQuery): string {
  const params = new URLSearchParams();
  const entries: [string, string][] = [
    ["street", query.street],
    ["postalcode", query.postalCode],
    ["city", query.city],
    ["country", query.country],
  ];
  for (const [key, value] of entries) {
    if (value !== "") params.set(key, value);
  }
  params.set("format", "jsonv2");
  params.set("limit", "1");
  return `${NOMINATIM_ORIGIN}/search?${params.toString()}`;
}

/** Looks up one address; any failure (status, transport, abort, body) is `failed`. */
export async function geocodeAddress(
  query: GeocodeQuery,
  signal?: AbortSignal,
): Promise<GeocodeOutcome> {
  try {
    const response = await fetch(searchUrl(query), { signal });
    if (!response.ok) return { status: "failed" };
    const body: unknown = await response.json();
    if (!Array.isArray(body)) return { status: "failed" };
    if (body.length === 0) return { status: "not-found" };
    const first = body[0] as { lat?: unknown; lon?: unknown };
    if (typeof first.lat !== "string" || typeof first.lon !== "string") {
      return { status: "failed" };
    }
    return { status: "found", lat: first.lat, lon: first.lon };
  } catch {
    return { status: "failed" };
  }
}
