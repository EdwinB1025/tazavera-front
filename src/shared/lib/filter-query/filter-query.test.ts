import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import {
  buildFilterHref,
  clearFiltersHref,
  useFilterNavigation,
} from "@/shared/lib/filter-query";

const nav = vi.hoisted(() => ({
  push: vi.fn(),
  pathname: "/es/offerings",
  search: "",
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: nav.push }),
  usePathname: () => nav.pathname,
  useSearchParams: () => new URLSearchParams(nav.search),
}));

const PATH = "/es/offerings";

/** URL writes of the facets (add-offering-facets design.md D4). */
describe("buildFilterHref (design.md D4)", () => {
  it("replaces one key and keeps the others in their order", () => {
    const current = new URLSearchParams("process=washed&verified=1&city=Bogotá");
    expect(buildFilterHref(PATH, current, { verified: "0" })).toBe(
      `${PATH}?process=washed&verified=0&city=Bogot%C3%A1`,
    );
  });

  it("writes one repeated key per array element", () => {
    const current = new URLSearchParams("cataRef=x");
    expect(buildFilterHref(PATH, current, { cataRef: ["a", "b"] })).toBe(
      `${PATH}?cataRef=a&cataRef=b`,
    );
  });

  it.each([[undefined], [""], [[]]])("removes the key for %j", (value) => {
    const current = new URLSearchParams("process=washed&city=Lima");
    expect(buildFilterHref(PATH, current, { process: value })).toBe(`${PATH}?city=Lima`);
  });

  it("always removes page", () => {
    const current = new URLSearchParams("page=3&process=washed");
    expect(buildFilterHref(PATH, current, { process: "natural" })).toBe(
      `${PATH}?process=natural`,
    );
  });

  it("returns the bare pathname when no key remains", () => {
    const current = new URLSearchParams("process=washed&page=2");
    expect(buildFilterHref(PATH, current, { process: undefined })).toBe(PATH);
  });

  it("appends a new key", () => {
    const current = new URLSearchParams("process=washed");
    expect(buildFilterHref(PATH, current, { city: "Lima" })).toBe(
      `${PATH}?process=washed&city=Lima`,
    );
  });
});

describe("clearFiltersHref (design.md D4)", () => {
  it("keeps only the kept keys and drops page", () => {
    const current = new URLSearchParams(
      "process=washed&orderBy=cupping_avg&orderDirection=desc&page=2",
    );
    expect(clearFiltersHref(PATH, current, ["orderBy", "orderDirection"])).toBe(
      `${PATH}?orderBy=cupping_avg&orderDirection=desc`,
    );
  });
});

describe("useFilterNavigation (design.md D4)", () => {
  beforeEach(() => {
    nav.push.mockReset();
  });

  it("navigate pushes the built href without scrolling", () => {
    nav.search = "process=washed&page=3";
    const { result } = renderHook(() => useFilterNavigation());
    result.current.navigate({ process: "natural" });
    expect(nav.push).toHaveBeenCalledWith("/es/offerings?process=natural", { scroll: false });
  });

  it("navigateTo pushes the given href without scrolling", () => {
    nav.search = "process=washed";
    const { result } = renderHook(() => useFilterNavigation());
    result.current.navigateTo("/es/offerings");
    expect(nav.push).toHaveBeenCalledWith("/es/offerings", { scroll: false });
  });
});
