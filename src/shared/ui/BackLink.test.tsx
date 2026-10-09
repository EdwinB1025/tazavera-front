import { describe, it, expect, afterEach, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { resetNavigationHistory } from "@/shared/lib/navigation-history";
import { BackLink } from "@/shared/ui";

/**
 * The back link (fix-production-aut-findings design.md D5; the base-controls
 * spec "Back link to the previous page" — "No previous page"). The other
 * scenarios are covered by `src/shared/lib/navigation-history.test.ts`.
 */

// The back control is a route button (render-navigation-actions-as-buttons);
// the app router is mocked — test infrastructure only.
const router = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));

afterEach(() => {
  cleanup();
  resetNavigationHistory();
});

describe("BackLink (design.md D5)", () => {
  it("addresses its fallback when the user has no previous page (spec: No previous page)", () => {
    render(<BackLink fallback="/es/offerings">Volver</BackLink>);
    fireEvent.click(screen.getByRole("button", { name: "Volver" }));
    expect(router.push).toHaveBeenCalledWith("/es/offerings");
  });
});
