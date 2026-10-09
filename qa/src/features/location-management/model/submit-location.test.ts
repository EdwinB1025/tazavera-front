import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { GeocodeOutcome } from "@/shared/lib/geocoding";
import type { LocationFormValues } from "@/features/location-management/model/location-form";

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

import { submitLocation } from "@/features/location-management/model/submit-location";

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
  it("does not cache failed", async () => {
    geocodeAddress.mockResolvedValue({ status: "failed" });
    const cache = new Map<string, GeocodeOutcome>();
    await submitLocation(VALUES, cache);
    await submitLocation(VALUES, cache);
    expect(geocodeAddress).toHaveBeenCalledTimes(2);
  });
});

describe("submitLocation outcome (design.md D4)", () => {
  it("is created without coordinates when the lookup finds nothing", async () => {
    geocodeAddress.mockResolvedValue({ status: "not-found" });
    await expect(submitLocation(VALUES, new Map())).resolves.toEqual({
      status: "created",
      hadCoordinates: false,
    });
  });

  it("is invalid with the field messages on 422", async () => {
    request.mockResolvedValue(
      new Response(JSON.stringify({ errors: { "contact.city": ["Required"] } }), {
        status: 422,
      }),
    );
    await expect(submitLocation(VALUES, new Map())).resolves.toEqual({
      status: "invalid",
      errors: { "contact.city": "Required" },
    });
  });

  it("is error on 500", async () => {
    request.mockResolvedValue(new Response(null, { status: 500 }));
    await expect(submitLocation(VALUES, new Map())).resolves.toEqual({ status: "error" });
  });

  it("is error on a rejected fetch", async () => {
    request.mockRejectedValue(new TypeError("network"));
    await expect(submitLocation(VALUES, new Map())).resolves.toEqual({ status: "error" });
  });
});
