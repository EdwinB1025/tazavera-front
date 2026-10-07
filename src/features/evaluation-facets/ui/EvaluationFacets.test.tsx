import { describe, it, expect, vi, afterEach, beforeAll, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup, within } from "@testing-library/react";
import { getMessages } from "@/shared/lib/i18n";
import { EvaluationFacets, type EvaluationFacetsTexts } from "./EvaluationFacets";
import { parseEvaluationFilters } from "../model/query";
import { appliedEvaluationFilters } from "../model/applied";

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

  it("opts the panel out of scroll anchoring, so an added chip keeps the scroll position", () => {
    renderPanel("status=open");
    expect(screen.getByRole("search", { name: "Filters" }).parentElement?.className).toBe(
      "[overflow-anchor:none]",
    );
  });

  it("shows the four facets in the spec order", () => {
    renderPanel("");
    const facets = [
      screen.getByRole("radiogroup", { name: "Status" }),
      screen.getByRole("group", { name: "Score" }),
      screen.getByRole("radiogroup", { name: "Process" }),
      screen.getByRole("textbox", { name: "City" }),
    ];
    for (let index = 1; index < facets.length; index += 1) {
      expect(
        facets[index - 1]!.compareDocumentPosition(facets[index]!) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    }
  });

  it("shows the values of its props as selected", () => {
    renderPanel("status=open&process=washed&scoreMin=80");
    expect(radio("Open", "Status").checked).toBe(true);
    expect(radio("washed", "Process").checked).toBe(true);
    expect((screen.getByRole("spinbutton", { name: "From" }) as HTMLInputElement).value).toBe("80");
    expect((screen.getByRole("spinbutton", { name: "To" }) as HTMLInputElement).value).toBe("100");
  });

  it("navigates to the new query without page when a process is chosen", () => {
    renderPanel("process=washed&page=3");
    fireEvent.click(radio("natural", "Process"));
    expect(nav.push).toHaveBeenCalledWith(`${PATH}?process=natural`, { scroll: false });
  });

  it("removes the key when Any is chosen", () => {
    renderPanel("status=open&city=Lima");
    fireEvent.click(radio("Any", "Status"));
    expect(nav.push).toHaveBeenCalledWith(`${PATH}?city=Lima`, { scroll: false });
  });

  it("writes the score bounds and removes both for the full range", () => {
    renderPanel("");
    commit(screen.getByRole("spinbutton", { name: "From" }), "60");
    expect(nav.push).toHaveBeenLastCalledWith(`${PATH}?scoreMin=60`, { scroll: false });
    cleanup();
    renderPanel("scoreMin=60");
    commit(screen.getByRole("spinbutton", { name: "From" }), "0");
    expect(nav.push).toHaveBeenLastCalledWith(PATH, { scroll: false });
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

  it("disables Process with Options unavailable and keeps the other facets working", () => {
    renderPanel("", null);
    const group = screen.getByRole("radiogroup", { name: "Process" });
    for (const input of within(group).getAllByRole("radio", { hidden: true })) {
      expect((input as HTMLInputElement).disabled).toBe(true);
    }
    expect(screen.getByText("Options unavailable")).toBeDefined();
    fireEvent.click(radio("Closed", "Status"));
    expect(nav.push).toHaveBeenLastCalledWith(`${PATH}?status=closed`, { scroll: false });
    commit(screen.getByRole("spinbutton", { name: "To" }), "90");
    expect(nav.push).toHaveBeenLastCalledWith(`${PATH}?scoreMax=90`, { scroll: false });
    commit(screen.getByRole("textbox", { name: "City" }), "Lima");
    expect(nav.push).toHaveBeenLastCalledWith(`${PATH}?city=Lima`, { scroll: false });
  });

  it("shows the applied chips, removes one and clears all keeping the sort", () => {
    const search = "status=open&process=washed&orderBy=cupping_score&orderDirection=desc";
    renderPanel(search);
    const applied = appliedEvaluationFilters(
      parseEvaluationFilters(new URLSearchParams(search)),
      TEXTS,
    );
    for (const entry of applied) {
      expect(
        screen.getByRole("button", { name: `Remove filter: ${entry.facet}: ${entry.value}` }),
      ).toBeDefined();
    }
    fireEvent.click(screen.getByRole("button", { name: "Remove filter: Process: washed" }));
    expect(nav.push).toHaveBeenLastCalledWith(
      `${PATH}?status=open&orderBy=cupping_score&orderDirection=desc`,
      { scroll: false },
    );
    fireEvent.click(screen.getByRole("button", { name: "Clear all" }));
    expect(nav.push).toHaveBeenLastCalledWith(
      `${PATH}?orderBy=cupping_score&orderDirection=desc`,
      { scroll: false },
    );
  });
});
