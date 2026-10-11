import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup, within } from "@testing-library/react";
import type { CoffeeInventoryItem, Session } from "@/shared/api";
import { SidebarProvider } from "@/shared/ui";

// The session, the token client and the router are replaced by spies so the
// list states can be driven without the network or Next's runtime. Test
// infrastructure only.
const mocks = vi.hoisted(() => ({
  session: { state: "loading" } as Session,
  signIn: vi.fn(),
  request: vi.fn(),
  push: vi.fn(),
  notFound: vi.fn(),
}));
vi.mock("@/features/auth", () => ({
  useSession: () => mocks.session,
  signIn: mocks.signIn,
}));
vi.mock("@/shared/api", () => ({
  publicRequest: vi.fn(),
  request: mocks.request,
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push, replace: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/en/manage/inventory",
  useSearchParams: () => new URLSearchParams(),
  notFound: mocks.notFound,
}));

import { InventoryListClient } from "./InventoryListClient";

// No global test setup in this project, so RTL auto-cleanup does not run.
afterEach(() => {
  cleanup();
});

const TEXTS = {
  eyebrow: "Management",
  heading: "Coffee inventory",
  intro: "The coffees available to create your offerings.",
  signedOut: "Sign in to explore the coffee inventory.",
  signIn: "Sign in",
  empty: "There is no coffee in the inventory.",
  error: "The coffee inventory could not be loaded.",
  retry: "Retry",
  view: "View",
  createOffering: "Create offering",
  process: "Process",
  variety: "Variety",
  roastLevel: "Roast level",
  altitude: "Altitude",
  producer: "Producer",
  certifications: "Certifications",
  roastery: "Roastery",
  roastLot: "Roast lot",
  productionDate: "Production date",
  trigger: "Filters",
  triggerWithCount: "Filters ({count})",
  noMatches: "No results match these filters.",
  clearAll: "Clear all",
  resultCount: "Results: {count}",
};

// The contract's example items.
const ITEMS: CoffeeInventoryItem[] = [
  {
    ulid: "01K5Y4R7N2D9W6T3H8M1Q5V0XC",
    roastLot: "L-2026-014",
    productionDate: "2026-09-19",
    coffee: {
      name: "Huila El Mirador",
      roastLevel: "medium",
      process: "washed",
      variety: "Caturra",
      producer: null,
      country: "Colombia",
      region: "Huila",
      altitude: 1800,
      lot: "HM-07",
      certifications: [{ code: "organic", description: "Certified organic production." }],
    },
    roastery: { name: "Nómada Roasters", description: "Tostador de especialidad en Barcelona." },
  },
  {
    ulid: "01K5Y4R7N2D9W6T3H8M1Q5V0XD",
    roastLot: "L-2026-021",
    productionDate: "2026-09-24",
    coffee: {
      name: "Sidama Bensa",
      roastLevel: "light",
      process: "natural",
      variety: "Heirloom",
      producer: "Bensa Cooperative",
      country: "Ethiopia",
      region: "Sidama",
      altitude: 2100,
      lot: "SB-12",
      certifications: [],
    },
    roastery: { name: "Nómada Roasters", description: "Tostador de especialidad en Barcelona." },
  },
];

const COFFEESHOP: Session = {
  state: "authenticated",
  user: { ulid: "01USER", name: "Lucía", surname: "Pérez", role: "coffeeshop" },
};

function answer(status: number, data: CoffeeInventoryItem[] = []) {
  return { ok: status >= 200 && status < 300, status, json: async () => ({ data }) };
}

function renderList() {
  // The toolbar's trigger reads the sidebar state (task 5.2).
  return render(
    <SidebarProvider>
      <InventoryListClient locale="en" texts={TEXTS} />
    </SidebarProvider>,
  );
}

function skeletonCount(container: HTMLElement): number {
  // Each skeleton card holds three pulsing shapes.
  return container.querySelectorAll(".animate-pulse").length / 3;
}

beforeEach(() => {
  // jsdom has no matchMedia; the sidebar reads the md breakpoint through it.
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
  mocks.session = COFFEESHOP;
  for (const fn of [mocks.signIn, mocks.request, mocks.push, mocks.notFound]) fn.mockReset();
});

