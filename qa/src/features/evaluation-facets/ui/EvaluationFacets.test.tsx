import { describe, it, expect, vi, afterEach, beforeAll, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup, within } from "@testing-library/react";
import { getMessages } from "@/shared/lib/i18n";
import { EvaluationFacets, type EvaluationFacetsTexts } from "@/features/evaluation-facets/ui/EvaluationFacets";
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

// jsdom has no ResizeObserver; Radix Slider measures with one.
beforeAll(() => {
  if (!("ResizeObserver" in globalThis)) {
    globalThis.ResizeObserver = class {
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
    } as unknown as typeof ResizeObserver;
  }
});

beforeEach(() => {
  nav.push.mockReset();
  nav.search = "";
});

/**
 * Evaluation facet panel (design.md D7; spec "Evaluation facets in the
 * sidebar", "Evaluation facet options unavailable", "Evaluation filter state
 * in the URL", "Applied evaluation filters").
 */

const catalog = getMessages("filters", "en");
const TEXTS: EvaluationFacetsTexts = {
  title: catalog.title!,
  clearAll: catalog.clearAll!,
  removeFilter: catalog.removeFilter!,
  any: catalog.any!,
  seeMore: catalog.seeMore!,
  seeLess: catalog.seeLess!,
  status: catalog.status!,
  statusOpen: catalog.statusOpen!,
  statusClosed: catalog.statusClosed!,
  score: catalog.score!,
  scoreMin: catalog.scoreMin!,
  scoreMax: catalog.scoreMax!,
  scoreRange: catalog.scoreRange!,
  rangeFrom: catalog.rangeFrom!,
  rangeTo: catalog.rangeTo!,
  process: catalog.process!,
  city: catalog.city!,
  cityHelp: catalog.cityHelp!,
  optionsUnavailable: catalog.optionsUnavailable!,
};

const PROCESSES = ["natural", "washed"];
const PATH = "/en/manage/evaluations";

function renderPanel(search: string, processes: string[] | null = PROCESSES) {
  nav.search = search;
  const values = parseEvaluationFilters(new URLSearchParams(search));
  return render(<EvaluationFacets values={values} options={{ processes }} texts={TEXTS} />);
}

function radio(name: string, group: string): HTMLInputElement {
  return within(screen.getByRole("radiogroup", { name: group })).getByRole("radio", {
    name,
    hidden: true,
  }) as HTMLInputElement;
}

function commit(input: HTMLElement, value: string) {
  fireEvent.change(input, { target: { value } });
  fireEvent.keyDown(input, { key: "Enter" });
}

describe("EvaluationFacets (design.md D7)", () => {
  it("is a search landmark named Filters", () => {
    renderPanel("");
    expect(screen.getByRole("search", { name: "Filters" })).toBeDefined();
  });

  it("removes the key when Any is chosen", () => {
    renderPanel("status=open&city=Lima");
    fireEvent.click(radio("Any", "Status"));
    expect(nav.push).toHaveBeenCalledWith(`${PATH}?city=Lima`, { scroll: false });
  });

  it("writes city and removes it when emptied", () => {
    renderPanel("");
    commit(screen.getByRole("textbox", { name: "City" }), "Barcelona");
    expect(nav.push).toHaveBeenLastCalledWith(`${PATH}?city=Barcelona`, { scroll: false });
    cleanup();
    renderPanel("city=Barcelona");
    commit(screen.getByRole("textbox", { name: "City" }), "");
    expect(nav.push).toHaveBeenLastCalledWith(PATH, { scroll: false });
  });
});

describe("EvaluationFacets, public set (add-public-evaluations design.md D7)", () => {
  const PUBLIC_TEXTS = { ...TEXTS, offering: "Offering", offeringFilterFallback: "Selected offering" };
  const HUILA = { name: "Huila", coffeeshop: "Tazavera" };

  function renderPublic(search: string, offering: typeof HUILA | null = HUILA, processes: string[] | null = PROCESSES) {
    nav.search = search;
    const values = parseEvaluationFilters(new URLSearchParams(search), "public");
    return render(
      <EvaluationFacets set="public" values={values} options={{ processes, offering }} texts={PUBLIC_TEXTS} />,
    );
  }

  it("shows Offering, Score, Process and City in order and no Status facet", () => {
    renderPublic("offeringId=01JOFFERA&status=open");
    const facets = [
      screen.getByRole("radiogroup", { name: "Offering" }),
      screen.getByRole("group", { name: "Score" }),
      screen.getByRole("radiogroup", { name: "Process" }),
      screen.getByRole("textbox", { name: "City" }),
    ];
    for (let index = 1; index < facets.length; index += 1) {
      expect(facets[index - 1]!.compareDocumentPosition(facets[index]!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    }
    expect(screen.queryByRole("radiogroup", { name: "Status" })).toBeNull();
  });
});
