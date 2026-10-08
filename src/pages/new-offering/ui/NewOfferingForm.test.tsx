import { describe, it, expect, vi, afterEach, beforeAll, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup, act, within } from "@testing-library/react";
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
vi.mock("next/navigation", () => ({ notFound: mocks.notFound }));

import { NewOfferingForm } from "./NewOfferingForm";

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
  stepUpMessage: "To continue, confirm your identity.",
  stepUpLabel: "Confirm your identity",
};

const ROUTE = "/en/manage/offerings/new";

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

function locationCalls() {
  return mocks.request.mock.calls.filter(([path]) => path === "/locations");
}

/** Renders the form and lets the locations request settle. */
async function renderLoaded() {
  renderForm();
  await act(async () => {});
}

async function submit(): Promise<void> {
  await act(async () => {
    fireEvent.click(submitButton());
  });
  await act(async () => {});
}

describe("NewOfferingForm — gate (design.md D6)", () => {
  it("while the session resolves, renders the form panel with its controls unavailable", () => {
    mocks.session = { state: "loading" };
    renderForm();
    expect(input().disabled).toBe(true);
    expect(submitButton().hasAttribute("disabled")).toBe(true);
    expect(screen.queryByText(TEXTS.signedOutMessage)).toBeNull();
  });

  it("an anonymous visitor sees the signed-out message and Sign in in place of the form", () => {
    mocks.session = { state: "anonymous" };
    renderForm();
    expect(screen.getByText(TEXTS.signedOutMessage)).toBeTruthy();
    expect(screen.queryByRole("combobox")).toBeNull();
    expect(screen.queryByRole("button", { name: TEXTS.submitLabel })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: TEXTS.signInLabel }));
    expect(mocks.signIn).toHaveBeenCalledTimes(1);
    expect(mocks.signIn).toHaveBeenCalledWith(ROUTE);
  });

  it("another role gets the 404", () => {
    mocks.session = {
      state: "authenticated",
      user: { ulid: "01SPEC", role: "specialist", name: "Ana" },
    } as Session;
    renderForm();
    expect(mocks.notFound).toHaveBeenCalledTimes(1);
  });
});

