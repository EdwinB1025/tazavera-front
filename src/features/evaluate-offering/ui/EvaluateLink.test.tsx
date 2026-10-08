import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { Session } from "@/shared/api";

/**
 * The session-aware Evaluate link (design.md D6; spec "Evaluate action on the
 * offering card"; tasks 9.1): a link to the new form of the offering for a
 * signed-in specialist, nothing for anyone else.
 */

const useSession = vi.fn<() => Session>();
vi.mock("@/features/auth", () => ({
  useSession: () => useSession(),
}));

// The Evaluate action is a route button (fix-production-aut-findings
// design.md D4); the app router is mocked — test infrastructure only.
const router = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));

import { EvaluateLink } from "./EvaluateLink";

const ULID = "01JOFFER000000000000000001";

function user(role: "specialist" | "coffeeshop"): Session {
  return { state: "authenticated", user: { ulid: "01JUSER", role } as never };
}

beforeEach(() => useSession.mockReset());
afterEach(cleanup);

describe("EvaluateLink (design.md D6)", () => {
  it("opens the new form of the offering for a signed-in specialist from an action button", () => {
    useSession.mockReturnValue(user("specialist"));
    render(<EvaluateLink ulid={ULID} locale="es" texts={{ evaluateLabel: "Evaluar" }} />);
    expect(screen.queryByRole("link", { name: "Evaluar" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Evaluar" }));
    expect(router.push).toHaveBeenCalledWith(`/es/manage/evaluations/new?offering=${ULID}`);
  });

  it.each([
    ["anonymous", { state: "anonymous" } as Session],
    ["another role", user("coffeeshop")],
  ])("renders nothing while %s", (_case, session) => {
    useSession.mockReturnValue(session);
    const { container } = render(
      <EvaluateLink ulid={ULID} locale="es" texts={{ evaluateLabel: "Evaluar" }} />,
    );
    expect(container.innerHTML).toBe("");
  });
});
