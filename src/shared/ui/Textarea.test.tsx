import { describe, it, expect, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { Textarea } from "@/shared/ui/Textarea";
import { Input } from "@/shared/ui/Input";

// This project has no global test setup, so RTL's auto-cleanup (which relies
// on a framework-provided afterEach) does not run. Clean up manually between
// tests so queries don't see elements left by previous renders.
afterEach(() => {
  cleanup();
});

describe("Textarea", () => {
  describe("box treatment (spec: Distinct treatment)", () => {
    it("is visibly distinct from the input's box", () => {
      render(
        <>
          <Input aria-label="One line" />
          <Textarea aria-label="Many lines" />
        </>,
      );
      const input = screen.getByRole("textbox", { name: "One line" });
      const textarea = screen.getByRole("textbox", { name: "Many lines" });
      expect(textarea.className).toContain("border-border-muted");
      expect(textarea.className).toContain("bg-surface-textarea");
      expect(textarea.className).not.toContain("bg-surface-input");
      expect(textarea.className).not.toContain("border-border-strong");
      expect(input.className).toContain("bg-surface-input");
      expect(input.className).toContain("border-border-strong");
    });
  });

  describe("value modes (spec: Multi-line value, design.md D7)", () => {
    it("keeps the line breaks of a multi-line value (uncontrolled defaultValue)", () => {
      render(<Textarea aria-label="Notes" defaultValue="first" />);
      const textarea = screen.getByRole("textbox", { name: "Notes" }) as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: "first\nsecond" } });
      expect(textarea.value).toBe("first\nsecond");
    });
  });
});