describe("NewOfferingForm — create (design.md D5, D10)", () => {
  it("submitting with no item chosen shows the error, marks the field invalid, focuses it and sends nothing", async () => {
    renderForm();
    await submit();
    const error = screen.getByText(TEXTS.inventoryRequired);
    expect(input().getAttribute("aria-invalid")).toBe("true");
    expect(input().getAttribute("aria-describedby")?.split(" ")).toContain(error.id);
    expect(document.activeElement).toBe(input());
    expect(createCalls()).toHaveLength(0);
  });

  it("on 201 the status shows the created count and the link to the list, and the choice resets", async () => {
    renderForm();
    await chooseMirador();
    await submit();
    // The combobox keeps its own option-count status; the form's is the one
    // carrying the created count.
    const region = screen
      .getAllByRole("status")
      .find((node) => node.textContent?.includes(TEXTS.createdStatus))!;
    expect(region.textContent).toContain(`${TEXTS.createdStatus} 2`);
    const link = within(region).getByRole("link", { name: TEXTS.viewMyOfferings });
    expect(link.getAttribute("href")).toBe("/en/manage/offerings");
    expect(input().value).toBe("");
    expect(screen.getByText(TEXTS.inventoryHelp)).toBeTruthy();
    expect(screen.queryByText("Created")).toBeNull();
  });

  it.each([422])("on a %i the form error shows and the chosen values are kept", async (status) => {
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

  it("on 403 the single alert region holds the step-up text and action, values kept", async () => {
    createAnswer = async () => jsonResponse(403, { message: "Forbidden" });
    renderForm();
    await chooseMirador();
    await submit();
    const alerts = screen.getAllByRole("alert");
    expect(alerts).toHaveLength(1);
    const region = alerts[0]!;
    expect(region.textContent).toContain(TEXTS.stepUpMessage);
    const action = within(region).getByRole("button", { name: TEXTS.stepUpLabel });
    // Neither the text nor the action carries a role of its own.
    expect(region.querySelectorAll("[role]")).toHaveLength(0);
    expect(input().value).toBe("Huila El Mirador");
    fireEvent.click(action);
    expect(mocks.requestProfileWrite).toHaveBeenCalledTimes(1);
    expect(mocks.requestProfileWrite).toHaveBeenCalledWith(ROUTE);
    expect(input().value).toBe("Huila El Mirador");
  });
});

describe("NewOfferingForm — locations (design.md D10)", () => {
  it("shows the loading line while GET /locations runs", async () => {
    locationsAnswer = () => new Promise(() => {});
    renderForm();
    await act(async () => {});
    expect(locationCalls()).toHaveLength(1);
    expect(screen.getByText(TEXTS.locationsLoading)).toBeTruthy();
    expect(screen.queryAllByRole("checkbox")).toHaveLength(0);
  });

  it("renders one checkbox per location under the legend, none preselected with two", async () => {
    await renderLoaded();
    const group = screen.getByRole("group", { name: /Locations/ });
    expect(within(group).getByRole("checkbox", { name: "Tazavera Gràcia" })).toBeTruthy();
    expect(within(group).getByRole("checkbox", { name: "Tazavera Born" })).toBeTruthy();
    for (const box of within(group).getAllByRole("checkbox")) {
      expect((box as HTMLInputElement).checked).toBe(false);
    }
  });

  it("preselects the only location of a coffeeshop with exactly one", async () => {
    locationsAnswer = async () => jsonResponse(200, { data: [GRACIA] });
    await renderLoaded();
    const boxes = screen.getAllByRole("checkbox");
    expect(boxes).toHaveLength(1);
    expect((boxes[0] as HTMLInputElement).checked).toBe(true);
  });

  it("with no locations, shows the empty message and the submit action is unavailable", async () => {
    locationsAnswer = async () => jsonResponse(200, { data: [] });
    await renderLoaded();
    expect(screen.getByText(TEXTS.locationsEmpty)).toBeTruthy();
    expect(submitButton().hasAttribute("disabled")).toBe(true);
  });

  it("on a failure shows the error line, and Retry refetches through the loading state", async () => {
    locationsAnswer = async () => jsonResponse(500, { message: "Server error" });
    await renderLoaded();
    expect(screen.getByText(TEXTS.locationsError)).toBeTruthy();
    expect(screen.queryByText("Server error")).toBeNull();

    let resolve!: (response: Response) => void;
    locationsAnswer = () => new Promise((res) => (resolve = res));
    fireEvent.click(screen.getByRole("button", { name: TEXTS.retryLabel }));
    await act(async () => {});
    expect(locationCalls()).toHaveLength(2);
    expect(screen.getByText(TEXTS.locationsLoading)).toBeTruthy();
    await act(async () => {
      resolve(jsonResponse(200, { data: [GRACIA, BORN] }));
    });
    expect(screen.getAllByRole("checkbox")).toHaveLength(2);
  });

  it("submits the selected locations", async () => {
    await renderLoaded();
    fireEvent.click(screen.getByRole("checkbox", { name: "Tazavera Born" }));
    await chooseMirador();
    await submit();
    expect(JSON.parse(createCalls()[0]![1].body)).toEqual({
      coffeeInventoryId: "01I1",
      locations: ["01L2"],
    });
  });

  it("with an item and no location selected the request is sent, and the API's rejection shows the form error", async () => {
    createAnswer = async () => jsonResponse(422, { message: "The locations field is required." });
    await renderLoaded();
    await chooseMirador();
    await submit();
    expect(createCalls()).toHaveLength(1);
    expect(JSON.parse(createCalls()[0]![1].body)).toEqual({
      coffeeInventoryId: "01I1",
      locations: [],
    });
    expect(screen.getByRole("alert").textContent).toBe(TEXTS.createError);
  });

  it("after a 201 the location checkboxes reset", async () => {
    await renderLoaded();
    fireEvent.click(screen.getByRole("checkbox", { name: "Tazavera Born" }));
    await chooseMirador();
    await submit();
    for (const box of screen.getAllByRole("checkbox")) {
      expect((box as HTMLInputElement).checked).toBe(false);
    }
  });
});

describe("NewOfferingForm — section card panel (design.md D15)", () => {
  // The panel's old local classes (MVC `.tz-form-main`): never on the form or
  // any of its ancestors.
  const OLD_PANEL_CLASSES = ["border-2", "bg-surface-form"];

  function expectSectionCardPanel(container: HTMLElement): void {
    const form = container.querySelector("form");
    expect(form).not.toBeNull();
    expect(form!.className).toBe("flex flex-col gap-6");

    const card = form!.closest(".bg-surface-card");
    expect(card).not.toBeNull();
    for (const cls of [
      "bg-surface-card",
      "border",
      "border-border-subtle",
      "rounded-container",
      "shadow-lg",
      "w-full",
      "md:max-w-160",
    ]) {
      expect(card!.classList.contains(cls), cls).toBe(true);
    }
    expect(card!.classList.contains("border-l-4")).toBe(false);
    // No header band.
    expect(card!.querySelector(".bg-surface-section")).toBeNull();

    for (let node: Element | null = form; node !== null; node = node.parentElement) {
      for (const cls of OLD_PANEL_CLASSES) {
        expect(node.classList.contains(cls), `${node.tagName} ${cls}`).toBe(false);
      }
    }
  }

  it("the signed-in form sits in a section card with no header band", async () => {
    const { container } = renderForm();
    await act(async () => {});
    expectSectionCardPanel(container);
  });

  it("while the session resolves, the form sits in the same section card", () => {
    mocks.session = { state: "loading" };
    const { container } = renderForm();
    expectSectionCardPanel(container);
  });
});
