import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

// The token client is replaced by a spy so the sent requests can be observed
// and answered. Test infrastructure only.
const { request, publicRequest } = vi.hoisted(() => ({
  request: vi.fn(),
  publicRequest: vi.fn(),
}));
vi.mock("@/shared/api", () => ({ request, publicRequest }));
// The feature never imports the auth feature; mocked so an accidental import
// could not reach the real popup flow.
vi.mock("@/features/auth", () => ({
  requestProfileWrite: vi.fn(),
  signIn: vi.fn(),
  useSession: vi.fn(),
}));

import { useDeleteFlow } from "./delete-flow";

/**
 * The single and bulk delete flows (design.md D5, D7; spec "Deleting
 * offerings"). Written before `./delete-flow` exists (task 5.1).
 */

function response(status: number): Response {
  return new Response(JSON.stringify({ message: "ignored" }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

beforeEach(() => {
  request.mockReset();
});

function setup() {
  const onDeleted = vi.fn();
  const hook = renderHook(() => useDeleteFlow({ onDeleted }));
  return { ...hook, onDeleted };
}

describe("useDeleteFlow — confirmation first", () => {
  it("opens the single confirmation and sends nothing before the confirm activation", () => {
    const { result } = setup();

    act(() => result.current.start({ kind: "one", ulid: "01A" }));

    expect(result.current.target).toEqual({ kind: "one", ulid: "01A" });
    expect(result.current.pending).toBe(false);
    expect(result.current.error).toBe("none");
    expect(request).not.toHaveBeenCalled();
  });

  it("closes on cancel and sends nothing", () => {
    const { result } = setup();

    act(() => result.current.start({ kind: "many", ulids: ["01A", "01B"] }));
    act(() => result.current.cancel());

    expect(result.current.target).toBeNull();
    expect(request).not.toHaveBeenCalled();
  });
});

describe("useDeleteFlow — requests and outcomes", () => {
  it.each([
    ["a failure status", () => Promise.resolve(response(500))],
  ])("keeps the confirmation open with its error on %s, and the confirm can be tried again", async (_, answer) => {
    const { result, onDeleted } = setup();
    request.mockImplementationOnce(answer);

    act(() => result.current.start({ kind: "one", ulid: "01A" }));
    await act(async () => result.current.confirm());

    expect(result.current.target).toEqual({ kind: "one", ulid: "01A" });
    expect(result.current.error).toBe("failed");
    expect(result.current.pending).toBe(false);
    expect(onDeleted).not.toHaveBeenCalled();

    request.mockResolvedValueOnce(response(200));
    await act(async () => result.current.confirm());
    expect(request).toHaveBeenCalledTimes(2);
    expect(onDeleted).toHaveBeenCalledWith(1);
  });
});
