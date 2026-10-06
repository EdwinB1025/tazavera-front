import { describe, it, expect, afterEach, beforeAll, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import type { Session } from "@/shared/api";
import { SidebarProvider } from "@/shared/ui";
import { AppSidebarProvider } from "@/widgets/app-sidebar";
import { OfferingsSidebarScreen } from "@/pages/offerings-sidebar";

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

vi.mock("next/navigation", () => ({
  usePathname: () => "/es/offerings",
}));

const SESSIONS: Record<string, Session> = {
  anonymous: { state: "anonymous" },
  loading: { state: "loading" },
  coffeeshop: {
    state: "authenticated",
    user: { name: "Lucía", surname: "Pérez", role: "coffeeshop" },
  },
};

/**
 * The offerings slot screen (design.md D9; spec "Shown on the offerings
 * list"): the sidebar for every session state, with no navigation entries.
 */
describe("OfferingsSidebarScreen (design.md D9)", () => {
  it.each(Object.keys(SESSIONS))(
    "renders the sidebar with no navigation for a %s session",
    (key) => {
      render(
        <SidebarProvider>
          <AppSidebarProvider session={SESSIONS[key]!} toggleLabel="sidebar.toggle">
            <OfferingsSidebarScreen />
          </AppSidebarProvider>
        </SidebarProvider>,
      );
      expect(screen.getByRole("complementary")).toBeDefined();
      expect(screen.queryByRole("navigation")).toBeNull();
    },
  );
});
