import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { useContext, type InputHTMLAttributes } from "react";
import { Field } from "@/shared/ui/Field";
import { FieldContext } from "@/shared/ui/field-context";

// This project has no global test setup, so RTL's auto-cleanup (which relies
// on a framework-provided afterEach) does not run. Clean up manually between
// tests so queries don't see elements left by previous renders.
afterEach(() => {
  cleanup();
});

/**
 * Field control tests (design.md D1 attribute contract, spec "Field structure
 * and association"). Written before the component is implemented (task 2.2);
 * the import of `Field` fails to resolve until then, so the file runs and
 * fails as required.
 *
 * Assertions are className-/attribute-based: jsdom has no CSS engine, so the
 * typographic roles are verified by their class names and the binding
 * contract by the exact attributes. Accessible names use the
 * `getByRole({ name })` query, which @testing-library/dom computes natively.
 *
 * `Probe` plays the control slot. It reads the field context and applies the
 * D1 attribute table exactly as Input, Select and Textarea do (context values
 * as defaults, an explicit prop always winning), so these tests pin down the
 * contract the real controls must implement.
 */
function Probe(props: InputHTMLAttributes<HTMLInputElement>) {
  const ctx = useContext(FieldContext);
  const id = props.id ?? ctx?.controlId;
  const describedBy =
    props["aria-describedby"] ??
    ([ctx?.helpId, ctx?.errorId].filter(Boolean).join(" ") || undefined);
  const ariaInvalid =
    props["aria-invalid"] ?? (ctx?.invalid ? "true" : undefined);
  const required = props.required ?? (ctx?.required ? true : undefined);
  return (
    <input
      {...props}
      id={id}
      aria-describedby={describedBy}
      aria-invalid={ariaInvalid}
      required={required}
      data-variant={ctx?.variant}
    />
  );
}

