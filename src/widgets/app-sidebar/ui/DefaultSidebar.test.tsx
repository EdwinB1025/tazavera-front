import { describe, it, expect, afterEach, beforeAll, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import type { Session } from "@/shared/api";
import { SidebarProvider } from "@/shared/ui";
import { AppSidebarProvider, DefaultSidebar } from "@/widgets/app-sidebar";

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
 * Default sidebar tests (design.md D4; spec "Management sidebar"): the
 * management rule moved here from `AppSidebar`. The route comes from the app
 * router hook, mocked here; test infrastructure only.
 */

let pathname = "/es/manage/offerings";

vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
}));

const AUTHENTICATED: Session = {
  state: "authenticated",
  user: { name: "Andrés", surname: "Gómez", role: "specialist" },
};
const ANONYMOUS: Session = { state: "anonymous" };

function renderDefault(session: Session) {
  return render(
    <SidebarProvider>
      <AppSidebarProvider session={session} toggleLabel="sidebar.toggle">
        <DefaultSidebar />
      </AppSidebarProvider>
    </SidebarProvider>,
  );
}

describe("DefaultSidebar (spec: Management sidebar)", () => {
  it("appears for an authenticated session on a management route (spec: Shown on a management route)", () => {
    for (const route of ["/es/manage/offerings", "/es/manage/evaluations"]) {
      pathname = route;
      const { unmount } = renderDefault(AUTHENTICATED);
      expect(screen.getByRole("complementary")).toBeDefined();
      expect(screen.getByRole("navigation")).toBeDefined();
      unmount();
    }
  });

  it("is hidden outside the management area (spec: Hidden outside the management area)", () => {
    for (const route of ["/es", "/es/account/profile"]) {
      pathname = route;
      const { unmount } = renderDefault(AUTHENTICATED);
      expect(screen.queryByRole("complementary")).toBeNull();
      expect(screen.queryByRole("navigation")).toBeNull();
      unmount();
    }
  });

  it("is hidden while the session is anonymous (spec: Hidden outside the management area)", () => {
    pathname = "/es/manage/evaluations";
    renderDefault(ANONYMOUS);
    expect(screen.queryByRole("complementary")).toBeNull();
    expect(screen.queryByRole("navigation")).toBeNull();
  });
});
