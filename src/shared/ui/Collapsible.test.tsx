import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import {
  Collapsible,
  CollapsibleHeader,
  CollapsibleBody,
} from "@/shared/ui/Collapsible";
import type { CollapsibleProps } from "@/shared/ui/Collapsible";

// This project has no global test setup, so RTL's auto-cleanup does not run.
afterEach(() => {
  cleanup();
});

/**
 * Collapsible section tests (design.md D9, spec "Collapsible section").
 * Written before the parts are implemented (task 2.1).
 *
 * jsdom has no CSS engine: the animation, rotation, layout and reduced-motion
 * behaviour are verified by the classes the build chose for them (task 2.2):
 *
 *   header  — `group flex w-full min-h-10 items-center justify-between gap-2
 *             p-2 [text-align:start] rounded-field focus-visible:focus-ring`
 *   title   — `type-subheading` inside a block `flex min-w-0 flex-wrap
 *             gap-x-3 gap-y-1`
 *   chevron — `size-4 shrink-0 text-text-accent opacity-80 group-hover:opacity-100
 *             group-focus-visible:opacity-100 transition-[rotate,opacity]
 *             duration-250 ease-out motion-reduce:transition-none`, plus
 *             `rotate-180` while expanded
 *   body    — a grid whose single row animates from `grid-rows-[0fr]`
 *             (collapsed, `invisible`, clipped at its edge) to
 *             `grid-rows-[1fr]` (expanded, clip widened by the 4px focus
 *             ring) over 250ms ease-out, the clip switching at once on close
 *             and at the end on open; `motion-reduce:[transition:none]`.
 */

/** The class tokens of an element, as exact names (no substring matching). */
function classTokens(element: Element): string[] {
  return element.getAttribute("class")?.split(/\s+/).filter(Boolean) ?? [];
}

const BODY_COLLAPSED = [
  "grid-rows-[0fr]",
  "invisible",
  "[clip-path:inset(0)]",
  "[transition:grid-template-rows_250ms_ease-out,visibility_250ms,clip-path_250ms_step-start]",
];
const BODY_EXPANDED = [
  "grid-rows-[1fr]",
  "[clip-path:inset(-4px)]",
  "[transition:grid-template-rows_250ms_ease-out,visibility_250ms,clip-path_250ms_step-end]",
];

function renderSection(
  props: Partial<CollapsibleProps> = {},
  header: { aside?: string; headingLevel?: 2 | 3 | 4 | 5 | 6 } = {},
) {
  const utils = render(
    <Collapsible {...props}>
      <CollapsibleHeader aside={header.aside} headingLevel={header.headingLevel}>
        Fragancia / Aroma
      </CollapsibleHeader>
      <CollapsibleBody data-testid="body">
        <a href="#x">Inner link</a>
      </CollapsibleBody>
    </Collapsible>,
  );
  const button = screen.getByRole("button");
  const body = screen.getByTestId("body");
  return { ...utils, button, body };
}

