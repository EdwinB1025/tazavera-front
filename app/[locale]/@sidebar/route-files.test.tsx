import { describe, it, expect, afterEach, vi } from "vitest";
import type { ComponentType, ReactNode } from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { existsSync } from "node:fs";
import { resolve as pathResolve } from "node:path";

// The route files are the unit under test; the screen they render is asserted
// by its own tests, so it is replaced here by a marker. Test infrastructure
// only.
vi.mock("@/pages/default-sidebar", () => ({
  DefaultSidebarScreen: () => <div data-testid="default-sidebar-screen" />,
}));

// The management slot pages render their route's entry block; each block is
// replaced by a marker that records the locale it receives. Test
// infrastructure only.
vi.mock("@/pages/manage-offerings", () => ({
  ManageOfferingsSidebarEntries: ({ locale }: { locale: string }) => (
    <div data-testid="manage-offerings-sidebar" data-locale={locale} />
  ),
}));
vi.mock("@/pages/new-offering", () => ({
  NewOfferingSidebarEntries: ({ locale }: { locale: string }) => (
    <div data-testid="new-offering-sidebar" data-locale={locale} />
  ),
}));

// No global test setup in this project, so RTL auto-cleanup does not run.
afterEach(() => {
  cleanup();
});

const SLOT_DIR = "app/[locale]/@sidebar";

function slotFile(relative: string): string {
  return pathResolve(process.cwd(), SLOT_DIR, relative);
}

type SlotRoute = { default: ComponentType };

/**
 * The default export of a slot route file. The specifier is computed so the
 * cases can check a route file before the commit that adds it exists.
 */
async function importSlotRoute(specifier: string): Promise<SlotRoute> {
  return (await import(specifier)) as SlotRoute;
}

/**
 * The `@sidebar` slot route files (design.md D2 as revised: the slot's default
 * screen on the locale root and on every deeper path, the optional catch-all
 * gone).
 */
describe("the @sidebar slot route files (design.md D2)", () => {
  it("app/[locale]/@sidebar/page.tsx exists and renders DefaultSidebarScreen", async () => {
    expect(existsSync(slotFile("page.tsx"))).toBe(true);
    const route = await importSlotRoute("./page.tsx");
    const SlotRootPage = route.default;
    render(<SlotRootPage />);
    expect(screen.getByTestId("default-sidebar-screen")).toBeDefined();
  });

  it("app/[locale]/@sidebar/[...rest]/page.tsx exists and renders DefaultSidebarScreen", async () => {
    expect(existsSync(slotFile("[...rest]/page.tsx"))).toBe(true);
    const route = await importSlotRoute("./[...rest]/page.tsx");
    const SlotCatchAllPage = route.default;
    render(<SlotCatchAllPage />);
    expect(screen.getByTestId("default-sidebar-screen")).toBeDefined();
  });

  it("app/[locale]/@sidebar/[[...rest]]/page.tsx does not exist", () => {
    expect(existsSync(slotFile("[[...rest]]/page.tsx"))).toBe(false);
  });
});

type LocaleSlotRoute = {
  default: (props: { params: Promise<{ locale: string }> }) => Promise<ReactNode> | ReactNode;
};

/**
 * The management slot pages (add-offering-management design.md D8 as revised
 * by review round 1): each renders its route's entry block with the locale of
 * its params.
 */
describe("the management @sidebar slot route files (add-offering-management D8)", () => {
  it.each([
    ["manage/offerings/page.tsx", "manage-offerings-sidebar"],
    ["manage/offerings/new/page.tsx", "new-offering-sidebar"],
  ])("app/[locale]/@sidebar/%s exists and renders its entry block", async (file, testId) => {
    expect(existsSync(slotFile(file))).toBe(true);
    const route = (await import(`./${file}`)) as LocaleSlotRoute;
    render(await route.default({ params: Promise.resolve({ locale: "en" }) }));
    expect(screen.getByTestId(testId).getAttribute("data-locale")).toBe("en");
  });
});
