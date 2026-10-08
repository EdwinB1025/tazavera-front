import { describe, it, expect, afterEach, beforeAll, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import type { ReactNode } from "react";
import type { Session } from "@/shared/api";
import { SidebarProvider } from "@/shared/ui";
import { AppSidebar, AppSidebarProvider } from "@/widgets/app-sidebar";

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
 * Sidebar frame tests (add-sidebar-slot design.md D4; spec "Management
 * sidebar"). The frame always renders when mounted: the visibility rule lives
 * in `DefaultSidebar`. The route comes from the app router hook, mocked here;
 * test infrastructure only.
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
const TOGGLE = "sidebar.toggle";

function renderFrame(
  frame: ReactNode,
  { session = AUTHENTICATED, entries }: { session?: Session; entries?: ReactNode } = {},
) {
  return render(
    <SidebarProvider>
      <AppSidebarProvider session={session} entries={entries} toggleLabel={TOGGLE}>
        {frame}
      </AppSidebarProvider>
    </SidebarProvider>,
  );
}

describe("AppSidebar frame (design.md D4)", () => {
  it("renders a landmark and a collapse control named by the provider's toggle text", () => {
    renderFrame(<AppSidebar />);
    expect(screen.getByRole("complementary", { name: TOGGLE })).toBeDefined();
    expect(screen.getByRole("button", { name: TOGGLE })).toBeDefined();
  });

  it("renders its children and no navigation on the offerings route", () => {
    pathname = "/es/offerings";
    renderFrame(<AppSidebar>offerings-controls</AppSidebar>, {
      session: ANONYMOUS,
      entries: <p>role-entry</p>,
    });
    expect(screen.getByRole("complementary", { name: TOGGLE })).toBeDefined();
    expect(screen.getByText("offerings-controls")).toBeDefined();
    expect(screen.queryByRole("navigation")).toBeNull();
    expect(screen.queryByText("role-entry")).toBeNull();
  });

  it("renders its children after the navigation", () => {
    pathname = "/es/manage/offerings";
    renderFrame(
      <AppSidebar>
        <p>area-controls</p>
      </AppSidebar>,
    );
    const nav = screen.getByRole("navigation");
    const controls = screen.getByText("area-controls");
    expect(
      nav.compareDocumentPosition(controls) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(nav.contains(controls)).toBe(false);
  });
});
