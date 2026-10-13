import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import type { CoffeeInventoryItem, Session } from "@/shared/api";

// The session, the token client and the router are replaced by spies so the
// detail states can be driven without the network or Next's runtime. Test
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
  usePathname: () => "/en/manage/inventory/01K5Y4R7N2D9W6T3H8M1Q5V0XC",
  notFound: mocks.notFound,
}));

import { InventoryDetailClient } from "./InventoryDetailClient";

// No global test setup in this project, so RTL auto-cleanup does not run.
afterEach(() => {
  cleanup();
});

const TEXTS = {
  eyebrow: "Coffee inventory",
  back: "Back to the coffee inventory",
  createOffering: "Create offering",
  loading: "Loading…",
  error: "The coffee inventory could not be loaded.",
  retry: "Retry",
  signedOut: "Sign in to explore the coffee inventory.",
  signIn: "Sign in",
  notFoundTitle: "Inventory item not found",
  notFoundLine: "It may have been removed, or the link may be wrong.",
  process: "Process",
  variety: "Variety",
  roastLevel: "Roast level",
  altitude: "Altitude",
  producer: "Producer",
  certifications: "Certifications",
  roastery: "Roastery",
  roastLot: "Roast lot",
  productionDate: "Production date",
  coffeeLot: "Coffee lot",
  roasteryDescription: "About the roastery",
};

const ULID = "01K5Y4R7N2D9W6T3H8M1Q5V0XC";

// The contract's first example item.
const ITEM: CoffeeInventoryItem = {
  ulid: ULID,
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
};

const COFFEESHOP: Session = {
  state: "authenticated",
  user: { ulid: "01USER", name: "Lucía", surname: "Pérez", role: "coffeeshop" },
};

function answer(status: number, data: CoffeeInventoryItem[] = []) {
  return { ok: status >= 200 && status < 300, status, json: async () => ({ data }) };
}

function renderDetail(ulid = ULID) {
  return render(<InventoryDetailClient locale="en" ulid={ulid} texts={TEXTS} />);
}

/** The value shown for a row's label. */
function valueOf(label: string): string | null {
  return screen.getByText(label, { selector: "dt" }).nextElementSibling?.textContent ?? null;
}

beforeEach(() => {
  mocks.session = COFFEESHOP;
  for (const fn of [mocks.signIn, mocks.request, mocks.push, mocks.notFound]) fn.mockReset();
});

describe("InventoryDetailClient (spec 'Coffee inventory detail')", () => {
  it("Detail of an item: back link, eyebrow, heading, Create offering, then every field", async () => {
    mocks.request.mockResolvedValue(answer(200, [ITEM]));
    renderDetail();

    const heading = await screen.findByRole("heading", { level: 1, name: "Huila El Mirador" });
    const back = screen.getByRole("link", { name: TEXTS.back });
    const eyebrow = screen.getByText(TEXTS.eyebrow);
    const create = screen.getByRole("button", { name: TEXTS.createOffering });
    const order = [back, eyebrow, heading, create];
    for (let index = 1; index < order.length; index += 1) {
      expect(
        order[index - 1]!.compareDocumentPosition(order[index]!) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    }
    expect(back.getAttribute("href")).toBe("/en/manage/inventory");
    expect(create.className).toContain("bg-action-1-bg");
    fireEvent.click(create);
    expect(mocks.push).toHaveBeenCalledWith(`/en/manage/offerings/new?inventory=${ULID}`);
    expect(mocks.request.mock.calls[0]![0]).toBe("/coffeeInventory");
    expect(
      [TEXTS.process, TEXTS.variety, TEXTS.roastLevel, TEXTS.altitude, TEXTS.certifications,
        TEXTS.roastery, TEXTS.roastLot, TEXTS.productionDate, TEXTS.coffeeLot, "organic",
        TEXTS.roasteryDescription].map(valueOf),
    ).toEqual([
      "washed", "Caturra", "medium", "1800 m", "organic", "Nómada Roasters", "L-2026-014",
      "2026-09-19", "HM-07", "Certified organic production.", "Tostador de especialidad en Barcelona.",
    ]);
  });

  it("Inventory detail eyebrow: the management eyebrow style", async () => {
    mocks.request.mockResolvedValue(answer(200, [ITEM]));
    renderDetail();

    await screen.findByRole("heading", { level: 1, name: "Huila El Mirador" });
    expect(screen.getByText(TEXTS.eyebrow).className).toBe("type-eyebrow-strong");
  });

  it("Detail fills the page width: the back link keeps its width, the content after it stretches", async () => {
    mocks.request.mockResolvedValue(answer(200, [ITEM]));
    renderDetail();

    const heading = await screen.findByRole("heading", { level: 1, name: "Huila El Mirador" });
    const back = screen.getByRole("link", { name: TEXTS.back });
    expect(back.parentElement!.className).toBe("flex flex-col items-start gap-6");
    const content = back.nextElementSibling!;
    expect(content.className).toBe("self-stretch");
    expect(content.contains(heading)).toBe(true);
  });

  it("Detail loading: the back link and the loading status, no heading of the item", () => {
    mocks.request.mockReturnValue(new Promise(() => {}));
    renderDetail();

    expect(screen.getByRole("link", { name: TEXTS.back })).toBeTruthy();
    expect(screen.getByRole("status").textContent).toContain(TEXTS.loading);
    expect(screen.queryByRole("heading", { level: 1 })).toBeNull();
  });

  it("Detail error and retry: the error message and retry, which reads again", async () => {
    mocks.request.mockResolvedValueOnce(answer(500));
    mocks.request.mockReturnValueOnce(new Promise(() => {}));
    renderDetail();

    expect(await screen.findByText(TEXTS.error)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: TEXTS.retry }));
    expect(mocks.request).toHaveBeenCalledTimes(2);
  });

  it("Unknown item: the not-found title, its line and the back button, no retry or back link", async () => {
    mocks.request.mockResolvedValue(answer(200, [ITEM]));
    renderDetail("01UNKNOWN");

    expect(
      await screen.findByRole("heading", { level: 1, name: TEXTS.notFoundTitle }),
    ).toBeTruthy();
    expect(screen.getByText(TEXTS.notFoundLine)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: TEXTS.back }));
    expect(mocks.push).toHaveBeenCalledWith("/en/manage/inventory");
    expect(screen.queryByRole("button", { name: TEXTS.retry })).toBeNull();
    expect(screen.queryByRole("link", { name: TEXTS.back })).toBeNull();
  });
});

describe("InventoryDetailClient (spec 'Access to the coffee inventory pages')", () => {
  it("Another role: the 404 and no inventory request on the detail", () => {
    mocks.session = { state: "authenticated", user: { ulid: "01SPEC", role: "specialist" } };
    renderDetail();

    expect(mocks.notFound).toHaveBeenCalledTimes(1);
    expect(mocks.request).not.toHaveBeenCalled();
  });
});
