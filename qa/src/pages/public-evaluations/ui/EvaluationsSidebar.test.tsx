import { describe, it, expect, afterEach, beforeAll, beforeEach, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { existsSync } from "node:fs";
import { resolve as pathResolve } from "node:path";
import type { ReactNode } from "react";
import type { OfferingResult } from "@/entities/offering";
import { SidebarProvider } from "@/shared/ui";
import { AppSidebarProvider } from "@/widgets/app-sidebar";

/**
 * The public list's sidebar screen (design.md D5, D7; spec "Public
 * evaluations filter sidebar"; tasks 2.9): the `AppSidebar` frame with no
 * navigation, the public facet panel, and the coffee and active-offering
 * reads on the server.
 */

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
  if (!("ResizeObserver" in globalThis)) {
    globalThis.ResizeObserver = class {
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
    } as unknown as typeof ResizeObserver;
  }
});

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/en/evaluations",
  useSearchParams: () => new URLSearchParams(),
}));

const fetchCoffees = vi.fn();
vi.mock("@/shared/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/shared/api")>()),
  fetchCoffees: () => fetchCoffees(),
}));

const fetchOffering = vi.fn<(ulid: string) => Promise<OfferingResult>>();
vi.mock("@/entities/offering", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/entities/offering")>()),
  fetchOffering: (ulid: string) => fetchOffering(ulid),
}));

import { EvaluationsSidebar } from "@/pages/public-evaluations/ui/EvaluationsSidebar";

async function renderSidebar(searchParams: Record<string, string>) {
  const screenNode: ReactNode = await EvaluationsSidebar({ locale: "en", searchParams });
  return render(
    <SidebarProvider>
      <AppSidebarProvider session={{ state: "anonymous" }} toggleLabel="Toggle sidebar">
        {screenNode}
      </AppSidebarProvider>
    </SidebarProvider>,
  );
}

beforeEach(() => {
  fetchCoffees.mockReset().mockResolvedValue([{ process: "washed" }, { process: "natural" }]);
  fetchOffering.mockReset().mockResolvedValue({
    status: "found",
    offering: {
      ulid: "01JOFFERA",
      location: { name: "Tazavera" },
      coffeeInventory: { coffee: { name: "Huila" } },
    },
  });
});
afterEach(cleanup);

describe("EvaluationsSidebar (design.md D7)", () => {
  it("renders the frame with no navigation and the facet panel as a search landmark", async () => {
    await renderSidebar({});
    expect(screen.queryByRole("navigation")).toBeNull();
    expect(screen.queryByRole("separator")).toBeNull();
    const panel = screen.getByRole("search", { name: "Filters" });
    expect(within(panel).getByRole("radio", { name: "washed", hidden: true })).toBeDefined();
    expect(fetchCoffees).toHaveBeenCalledTimes(1);
    expect(fetchOffering).not.toHaveBeenCalled();
  });

  it("reads the active offering on the server and labels its option", async () => {
    await renderSidebar({ offeringId: "01JOFFERA" });
    expect(fetchOffering).toHaveBeenCalledWith("01JOFFERA");
    expect(screen.getByRole("radio", { name: "Huila · Tazavera", hidden: true })).toBeDefined();
  });

  it("has no slot page under the view route, which falls to the catch-all", () => {
    const slot = pathResolve(process.cwd(), "app/[locale]/@sidebar");
    expect(existsSync(pathResolve(slot, "evaluations/page.tsx"))).toBe(true);
    expect(existsSync(pathResolve(slot, "evaluations/[ulid]"))).toBe(false);
    expect(existsSync(pathResolve(slot, "[...rest]/page.tsx"))).toBe(true);
  });
});
