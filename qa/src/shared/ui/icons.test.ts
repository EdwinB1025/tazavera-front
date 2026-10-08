import { describe, it, expect, afterEach } from "vitest";
import { createElement } from "react";
import { render, cleanup } from "@testing-library/react";
import { BeanMark } from "@/shared/ui/icons";

// No global test setup in this project, so RTL auto-cleanup does not run.
afterEach(() => {
  cleanup();
});

describe("BeanMark bean artwork (add-evaluation-scales design.md D4)", () => {
  // jsdom has no CSS engine, so the artwork is verified by its exact token
  // classes (design.md D4: the disc a full circle in
  // `fill-evaluation-bean-on`/`-off`, the bean path in the matching
  // `fill-`/`stroke-evaluation-bean-mark-on`/`-mark-off`).

  it("renders aria-hidden, being decorative artwork", () => {
    const { container } = render(createElement(BeanMark, { variant: "on" }));
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg!.getAttribute("aria-hidden")).not.toBeNull();
  });

  it('variant "on": the disc in fill-evaluation-bean-on, the path in the matching mark tokens', () => {
    const { container } = render(createElement(BeanMark, { variant: "on" }));
    const svg = container.querySelector("svg");
    const disc = svg!.querySelector(".fill-evaluation-bean-on");
    const mark = svg!.querySelector(
      "path.fill-evaluation-bean-mark-on.stroke-evaluation-bean-mark-on",
    );
    expect(disc).not.toBeNull();
    expect(mark).not.toBeNull();
    // the disc is the background shape and the path draws the bean on it
    expect(disc).not.toBe(mark);
  });

  it('variant "off": the disc in fill-evaluation-bean-off, the path in the matching mark tokens', () => {
    const { container } = render(createElement(BeanMark, { variant: "off" }));
    const svg = container.querySelector("svg");
    const disc = svg!.querySelector(".fill-evaluation-bean-off");
    const mark = svg!.querySelector(
      "path.fill-evaluation-bean-mark-off.stroke-evaluation-bean-mark-off",
    );
    expect(disc).not.toBeNull();
    expect(mark).not.toBeNull();
    // the disc is the background shape and the path draws the bean on it
    expect(disc).not.toBe(mark);
  });
});