describe("InventoryListClient (spec 'Access to the coffee inventory pages')", () => {
  it("Session loading: the heading block and the skeleton cards, no gate message, card or 404", () => {
    mocks.session = { state: "loading" };
    const { container } = renderList();

    expect(screen.getByRole("heading", { level: 1, name: TEXTS.heading })).toBeTruthy();
    expect(skeletonCount(container)).toBe(3);
    expect(screen.queryByText(TEXTS.signedOut)).toBeNull();
    expect(screen.queryByRole("heading", { level: 2 })).toBeNull();
    expect(mocks.notFound).not.toHaveBeenCalled();
  });

  it("Anonymous visitor: the signed-out message and Sign in, no request, sign in for the route", () => {
    mocks.session = { state: "anonymous" };
    renderList();

    expect(screen.getByRole("heading", { level: 1, name: TEXTS.heading })).toBeTruthy();
    expect(screen.getByText(TEXTS.signedOut)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: TEXTS.signIn }));
    expect(mocks.signIn).toHaveBeenCalledWith("/en/manage/inventory");
    expect(mocks.request).not.toHaveBeenCalled();
  });

  it("Another role: the 404 and no inventory request", () => {
    mocks.session = { state: "authenticated", user: { ulid: "01SPEC", role: "specialist" } };
    renderList();

    expect(mocks.notFound).toHaveBeenCalledTimes(1);
    expect(mocks.request).not.toHaveBeenCalled();
  });
});

describe("InventoryListClient (spec 'Coffee inventory list')", () => {
  it("Inventory list eyebrow: the management eyebrow style", () => {
    mocks.request.mockReturnValue(new Promise(() => {}));
    renderList();

    expect(screen.getByText(TEXTS.eyebrow).className).toBe("type-eyebrow-strong");
  });

  it("Success: one card per returned item, in order, and no pagination", async () => {
    mocks.request.mockResolvedValue(answer(200, ITEMS));
    renderList();

    const headings = await screen.findAllByRole("heading", { level: 2 });
    expect(headings.map((heading) => heading.textContent)).toEqual([
      "Huila El Mirador",
      "Sidama Bensa",
    ]);
    expect(mocks.request.mock.calls[0]![0]).toBe("/coffeeInventory");
    expect(screen.queryByRole("navigation")).toBeNull();
  });

  it("Loading: three skeleton cards and no card, empty or error message", () => {
    mocks.request.mockReturnValue(new Promise(() => {}));
    const { container } = renderList();

    expect(skeletonCount(container)).toBe(3);
    expect(screen.queryByRole("heading", { level: 2 })).toBeNull();
    expect(screen.queryByText(TEXTS.empty)).toBeNull();
    expect(screen.queryByText(TEXTS.error)).toBeNull();
  });

  it("Empty: the empty message and no card", async () => {
    mocks.request.mockResolvedValue(answer(200, []));
    renderList();

    expect(await screen.findByText(TEXTS.empty)).toBeTruthy();
    expect(screen.queryByRole("heading", { level: 2 })).toBeNull();
  });

  it("Error and retry: the error message and retry, which reads again", async () => {
    mocks.request.mockResolvedValueOnce(answer(500));
    mocks.request.mockReturnValueOnce(new Promise(() => {}));
    const { container } = renderList();

    expect(await screen.findByText(TEXTS.error)).toBeTruthy();
    expect(screen.queryByRole("heading", { level: 2 })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: TEXTS.retry }));
    expect(mocks.request).toHaveBeenCalledTimes(2);
    expect(skeletonCount(container)).toBe(3);
  });
});

describe("InventoryListClient (spec 'Coffee inventory card')", () => {
  it("Card actions: View in treatment 3 to the detail, Create offering in treatment 1 to New offering", async () => {
    mocks.request.mockResolvedValue(answer(200, ITEMS.slice(0, 1)));
    renderList();

    const card = (await screen.findByRole("heading", { level: 2 })).closest(".rounded-container");
    const view = within(card as HTMLElement).getByRole("button", { name: TEXTS.view });
    const create = within(card as HTMLElement).getByRole("button", { name: TEXTS.createOffering });
    expect(view.className).toContain("bg-action-3-bg");
    expect(create.className).toContain("bg-action-1-bg");
    fireEvent.click(view);
    expect(mocks.push).toHaveBeenLastCalledWith("/en/manage/inventory/01K5Y4R7N2D9W6T3H8M1Q5V0XC");
    fireEvent.click(create);
    expect(mocks.push).toHaveBeenLastCalledWith(
      "/en/manage/offerings/new?inventory=01K5Y4R7N2D9W6T3H8M1Q5V0XC",
    );
  });
});

describe("InventoryListClient (design.md D6 layout)", () => {
  it("puts the heading block 2rem above the toolbar, and the results 1.5rem below it", async () => {
    mocks.request.mockResolvedValue(answer(200, ITEMS));
    renderList();

    await screen.findAllByRole("heading", { level: 2 });
    const headingBlock = screen.getByRole("heading", { level: 1 }).parentElement!;
    expect(headingBlock.parentElement!.className).toBe("flex flex-col gap-8");
    const toolbar = screen.getByRole("button", { name: TEXTS.trigger }).closest("div")!;
    expect(toolbar.parentElement!.className).toBe("flex flex-col gap-6");
  });
});
