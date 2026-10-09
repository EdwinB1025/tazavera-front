import { describe, it, expect, afterEach, beforeAll, beforeEach } from "vitest";
import type { ReactNode } from "react";
import { render, screen, fireEvent, cleanup, act } from "@testing-library/react";
import { FiltersTrigger, SidebarProvider, useSidebar } from "@/shared/ui";

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
  const { open, setOpen, subsectionOpen } = useSidebar();
  return (
    <>
      <output data-testid="open">{String(open)}</output>
      <output data-testid="subsection">{String(subsectionOpen)}</output>
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
  it("renders from md while the sidebar is collapsed or its sub-section closed", () => {
    renderTrigger();
    expect(screen.getByTestId("open").textContent).toBe("true");
    expect(trigger()).not.toBeNull();
    act(() => fireEvent.click(screen.getByRole("button", { name: "toggle" })));
    expect(trigger()).not.toBeNull();
  });

  it("opens the sub-section from md and then hides (spec: Facets open from the toolbar)", () => {
    renderTrigger();
    fireEvent.click(trigger()!);
    expect(screen.getByTestId("subsection").textContent).toBe("true");
    expect(trigger()).toBeNull();
  });

  it("opens the sidebar with the sub-section below md (spec: Facets open from the toolbar)", () => {
    mobile = true;
    renderTrigger();
    fireEvent.click(trigger()!);
    expect(screen.getByTestId("open").textContent).toBe("true");
    expect(screen.getByTestId("subsection").textContent).toBe("true");
  });
});
