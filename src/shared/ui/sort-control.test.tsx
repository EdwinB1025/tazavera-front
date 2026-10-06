import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { Field, Select } from "@/shared/ui";

afterEach(() => {
  cleanup();
});

/**
 * Sort control (spec filtering "Sort control"; design.md D14.10): the
 * existing Field + Select composed by each consumer, labelled "Sort by",
 * reporting the chosen order at once with no separate action.
 */

describe("Sort control (Field + Select)", () => {
  it("choosing another order reports it at once", () => {
    const onChange = vi.fn();
    render(
      <Field label="Sort by">
        <Select value="newest" onChange={(event) => onChange(event.target.value)}>
          <option value="newest">Newest</option>
          <option value="score">Highest score</option>
        </Select>
      </Field>,
    );
    const select = screen.getByRole("combobox", { name: "Sort by" });
    fireEvent.change(select, { target: { value: "score" } });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("score");
    expect(screen.queryByRole("button")).toBeNull();
  });
});
