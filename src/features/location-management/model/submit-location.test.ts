import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { GeocodeOutcome } from "@/shared/lib/geocoding";
import type { LocationFormValues } from "./location-form";

/**
 * The submit sequence (design.md D4, D6): cache lookup, geocoding with a
 * 5000 ms abort, then the create request. The token client and the
 * geocoding entry point are replaced by spies.
 */
const { request, geocodeAddress } = vi.hoisted(() => ({
  request: vi.fn(),
  geocodeAddress: vi.fn(),
}));
vi.mock("@/shared/api", () => ({ request }));
vi.mock("@/shared/lib/geocoding", () => ({ geocodeAddress }));

import { submitLocation } from "./submit-location";

const VALUES: LocationFormValues = {
  name: "Tazavera Gràcia",
  description: "",
  address: "  Carrer de Verdi 12 ",
  postalCode: "08012",
  city: " Barcelona",
  country: "",
  phone: "",
  email: "",
  web: "",
  social: "",
};

function postedBody(): Record<string, unknown> {
  const [, init] = request.mock.calls.at(-1) as [string, RequestInit];
  return JSON.parse(init.body as string);
}

beforeEach(() => {
  request.mockReset();
  geocodeAddress.mockReset();
  request.mockResolvedValue(new Response(null, { status: 201 }));
  geocodeAddress.mockResolvedValue({ status: "found", lat: "41.4029", lon: "2.1565" });
});

afterEach(() => {
  vi.useRealTimers();
});

describe("submitLocation geocoding (design.md D6)", () => {
  it("calls geocodeAddress once with the trimmed fields", async () => {
    await submitLocation(VALUES, new Map());
    expect(geocodeAddress).toHaveBeenCalledTimes(1);
    expect(geocodeAddress.mock.calls[0][0]).toEqual({
      street: "Carrer de Verdi 12",
      postalCode: "08012",
      city: "Barcelona",
      country: "",
    });
  });

  it("aborts the lookup after 5000 ms and then posts without coordinates", async () => {
    vi.useFakeTimers();
    geocodeAddress.mockImplementation(
      (_query, signal: AbortSignal) =>
        new Promise<GeocodeOutcome>((resolve) => {
          signal.addEventListener("abort", () => resolve({ status: "failed" }));
        }),
    );
    const pending = submitLocation(VALUES, new Map());
    await vi.advanceTimersByTimeAsync(4999);
    expect(request).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    await expect(pending).resolves.toEqual({ status: "created", hadCoordinates: false });
    const signal = geocodeAddress.mock.calls[0][1] as AbortSignal;
    expect(signal.aborted).toBe(true);
    const body = postedBody();
    expect("latitud" in body).toBe(false);
    expect("longitud" in body).toBe(false);
  });

  it.each<GeocodeOutcome>([
    { status: "found", lat: "41.4029", lon: "2.1565" },
    { status: "not-found" },
  ])("caches $status by the lower-cased trimmed address", async (outcome) => {
    geocodeAddress.mockResolvedValue(outcome);
    const cache = new Map<string, GeocodeOutcome>();
    await submitLocation(VALUES, cache);
    await submitLocation(
      { ...VALUES, address: "carrer de verdi 12", city: "BARCELONA  " },
      cache,
    );
    expect(geocodeAddress).toHaveBeenCalledTimes(1);
    expect(request).toHaveBeenCalledTimes(2);
  });
});

describe("submitLocation outcome (design.md D4)", () => {
  it("is created with hadCoordinates when the lookup finds the address", async () => {
    await expect(submitLocation(VALUES, new Map())).resolves.toEqual({
      status: "created",
      hadCoordinates: true,
    });
    expect(postedBody().latitud).toBe(41.4029);
  });
});
