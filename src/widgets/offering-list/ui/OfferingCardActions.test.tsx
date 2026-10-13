import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import type { Session } from "@/shared/api";

// No global test setup in this project, so RTL auto-cleanup does not run.
afterEach(() => {
  cleanup();
});

/**
 * The actions the entry-page list supplies to each offering card (spec
 * "Offering card actions"; fix-offering-card-actions-layout design.md D4).
 * The session and the app router are replaced so a specialist sees every
 * action. Test infrastructure only.
 */

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const SPECIALIST: Session = {
  state: "authenticated",
  user: { ulid: "01JUSER", role: "specialist" } as never,
};
vi.mock("@/features/auth", () => ({
  useSession: () => SPECIALIST,
}));

import { OfferingCardActions } from "./OfferingCardActions";

const TEXTS = {
  viewLabel: "texts.viewLabel",
  viewEvaluationsLabel: "texts.viewEvaluationsLabel",
  evaluateLabel: "texts.evaluateLabel",
};

describe("OfferingCardActions", () => {
  it("renders View, View evaluations and Evaluate at one height (spec: 'Footer actions share one height')", () => {
    render(<OfferingCardActions ulid="01K6A3M8Q2V7XH4T9B5N1RCW0D" locale="es" texts={TEXTS} />);
    const buttons = [TEXTS.viewLabel, TEXTS.viewEvaluationsLabel, TEXTS.evaluateLabel].map(
      (name) => screen.getByRole("button", { name }),
    );
    for (const button of buttons) {
      expect(button.classList.contains("h-8")).toBe(true);
    }
  });
});
