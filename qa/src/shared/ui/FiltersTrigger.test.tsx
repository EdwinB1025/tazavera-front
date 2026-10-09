import { describe, it, expect, afterEach, beforeAll, beforeEach } from "vitest";
import type { ReactNode } from "react";
import { render, screen, fireEvent, cleanup, act } from "@testing-library/react";
import { FiltersTrigger, SIDEBAR_ID, SidebarProvider, useSidebar } from "@/shared/ui";

// No global test setup in this project, so RTL auto-cleanup does not run.
afterEach(() => {
  cleanup();
});

// matchMedia mock whose viewport is chosen per case; `useIsMobile` reads the
// md breakpoint through it. Test infrastructure only.
let mobile = false;
beforeAll(() => {
  window.matchMedia = ((query: string) => ({
    matches: mobile,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
});

beforeEach(() => {
  mobile = false;
});

/** Reads and sets the sidebar state next to the trigger. */
function Probe(): ReactNode {
  const { open, setOpen } = useSidebar();
  return (
    <>
      <output data-testid="open">{String(open)}</output>
      <button type="button" onClick={() => setOpen((value) => !value)}>
        toggle
      </button>
    </>
  );
}

function renderTrigger(label = "Filters") {
  return render(
    <SidebarProvider>
      <FiltersTrigger label={label} />
      <Probe />
    </SidebarProvider>,
  );
}

function trigger(): HTMLElement | null {
  return screen.queryByRole("button", { name: "Filters" });
}

/** The body "Filters" trigger (add-offering-facets design.md D8; spec "Offerings filter toolbar"). */
describe("FiltersTrigger (design.md D8)", () => {
  it("renders below md whatever the sidebar state", () => {
    mobile = true;
    renderTrigger();
    expect(screen.getByTestId("open").textContent).toBe("false");
    expect(trigger()).not.toBeNull();
    act(() => fireEvent.click(screen.getByRole("button", { name: "toggle" })));
    expect(screen.getByTestId("open").textContent).toBe("true");
    expect(trigger()).not.toBeNull();
  });

  // collapse-sidebar-filters: expanded means the sidebar open with its facets
  // sub-section open, which the trigger itself opens.
  it("mirrors the open sidebar and sub-section in aria-expanded and controls the sidebar", () => {
    mobile = true;
    renderTrigger();
    expect(trigger()!.getAttribute("aria-expanded")).toBe("false");
    expect(trigger()!.getAttribute("aria-controls")).toBe(SIDEBAR_ID);
    act(() => fireEvent.click(trigger()!));
    expect(trigger()!.getAttribute("aria-expanded")).toBe("true");
  });

  it("shows the caller's text and focus ring", () => {
    mobile = true;
    renderTrigger("Filters (2)");
    const button = screen.getByRole("button", { name: "Filters (2)" });
    expect(button.getAttribute("class")).toContain("focus-visible:focus-ring");
  });
});
