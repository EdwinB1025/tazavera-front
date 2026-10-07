import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
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

import { EvaluateLink } from "./EvaluateLink";

const ULID = "01JOFFER000000000000000001";

function user(role: "specialist" | "coffeeshop"): Session {
  return { state: "authenticated", user: { ulid: "01JUSER", role } as never };
}

beforeEach(() => useSession.mockReset());
afterEach(cleanup);

describe("EvaluateLink (design.md D6)", () => {
  it("links a signed-in specialist to the new form of the offering", () => {
    useSession.mockReturnValue(user("specialist"));
    render(<EvaluateLink ulid={ULID} locale="es" texts={{ evaluateLabel: "Evaluar" }} />);
    const link = screen.getByRole("link", { name: "Evaluar" });
    expect(link.getAttribute("href")).toBe(`/es/manage/evaluations/new?offering=${ULID}`);
  });

  it.each([
    ["loading", { state: "loading" } as Session],
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
