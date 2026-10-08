import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * The contact requests (design.md D4). The token client is replaced by a spy
 * so each request's path, method, headers and body can be inspected.
 */
const { request } = vi.hoisted(() => ({ request: vi.fn() }));
vi.mock("@/shared/api", () => ({ request }));

import { createContact, fetchContact } from "@/features/user-account/api/contacts";

beforeEach(() => {
  request.mockReset();
  request.mockResolvedValue(new Response(null, { status: 200 }));
});

describe("fetchContact", () => {
  it("sends one GET to /users/{ulid}/contacts with Accept JSON and no body", async () => {
    await fetchContact("u1");
    expect(request).toHaveBeenCalledTimes(1);
    const [path, init] = request.mock.calls[0] as [string, RequestInit | undefined];
    expect(path).toBe("/users/u1/contacts");
    expect(init?.method ?? "GET").toBe("GET");
    expect(new Headers(init?.headers).get("Accept")).toBe("application/json");
    expect(init?.body).toBeUndefined();
  });
});

describe("createContact", () => {
  it("sends one POST to /users/{ulid}/contacts with the payload as the JSON body", async () => {
    const payload = {
      address: "Carrer de Verdi 12",
      city: "Barcelona",
      postal_code: null,
      country: null,
      phone: null,
      email: null,
      web: null,
      social: null,
    };
    await createContact("u1", payload);
    expect(request).toHaveBeenCalledTimes(1);
    const [path, init] = request.mock.calls[0] as [string, RequestInit];
    expect(path).toBe("/users/u1/contacts");
    expect(init.method).toBe("POST");
    const headers = new Headers(init.headers);
    expect(headers.get("Accept")).toBe("application/json");
    expect(headers.get("Content-Type")).toBe("application/json");
    expect(JSON.parse(init.body as string)).toEqual(payload);
  });
});
