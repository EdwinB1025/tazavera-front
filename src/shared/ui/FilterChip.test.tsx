import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { FilterChip } from "@/shared/ui";

afterEach(() => {
  cleanup();
});

/**
 * Applied-filter chip (spec filtering "Applied-filter chips"; design.md D4).
 * The shared badge geometry comes first, the chip's own treatments on top
 * (spec scenario "Chip matches the badge geometry").
 */

const BADGE_GEOMETRY_TOKENS = [
  "type-badge",
  "rounded-field",
  "inline-flex",
  "items-center",
  "gap-1",
  "px-2",
  "py-0.5",
];
const CHIP_TOKENS = [
  "rounded-pill!",
  "min-h-7",
  "gap-1.5!",
  "py-1!",
  "pl-3!",
  "border",
  "border-border-inverse",
  "text-nav-text-dark",
  "hover:underline",
  "focus-visible:focus-ring",
];

describe("FilterChip", () => {
  it("class list is the badge geometry followed by the chip treatments", () => {
    render(<FilterChip value="Washed" label="Remove" onRemove={() => {}} />);
    const chip = screen.getByRole("button", { name: "Remove" });
    expect(chip.className.split(/\s+/)).toEqual([...BADGE_GEOMETRY_TOKENS, ...CHIP_TOKENS]);
  });
});
