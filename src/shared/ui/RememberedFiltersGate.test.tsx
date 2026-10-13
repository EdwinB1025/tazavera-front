import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import type { ReactNode } from "react";
import { useFilterNavigation } from "@/shared/lib/filter-query";
import { ClearFiltersButton, FilterMemoryScope, RememberedFiltersGate } from "@/shared/ui";

const nav = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  search: "",
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: nav.push, replace: nav.replace }),
  usePathname: () => "/es/manage/evaluations",
  useSearchParams: () => new URLSearchParams(nav.search),
}));

const KEYS = ["status", "scoreMin", "scoreMax", "process", "city", "orderBy", "orderDirection"];
const STORAGE_KEY = "tazavera.list-filters.my-evaluations";

function Scope({ children }: { children: ReactNode }): ReactNode {
  return (
    <FilterMemoryScope name="my-evaluations" keys={KEYS}>
      {children}
    </FilterMemoryScope>
  );
}

function Gate(): ReactNode {
  return (
    <Scope>
      <RememberedFiltersGate fallback={null}>
        <p>list</p>
      </RememberedFiltersGate>
    </Scope>
  );
}

beforeEach(() => {
  sessionStorage.clear();
});

// No global test setup in this project, so RTL auto-cleanup does not run.
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  nav.push.mockClear();
  nav.replace.mockClear();
});

/** Spec "Editing lists remember their filters and order for the tab" (design.md D2, D3). */
describe("Remembered list filters", () => {
  it("restores the kept filters and order on a new opening", () => {
    sessionStorage.setItem(STORAGE_KEY, "process=washed&orderBy=cupping_score&orderDirection=desc");
    nav.search = "";
    render(<Gate />);
    expect(nav.replace).toHaveBeenCalledTimes(1);
    expect(nav.replace).toHaveBeenCalledWith(
      "/es/manage/evaluations?process=washed&orderBy=cupping_score&orderDirection=desc",
      { scroll: false },
    );
    expect(nav.push).not.toHaveBeenCalled();
    expect(screen.queryByText("list")).toBeNull();
  });

  it("stores the cleared filters, keeping the order Clear all keeps", () => {
    nav.search = "process=washed&orderBy=cupping_score&orderDirection=desc&page=2";
    render(
      <Scope>
        <ClearFiltersButton label="Clear all" keep={["orderBy", "orderDirection"]} />
      </Scope>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Clear all" }));
    expect(nav.push).toHaveBeenCalledWith(
      "/es/manage/evaluations?orderBy=cupping_score&orderDirection=desc",
      { scroll: false },
    );
    expect(sessionStorage.getItem(STORAGE_KEY)).toBe("orderBy=cupping_score&orderDirection=desc");
  });

  it("opens the list as before when nothing is stored", () => {
    nav.search = "";
    render(<Gate />);
    expect(screen.getByText("list")).toBeTruthy();
    expect(nav.replace).not.toHaveBeenCalled();
    expect(nav.push).not.toHaveBeenCalled();
  });

  it("applies filters and opens the list as before when the browser storage is unavailable", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    function Apply(): ReactNode {
      const { navigate } = useFilterNavigation();
      return (
        <button type="button" onClick={() => navigate({ process: "natural" })}>
          apply
        </button>
      );
    }
    nav.search = "process=washed";
    render(
      <Scope>
        <Apply />
      </Scope>,
    );
    fireEvent.click(screen.getByRole("button", { name: "apply" }));
    expect(nav.push).toHaveBeenCalledWith("/es/manage/evaluations?process=natural", {
      scroll: false,
    });
    cleanup();
    nav.search = "";
    render(<Gate />);
    expect(screen.getByText("list")).toBeTruthy();
    expect(nav.replace).not.toHaveBeenCalled();
  });
});
