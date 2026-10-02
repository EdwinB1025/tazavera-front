import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { Input } from "@/shared/ui/Input";
import { Field } from "@/shared/ui/Field";
import { Eye, EyeOff } from "@/shared/ui/icons";

// This project has no global test setup, so RTL's auto-cleanup (which relies
// on a framework-provided afterEach) does not run. Clean up manually between
// tests so queries don't see elements left by previous renders.
afterEach(() => {
  cleanup();
});

/**
 * Input control tests (design.md D1 contract, D7 modes, D9 password reveal;
 * spec "Text input"). Written before the component is implemented (task 3.2);
 * the import of `Input` fails to resolve until then, so the file runs and
 * fails as required.
 *
 * Assertions are className-/attribute-based: jsdom has no CSS engine, so the
 * box tokens are verified by their presence in `className` (they activate via
 * the matching pseudo-classes in a real browser) and the contract by the exact
 * attributes. Accessible names use the `getByRole({ name })` query, which
 * @testing-library/dom computes natively.
 */

const BOX_TOKENS = [
  "h-10",
  "rounded-field",
  "border-2",
  "border-border-strong",
  "bg-surface-input",
  "type-control",
  "placeholder:italic",
  "placeholder:text-text-placeholder",
  "focus-visible:focus-ring",
  "disabled:opacity-50",
  "disabled:cursor-not-allowed",
];

// Consumer-supplied toggle copy (correction 3): Input writes no text of its
// own, so the tests supply the labels and assert the toggle's accessible name
// equals each one as it flips (design.md D9).
const SHOW_PASSWORD_LABEL = "Reveal the secret";
const HIDE_PASSWORD_LABEL = "Mask the secret";

