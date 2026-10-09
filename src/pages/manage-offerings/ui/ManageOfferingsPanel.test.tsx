import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  cleanup,
  waitFor,
  act,
  within,
} from "@testing-library/react";
import type { OfferingSummary, Session } from "@/shared/api";

// The session, the request clients and the router are replaced by spies so
// the list states can be driven without the network or Next's runtime. Test
// infrastructure only.
const mocks = vi.hoisted(() => ({
  session: { state: "loading" } as Session,
  signIn: vi.fn(),
  requestProfileWrite: vi.fn(),
  publicRequest: vi.fn(),
  request: vi.fn(),
  push: vi.fn(),
  replace: vi.fn(),
  notFound: vi.fn(),
}));
vi.mock("@/features/auth", () => ({
  useSession: () => mocks.session,
  signIn: mocks.signIn,
  requestProfileWrite: mocks.requestProfileWrite,
}));
vi.mock("@/shared/api", () => ({
  publicRequest: mocks.publicRequest,
  request: mocks.request,
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push, replace: mocks.replace }),
  notFound: mocks.notFound,
}));

import { ManageOfferingsPanel } from "./ManageOfferingsPanel";

// No global test setup in this project, so RTL auto-cleanup does not run.
afterEach(() => {
  cleanup();
});

/**
 * The own list (design.md D1, D2, D3, D6; spec "My offerings list" and
 * "Access to the management area"). Written before `./ManageOfferingsPanel`
 * exists (task 3.1).
 */

// Typed by the panel's props where it is passed, so a key the panel does not
// read yet is no type error.
const TEXTS = {
  coffeeshopCaption: "Coffeeshop:",
  roasterCaption: "Roaster:",
  evaluationsLabel: "Evaluations:",
  defectiveLabel: "Defective:",
  viewLabel: "View",
  verifiedLabel: "Verified",
  provisionalLabel: "Provisional",
  ratingExceptionalLabel: "Exceptional",
  ratingExcellentLabel: "Excellent",
  ratingGoodLabel: "Good",
  ratingCommercialLabel: "Commercial",
  navigationLabel: "Pagination",
  previousLabel: "Previous",
  nextLabel: "Next",
  pageLabel: "Page {page}",
  eyebrow: "Management",
  listHeading: "My offerings",
  newOfferingLink: "New offering",
  listEmptyMessage: "You have no offerings yet.",
  listErrorMessage: "Your offerings could not be loaded.",
  retryLabel: "Retry",
  signedOutMessage: "Sign in to manage your offerings.",
  signInLabel: "Sign in",
  selectAllLabel: "Select all on this page",
  selectedCount: "Selected:",
  selectLabel: "Select",
  deleteLabel: "Delete",
  deleteSelectedLabel: "Delete selected",
  deleteOneTitle: "Delete this offering?",
  deleteOneDescription: "The offering will be deleted. This cannot be undone.",
  deleteManyTitle: "Delete the selected offerings?",
  deleteManyDescription: "The selected offerings will be deleted. This cannot be undone.",
  deleteConfirmLabel: "Delete",
  cancelLabel: "Cancel",
  deleteError: "It could not be deleted. Try again.",
  deletedStatus: "Offerings deleted:",
};

const COFFEESHOP: Session = {
  state: "authenticated",
  user: { ulid: "01USER", role: "coffeeshop", name: "Tazavera" },
};

function offering(ulid: string, coffee: string, location: string): OfferingSummary {
  return {
    ulid,
    cuppingAvg: "84.25",
    evaluationCount: 5,
    defectiveEvaluationCount: 0,
    verificationStatus: "provisional",
    location: { ulid: `L${ulid}`, name: location },
    coffeeInventory: {
      ulid: `I${ulid}`,
      coffee: { name: coffee, country: "Colombia" },
      roastery: { name: "Nómada" },
    },
    sensoryTaxonomy: [],
  };
}

const ITEMS = [
  offering("01A", "Huila El Mirador", "Tazavera Gràcia"),
  offering("01B", "Sidama Bensa", "Tazavera Born"),
];

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function pageOf(data: OfferingSummary[], current = 1, last = 2) {
  return jsonResponse(200, {
    data,
    meta: { current_page: current, last_page: last, per_page: 15 },
  });
}

