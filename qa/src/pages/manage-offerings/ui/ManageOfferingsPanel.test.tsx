import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import {
  render,
  screen,
  cleanup,
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

import { ManageOfferingsPanel } from "@/pages/manage-offerings/ui/ManageOfferingsPanel";

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
  listEmptyCreateLink: "Create an offering",
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

describe("ManageOfferingsPanel — header (design.md D6)", () => {
  it("lays the header out as a stacked row that spreads from md, the title group 0.5rem apart", async () => {
    mocks.publicRequest.mockResolvedValue(pageOf(ITEMS));
    renderPanel();

    const titleGroup = screen.getByText(TEXTS.eyebrow).parentElement!;
    expect(titleGroup.className).toBe("flex flex-col gap-2");
    expect(titleGroup.parentElement!.className).toBe(
      "flex flex-col items-start gap-4 md:flex-row md:flex-wrap md:items-end md:justify-between",
    );
    await screen.findAllByRole("heading", { level: 2 });
  });
});


describe("ManageOfferingsPanel — deleting (spec 'Deleting offerings')", () => {
  async function loaded(page = 1, items = ITEMS) {
    mocks.publicRequest.mockResolvedValueOnce(pageOf(items, page, page));
    const view = renderPanel(page);
    await screen.findAllByRole("heading", { level: 2 });
    return view;
  }

  it("renders no status line before a delete", async () => {
    await loaded();

    expect(screen.queryByRole("status")).toBeNull();
  });
});
