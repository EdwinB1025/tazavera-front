import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { PasswordInput } from "@/shared/ui/PasswordInput";
import { Field } from "@/shared/ui/Field";
import { Eye, EyeOff } from "@/shared/ui/icons";

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
    it("swaps the Eye / EyeOff icon at size-4 text-text-secondary and keeps the shared focus indicator on the toggle", () => {
      // Reference renders pin down which glyph is which without relying on
      // the icon library's own markup details.
      const { container: eyeRef } = render(<Eye />);
      const { container: eyeOffRef } = render(<EyeOff />);
      const eyeMarkup = eyeRef.querySelector("svg")!.innerHTML;
      const eyeOffMarkup = eyeOffRef.querySelector("svg")!.innerHTML;

      const { container } = render(
        <PasswordInput
          aria-label="Password"
          showPasswordLabel={SHOW_PASSWORD_LABEL}
          hidePasswordLabel={HIDE_PASSWORD_LABEL}
        />,
      );
      const toggle = screen.getByRole("button", { name: SHOW_PASSWORD_LABEL });
      expect(toggle.className).toContain("focus-visible:focus-ring");

      const icon = container.querySelector("svg")!;
      expect(icon.innerHTML).toBe(eyeMarkup);
      expect(icon.getAttribute("class")).toContain("size-4");
      expect(icon.getAttribute("class")).toContain("text-text-secondary");

      fireEvent.click(toggle);
      expect(container.querySelector("svg")!.innerHTML).toBe(eyeOffMarkup);
    });

    it("disables the visibility toggle whenever the input is disabled (Unplanned fix)", () => {
      render(
        <PasswordInput
          aria-label="Password"
          disabled
          showPasswordLabel={SHOW_PASSWORD_LABEL}
          hidePasswordLabel={HIDE_PASSWORD_LABEL}
        />,
      );
      const toggle = screen.getByRole("button", { name: SHOW_PASSWORD_LABEL });
      expect(toggle.hasAttribute("disabled")).toBe(true);
    });

    it("carries variant-inverse on the relative wrapper so the toggle resolves inverse tokens without a Field (Unplanned fix)", () => {
      render(
        <PasswordInput
          aria-label="Password"
          variant="inverse"
          showPasswordLabel={SHOW_PASSWORD_LABEL}
          hidePasswordLabel={HIDE_PASSWORD_LABEL}
        />,
      );
      const wrapper = screen.getByLabelText("Password").parentElement!;
      expect(wrapper.className).toContain("relative");
      expect(wrapper.className).toContain("variant-inverse");
    });
  });

  describe("toggle labels (design.md D9)", () => {
    it("rejects PasswordInput without the toggle labels at the type level", () => {
      // PasswordInput writes no copy: both labels come from the consuming
      // capability and are plain required props. The @ts-expect-error directive
      // turns that into a build check: `npx tsc --noEmit` fails (TS2578,
      // unused directive) if the case is ever accepted.
      // @ts-expect-error showPasswordLabel and hidePasswordLabel are required
      render(<PasswordInput aria-label="Password" />);
      // At runtime the control still renders; the requirement is compile-time.
      expect(screen.getByLabelText("Password")).toBeDefined();
    });

    it("rejects PasswordInput with only one toggle label at the type level", () => {
      // @ts-expect-error both labels are required, not just one
      render(<PasswordInput aria-label="Password" showPasswordLabel={SHOW_PASSWORD_LABEL} />);
      expect(screen.getByLabelText("Password")).toBeDefined();
    });
  });

  describe("field attribute contract (design.md D1)", () => {
    it("takes the field's id, aria-describedby, aria-invalid and required as defaults", () => {
      const { container } = render(
        <Field label="Password" help="Help copy" error="Error copy" required>
          <PasswordInput
            showPasswordLabel={SHOW_PASSWORD_LABEL}
            hidePasswordLabel={HIDE_PASSWORD_LABEL}
          />
        </Field>,
      );
      const input = container.querySelector("input")!;
      const help = screen.getByText("Help copy");
      const error = screen.getByText("Error copy");
      expect(input.getAttribute("id")).toBe(
        container.querySelector("label")!.getAttribute("for"),
      );
      expect(input.getAttribute("aria-describedby")).toBe(`${help.id} ${error.id}`);
      expect(input.getAttribute("aria-invalid")).toBe("true");
      expect(input.hasAttribute("required")).toBe(true);
    });

    it("explicit props win over the context values", () => {
      const { container } = render(
        <Field label="Password" help="Help copy" error="Error copy" required>
          <PasswordInput
            id="custom-id"
            aria-describedby="custom-desc"
            aria-invalid="false"
            required={false}
            showPasswordLabel={SHOW_PASSWORD_LABEL}
            hidePasswordLabel={HIDE_PASSWORD_LABEL}
          />
        </Field>,
      );
      const input = container.querySelector("input")!;
      expect(input.getAttribute("id")).toBe("custom-id");
      expect(input.getAttribute("aria-describedby")).toBe("custom-desc");
      expect(input.getAttribute("aria-invalid")).toBe("false");
      expect(input.hasAttribute("required")).toBe(false);
    });

    it("receives none of the field attributes without a Field (spec: Control without a field)", () => {
      render(
        <PasswordInput
          aria-label="Password"
          showPasswordLabel={SHOW_PASSWORD_LABEL}
          hidePasswordLabel={HIDE_PASSWORD_LABEL}
        />,
      );
      const input = screen.getByLabelText("Password");
      expect(input.hasAttribute("id")).toBe(false);
      expect(input.hasAttribute("aria-describedby")).toBe(false);
      expect(input.hasAttribute("aria-invalid")).toBe(false);
      expect(input.hasAttribute("required")).toBe(false);
    });
  });

  describe("variant resolution (design.md D1, D4)", () => {
    it("defaults the variant to the field's variant", () => {
      const { container } = render(
        <Field label="Password" variant="inverse">
          <PasswordInput
            showPasswordLabel={SHOW_PASSWORD_LABEL}
            hidePasswordLabel={HIDE_PASSWORD_LABEL}
          />
        </Field>,
      );
      expect(container.querySelector("input")!.className).toContain(
        "variant-inverse",
      );
    });

    it("an explicit variant prop wins over the field's variant", () => {
      const { container } = render(
        <Field label="Password" variant="inverse">
          <PasswordInput
            variant="default"
            showPasswordLabel={SHOW_PASSWORD_LABEL}
            hidePasswordLabel={HIDE_PASSWORD_LABEL}
          />
        </Field>,
      );
      expect(container.querySelector("input")!.className).not.toContain(
        "variant-inverse",
      );
    });
  });

  describe("value modes (design.md D7)", () => {
    it("updates its value as the user types (uncontrolled defaultValue)", () => {
      render(
        <PasswordInput
          aria-label="Password"
          defaultValue="Ada"
          showPasswordLabel={SHOW_PASSWORD_LABEL}
          hidePasswordLabel={HIDE_PASSWORD_LABEL}
        />,
      );
      const input = screen.getByLabelText("Password") as HTMLInputElement;
      expect(input.value).toBe("Ada");
      fireEvent.change(input, { target: { value: "Ada Lovelace" } });
      expect(input.value).toBe("Ada Lovelace");
    });

    it("controlled mode: value and onChange drive the value", () => {
      const onChange = vi.fn();
      render(
        <PasswordInput
          aria-label="Password"
          value="Ada"
          onChange={onChange}
          showPasswordLabel={SHOW_PASSWORD_LABEL}
          hidePasswordLabel={HIDE_PASSWORD_LABEL}
        />,
      );
      const input = screen.getByLabelText("Password") as HTMLInputElement;
      fireEvent.change(input, { target: { value: "Byron" } });
      expect(onChange).toHaveBeenCalledTimes(1);
      // Controlled: without a state update the value stays the prop's.
      expect(input.value).toBe("Ada");
    });
  });

  describe("standalone use (spec: Control without a field)", () => {
    it("exposes the consumer-supplied aria-label as its accessible name", () => {
      render(
        <PasswordInput
          aria-label="Secret"
          showPasswordLabel={SHOW_PASSWORD_LABEL}
          hidePasswordLabel={HIDE_PASSWORD_LABEL}
        />,
      );
      expect(screen.getByLabelText("Secret")).toBeDefined();
    });
  });
});
