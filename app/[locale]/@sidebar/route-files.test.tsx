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

vi.mock("@/pages/evaluations-list", () => ({
  EvaluationsSidebarScreen: ({ locale }: { locale: string }) => (
    <div data-testid="evaluations-sidebar" data-locale={locale} />
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

type LocaleSearchSlotRoute = {
  default: (props: {
    params: Promise<{ locale: string }>;
    searchParams: Promise<Record<string, string | string[] | undefined>>;
  }) => Promise<ReactNode>;
};

/**
 * The evaluations slot page (add-evaluation-facets spec "Form routes have no
 * facets"): only the list route renders the facets; the form routes have no
 * slot page, so the catch-all default sidebar renders.
 */
describe("the evaluations @sidebar slot route files (add-evaluation-facets)", () => {
  it("renders the facets on manage/evaluations only, not on its form routes", async () => {
    const file = "manage/evaluations/page.tsx";
    const route = (await import(`./${file}`)) as LocaleSearchSlotRoute;
    render(
      await route.default({ params: Promise.resolve({ locale: "en" }), searchParams: Promise.resolve({}) }),
    );
    expect(screen.getByTestId("evaluations-sidebar").getAttribute("data-locale")).toBe("en");
    expect(existsSync(slotFile("manage/evaluations/new/page.tsx"))).toBe(false);
    expect(existsSync(slotFile("manage/evaluations/[ulid]/page.tsx"))).toBe(false);
  });
});
