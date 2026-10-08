import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { FilterChip } from "@/shared/ui";

afterEach(() => {
  cleanup();
});

describe("FilterChip", () => {
  it("the X icon is aria-hidden", () => {
    render(<FilterChip value="Washed" label="Remove" onRemove={() => {}} />);
    const svg = screen.getByRole("button", { name: "Remove" }).querySelector("svg")!;
    expect(svg.getAttribute("aria-hidden")).toBe("true");
  });
});
