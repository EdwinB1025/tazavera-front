import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { LabelValueRow } from "@/shared/ui/LabelValueRow";

// No global test setup in this project, so RTL auto-cleanup does not run.
afterEach(() => {
  cleanup();
});

/**
 * LabelValueRow tests (design.md D5; content-structure "Label/value row").
 * jsdom has no CSS engine: the row is verified by its exact class tokens.
 */

/** The class tokens of an element, as exact names (no substring matching). */
function classTokens(element: Element): string[] {
  return (element.getAttribute("class") ?? "").split(/\s+/).filter(Boolean);
}

const ROW_TOKENS = [
  "flex",
  "flex-wrap",
  "items-baseline",
  "justify-between",
  "gap-4",
];

function renderRows(rows: { label: string; value: string }[]) {
  return render(
    <dl>
      {rows.map((row) => (
        <LabelValueRow key={row.label} label={row.label} value={row.value} />
      ))}
    </dl>,
  );
}

describe("LabelValueRow", () => {
  it("renders the term and the value in one row with the D5 layout", () => {
    const { container } = renderRows([{ label: "Country", value: "Colombia" }]);
    const row = container.querySelector("dl > div")!;
    expect(row).not.toBeNull();
    for (const token of ROW_TOKENS) {
      expect(classTokens(row)).toContain(token);
    }
    const term = row.querySelector("dt")!;
    const value = row.querySelector("dd")!;
    expect(classTokens(term)).toContain("type-label");
    expect(classTokens(value)).toContain("type-body");
    // Term first, value last.
    expect(row.firstElementChild).toBe(term);
    expect(row.lastElementChild).toBe(value);
  });

  it("keeps description semantics for several rows in one list", () => {
    const { container } = renderRows([
      { label: "Country", value: "Colombia" },
      { label: "Region", value: "Huila" },
    ]);
    const rows = container.querySelectorAll("dl > div");
    expect(rows).toHaveLength(2);
    rows.forEach((row) => {
      expect(row.children).toHaveLength(2);
      expect(row.children[0].tagName).toBe("DT");
      expect(row.children[1].tagName).toBe("DD");
    });
  });

  it("renders exactly the consumer's label and value", () => {
    const { container } = renderRows([{ label: "Altitude", value: "1800" }]);
    const row = container.querySelector("dl > div")!;
    expect(row.querySelector("dt")!.textContent).toBe("Altitude");
    expect(row.querySelector("dd")!.textContent).toBe("1800");
    expect(row.textContent).toBe("Altitude1800");
  });
});
