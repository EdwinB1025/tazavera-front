import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { Input } from "@/shared/ui/Input";
import { Field } from "@/shared/ui/Field";

// This project has no global test setup, so RTL's auto-cleanup (which relies
// on a framework-provided afterEach) does not run. Clean up manually between
// tests so queries don't see elements left by previous renders.
afterEach(() => {
  cleanup();
});

describe("Input", () => {
  describe("value modes (design.md D7)", () => {
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

  describe("visibility toggle (design.md D8, D9)", () => {
    it("renders no visibility toggle at all", () => {
      render(<Input aria-label="Name" />);
      render(<Input aria-label="Password" type="password" />);
      expect(screen.queryByRole("button")).toBeNull();
    });
  });

  describe("field attribute contract (design.md D1)", () => {
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
});
