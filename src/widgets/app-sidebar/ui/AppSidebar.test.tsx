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
  it("renders the provider's entries followed by its own on a management route (spec: Shown on a management route)", () => {
    pathname = "/es/manage/offerings";
    renderFrame(<AppSidebar entries={<p>area-entry</p>} />, {
      entries: <p>role-entry</p>,
    });
    const nav = screen.getByRole("navigation");
    const role = screen.getByText("role-entry");
    const area = screen.getByText("area-entry");
    expect(nav.contains(role)).toBe(true);
    expect(nav.contains(area)).toBe(true);
    expect(
      role.compareDocumentPosition(area) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("renders an empty navigation when no entries are contributed (spec: No entries contributed)", () => {
    pathname = "/es/manage/offerings";
    renderFrame(<AppSidebar />);
    expect(screen.getByRole("navigation").textContent).toBe("");
  });

  it("nests the sub-section under the list's entry, marked current (spec: Sidebar entry sub-section)", () => {
    pathname = "/es/offerings";
    renderFrame(
      <AppSidebar
        listEntry={{ label: "Explorar ofertas", href: "/es/offerings" }}
        subsection={{ title: "Filtros", content: <p>facets</p> }}
      />,
      { session: { state: "anonymous" } },
    );
    const entry = screen.getByRole("link", { name: "Explorar ofertas" });
    expect(entry.getAttribute("aria-current")).toBe("page");
    expect(
      entry.closest("li")!.contains(screen.getByRole("button", { name: "Filtros" })),
    ).toBe(true);
  });
});
