import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";
import type { Session } from "@/shared/api";

/**
 * The session-aware Evaluate link (design.md D6; spec "Evaluate action on the
 * offering card"; tasks 9.1): a link to the new form of the offering for a
 * signed-in specialist, nothing for anyone else.
 */

const useSession = vi.fn<() => Session>();

import { EvaluateLink, type EvaluateLinkProps } from "@/features/evaluate-offering/ui/EvaluateLink";

// The link's caller: supplies the mocked session as a prop.
function SessionEvaluateLink(props: Omit<EvaluateLinkProps, "session">) {
  return <EvaluateLink session={useSession()} {...props} />;
}

const ULID = "01JOFFER000000000000000001";

beforeEach(() => useSession.mockReset());
afterEach(cleanup);

describe("EvaluateLink (design.md D6)", () => {
  it.each([
    ["loading", { state: "loading" } as Session],
  ])("renders nothing while %s", (_case, session) => {
    useSession.mockReturnValue(session);
    const { container } = render(
      <SessionEvaluateLink ulid={ULID} locale="es" texts={{ evaluateLabel: "Evaluar" }} />,
    );
    expect(container.innerHTML).toBe("");
  });
});
