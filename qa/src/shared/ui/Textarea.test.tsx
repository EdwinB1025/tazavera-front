import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { Textarea } from "@/shared/ui/Textarea";
import { Field } from "@/shared/ui/Field";

// This project has no global test setup, so RTL's auto-cleanup (which relies
// on a framework-provided afterEach) does not run. Clean up manually between
// tests so queries don't see elements left by previous renders.
afterEach(() => {
  cleanup();
});

/**
 * Textarea control tests (design.md D3 readOnly, D4 no variant, D7 modes;
 * spec "Textarea"). Written before the component is implemented (task 5.2);
 * the import of `Textarea` fails to resolve until then, so the file runs and
 * fails as required.
 *
 * Assertions are className-/attribute-based: jsdom has no CSS engine, so the
 * surface and boundary tokens are verified by their presence in `className`
 * and the contract by the exact attributes.
 */

const BOX_TOKENS = [
  "rounded-field",
  "border-2",
  "border-border-muted",
  "bg-surface-textarea",
  "type-control",
  "placeholder:italic",
  "placeholder:text-text-placeholder",
  "focus-visible:focus-ring",
  "disabled:opacity-50",
  "disabled:cursor-not-allowed",
];

describe("Textarea", () => {
  describe("box treatment (spec: Distinct treatment)", () => {
    it("renders the exact textarea tokens", () => {
      render(<Textarea aria-label="Notes" />);
      const textarea = screen.getByRole("textbox", { name: "Notes" });
      for (const token of BOX_TOKENS) {
        expect(textarea.className).toContain(token);
      }
    });

    it("swaps the border to the error treatment when invalid (design.md D9)", () => {
      render(
        <Field label="Notes" error="Say something">
          <Textarea />
        </Field>,
      );
      const textarea = screen.getByRole("textbox", { name: "Notes" });
      expect(textarea.className).toContain("border-feedback-error");
      expect(textarea.className).not.toContain("border-border-muted");
    });
  });

  describe("value modes (spec: Multi-line value, design.md D7)", () => {
    it("controlled mode: value and onChange drive the value", () => {
      const onChange = vi.fn();
      render(<Textarea aria-label="Notes" value="first" onChange={onChange} />);
      const textarea = screen.getByRole("textbox", { name: "Notes" }) as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: "first\nsecond" } });
      expect(onChange).toHaveBeenCalledTimes(1);
      // Controlled: without a state update the value stays the prop's.
      expect(textarea.value).toBe("first");
    });

    it("passes native readOnly through (design.md D3)", () => {
      render(<Textarea aria-label="Notes" readOnly value="first" />);
      expect(
        screen.getByRole("textbox", { name: "Notes" }).hasAttribute("readonly"),
      ).toBe(true);
    });
  });

  describe("field attribute contract (design.md D1)", () => {
    it("takes the field's id, aria-describedby, aria-invalid and required as defaults", () => {
      const { container } = render(
        <Field label="Notes" help="Help copy" error="Say something" required>
          <Textarea />
        </Field>,
      );
      const textarea = screen.getByRole("textbox", { name: "Notes" });
      const help = screen.getByText("Help copy");
      const error = screen.getByText("Say something");
      expect(textarea.getAttribute("id")).toBe(
        container.querySelector("label")!.getAttribute("for"),
      );
      expect(textarea.getAttribute("aria-describedby")).toBe(
        `${help.id} ${error.id}`,
      );
      expect(textarea.getAttribute("aria-invalid")).toBe("true");
      expect(textarea.hasAttribute("required")).toBe(true);
    });

    it("explicit props win over the context values", () => {
      render(
        <Field label="Notes" help="Help copy" error="Say something" required>
          <Textarea
            id="custom-id"
            aria-describedby="custom-desc"
            aria-invalid="false"
            required={false}
          />
        </Field>,
      );
      const textarea = screen.getByRole("textbox");
      expect(textarea.getAttribute("id")).toBe("custom-id");
      expect(textarea.getAttribute("aria-describedby")).toBe("custom-desc");
      expect(textarea.getAttribute("aria-invalid")).toBe("false");
      expect(textarea.hasAttribute("required")).toBe(false);
    });

    it("receives none of the field attributes without a Field (spec: Control without a field)", () => {
      render(<Textarea aria-label="Notes" />);
      const textarea = screen.getByRole("textbox", { name: "Notes" });
      expect(textarea.hasAttribute("id")).toBe(false);
      expect(textarea.hasAttribute("aria-describedby")).toBe(false);
      expect(textarea.hasAttribute("aria-invalid")).toBe(false);
      expect(textarea.hasAttribute("required")).toBe(false);
    });
  });

  describe("variants (design.md D4)", () => {
    it("rejects a variant prop at compile time", () => {
      // Textarea renders the default variant only and takes no `variant`
      // prop. The @ts-expect-error directive turns that into a build check:
      // `npx tsc --noEmit` fails (TS2578, unused directive) if the prop ever
      // becomes accepted.
      // @ts-expect-error no variant prop on Textarea
      render(<Textarea aria-label="Notes" variant="inverse" />);
      expect(screen.getByRole("textbox", { name: "Notes" })).toBeDefined();
    });
  });

  describe("standalone use (spec: Control without a field)", () => {
    it("exposes the consumer-supplied aria-label as its accessible name", () => {
      render(<Textarea aria-label="Tasting notes" />);
      expect(screen.getByRole("textbox", { name: "Tasting notes" })).toBeDefined();
    });
  });
});