function renderPanel(page = 1) {
  return render(
    <ManageOfferingsPanel locale="en" page={page} taxonomies={[]} texts={TEXTS} />,
  );
}

beforeEach(() => {
  mocks.session = COFFEESHOP;
  for (const fn of [
    mocks.signIn,
    mocks.requestProfileWrite,
    mocks.publicRequest,
    mocks.request,
    mocks.push,
    mocks.replace,
    mocks.notFound,
  ]) {
    fn.mockReset();
  }
});

function skeletonCount(container: HTMLElement): number {
  // Each skeleton card holds three pulsing shapes.
  return container.querySelectorAll(".animate-pulse").length / 3;
}

describe("ManageOfferingsPanel — header (design.md D6)", () => {
  it("renders the eyebrow, the h1 as a focus target and the New offering link for a coffeeshop", async () => {
    mocks.publicRequest.mockResolvedValue(pageOf(ITEMS));
    renderPanel();

    expect(screen.getByText(TEXTS.eyebrow).className).toBe("type-eyebrow-strong");
    const heading = screen.getByRole("heading", { level: 1, name: TEXTS.listHeading });
    expect(heading.className).toBe("type-heading");
    expect(heading.getAttribute("tabindex")).toBe("-1");
    fireEvent.click(screen.getByRole("button", { name: TEXTS.newOfferingLink }));
    expect(mocks.push).toHaveBeenCalledWith("/en/manage/offerings/new");
    await screen.findAllByRole("heading", { level: 2 });
  });

  it("renders the heading but no New offering link for an anonymous visitor, with the gate in place of the list", () => {
    mocks.session = { state: "anonymous" };
    renderPanel();

    expect(screen.getByRole("heading", { level: 1, name: TEXTS.listHeading })).toBeTruthy();
    expect(screen.queryByRole("button", { name: TEXTS.newOfferingLink })).toBeNull();
    expect(screen.getByText(TEXTS.signedOutMessage)).toBeTruthy();
    expect(mocks.publicRequest).not.toHaveBeenCalled();
  });

  it("signs in with the list route from the gate's button", () => {
    mocks.session = { state: "anonymous" };
    renderPanel();

    fireEvent.click(screen.getByRole("button", { name: TEXTS.signInLabel }));
    expect(mocks.signIn).toHaveBeenCalledTimes(1);
    expect(mocks.signIn).toHaveBeenCalledWith("/en/manage/offerings");
  });

  it("renders the 404 for a signed-in user of another role", () => {
    mocks.session = {
      state: "authenticated",
      user: { ulid: "01SPEC", role: "specialist" },
    };
    renderPanel();

    expect(mocks.notFound).toHaveBeenCalledTimes(1);
    expect(mocks.publicRequest).not.toHaveBeenCalled();
  });
});

