import { describe, it, expect, afterEach, vi } from "vitest";
import type { ComponentType } from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { existsSync } from "node:fs";
import { resolve as pathResolve } from "node:path";

// The route files are the unit under test; the screen they render is asserted
// by its own tests, so it is replaced here by a marker. Test infrastructure
// only.
vi.mock("@/pages/default-sidebar", () => ({
  DefaultSidebarScreen: () => <div data-testid="default-sidebar-screen" />,
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
