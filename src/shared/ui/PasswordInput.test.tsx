import { describe, it, expect, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { PasswordInput } from "@/shared/ui/PasswordInput";

// This project has no global test setup, so RTL's auto-cleanup (which relies
// on a framework-provided afterEach) does not run. Clean up manually between
// tests so queries don't see elements left by previous renders.
afterEach(() => {
  cleanup();
});

/**
 * PasswordInput control tests (design.md D1 contract, D7 modes, D9 toggle
 * treatment; spec "Password input"). Written before the component is
 * implemented (task 10.2); the import of `PasswordInput` fails to resolve
 * until then, so the file runs and fails as required.
 *
 * Assertions are className-/attribute-based: jsdom has no CSS engine, so the
 * toggle treatment is verified by the exact classes in `className` and the
 * contract by the exact attributes. Accessible names use the
 * `getByRole({ name })` and `getByLabelText` queries, which @testing-library
 * computes natively (an input[type="password"] has no ARIA role, so its
 * accessible name is asserted through its label).
 */

// Consumer-supplied toggle copy (design.md D9): PasswordInput writes no text
// of its own, so the tests supply the labels and assert the toggle's
// accessible name equals each one as it flips.
const SHOW_PASSWORD_LABEL = "Reveal the secret";
const HIDE_PASSWORD_LABEL = "Mask the secret";

describe("PasswordInput", () => {
  describe("password mode (spec: Password masked, Reveal and mask, Visibility toggle is named)", () => {
    it("masks the value by default and the toggle named by the supplied labels reveals and masks again", () => {
      render(
        <PasswordInput
          aria-label="Password"
          defaultValue="s3cret"
          showPasswordLabel={SHOW_PASSWORD_LABEL}
          hidePasswordLabel={HIDE_PASSWORD_LABEL}
        />,
      );
      const input = screen.getByLabelText("Password");
      expect(input.getAttribute("type")).toBe("password");

      const toggle = screen.getByRole("button", { name: SHOW_PASSWORD_LABEL });
      expect(toggle.getAttribute("type")).toBe("button");
      expect(toggle.getAttribute("aria-label")).toBe(SHOW_PASSWORD_LABEL);

      fireEvent.click(toggle);
      expect(input.getAttribute("type")).toBe("text");
      const revealedToggle = screen.getByRole("button", {
        name: HIDE_PASSWORD_LABEL,
      });
      expect(revealedToggle.getAttribute("aria-label")).toBe(HIDE_PASSWORD_LABEL);

      fireEvent.click(revealedToggle);
      expect(input.getAttribute("type")).toBe("password");
      expect(
        screen.getByRole("button", { name: SHOW_PASSWORD_LABEL }),
      ).toBeDefined();
    });
  });
});
