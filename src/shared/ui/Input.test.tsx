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
    it("masks the value by default and the named toggle reveals and masks again", () => {
      render(<Input aria-label="Password" type="password" defaultValue="s3cret" />);
      const input = screen.getByLabelText("Password");
      expect(input.getAttribute("type")).toBe("password");

      const toggle = screen.getByRole("button", { name: /show/i });
      expect(toggle.getAttribute("type")).toBe("button");

      fireEvent.click(toggle);
      expect(input.getAttribute("type")).toBe("text");
      expect(screen.getByRole("button", { name: /hide/i })).toBeDefined();

      fireEvent.click(screen.getByRole("button", { name: /hide/i }));
      expect(input.getAttribute("type")).toBe("password");
      expect(screen.getByRole("button", { name: /show/i })).toBeDefined();
    });

    it("swaps the Eye / EyeOff icon at size-4 text-text-secondary and keeps the shared focus indicator on the toggle", () => {
      // Reference renders pin down which glyph is which without relying on
      // the icon library's own markup details.
      const { container: eyeRef } = render(<Eye />);
      const { container: eyeOffRef } = render(<EyeOff />);
      const eyeMarkup = eyeRef.querySelector("svg")!.innerHTML;
      const eyeOffMarkup = eyeOffRef.querySelector("svg")!.innerHTML;

      const { container } = render(
        <Input aria-label="Password" type="password" />,
      );
      const toggle = screen.getByRole("button", { name: /show/i });
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