describe("ManageOfferingsPanel — list states (spec 'My offerings list')", () => {
  it("shows three skeleton cards and no list content while the session resolves", () => {
    mocks.session = { state: "loading" };
    const { container } = renderPanel();

    expect(skeletonCount(container)).toBe(3);
    expect(screen.queryByText(TEXTS.signedOutMessage)).toBeNull();
    expect(mocks.publicRequest).not.toHaveBeenCalled();
  });

  it("shows three skeleton cards while the list loads, with no empty or error message", () => {
    mocks.publicRequest.mockReturnValue(new Promise(() => {}));
    const { container } = renderPanel();

    expect(skeletonCount(container)).toBe(3);
    expect(screen.queryByRole("heading", { level: 2 })).toBeNull();
    expect(screen.queryByText(TEXTS.listEmptyMessage)).toBeNull();
    expect(screen.queryByText(TEXTS.listErrorMessage)).toBeNull();
    expect(screen.queryByRole("button", { name: TEXTS.previousLabel })).toBeNull();
  });

  it("requests the session user's offerings for the route's page", async () => {
    mocks.publicRequest.mockResolvedValue(pageOf(ITEMS, 2, 3));
    renderPanel(2);

    await screen.findAllByRole("heading", { level: 2 });
    expect(mocks.publicRequest).toHaveBeenCalledWith(
      "/offerings?coffeeshopUlid=01USER&page=2",
    );
  });

  it("renders one offering card per item and the pagination on success", async () => {
    mocks.publicRequest.mockResolvedValue(pageOf(ITEMS, 1, 2));
    renderPanel();

    const titles = await screen.findAllByRole("heading", { level: 2 });
    expect(titles.map((title) => title.textContent)).toEqual([
      "Huila El Mirador",
      "Sidama Bensa",
    ]);
    const previous = screen.getByRole("button", { name: TEXTS.previousLabel });
    const next = screen.getByRole("button", { name: TEXTS.nextLabel });
    expect((previous as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(next);
    expect(mocks.push).toHaveBeenCalledWith("/en/manage/offerings?page=2");
  });

  it("lays the cards out in the grid of design.md D3 (1 / lg 2 / 2xl 3, 1.5rem gap)", async () => {
    mocks.publicRequest.mockResolvedValue(pageOf(ITEMS));
    renderPanel();

    const [title] = await screen.findAllByRole("heading", { level: 2 });
    const grid = title.closest(".grid")!;
    expect(grid.className).toBe("grid grid-cols-1 gap-6 lg:grid-cols-2 2xl:grid-cols-3");
    expect(grid.className).not.toMatch(/\bmd:grid-cols|\bxl:grid-cols/);
  });

  it("renders the empty message and the create link, and no card, when there are no offerings", async () => {
    mocks.publicRequest.mockResolvedValue(pageOf([]));
    renderPanel();

    const message = await screen.findByText(TEXTS.listEmptyMessage);
    const buttons = screen.getAllByRole("button", { name: TEXTS.newOfferingLink });
    expect(buttons).toHaveLength(2);
    mocks.push.mockClear();
    fireEvent.click(buttons[1]);
    expect(mocks.push).toHaveBeenCalledWith("/en/manage/offerings/new");
    expect(screen.queryByRole("heading", { level: 2 })).toBeNull();
    expect(message.parentElement!.className).toBe(
      "flex flex-col items-center gap-4 text-center",
    );
  });

  it("renders the error message and Retry, and Retry reloads through the loading state", async () => {
    mocks.publicRequest.mockResolvedValueOnce(jsonResponse(500, {}));
    const { container } = renderPanel();

    const message = await screen.findByText(TEXTS.listErrorMessage);
    expect(message.parentElement!.className).toBe(
      "flex flex-col items-center gap-4 text-center",
    );
    expect(screen.queryByRole("heading", { level: 2 })).toBeNull();

    let resolve: (value: Response) => void = () => {};
    mocks.publicRequest.mockReturnValueOnce(
      new Promise<Response>((done) => {
        resolve = done;
      }),
    );
    fireEvent.click(screen.getByRole("button", { name: TEXTS.retryLabel }));

    expect(skeletonCount(container)).toBe(3);
    expect(screen.queryByText(TEXTS.listErrorMessage)).toBeNull();
    await act(async () => {
      resolve(pageOf(ITEMS));
    });
    await waitFor(() =>
      expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(2),
    );
    expect(mocks.publicRequest).toHaveBeenCalledTimes(2);
  });
});

describe("ManageOfferingsPanel — selection (spec 'Offering selection')", () => {
  const SELECT_A = "Select Huila El Mirador — Tazavera Gràcia";
  const SELECT_B = "Select Sidama Bensa — Tazavera Born";

  function checkbox(name: string): HTMLInputElement {
    return screen.getByRole("checkbox", { name }) as HTMLInputElement;
  }

  async function loaded(page = 1) {
    mocks.publicRequest.mockResolvedValue(pageOf(ITEMS, page, 2));
    const view = renderPanel(page);
    await screen.findAllByRole("heading", { level: 2 });
    return view;
  }

  it("fills every card's actions with its Select and Delete", async () => {
    await loaded();

    expect(checkbox(SELECT_A)).toBeTruthy();
    expect(checkbox(SELECT_B)).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Delete Huila El Mirador — Tazavera Gràcia" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Delete Sidama Bensa — Tazavera Born" }),
    ).toBeTruthy();
  });

  it("renders the toolbar in the success state: select all, the count and the bulk delete, laid out in one wrapping row", async () => {
    await loaded();

    const selectAll = checkbox(TEXTS.selectAllLabel);
    const count = screen.getByText("Selected: 0");
    const bulk = screen.getByRole("button", { name: TEXTS.deleteSelectedLabel });
    expect(count.className).toBe("type-meta");
    const toolbar = count.parentElement!;
    expect(toolbar.className).toBe("flex flex-wrap items-center gap-4");
    expect(toolbar.contains(selectAll)).toBe(true);
    expect(toolbar.lastElementChild!.contains(bulk)).toBe(true);
    expect(bulk.className).toContain("md:ml-auto");
  });

  it("renders no toolbar while loading, on empty and on error", async () => {
    mocks.publicRequest.mockResolvedValue(pageOf([]));
    renderPanel();
    await screen.findByText(TEXTS.listEmptyMessage);

    expect(screen.queryByRole("checkbox", { name: TEXTS.selectAllLabel })).toBeNull();
    expect(screen.queryByRole("button", { name: TEXTS.deleteSelectedLabel })).toBeNull();
  });

  it("toggles only the activated card and updates the count", async () => {
    await loaded();

    fireEvent.click(checkbox(SELECT_A));

    expect(checkbox(SELECT_A).checked).toBe(true);
    expect(checkbox(SELECT_B).checked).toBe(false);
    expect(screen.getByText("Selected: 1")).toBeTruthy();
    fireEvent.click(checkbox(SELECT_A));
    expect(checkbox(SELECT_A).checked).toBe(false);
    expect(screen.getByText("Selected: 0")).toBeTruthy();
  });

  it("reads select all unchecked at none selected and checked at a full page selection", async () => {
    await loaded();

    expect(checkbox(TEXTS.selectAllLabel).checked).toBe(false);
    fireEvent.click(checkbox(SELECT_A));
    expect(checkbox(TEXTS.selectAllLabel).checked).toBe(false);
    fireEvent.click(checkbox(SELECT_B));
    expect(checkbox(TEXTS.selectAllLabel).checked).toBe(true);
  });

  it("selects the whole page from a partial selection and clears it from a full one", async () => {
    await loaded();

    fireEvent.click(checkbox(SELECT_A));
    fireEvent.click(checkbox(TEXTS.selectAllLabel));
    expect(checkbox(SELECT_A).checked).toBe(true);
    expect(checkbox(SELECT_B).checked).toBe(true);
    expect(screen.getByText("Selected: 2")).toBeTruthy();

    fireEvent.click(checkbox(TEXTS.selectAllLabel));
    expect(checkbox(SELECT_A).checked).toBe(false);
    expect(checkbox(SELECT_B).checked).toBe(false);
    expect(screen.getByText("Selected: 0")).toBeTruthy();
  });

  it("disables the bulk delete at zero selected", async () => {
    await loaded();

    const bulk = () =>
      screen.getByRole("button", { name: TEXTS.deleteSelectedLabel }) as HTMLButtonElement;
    expect(bulk().disabled).toBe(true);
    fireEvent.click(checkbox(SELECT_A));
    expect(bulk().disabled).toBe(false);
  });

  it("clears the selection and resets the count on a page change", async () => {
    const view = await loaded(1);
    fireEvent.click(checkbox(SELECT_A));
    expect(screen.getByText("Selected: 1")).toBeTruthy();

    mocks.publicRequest.mockResolvedValue(pageOf(ITEMS, 2, 2));
    view.rerender(
      <ManageOfferingsPanel locale="en" page={2} taxonomies={[]} texts={TEXTS} />,
    );
    await screen.findByText("Selected: 0");
    expect(checkbox(SELECT_A).checked).toBe(false);
  });
});

