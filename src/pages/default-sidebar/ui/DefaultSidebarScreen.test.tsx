import { describe, it, expect, afterEach, beforeAll, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import type { Session } from "@/shared/api";
import { SidebarProvider } from "@/shared/ui";
import { AppSidebarProvider } from "@/widgets/app-sidebar";
import { DefaultSidebarScreen } from "@/pages/default-sidebar";

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

let pathname = "/es/manage/offerings";

vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
}));

const AUTHENTICATED: Session = {
  state: "authenticated",
  user: { name: "Andrés", surname: "Gómez", role: "specialist" },
};

function renderScreen() {
  return render(
    <SidebarProvider>
      <AppSidebarProvider session={AUTHENTICATED} toggleLabel="sidebar.toggle">
        <DefaultSidebarScreen />
      </AppSidebarProvider>
    </SidebarProvider>,
  );
}

/** The `@sidebar` default and catch-all screen (design.md D2). */
describe("DefaultSidebarScreen (design.md D2)", () => {
  it("renders the management sidebar on a management route", () => {
    pathname = "/es/manage/offerings";
    renderScreen();
    expect(screen.getByRole("complementary")).toBeDefined();
  });

  it("renders nothing on any other route", () => {
    pathname = "/es/about";
    renderScreen();
    expect(screen.queryByRole("complementary")).toBeNull();
  });
});
