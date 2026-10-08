import { describe, it, expect, afterEach, beforeAll, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import type { Session } from "@/shared/api";
import { SidebarProvider } from "@/shared/ui";
import { AppSidebarProvider } from "@/widgets/app-sidebar";
import { NewOfferingSidebarEntries } from "@/pages/new-offering";

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
  usePathname: () => "/es/manage/offerings/new",
}));

const SESSION: Session = {
  state: "authenticated",
  user: { name: "Lucía", surname: "Pérez", role: "coffeeshop" },
};

const LABELS: Record<string, string> = {
  es: "Administrar ofertas",
  en: "Manage offerings",
  ca: "Gestionar ofertes",
};

const LOCATION_LABELS: Record<string, string> = {
  es: "Administrar ubicaciones",
  en: "Manage locations",
  ca: "Administra les ubicacions",
};

const REMOVED = [
  "Mis ofertas",
  "My offerings",
  "Les meves ofertes",
  "Nueva oferta",
  "New offering",
  "Nova oferta",
];

/**
 * The create route's sidebar (design.md D8 as revised by review round 1;
 * spec "Management sidebar entry"): the single "Manage offerings" entry,
 * addressing the list route and marked as the current entry.
 */
describe("NewOfferingSidebarEntries (design.md D8)", () => {
  it.each(["en", "ca"])("renders the Manage offerings entry in %s", (locale) => {
    render(
      <SidebarProvider>
        <AppSidebarProvider session={SESSION} toggleLabel="sidebar.toggle">
          <NewOfferingSidebarEntries locale={locale} />
        </AppSidebarProvider>
      </SidebarProvider>,
    );

    const link = screen.getByRole("link", { name: LABELS[locale]! });
    expect(link.getAttribute("href")).toBe(`/${locale}/manage/offerings`);
    expect(link.getAttribute("aria-current")).toBe("page");
    // Two entries in order, only "Manage offerings" current (add-coffeeshop-location D8).
    const entries = Array.from(link.closest("ul")!.querySelectorAll("a"));
    expect(entries.map((a) => a.textContent)).toEqual([LABELS[locale], LOCATION_LABELS[locale]]);
    expect(entries[1].getAttribute("href")).toBe(`/${locale}/manage/locations`);
    expect(entries[1].hasAttribute("aria-current")).toBe(false);
    expect(
      screen
        .queryAllByRole("link")
        .some((a) => a.getAttribute("href") === `/${locale}/manage/offerings/new`),
    ).toBe(false);
    for (const text of REMOVED) {
      expect(screen.queryByText(text)).toBeNull();
    }
  });
});
