import { describe, it, expect, afterEach, beforeAll, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import type { Session } from "@/shared/api";
import { AppSidebar } from "@/widgets/app-sidebar";

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
 * Management sidebar tests (design.md D11; spec "Management sidebar"). Written
 * before the slice exists (task 8.2); the import fails to resolve until then,
 * so the file runs and fails as required.
 *
 * The sidebar appears only for an authenticated session on a
 * `/[locale]/manage/*` route (spec: "Hidden outside the management area" —
 * with it hidden, the main area keeps the single column the shell tests
 * assert). It renders the navigation entries contributed by the management
 * area, and with none contributed it renders its region with no entries and
 * no empty placeholder (spec: "No entries contributed"). The route comes from
 * the app router hook, mocked here; test infrastructure only.
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

describe("AppSidebar (spec: Management sidebar)", () => {
  it("appears for an authenticated session on a management route (spec: Shown on a management route)", () => {
    pathname = "/es/manage/offerings";
    render(
      <AppSidebar
        session={AUTHENTICATED}
        entries={<ul><li>offering-one</li></ul>}
        toggleLabel="sidebar.toggle"
      />,
    );
    expect(screen.getByRole("navigation")).toBeDefined();
    expect(screen.getByText("offering-one")).toBeDefined();
  });

  it("is hidden outside the management area (spec: Hidden outside the management area)", () => {
    pathname = "/es";
    const { unmount } = render(<AppSidebar
          session={AUTHENTICATED}
          entries={<ul><li>offering-one</li></ul>}
          toggleLabel="sidebar.toggle"
        />);
    expect(screen.queryByRole("navigation")).toBeNull();
    unmount();

    pathname = "/es/account/profile";
    render(<AppSidebar
          session={AUTHENTICATED}
          entries={<ul><li>offering-one</li></ul>}
          toggleLabel="sidebar.toggle"
        />);
    expect(screen.queryByRole("navigation")).toBeNull();
  });

  it("is hidden while the session is anonymous (spec: Hidden outside the management area)", () => {
    pathname = "/es/manage/evaluations";
    render(<AppSidebar
        session={ANONYMOUS}
        entries={<ul><li>evaluation-one</li></ul>}
        toggleLabel="sidebar.toggle"
      />);
    expect(screen.queryByRole("navigation")).toBeNull();
  });

  it("renders the navigation entries contributed by the management area", () => {
    pathname = "/es/manage/evaluations";
    render(
      <AppSidebar
        session={AUTHENTICATED}
        entries={
          <ul>
            <li>evaluation-one</li>
            <li>evaluation-two</li>
          </ul>
        }
        toggleLabel="sidebar.toggle"
      />,
    );
    expect(screen.getByText("evaluation-one")).toBeDefined();
    expect(screen.getByText("evaluation-two")).toBeDefined();
  });

  it("renders its region with no entries and no empty placeholder (spec: No entries contributed)", () => {
    pathname = "/es/manage/offerings";
    render(<AppSidebar session={AUTHENTICATED} toggleLabel="sidebar.toggle" />);
    const region = screen.getByRole("navigation");
    expect(region.textContent).toBe("");
  });

  it("labels its collapse control with the given text (design summary §3)", () => {
    pathname = "/es/manage/offerings";
    render(<AppSidebar session={AUTHENTICATED} toggleLabel="sidebar.toggle" />);
    expect(
      screen.getByRole("button", { name: "sidebar.toggle" }),
    ).toBeDefined();
  });
});
