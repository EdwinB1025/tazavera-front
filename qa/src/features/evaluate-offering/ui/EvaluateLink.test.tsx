import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";
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

import { EvaluateLink } from "@/features/evaluate-offering/ui/EvaluateLink";

const ULID = "01JOFFER000000000000000001";

beforeEach(() => useSession.mockReset());
afterEach(cleanup);

describe("EvaluateLink (design.md D6)", () => {
  it.each([
    ["loading", { state: "loading" } as Session],
  ])("renders nothing while %s", (_case, session) => {
    useSession.mockReturnValue(session);
    const { container } = render(
      <EvaluateLink ulid={ULID} locale="es" texts={{ evaluateLabel: "Evaluar" }} />,
    );
    expect(container.innerHTML).toBe("");
  });
});
