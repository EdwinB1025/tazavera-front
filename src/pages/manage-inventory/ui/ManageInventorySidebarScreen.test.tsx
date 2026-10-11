import { describe, it, expect, afterEach, beforeAll, vi } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";
import type { Session } from "@/shared/api";
import { SidebarProvider } from "@/shared/ui";
import { AppSidebarProvider } from "@/widgets/app-sidebar";
import { ManageInventorySidebarScreen } from "@/pages/manage-inventory";

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
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
});

vi.mock("next/navigation", () => ({
  usePathname: () => "/en/manage/inventory",
  useRouter: () => ({ push: () => {} }),
  useSearchParams: () => new URLSearchParams(),
}));

const SESSION: Session = {
  state: "authenticated",
  user: { name: "Lucía", surname: "Pérez", role: "coffeeshop" },
};

/** The inventory list's sidebar (spec "Coffee inventory sidebar"). */
describe("ManageInventorySidebarScreen", () => {
  it("Entries on the inventory list: the three entries in order, only the last current, with the Filters toggle", () => {
    render(
      <SidebarProvider>
        <AppSidebarProvider session={SESSION} toggleLabel="sidebar.toggle">
          <ManageInventorySidebarScreen locale="en" searchParams={{}} />
        </AppSidebarProvider>
      </SidebarProvider>,
    );
    const links = within(screen.getByRole("navigation")).getAllByRole("link");
    expect(links.map((link) => link.textContent)).toEqual([
      "Manage offerings",
      "Manage locations",
      "Explore coffee inventory",
    ]);
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "/en/manage/offerings",
      "/en/manage/locations",
      "/en/manage/inventory",
    ]);
    expect(links.map((link) => link.getAttribute("aria-current"))).toEqual([null, null, "page"]);
    expect(
      within(screen.getByRole("complementary")).getByRole("button", { name: "Filters" }),
    ).toBeTruthy();
  });
});