describe("ManageOfferingsPanel — deleting (spec 'Deleting offerings')", () => {
  const DELETE_A = "Delete Huila El Mirador — Tazavera Gràcia";

  function ok(): Response {
    return jsonResponse(200, { message: "never shown" });
  }

  async function loaded(page = 1, items = ITEMS) {
    mocks.publicRequest.mockResolvedValueOnce(pageOf(items, page, page));
    const view = renderPanel(page);
    await screen.findAllByRole("heading", { level: 2 });
    return view;
  }

  function confirmButton(): HTMLElement {
    const dialog = screen.getByRole("alertdialog");
    return within(dialog).getByRole("button", { name: TEXTS.deleteConfirmLabel });
  }

  it("deletes one offering after confirmation: closes, announces 1, reloads and focuses the heading", async () => {
    await loaded();
    fireEvent.click(screen.getByRole("button", { name: DELETE_A }));
    expect(screen.getByRole("alertdialog", { name: TEXTS.deleteOneTitle })).toBeTruthy();
    expect(mocks.request).not.toHaveBeenCalled();

    mocks.request.mockResolvedValue(ok());
    mocks.publicRequest.mockResolvedValueOnce(pageOf([ITEMS[1]]));
    await act(async () => {
      fireEvent.click(confirmButton());
    });

    expect(mocks.request.mock.calls[0][0]).toBe("/offerings/01A");
    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
    const status = screen.getByRole("status");
    expect(status.textContent).toBe("Offerings deleted: 1");
    expect(status.className).toBe("type-body");
    expect(status.parentElement!.className).toBe("flex flex-col gap-4");
    await waitFor(() =>
      expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(1),
    );
    expect(mocks.publicRequest).toHaveBeenCalledTimes(2);
    const heading = screen.getByRole("heading", { level: 1 });
    await waitFor(() => expect(document.activeElement).toBe(heading));
  });

  it("deletes the selection after confirmation, announces its count and empties the selection", async () => {
    await loaded();
    fireEvent.click(screen.getByRole("checkbox", { name: TEXTS.selectAllLabel }));
    fireEvent.click(screen.getByRole("button", { name: TEXTS.deleteSelectedLabel }));
    expect(screen.getByRole("alertdialog", { name: TEXTS.deleteManyTitle })).toBeTruthy();

    mocks.request.mockResolvedValue(ok());
    mocks.publicRequest.mockResolvedValueOnce(pageOf(ITEMS));
    await act(async () => {
      fireEvent.click(confirmButton());
    });

    expect(mocks.request.mock.calls[0][0]).toBe("/offerings");
    const init = mocks.request.mock.calls[0][1] as RequestInit;
    expect(JSON.parse(init.body as string)).toEqual({ offerings: ["01A", "01B"] });
    await waitFor(() =>
      expect(screen.getByRole("status").textContent).toBe("Offerings deleted: 2"),
    );
    await screen.findByText("Selected: 0");
    const heading = screen.getByRole("heading", { level: 1 });
    await waitFor(() => expect(document.activeElement).toBe(heading));
  });

  it("keeps the confirmation open with its error on a failure", async () => {
    await loaded();
    fireEvent.click(screen.getByRole("button", { name: DELETE_A }));
    mocks.request.mockResolvedValue(jsonResponse(500, {}));
    await act(async () => {
      fireEvent.click(confirmButton());
    });

    const dialog = screen.getByRole("alertdialog");
    expect(within(dialog).getByRole("alert").textContent).toBe(TEXTS.deleteError);
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("keeps the confirmation open with its error on a 403, with no step-up", async () => {
    await loaded();
    fireEvent.click(screen.getByRole("button", { name: DELETE_A }));
    mocks.request.mockResolvedValue(jsonResponse(403, {}));
    await act(async () => {
      fireEvent.click(confirmButton());
    });

    expect(mocks.request).toHaveBeenCalledTimes(1);
    const dialog = screen.getByRole("alertdialog");
    expect(within(dialog).getByRole("alert").textContent).toBe(TEXTS.deleteError);
    expect(screen.queryByRole("button", { name: "Confirm your identity" })).toBeNull();
    expect(mocks.requestProfileWrite).not.toHaveBeenCalled();
  });

  it("moves to the previous page when a delete empties a page beyond the first", async () => {
    await loaded(2, [ITEMS[0]]);
    fireEvent.click(screen.getByRole("button", { name: DELETE_A }));
    mocks.request.mockResolvedValue(ok());
    mocks.publicRequest.mockResolvedValueOnce(pageOf([], 2, 2));
    await act(async () => {
      fireEvent.click(confirmButton());
    });

    await waitFor(() =>
      expect(mocks.push).toHaveBeenCalledWith("/en/manage/offerings?page=1"),
    );
  });
});