describe("Field", () => {
  describe("presentation (spec: Presentation)", () => {
    it("renders label, control, help and error in that order in their typographic roles", () => {
      const { container } = render(
        <Field label="E-mail" help="We never share it" error="Enter a valid e-mail">
          <Probe />
        </Field>,
      );
      const root = container.firstElementChild!;
      expect(root.children).toHaveLength(4);

      const [label, control, help, error] = Array.from(root.children);
      expect(label!.tagName).toBe("LABEL");
      expect(label!.className).toContain("type-label");
      expect(control!.tagName).toBe("INPUT");
      expect(help!.className).toContain("type-meta");
      expect(help!.textContent).toBe("We never share it");
      expect(error!.className).toContain("type-error");
      expect(error!.textContent).toBe("Enter a valid e-mail");
    });
  });

  describe("spacing (design.md D10, correction 2)", () => {
    it("gives the label exactly mb-2 and the help text and error message exactly mt-1", () => {
      const { container } = render(
        <Field label="E-mail" help="We never share it" error="Enter a valid e-mail">
          <Probe />
        </Field>,
      );
      expect(margins(container.querySelector("label")!)).toEqual(["mb-2"]);
      expect(margins(screen.getByText("We never share it"))).toEqual(["mt-1"]);
      expect(margins(screen.getByText("Enter a valid e-mail"))).toEqual(["mt-1"]);
    });
  });

  describe("label association (spec: Label association)", () => {
    it("binds the label to the control: the label's htmlFor is the control's id", () => {
      const { container } = render(
        <Field label="E-mail">
          <Probe />
        </Field>,
      );
      const label = container.querySelector("label")!;
      const input = container.querySelector("input")!;
      expect(label.getAttribute("for")).toBe(input.getAttribute("id"));

      // Assistive technology reaches the control with the field's label
      screen.getByRole("textbox", { name: "E-mail" });
    });
  });

  describe("required marking (spec: Required marking)", () => {
    it("renders a visible * in an aria-hidden element and marks the control required", () => {
      const { container } = render(
        <Field label="E-mail" required>
          <Probe />
        </Field>,
      );
      const label = container.querySelector("label")!;
      const asterisk = label.querySelector('[aria-hidden="true"]')!;
      expect(asterisk.textContent).toBe("*");

      const input = container.querySelector("input")!;
      expect(input.hasAttribute("required")).toBe(true);

      // The asterisk stays hidden from assistive technology: the accessible
      // name is still just the label text.
      screen.getByRole("textbox", { name: "E-mail" });
    });

    it("renders no asterisk and leaves the control unmarked when not required", () => {
      const { container } = render(
        <Field label="E-mail">
          <Probe />
        </Field>,
      );
      const label = container.querySelector("label")!;
      expect(label.querySelector('[aria-hidden="true"]')).toBeNull();
      expect(container.querySelector("input")!.hasAttribute("required")).toBe(
        false,
      );
    });
  });

  describe("error presentation (spec: Error presentation)", () => {
    it("renders the error message as text below the control and exposes the control as invalid", () => {
      const { container } = render(
        <Field label="E-mail" error="Enter a valid e-mail">
          <Probe />
        </Field>,
      );
      const root = container.firstElementChild!;
      const error = screen.getByText("Enter a valid e-mail");

      // The message renders as text (never color alone) below the control.
      expect(error.className).toContain("type-error");
      expect(root.lastElementChild).toBe(error);

      const input = container.querySelector("input")!;
      expect(input.getAttribute("aria-invalid")).toBe("true");
    });

    it("omits aria-invalid when no error is shown", () => {
      const { container } = render(
        <Field label="E-mail">
          <Probe />
        </Field>,
      );
      expect(
        container.querySelector("input")!.hasAttribute("aria-invalid"),
      ).toBe(false);
    });
  });

  describe("help and error association (spec: Help and error together)", () => {
    it("lists the present ids in aria-describedby, help before error, space-separated", () => {
      const { container } = render(
        <Field label="E-mail" help="We never share it" error="Enter a valid e-mail">
          <Probe />
        </Field>,
      );
      const help = screen.getByText("We never share it");
      const error = screen.getByText("Enter a valid e-mail");
      const input = container.querySelector("input")!;
      expect(input.getAttribute("aria-describedby")).toBe(
        `${help.id} ${error.id}`,
      );
    });

    it("describes with the help id alone when only help is shown", () => {
      const { container } = render(
        <Field label="E-mail" help="We never share it">
          <Probe />
        </Field>,
      );
      const help = screen.getByText("We never share it");
      expect(container.querySelector("input")!.getAttribute("aria-describedby")).toBe(
        help.id,
      );
    });

    it("describes with the error id alone when only an error is shown", () => {
      const { container } = render(
        <Field label="E-mail" error="Enter a valid e-mail">
          <Probe />
        </Field>,
      );
      const error = screen.getByText("Enter a valid e-mail");
      expect(container.querySelector("input")!.getAttribute("aria-describedby")).toBe(
        error.id,
      );
    });

    it("omits aria-describedby when neither help nor error exists", () => {
      const { container } = render(
        <Field label="E-mail">
          <Probe />
        </Field>,
      );
      expect(
        container.querySelector("input")!.hasAttribute("aria-describedby"),
      ).toBe(false);
    });
  });

  describe("explicit props win over the context values (design.md D1)", () => {
    it("keeps explicit id, aria-describedby, aria-invalid and required over the field's values", () => {
      const { container } = render(
        <Field label="E-mail" help="Help copy" error="Error copy" required>
          <Probe
            id="custom-id"
            aria-describedby="custom-desc"
            aria-invalid="false"
            required={false}
          />
        </Field>,
      );
      const input = container.querySelector("input")!;
      expect(input.getAttribute("id")).toBe("custom-id");
      expect(input.getAttribute("aria-describedby")).toBe("custom-desc");
      expect(input.getAttribute("aria-invalid")).toBe("false");
      expect(input.hasAttribute("required")).toBe(false);
    });
  });

  describe("control without a field (spec: Control without a field)", () => {
    it("receives none of the field attributes", () => {
      const { container } = render(<Probe />);
      const input = container.querySelector("input")!;
      expect(input.hasAttribute("id")).toBe(false);
      expect(input.hasAttribute("aria-describedby")).toBe(false);
      expect(input.hasAttribute("aria-invalid")).toBe(false);
      expect(input.hasAttribute("required")).toBe(false);
    });
  });

  describe("inverse variant (design.md D4)", () => {
    it("renders variant-inverse on the field's root and carries the variant in the context", () => {
      const { container } = render(
        <Field label="E-mail" variant="inverse">
          <Probe />
        </Field>,
      );
      const root = container.firstElementChild!;
      expect(root.className).toContain("variant-inverse");
      expect(container.querySelector("input")!.getAttribute("data-variant")).toBe(
        "inverse",
      );
    });

    it("defaults to the default variant with no scope class on the root", () => {
      const { container } = render(
        <Field label="E-mail">
          <Probe />
        </Field>,
      );
      const root = container.firstElementChild!;
      expect(root.className).not.toContain("variant-inverse");
      expect(container.querySelector("input")!.getAttribute("data-variant")).toBe(
        "default",
      );
    });
  });

  describe("empty-string messages (Unplanned fix: form-fields spec)", () => {
    it('renders no message and wires nothing for help="" and error=""', () => {
      const { container } = render(
        <Field label="E-mail" help="" error="">
          <Probe />
        </Field>,
      );
      expect(container.querySelector("p")).toBeNull();
      const input = container.querySelector("input")!;
      expect(input.hasAttribute("aria-describedby")).toBe(false);
      expect(input.hasAttribute("aria-invalid")).toBe(false);
    });
  });
});

/** The margin utilities of an element (design.md D10 pins them exactly). */
function margins(element: Element): string[] {
  return element.className
    .split(/\s+/)
    .filter((token) => /^m[trblxyse]?-/.test(token));
}
