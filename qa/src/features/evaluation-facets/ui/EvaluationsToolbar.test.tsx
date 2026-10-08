import { describe, it, expect, vi, afterEach, beforeAll, beforeEach } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";
import { getMessages } from "@/shared/lib/i18n";
import { SidebarProvider } from "@/shared/ui";
import { EvaluationsToolbar, type EvaluationsToolbarTexts } from "@/features/evaluation-facets/ui/EvaluationsToolbar";
import { parseEvaluationFilters } from "@/features/evaluation-facets/model/query";

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
  it("lays out one wrapping row with the trigger at the start and the sort field at the end", () => {
    const select = renderToolbar("");
    const trigger = screen.getByRole("button", { name: "Filters" });
    const field = select.closest("div.grow")!;
    const row = field.parentElement!;
    expect(row.className.split(" ")).toEqual(
      expect.arrayContaining(["flex", "flex-wrap", "items-end", "justify-between", "gap-x-4", "gap-y-3"]),
    );
    expect(row.contains(trigger)).toBe(true);
    expect(trigger.compareDocumentPosition(field) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(field.className.split(" ")).toEqual(
      expect.arrayContaining(["min-w-48", "max-w-64", "grow", "ml-auto"]),
    );
  });

  it("lists the five sort options in order", () => {
    const select = renderToolbar("");
    expect(within(select).getAllByRole("option").map((option) => option.textContent)).toEqual([
      "Default order",
      "Highest score",
      "Lowest score",
      "Newest",
      "Oldest",
    ]);
  });

  it("selects the current sort", () => {
    const select = renderToolbar("orderBy=cupping_score&orderDirection=desc");
    expect(select.value).toBe("score-desc");
  });
});
