import { describe, it, expect, vi, beforeEach } from "vitest";
import type { CreateLocationPayload } from "@/shared/api";

/**
 * The location requests (design.md D4). The token client is replaced by a spy
 * so each request's path, method, headers and body can be inspected.
 */
const { request } = vi.hoisted(() => ({ request: vi.fn() }));
vi.mock("@/shared/api", () => ({ request }));

import { createLocation, fetchOwnLocations } from "@/features/location-management/api/locations";

beforeEach(() => {
  request.mockReset();
  request.mockResolvedValue(new Response(null, { status: 200 }));
});

describe("fetchOwnLocations", () => {
  it("sends one GET to /users/{ulid}/locations through request", async () => {
    await fetchOwnLocations("u1");
    expect(request).toHaveBeenCalledTimes(1);
    const [path, init] = request.mock.calls[0] as [string, RequestInit | undefined];
    expect(path).toBe("/users/u1/locations");
    expect(init?.method ?? "GET").toBe("GET");
    expect(init?.body).toBeUndefined();
  });
});

describe("createLocation", () => {
  it("sends one POST to /locations with the payload as the JSON body", async () => {
    const payload: CreateLocationPayload = {
      name: "Tazavera Gràcia",
      contact: { address: "Carrer de Verdi 12", city: "Barcelona" },
    };
    await createLocation(payload);
    expect(request).toHaveBeenCalledTimes(1);
    const [path, init] = request.mock.calls[0] as [string, RequestInit];
    expect(path).toBe("/locations");
    expect(init.method).toBe("POST");
    expect(new Headers(init.headers).get("Content-Type")).toBe("application/json");
    expect(JSON.parse(init.body as string)).toEqual(payload);
  });
});
