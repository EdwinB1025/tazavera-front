import { describe, it, expect, vi, afterEach, beforeAll, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { getMessages } from "@/shared/lib/i18n";
import { SidebarProvider } from "@/shared/ui";
import { EvaluationsToolbar, type EvaluationsToolbarTexts } from "./EvaluationsToolbar";
import { parseEvaluationFilters } from "../model/query";

const nav = vi.hoisted(() => ({ push: vi.fn(), search: "" }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: nav.push }),
  usePathname: () => "/en/manage/evaluations",
  useSearchParams: () => new URLSearchParams(nav.search),
}));

// No global test setup in this project, so RTL auto-cleanup does not run.
afterEach(() => {
  cleanup();
});

// Below md, so the trigger always renders. Test infrastructure only.
beforeAll(() => {
  window.matchMedia = ((query: string) => ({
    matches: true,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
});

beforeEach(() => {
  nav.push.mockReset();
  nav.search = "";
});

const catalog = getMessages("filters", "en");
const TEXTS: EvaluationsToolbarTexts = {
  trigger: catalog.trigger!,
  triggerWithCount: catalog.triggerWithCount!,
  sortBy: catalog.sortBy!,
  sortDefault: catalog.sortDefault!,
  sortScoreDesc: catalog.sortScoreDesc!,
  sortScoreAsc: catalog.sortScoreAsc!,
  sortNewest: catalog.sortNewest!,
  sortOldest: catalog.sortOldest!,
};
const PATH = "/en/manage/evaluations";

function renderToolbar(search: string, count = 0) {
  nav.search = search;
  const { sort } = parseEvaluationFilters(new URLSearchParams(search));
  render(
    <SidebarProvider>
      <EvaluationsToolbar count={count} sort={sort} texts={TEXTS} />
    </SidebarProvider>,
  );
  return screen.getByRole("combobox", { name: "Sort by" }) as HTMLSelectElement;
}

/** The evaluations body toolbar (design.md D6, D8; spec "Evaluation sort", "Evaluations filter toolbar"). */
describe("EvaluationsToolbar (design.md D8)", () => {

  it("reads Filters without applied values and Filters (2) with two", () => {
    renderToolbar("");
    expect(screen.getByRole("button", { name: "Filters" })).toBeDefined();
    cleanup();
    renderToolbar("", 2);
    expect(screen.getByRole("button", { name: "Filters (2)" })).toBeDefined();
  });

  it("writes both sort keys without page for Lowest score", () => {
    const select = renderToolbar("status=open&page=2");
    fireEvent.change(select, { target: { value: "score-asc" } });
    expect(nav.push).toHaveBeenCalledWith(
      `${PATH}?status=open&orderBy=cupping_score&orderDirection=asc`,
      { scroll: false },
    );
  });

  it("removes both keys for Default order", () => {
    const select = renderToolbar("orderBy=cupping_score&orderDirection=desc&city=Lima");
    fireEvent.change(select, { target: { value: "default" } });
    expect(nav.push).toHaveBeenCalledWith(`${PATH}?city=Lima`, { scroll: false });
  });
});
