import { describe, it, expect, vi, afterEach, beforeAll, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup, within } from "@testing-library/react";
import { getMessages } from "@/shared/lib/i18n";
import { OfferingFacets, offeringFacetsTexts } from "@/features/offering-facets";
import { parseOfferingFilters } from "@/features/offering-facets/model/query";
import type { OfferingFacetOptions } from "@/features/offering-facets/model/options";

const nav = vi.hoisted(() => ({ push: vi.fn(), search: "" }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: nav.push }),
  usePathname: () => "/en/offerings",
  useSearchParams: () => new URLSearchParams(nav.search),
}));

// No global test setup in this project, so RTL auto-cleanup does not run.
afterEach(() => {
  cleanup();
});

// jsdom has no ResizeObserver; Radix Slider and Popover measure with one.
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
 * Offering facet panel (design.md D7; spec "Offering facets in the sidebar",
 * "Offering facet options unavailable", "Offering filter state in the URL",
 * "Applied offering filters").
 */

const TEXTS = offeringFacetsTexts(getMessages("filters", "en"));

const OPTIONS: OfferingFacetOptions = {
  countries: ["Colombia", "Ethiopia"],
  regions: ["Huila", "Sidama"],
  processes: ["natural", "washed"],
  varieties: ["Caturra"],
  producers: ["Bensa"],
  tasteNotes: [{ value: "F", label: "Fruity", children: [{ value: "B", label: "Berry" }] }],
};

function renderPanel(search: string, options: OfferingFacetOptions = OPTIONS) {
  nav.search = search;
  const values = parseOfferingFilters(new URLSearchParams(search));
  return render(<OfferingFacets values={values} options={options} texts={TEXTS} />);
}

function radio(group: string, name: string): HTMLInputElement {
  return within(screen.getByRole("radiogroup", { name })).getByRole("radio", {
    name: group,
    hidden: true,
  }) as HTMLInputElement;
}

describe("OfferingFacets (design.md D7)", () => {
  it("is a search landmark named Filters", () => {
    renderPanel("");
    expect(screen.getByRole("search", { name: "Filters" })).toBeDefined();
  });

  it("removes the key when Any is chosen", () => {
    renderPanel("process=washed&city=Lima");
    fireEvent.click(radio("Any", "Process"));
    expect(nav.push).toHaveBeenCalledWith("/en/offerings?city=Lima", { scroll: false });
  });

  it("reads Exact city name as the City help", () => {
    renderPanel("");
    const city = screen.getByRole("textbox", { name: "City" });
    const help = document.getElementById(city.getAttribute("aria-describedby") ?? "");
    expect(help?.textContent).toBe("Exact city name");
  });
});
