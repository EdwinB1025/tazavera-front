import { describe, it, expect, afterEach, beforeAll, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { SidebarProvider } from "./Sidebar";
import { SidebarMenuSub } from "./SidebarMenuSub";
import { ComboboxLoader } from "./ComboboxLoader";

// No global test setup in this project, so RTL auto-cleanup does not run.
afterEach(() => {
  cleanup();
});

// jsdom has no matchMedia; the sidebar reads the md breakpoint through it.
// Test infrastructure only.
beforeAll(() => {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
});

/**
 * The combobox loader (lazy-load-facet-controls design.md D1–D2; spec
 * filtering "Facet comboboxes loaded on first opening"). The combobox module
 * records its import and never resolves, so the loading status stays.
 */
const combobox = vi.hoisted(() => ({ imported: false }));

vi.mock("./Combobox", () => {
  combobox.imported = true;
  return new Promise(() => {});
});

describe("ComboboxLoader", () => {
  it("loads the combobox only at the first opening and shows Loading… meanwhile (spec: First opening while the comboboxes load)", async () => {
    render(
      <SidebarProvider>
        <SidebarMenuSub title="Filters">
          <ComboboxLoader
            label="Coffee"
            options={[]}
            value={null}
            onChange={() => {}}
            texts={{
              searching: "Searching…",
              noMatches: "No matches",
              loadError: "Results could not be loaded",
              optionCount: "Options: {count}",
              loading: "Loading…",
            }}
          />
        </SidebarMenuSub>
      </SidebarProvider>,
    );
    expect(combobox.imported).toBe(false);
    fireEvent.click(screen.getByRole("button", { name: "Filters" }));
    await vi.waitFor(() => expect(combobox.imported).toBe(true));
    expect(screen.getByRole("status").textContent).toBe("Loading…");
  });
});
