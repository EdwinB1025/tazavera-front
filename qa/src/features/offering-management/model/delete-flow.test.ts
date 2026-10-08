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

import { previousPageAfterDelete, useDeleteFlow } from "@/features/offering-management/model/delete-flow";

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

function deferred() {
  let resolve: (value: Response) => void = () => {};
  let reject: (reason: unknown) => void = () => {};
  const promise = new Promise<Response>((done, fail) => {
    resolve = done;
    reject = fail;
  });
  return { promise, resolve, reject };
}

beforeEach(() => {
  request.mockReset();
});

function setup() {
  const onDeleted = vi.fn();
  const hook = renderHook(() => useDeleteFlow({ onDeleted }));
  return { ...hook, onDeleted };
}

describe("useDeleteFlow — requests and outcomes", () => {
  it("sends DELETE /offerings/{ulid} through request and is pending until it answers", async () => {
    const { result, onDeleted } = setup();
    const answer = deferred();
    request.mockReturnValue(answer.promise);

    act(() => result.current.start({ kind: "one", ulid: "01A" }));
    act(() => result.current.confirm());

    expect(request).toHaveBeenCalledTimes(1);
    expect(request.mock.calls[0][0]).toBe("/offerings/01A");
    expect(request.mock.calls[0][1]).toMatchObject({ method: "DELETE" });
    expect(result.current.pending).toBe(true);

    await act(async () => answer.resolve(response(200)));

    expect(result.current.pending).toBe(false);
    expect(result.current.target).toBeNull();
    expect(onDeleted).toHaveBeenCalledWith(1);
  });

  it("sends DELETE /offerings with the selection in the body and reports its count", async () => {
    const { result, onDeleted } = setup();
    request.mockResolvedValue(response(200));

    act(() => result.current.start({ kind: "many", ulids: ["01A", "01B", "01C"] }));
    await act(async () => result.current.confirm());

    expect(request.mock.calls[0][0]).toBe("/offerings");
    const init = request.mock.calls[0][1] as RequestInit;
    expect(init.method).toBe("DELETE");
    expect(JSON.parse(init.body as string)).toEqual({
      offerings: ["01A", "01B", "01C"],
    });
    expect(new Headers(init.headers).get("Content-Type")).toBe("application/json");
    expect(result.current.target).toBeNull();
    expect(onDeleted).toHaveBeenCalledWith(3);
  });

  it.each([
    ["a 422", () => Promise.resolve(response(422))],
    ["a transport failure", () => Promise.reject(new TypeError("Failed to fetch"))],
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

  it("asks for the step-up on a 403 and keeps the confirmation and its target", async () => {
    const { result, onDeleted } = setup();
    request.mockResolvedValue(response(403));

    act(() => result.current.start({ kind: "many", ulids: ["01A"] }));
    await act(async () => result.current.confirm());

    expect(result.current.error).toBe("step-up");
    expect(result.current.target).toEqual({ kind: "many", ulids: ["01A"] });
    expect(onDeleted).not.toHaveBeenCalled();
  });

  it("clears the previous error when a new confirmation opens", async () => {
    const { result } = setup();
    request.mockResolvedValue(response(500));

    act(() => result.current.start({ kind: "one", ulid: "01A" }));
    await act(async () => result.current.confirm());
    act(() => result.current.cancel());
    act(() => result.current.start({ kind: "one", ulid: "01B" }));

    expect(result.current.error).toBe("none");
  });
});

describe("previousPageAfterDelete (spec 'Last page emptied')", () => {
  it("steps back one page when the reloaded page beyond the first is empty", () => {
    expect(previousPageAfterDelete("empty", 3)).toBe(2);
  });

  it("stays on the first page, and on any page that is not empty", () => {
    expect(previousPageAfterDelete("empty", 1)).toBeNull();
    expect(previousPageAfterDelete("success", 3)).toBeNull();
    expect(previousPageAfterDelete("loading", 3)).toBeNull();
    expect(previousPageAfterDelete("error", 3)).toBeNull();
  });
});
