import { describe, it, expect, afterEach, vi } from "vitest";
import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { NoteField } from "./NoteField";

/**
 * The optional note of an axis and part (design.md D14; spec "Notes"; tasks
 * 5.3): closed behind "Add note"; open, a `Field` with a `Textarea` and the
 * remove-note control; removing drops the note and its text.
 */

const sent = vi.fn();

afterEach(() => {
  cleanup();
  sent.mockReset();
});

function Harness({ initial = null }: { initial?: string | null }) {
  const [value, setValue] = useState<string | null>(initial);
  return (
    <NoteField
      label="Note on aroma"
      addLabel="Add note"
      removeLabel="Remove note"
      value={value}
      onChange={(next) => {
        sent(next);
        setValue(next);
      }}
    />
  );
}

const LINK_STYLE = ["type-body", "text-text-link", "underline", "focus-visible:focus-ring"];

describe("NoteField (design.md D14)", () => {
  it("starts closed behind an Add note control styled as a link", () => {
    render(<Harness />);
    const add = screen.getByRole("button", { name: "Add note" });
    for (const token of LINK_STYLE) expect(add.className).toContain(token);
    expect(screen.queryByRole("textbox")).toBeNull();
    expect(sent).not.toHaveBeenCalled();
  });

  it("shows an aria-hidden plus icon after the Add note text (spec: The Add note control shows a plus icon)", () => {
    render(<Harness />);
    const add = screen.getByRole("button", { name: "Add note" });
    expect(add.lastElementChild?.tagName.toLowerCase()).toBe("svg");
    expect(add.lastElementChild?.getAttribute("aria-hidden")).toBe("true");
  });

  it("opens the note field with its label, a textarea and the remove control aligned to the end", () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole("button", { name: "Add note" }));
    const textarea = screen.getByRole("textbox", { name: "Note on aroma" });
    expect(textarea.tagName).toBe("TEXTAREA");
    expect(screen.queryByRole("button", { name: "Add note" })).toBeNull();
    const remove = screen.getByRole("button", { name: "Remove note" });
    for (const token of LINK_STYLE) expect(remove.className).toContain(token);
    expect(remove.className).toContain("self-end");
    fireEvent.change(textarea, { target: { value: "Bright jasmine" } });
    expect(sent).toHaveBeenLastCalledWith("Bright jasmine");
  });

  it("drops the note and its text when removed", () => {
    render(<Harness initial="Bright jasmine" />);
    fireEvent.click(screen.getByRole("button", { name: "Remove note" }));
    expect(screen.queryByRole("textbox")).toBeNull();
    expect(sent).toHaveBeenLastCalledWith(null);
    fireEvent.click(screen.getByRole("button", { name: "Add note" }));
    expect((screen.getByRole("textbox") as HTMLTextAreaElement).value).toBe("");
  });
});
