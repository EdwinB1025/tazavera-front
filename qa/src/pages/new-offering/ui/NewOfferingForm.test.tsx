import { describe, it, expect, vi, afterEach, beforeAll, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup, act } from "@testing-library/react";
import type { CoffeeInventoryItem, Session } from "@/shared/api";

// The session, the token client and the routing module are replaced by spies
// so the form can be driven without the network or Next's runtime; the
// shared combobox runs as shipped. Test infrastructure only.
const mocks = vi.hoisted(() => ({
  session: { state: "loading" } as Session,
  signIn: vi.fn(),
  requestProfileWrite: vi.fn(),
  request: vi.fn(),
  publicRequest: vi.fn(),
  notFound: vi.fn(),
  // Cancel is a route button (render-navigation-actions-as-buttons).
  push: vi.fn(),
}));
vi.mock("@/features/auth", () => ({
  useSession: () => mocks.session,
  signIn: mocks.signIn,
  requestProfileWrite: mocks.requestProfileWrite,
}));
vi.mock("@/shared/api", () => ({
  request: mocks.request,
  publicRequest: mocks.publicRequest,
}));
vi.mock("next/navigation", () => ({
  notFound: mocks.notFound,
  useRouter: () => ({ push: mocks.push }),
}));

import { NewOfferingForm } from "@/pages/new-offering/ui/NewOfferingForm";

// jsdom lacks ResizeObserver (Radix popper, cmdk list) and scrollIntoView
// (cmdk scrolls the active option into view). Test-only stubs.
beforeAll(() => {
  if (!("ResizeObserver" in globalThis)) {
    globalThis.ResizeObserver = class {
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
    } as unknown as typeof ResizeObserver;
  }
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = () => {};
  }
});

// No global test setup in this project, so RTL auto-cleanup does not run.
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

/**
 * The create form (design.md D4, D5, D6, D9, D10; spec "Creating offerings"
 * and "Access to the management area"). Written before `./NewOfferingForm`
 * exists (task 6.1).
 */

// Typed by the form's props where it is passed, so a key the form does not
// read yet is no type error.
const TEXTS = {
  signedOutMessage: "Sign in to manage your offerings.",
  signInLabel: "Sign in",
  inventoryLabel: "Inventory item",
  inventoryHelp: "Type at least 2 letters of the coffee name.",
  inventorySearching: "Searching…",
  inventoryNoMatches: "No matches",
  inventorySearchError: "Results could not be loaded",
  inventoryRequired: "Choose an inventory item.",
  inventoryLotCaption: "Lot:",
  inventoryProducedCaption: "Produced on:",
  optionCount: "Options: {count}",
  locationsLegend: "Locations",
  locationsLoading: "Loading your locations…",
  locationsEmpty: "You have no locations registered.",
  locationsError: "Your locations could not be loaded.",
  retryLabel: "Retry",
  submitLabel: "Create offerings",
  cancelLabel: "Cancel",
  createError: "The offerings could not be created. Check the data and try again.",
  createdStatus: "Offerings created:",
  viewMyOfferings: "View my offerings",
};

const COFFEESHOP: Session = {
  state: "authenticated",
  user: { ulid: "01USER", role: "coffeeshop", name: "Tazavera" },
};

const MIRADOR: CoffeeInventoryItem = {
  ulid: "01I1",
  roastLot: "L-2026-014",
  productionDate: "2026-09-19",
  coffee: { name: "Huila El Mirador", country: "Colombia", process: "washed" },
  roastery: { name: "Nómada Roasters" },
};

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const GRACIA = { ulid: "01L1", name: "Tazavera Gràcia" };
const BORN = { ulid: "01L2", name: "Tazavera Born" };

// The create and locations answers of each test; the inventory search
// answers as the API would.
let createAnswer: () => Promise<Response>;
let locationsAnswer: () => Promise<Response>;

beforeEach(() => {
  mocks.session = COFFEESHOP;
  mocks.signIn.mockReset();
  mocks.requestProfileWrite.mockReset();
  mocks.notFound.mockReset();
  mocks.request.mockReset();
  createAnswer = async () => jsonResponse(201, { data: [{}, {}], message: "Created" });
  locationsAnswer = async () => jsonResponse(200, { data: [GRACIA, BORN] });
  mocks.request.mockImplementation(async (path: string, init?: RequestInit) => {
    if (path.startsWith("/coffeeInventory")) return jsonResponse(200, { data: [MIRADOR] });
    if (path === "/locations") return locationsAnswer();
    if (path === "/offerings" && init?.method === "POST") return createAnswer();
    throw new Error(`unexpected request ${path}`);
  });
});

function renderForm() {
  return render(<NewOfferingForm locale="en" texts={TEXTS} />);
}

function input(): HTMLInputElement {
  return screen.getByRole("combobox", { name: /Inventory item/ }) as HTMLInputElement;
}

function submitButton(): HTMLElement {
  return screen.getByRole("button", { name: TEXTS.submitLabel });
}

function createCalls() {
  return mocks.request.mock.calls.filter(
    ([path, init]) => path === "/offerings" && init?.method === "POST",
  );
}

async function chooseMirador(): Promise<void> {
  vi.useFakeTimers();
  fireEvent.change(input(), { target: { value: "hui" } });
  await act(async () => {
    vi.advanceTimersByTime(300);
  });
  await act(async () => {});
  fireEvent.click(screen.getByRole("option", { name: /Huila El Mirador/ }));
  vi.useRealTimers();
}

async function submit(): Promise<void> {
  await act(async () => {
    fireEvent.click(submitButton());
  });
  await act(async () => {});
}

describe("NewOfferingForm — create (design.md D5, D10)", () => {
  it("submitting with an item sends the create call with its ulid", async () => {
    renderForm();
    await chooseMirador();
    await submit();
    expect(createCalls()).toHaveLength(1);
    expect(JSON.parse(createCalls()[0]![1].body)).toMatchObject({ coffeeInventoryId: "01I1" });
  });

  it.each([500])("on a %i the form error shows and the chosen values are kept", async (status) => {
    createAnswer = async () => jsonResponse(status, { message: "Rejected" });
    renderForm();
    await chooseMirador();
    await submit();
    const alerts = screen.getAllByRole("alert");
    expect(alerts).toHaveLength(1);
    expect(alerts[0]!.textContent).toBe(TEXTS.createError);
    expect(input().value).toBe("Huila El Mirador");
    expect(screen.getByText("Lot: L-2026-014 · Produced on: 2026-09-19")).toBeTruthy();
    expect(screen.queryByText("Rejected")).toBeNull();
  });

  it("on a transport failure the form error shows", async () => {
    createAnswer = async () => {
      throw new TypeError("Failed to fetch");
    };
    renderForm();
    await chooseMirador();
    await submit();
    expect(screen.getByRole("alert").textContent).toBe(TEXTS.createError);
  });
});