describe("Collapsible section", () => {
  it("starts collapsed, with the body inert and referenced by the header", () => {
    const { button, body } = renderSection();
    expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(body.hasAttribute("inert")).toBe(true);
    expect(body.id).not.toBe("");
    expect(button.getAttribute("aria-controls")).toBe(body.id);
    for (const c of BODY_COLLAPSED) expect(classTokens(body)).toContain(c);
    for (const c of BODY_EXPANDED) expect(classTokens(body)).not.toContain(c);
  });

  it("toggles on click and keeps aria-controls resolving in both states", () => {
    const { button, body } = renderSection();
    fireEvent.click(button);
    expect(button.getAttribute("aria-expanded")).toBe("true");
    expect(body.hasAttribute("inert")).toBe(false);
    expect(document.getElementById(button.getAttribute("aria-controls")!)).toBe(body);
    for (const c of BODY_EXPANDED) expect(classTokens(body)).toContain(c);
    for (const c of BODY_COLLAPSED) expect(classTokens(body)).not.toContain(c);

    fireEvent.click(button);
    expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(body.hasAttribute("inert")).toBe(true);
    expect(document.getElementById(button.getAttribute("aria-controls")!)).toBe(body);
  });

  it("starts expanded with defaultOpen", () => {
    const { button, body } = renderSection({ defaultOpen: true });
    expect(button.getAttribute("aria-expanded")).toBe("true");
    expect(body.hasAttribute("inert")).toBe(false);
  });

  it("reports toggles and follows the prop when controlled", () => {
    const onOpenChange = vi.fn();
    const { button, rerender } = renderSection({ open: false, onOpenChange });
    fireEvent.click(button);
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(button.getAttribute("aria-expanded")).toBe("false");

    rerender(
      <Collapsible open onOpenChange={onOpenChange}>
        <CollapsibleHeader>Fragancia / Aroma</CollapsibleHeader>
        <CollapsibleBody data-testid="body">
          <a href="#x">Inner link</a>
        </CollapsibleBody>
      </Collapsible>,
    );
    expect(screen.getByRole("button").getAttribute("aria-expanded")).toBe("true");
  });

  it("reports toggles when uncontrolled", () => {
    const onOpenChange = vi.fn();
    const { button } = renderSection({ onOpenChange });
    fireEvent.click(button);
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(button.getAttribute("aria-expanded")).toBe("true");
  });

  it("names the header by the title only and describes it by the aside", () => {
    renderSection({}, { aside: "Completo" });
    const button = screen.getByRole("button", {
      name: "Fragancia / Aroma",
      description: "Completo",
    });
    expect(button).toBeDefined();
  });

  it("has no description without an aside", () => {
    const { button } = renderSection();
    expect(button.hasAttribute("aria-describedby")).toBe(false);
  });

  it("wraps the button in a heading of the given level", () => {
    const { button } = renderSection({}, { headingLevel: 3 });
    const heading = screen.getByRole("heading", { level: 3 });
    expect(heading.tagName).toBe("H3");
    expect(heading.contains(button)).toBe(true);
  });

  it("renders no heading without a heading level", () => {
    renderSection();
    expect(screen.queryByRole("heading")).toBeNull();
  });

  it("hides the chevron and turns it with the state, without motion when reduced", () => {
    const { button } = renderSection();
    const chevron = button.querySelector("svg")!;
    expect(chevron.getAttribute("aria-hidden")).toBe("true");
    for (const c of [
      "size-4",
      "shrink-0",
      "text-text-accent",
      "opacity-80",
      "group-hover:opacity-100",
      "group-focus-visible:opacity-100",
      "transition-[rotate,opacity]",
      "duration-250",
      "ease-out",
      "motion-reduce:transition-none",
    ]) {
      expect(classTokens(chevron)).toContain(c);
    }
    expect(classTokens(chevron)).not.toContain("rotate-180");
    fireEvent.click(button);
    expect(classTokens(button.querySelector("svg")!)).toContain("rotate-180");
  });

  it("animates the body without motion when reduced", () => {
    const { body } = renderSection();
    expect(classTokens(body)).toContain("grid");
    expect(classTokens(body)).toContain("motion-reduce:[transition:none]");
    const inner = body.firstElementChild!;
    expect(classTokens(inner)).toContain("min-h-0");
  });

  it("clips the collapsed body's overflow", () => {
    const { body, button } = renderSection();
    const inner = body.firstElementChild!;
    expect(classTokens(inner)).toContain("min-h-0");
    expect(classTokens(inner)).toContain("overflow-hidden");
    fireEvent.click(button);
    expect(classTokens(inner)).toContain("min-h-0");
    expect(classTokens(inner)).not.toContain("overflow-hidden");
    fireEvent.click(button);
    expect(classTokens(inner)).toContain("overflow-hidden");
  });

  it("lays out the header as a full-width focusable row", () => {
    const { button } = renderSection({}, { aside: "Completo" });
    expect(button.getAttribute("type")).toBe("button");
    for (const c of [
      "group",
      "flex",
      "w-full",
      "min-h-10",
      "items-center",
      "justify-between",
      "gap-2",
      "p-2",
      "[text-align:start]",
      "rounded-field",
      "focus-visible:focus-ring",
    ]) {
      expect(classTokens(button)).toContain(c);
    }
    const title = screen.getByText("Fragancia / Aroma");
    expect(classTokens(title)).toContain("type-subheading");
    const block = title.parentElement!;
    for (const c of ["flex", "min-w-0", "flex-wrap", "items-center", "gap-x-3", "gap-y-1"]) {
      expect(classTokens(block)).toContain(c);
    }
  });

  it("keeps the body's content state across a collapse", () => {
    render(
      <Collapsible defaultOpen>
        <CollapsibleHeader>Notes</CollapsibleHeader>
        <CollapsibleBody>
          <input aria-label="Note" />
        </CollapsibleBody>
      </Collapsible>,
    );
    const button = screen.getByRole("button", { name: "Notes" });
    const input = screen.getByLabelText("Note") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "cocoa" } });
    fireEvent.click(button);
    fireEvent.click(button);
    expect((screen.getByLabelText("Note") as HTMLInputElement).value).toBe("cocoa");
  });

  it("adds no text of its own", () => {
    const { button, body } = renderSection({}, { aside: "Completo" });
    expect(button.textContent).toBe("Fragancia / AromaCompleto");
    expect(body.textContent).toBe("Inner link");
  });
});
