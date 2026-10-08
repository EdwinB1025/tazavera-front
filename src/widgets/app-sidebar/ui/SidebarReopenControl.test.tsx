import { describe, it, expect, afterEach, beforeAll, vi } from "vitest";
import {
  render,
  screen,
  cleanup,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import type { ReactNode } from "react";
import type { Session } from "@/shared/api";
import { SidebarProvider, SIDEBAR_ID } from "@/shared/ui";
import {
  AppSidebar,
  AppSidebarProvider,
  SidebarReopenControl,
} from "@/widgets/app-sidebar";

// No global test setup in this project, so RTL auto-cleanup does not run.
afterEach(() => {
  cleanup();
  mobile = false;
});

// matchMedia mock whose viewport each case sets before rendering, and the
// Radix measurements jsdom lacks. Test infrastructure only.
let mobile = false;
beforeAll(() => {
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
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

vi.mock("next/navigation", () => ({
  usePathname: () => "/es/manage/offerings",
}));

/**
 * Re-open control tests (design.md D3, D6; spec "Sidebar re-open control").
 */

const AUTHENTICATED: Session = {
  state: "authenticated",
  user: { name: "Andrés", surname: "Gómez", role: "specialist" },
};
const TOGGLE = "sidebar.toggle";

function renderControl(sidebar?: ReactNode) {
  return render(
    <SidebarProvider>
      <AppSidebarProvider session={AUTHENTICATED} toggleLabel={TOGGLE}>
        <header>
          <SidebarReopenControl />
        </header>
        {sidebar}
      </AppSidebarProvider>
    </SidebarProvider>,
  );
}

describe("SidebarReopenControl (spec: Sidebar re-open control)", () => {
  it("renders nothing without a sidebar (spec: No control without a sidebar)", () => {
    renderControl();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("renders nothing while the sidebar is expanded from md (spec: Control hidden while expanded)", () => {
    renderControl(<AppSidebar />);
    expect(screen.getAllByRole("button", { name: TOGGLE })).toHaveLength(1);
    expect(
      screen.getByRole("complementary").contains(
        screen.getByRole("button", { name: TOGGLE }),
      ),
    ).toBe(true);
  });

  it("is shown, named and focused once the sidebar collapses (spec: Control shown while collapsed)", () => {
    renderControl(<AppSidebar />);
    fireEvent.click(screen.getByRole("button", { name: TOGGLE }));
    expect(screen.queryByRole("complementary")).toBeNull();
    const control = screen.getByRole("button", { name: TOGGLE });
    expect(control.getAttribute("aria-expanded")).toBe("false");
    expect(control.getAttribute("aria-controls")).toBe(SIDEBAR_ID);
    expect(control.className).toContain("bg-nav-button-bg");
    expect(document.activeElement).toBe(control);
  });

  it("re-opens the sidebar and focuses its collapse control (spec: Re-opening the sidebar)", () => {
    renderControl(<AppSidebar />);
    fireEvent.click(screen.getByRole("button", { name: TOGGLE }));
    fireEvent.click(screen.getByRole("button", { name: TOGGLE }));
    const sidebar = screen.getByRole("complementary");
    const buttons = screen.getAllByRole("button", { name: TOGGLE });
    expect(buttons).toHaveLength(1);
    expect(sidebar.contains(buttons[0]!)).toBe(true);
    expect(document.activeElement).toBe(buttons[0]);
  });

  it("opens the overlay below md and gets focus back on dismissal (spec: Opening on a small viewport)", async () => {
    mobile = true;
    renderControl(<AppSidebar />);
    expect(screen.queryByRole("dialog")).toBeNull();
    const control = screen.getByRole("button", { name: TOGGLE });
    expect(control.getAttribute("aria-expanded")).toBe("false");
    control.focus();
    fireEvent.click(control);
    const dialog = screen.getByRole("dialog");
    fireEvent.keyDown(dialog, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
    // the dialog returns focus once it has unmounted (Radix, asynchronously)
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole("button", { name: TOGGLE }),
      ),
    );
  });
});
