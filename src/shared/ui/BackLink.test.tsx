import { describe, it, expect, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { resetNavigationHistory } from "@/shared/lib/navigation-history";
import { BackLink } from "@/shared/ui";

/**
 * The back link (fix-production-aut-findings design.md D5; the base-controls
 * spec "Back link to the previous page" — "No previous page"). The other
 * scenarios are covered by `src/shared/lib/navigation-history.test.ts`.
 */

// The header's back control is a link (apply-header-link-rule).

afterEach(() => {
  cleanup();
  resetNavigationHistory();
});

describe("BackLink (design.md D5)", () => {
  it("addresses its fallback when the user has no previous page (spec: No previous page)", () => {
    render(<BackLink fallback="/es/offerings">Volver</BackLink>);
    expect(screen.getByRole("link", { name: "Volver" }).getAttribute("href")).toBe("/es/offerings");
  });
});