describe("Input", () => {
  describe("box treatment", () => {
    it("renders the exact box tokens", () => {
      render(<Input aria-label="Name" />);
      const input = screen.getByRole("textbox", { name: "Name" });
      for (const token of BOX_TOKENS) {
        expect(input.className).toContain(token);
      }
    });

    it("shows no hover token in the default variant (spec: Hover on light surfaces)", () => {
      render(<Input aria-label="Name" />);
      const input = screen.getByRole("textbox", { name: "Name" });
      const hoverTokens = input.className
        .split(/\s+/)
        .filter((token) => token.includes("hover:"));
      expect(hoverTokens).toEqual([]);
    });

    it("swaps the border to the error treatment when invalid (design.md D9)", () => {
      render(
        <Field label="E-mail" error="Enter a valid e-mail">
          <Input />
        </Field>,
      );
      const input = screen.getByRole("textbox", { name: "E-mail" });
      expect(input.className).toContain("border-feedback-error");
      expect(input.className).not.toContain("border-border-strong");
    });

    it("inverse variant adds variant-inverse bg-transparent hover:border-nav-text-dark (design.md D2)", () => {
      render(<Input aria-label="Name" variant="inverse" />);
      const input = screen.getByRole("textbox", { name: "Name" });
      expect(input.className).toContain("variant-inverse");
      expect(input.className).toContain("bg-transparent");
      expect(input.className).toContain("hover:border-nav-text-dark");
    });
  });

  describe("value modes (design.md D7)", () => {
    it("updates its value as the user types (uncontrolled defaultValue)", () => {
      render(<Input aria-label="Name" defaultValue="Ada" />);
      const input = screen.getByRole("textbox", { name: "Name" }) as HTMLInputElement;
      expect(input.value).toBe("Ada");
      fireEvent.change(input, { target: { value: "Ada Lovelace" } });
      expect(input.value).toBe("Ada Lovelace");
    });

    it("controlled mode: value and onChange drive the value", () => {
      const onChange = vi.fn();
      render(<Input aria-label="Name" value="Ada" onChange={onChange} />);
      const input = screen.getByRole("textbox", { name: "Name" }) as HTMLInputElement;
      fireEvent.change(input, { target: { value: "Byron" } });
      expect(onChange).toHaveBeenCalledTimes(1);
      // Controlled: without a state update the value stays the prop's.
      expect(input.value).toBe("Ada");
    });
  });

  describe("native attribute passthrough", () => {
    it("passes readOnly, name and disabled through", () => {
      render(<Input aria-label="Name" readOnly name="email" disabled />);
      const input = screen.getByRole("textbox", { name: "Name" });
      expect(input.hasAttribute("readonly")).toBe(true);
      expect(input.getAttribute("name")).toBe("email");
      expect(input.hasAttribute("disabled")).toBe(true);
    });
  });

  describe("password mode (spec: Password masked, Reveal and mask, Visibility toggle is named)", () => {
    it("masks the value by default and the toggle named by the supplied labels reveals and masks again", () => {
      render(
        <Input
          aria-label="Password"
          type="password"
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

    it("swaps the Eye / EyeOff icon at size-4 text-text-secondary and keeps the shared focus indicator on the toggle", () => {
      // Reference renders pin down which glyph is which without relying on
      // the icon library's own markup details.
      const { container: eyeRef } = render(<Eye />);
      const { container: eyeOffRef } = render(<EyeOff />);
      const eyeMarkup = eyeRef.querySelector("svg")!.innerHTML;
      const eyeOffMarkup = eyeOffRef.querySelector("svg")!.innerHTML;

      const { container } = render(
        <Input
          aria-label="Password"
          type="password"
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

    it("renders no visibility toggle outside password mode", () => {
      render(<Input aria-label="Name" />);
      expect(screen.queryByRole("button")).toBeNull();
    });

    it("disables the visibility toggle whenever the input is disabled (Unplanned fix)", () => {
      render(
        <Input
          aria-label="Password"
          type="password"
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
        <Input
          aria-label="Password"
          type="password"
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

  describe("toggle labels (correction 3, design.md D9)", () => {
    it('rejects type="password" without the toggle labels at the type level', () => {
      // Input writes no copy: both labels come from the consuming capability
      // and are required when type="password". The @ts-expect-error directive
      // turns that into a build check: `npx tsc --noEmit` fails (TS2578,
      // unused directive) if the case is ever accepted.
      // @ts-expect-error showPasswordLabel and hidePasswordLabel are required
      render(<Input aria-label="Password" type="password" />);
      // At runtime the control still renders; the requirement is compile-time.
      expect(screen.getByLabelText("Password")).toBeDefined();
    });

    it('rejects type="password" with only one toggle label at the type level', () => {
      // @ts-expect-error both labels are required, not just one
      render(<Input aria-label="Password" type="password" showPasswordLabel={SHOW_PASSWORD_LABEL} />);
      expect(screen.getByLabelText("Password")).toBeDefined();
    });
  });

  describe("field attribute contract (design.md D1)", () => {
    it("takes the field's id, aria-describedby, aria-invalid and required as defaults", () => {
      const { container } = render(
        <Field label="E-mail" help="Help copy" error="Error copy" required>
          <Input />
        </Field>,
      );
      const input = screen.getByRole("textbox", { name: "E-mail" });
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
      render(
        <Field label="E-mail" help="Help copy" error="Error copy" required>
          <Input
            id="custom-id"
            aria-describedby="custom-desc"
            aria-invalid="false"
            required={false}
          />
        </Field>,
      );
      const input = screen.getByRole("textbox");
      expect(input.getAttribute("id")).toBe("custom-id");
      expect(input.getAttribute("aria-describedby")).toBe("custom-desc");
      expect(input.getAttribute("aria-invalid")).toBe("false");
      expect(input.hasAttribute("required")).toBe(false);
    });

    it("receives none of the field attributes without a Field (spec: Control without a field)", () => {
      render(<Input aria-label="Name" />);
      const input = screen.getByRole("textbox", { name: "Name" });
      expect(input.hasAttribute("id")).toBe(false);
      expect(input.hasAttribute("aria-describedby")).toBe(false);
      expect(input.hasAttribute("aria-invalid")).toBe(false);
      expect(input.hasAttribute("required")).toBe(false);
    });
  });

  describe("variant resolution (design.md D1, D4)", () => {
    it("defaults the variant to the field's variant", () => {
      render(
        <Field label="E-mail" variant="inverse">
          <Input />
        </Field>,
      );
      expect(screen.getByRole("textbox").className).toContain("variant-inverse");
    });

    it("an explicit variant prop wins over the field's variant", () => {
      render(
        <Field label="E-mail" variant="inverse">
          <Input variant="default" />
        </Field>,
      );
      expect(
        screen.getByRole("textbox").className,
      ).not.toContain("variant-inverse");
    });
  });

  describe("standalone use (spec: Control without a field)", () => {
    it("exposes the consumer-supplied aria-label as its accessible name", () => {
      render(<Input aria-label="Search term" />);
      expect(screen.getByRole("textbox", { name: "Search term" })).toBeDefined();
    });
  });
});
