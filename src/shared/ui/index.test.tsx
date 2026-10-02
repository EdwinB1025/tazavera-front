import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { Button, Link, Loader2, ArrowLeft, Field } from "@/shared/ui";

// No global test setup in this project, so RTL auto-cleanup does not run.
afterEach(() => {
  cleanup();
});

/**
 * Segment-entry smoke test (design.md "Files" table: `src/shared/ui/index.ts`
 * is the segment entry exporting Button, Link and the icon module).
 *
 * Written before the entry exists (task 5.1); the import from `@/shared/ui`
 * fails to resolve until `src/shared/ui/index.ts` is created in task 5.2, so
 * the file runs and fails as required.
 */
describe("shared/ui segment entry (@/shared/ui)", () => {
  it("renders both action controls exported from the segment", () => {
    render(
      <>
        <Button>Save</Button>
        <Link href="/home">Home</Link>
      </>,
    );
    expect(screen.getByRole("button", { name: "Save" })).toBeDefined();
    expect(screen.getByRole("link", { name: "Home" })).toBeDefined();
  });

  it("re-exports the icon module", () => {
    expect(Loader2).toBeDefined();
    expect(ArrowLeft).toBeDefined();
  });

  it("renders the field control exported from the segment", () => {
    render(
      <Field label="E-mail" error="Enter a valid e-mail">
        <input aria-label="E-mail address" />
      </Field>,
    );
    expect(
      screen.getByRole("textbox", { name: "E-mail address" }),
    ).toBeDefined();
    expect(screen.getByText("Enter a valid e-mail")).toBeDefined();
  });
});
