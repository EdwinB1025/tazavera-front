import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { Select } from "@/shared/ui/Select";
import { Field } from "@/shared/ui/Field";

// This project has no global test setup, so RTL's auto-cleanup (which relies
// on a framework-provided afterEach) does not run. Clean up manually between
// tests so queries don't see elements left by previous renders.
afterEach(() => {
  cleanup();
});

describe("Select", () => {
  describe("closed box (spec: Closed box)", () => {
    it("carries variant-inverse on the relative wrapper so the chevron resolves inverse tokens without a Field (Unplanned fix)", () => {
      render(
        <Select aria-label="Size" variant="inverse">
          <option value="m">Medium</option>
        </Select>,
      );
      const wrapper = screen.getByRole("combobox", { name: "Size" })
        .parentElement!;
      expect(wrapper.className).toContain("relative");
      expect(wrapper.className).toContain("variant-inverse");
    });

    it("fades the chevron with the select when disabled (Unplanned fix)", () => {
      const { container } = render(
        <Select aria-label="Size" disabled>
          <option value="m">Medium</option>
        </Select>,
      );
      const select = screen.getByRole("combobox", { name: "Size" });
      expect(select.className).toContain("peer");
      expect(container.querySelector("svg")!.getAttribute("class")).toContain(
        "peer-disabled:opacity-50",
      );
    });

    it("swaps the border to the error treatment when invalid (design.md D9)", () => {
      render(
        <Field label="Size" error="Choose a size">
          <Select>
            <option value="m">Medium</option>
          </Select>
        </Field>,
      );
      const select = screen.getByRole("combobox", { name: "Size" });
      expect(select.className).toContain("border-feedback-error");
      expect(select.className).not.toContain("border-border-strong");
    });

    it("inverse variant adds variant-inverse bg-transparent hover:border-nav-text-dark (design.md D2)", () => {
      render(
        <Select aria-label="Size" variant="inverse">
          <option value="m">Medium</option>
        </Select>,
      );
      const select = screen.getByRole("combobox", { name: "Size" });
      expect(select.className).toContain("variant-inverse");
      expect(select.className).toContain("bg-transparent");
      expect(select.className).toContain("hover:border-nav-text-dark");
    });

    it("passes disabled through", () => {
      render(
        <Select aria-label="Size" disabled>
          <option value="m">Medium</option>
        </Select>,
      );
      expect(
        screen.getByRole("combobox", { name: "Size" }).hasAttribute("disabled"),
      ).toBe(true);
    });
  });

  describe("choosing an option (spec: Choosing an option, design.md D7)", () => {
    it("controlled mode: value and onChange drive the selection", () => {
      const onChange = vi.fn();
      render(
        <Select aria-label="Size" value="m" onChange={onChange}>
          <option value="s">Small</option>
          <option value="m">Medium</option>
          <option value="l">Large</option>
        </Select>,
      );
      const select = screen.getByRole("combobox", { name: "Size" }) as HTMLSelectElement;
      fireEvent.change(select, { target: { value: "l" } });
      expect(onChange).toHaveBeenCalledTimes(1);
      // Controlled: without a state update the selection stays the prop's.
      expect(select.value).toBe("m");
    });
  });

  describe("field attribute contract (design.md D1)", () => {
    it("takes the field's id, aria-describedby, aria-invalid and required as defaults", () => {
      const { container } = render(
        <Field label="Size" help="Help copy" error="Choose a size" required>
          <Select>
            <option value="m">Medium</option>
          </Select>
        </Field>,
      );
      const select = screen.getByRole("combobox", { name: "Size" });
      const help = screen.getByText("Help copy");
      const error = screen.getByText("Choose a size");
      expect(select.getAttribute("id")).toBe(
        container.querySelector("label")!.getAttribute("for"),
      );
      expect(select.getAttribute("aria-describedby")).toBe(`${help.id} ${error.id}`);
      expect(select.getAttribute("aria-invalid")).toBe("true");
      expect(select.hasAttribute("required")).toBe(true);
    });

    it("explicit props win over the context values", () => {
      render(
        <Field label="Size" help="Help copy" error="Choose a size" required>
          <Select
            id="custom-id"
            aria-describedby="custom-desc"
            aria-invalid="false"
            required={false}
          >
            <option value="m">Medium</option>
          </Select>
        </Field>,
      );
      const select = screen.getByRole("combobox");
      expect(select.getAttribute("id")).toBe("custom-id");
      expect(select.getAttribute("aria-describedby")).toBe("custom-desc");
      expect(select.getAttribute("aria-invalid")).toBe("false");
      expect(select.hasAttribute("required")).toBe(false);
    });

    it("receives none of the field attributes without a Field (spec: Control without a field)", () => {
      render(
        <Select aria-label="Size">
          <option value="m">Medium</option>
        </Select>,
      );
      const select = screen.getByRole("combobox", { name: "Size" });
      expect(select.hasAttribute("id")).toBe(false);
      expect(select.hasAttribute("aria-describedby")).toBe(false);
      expect(select.hasAttribute("aria-invalid")).toBe(false);
      expect(select.hasAttribute("required")).toBe(false);
    });
  });

  describe("variant resolution (design.md D1, D4)", () => {
    it("defaults the variant to the field's variant", () => {
      render(
        <Field label="Size" variant="inverse">
          <Select>
            <option value="m">Medium</option>
          </Select>
        </Field>,
      );
      expect(screen.getByRole("combobox").className).toContain("variant-inverse");
    });

    it("an explicit variant prop wins over the field's variant", () => {
      render(
        <Field label="Size" variant="inverse">
          <Select variant="default">
            <option value="m">Medium</option>
          </Select>
        </Field>,
      );
      expect(
        screen.getByRole("combobox").className,
      ).not.toContain("variant-inverse");
    });
  });

  describe("standalone use (spec: Control without a field)", () => {
    it("exposes the consumer-supplied aria-label as its accessible name", () => {
      render(
        <Select aria-label="Origin">
          <option value="et">Ethiopia</option>
        </Select>,
      );
      expect(screen.getByRole("combobox", { name: "Origin" })).toBeDefined();
    });
  });
});
