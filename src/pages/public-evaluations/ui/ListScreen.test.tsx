import { describe, it, expect, afterEach, beforeAll, beforeEach, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { PublicEvaluationListProps } from "@/widgets/public-evaluation-list";
import { SidebarProvider } from "@/shared/ui";

/**
 * The public list screen (design.md D4, D5; summary §5.2; spec "Public
 * evaluations list", "Public evaluations sort"; tasks 2.9). The async list is
 * replaced at the widget's public API by a marker recording its props.
 */

const nav = vi.hoisted(() => ({ push: vi.fn(), search: "" }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: nav.push, refresh: vi.fn() }),
  usePathname: () => "/en/evaluations",
  useSearchParams: () => new URLSearchParams(nav.search),
}));

const list = vi.hoisted(() => ({ props: null as PublicEvaluationListProps | null }));
vi.mock("@/widgets/public-evaluation-list", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/widgets/public-evaluation-list")>()),
  PublicEvaluationList: (props: PublicEvaluationListProps) => {
    list.props = props;
    return <div data-testid="public-list" />;
  },
}));

import { ListScreen } from "./ListScreen";

// jsdom has no matchMedia; the sidebar reads the md breakpoint through it.
beforeAll(() => {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
});

function renderScreen(search: Record<string, string>) {
  nav.search = new URLSearchParams(search).toString();
  return render(
    <SidebarProvider>
      <ListScreen locale="en" searchParams={search} />
    </SidebarProvider>,
  );
}

beforeEach(() => {
  nav.push.mockReset();
  list.props = null;
});
afterEach(cleanup);

describe("ListScreen (summary §5.2)", () => {

  it("requests the fixed keys with the facet values, the page and the URL's query for the pagination", () => {
    const search = { offeringId: "01JOFFERA", status: "open", page: "2" };
    renderScreen(search);
    expect(list.props?.query).toEqual({
      offeringId: "01JOFFERA",
      evaluationType: "specialist",
      status: "closed",
      orderBy: "created_at",
      orderDirection: "desc",
      page: 2,
    });
    expect(list.props?.searchParams).toEqual(search);
    expect(list.props?.filtered).toBe(true);
  });

  it("writes a sort change without page and without scrolling", () => {
    renderScreen({ city: "Lima", page: "3" });
    fireEvent.change(screen.getByRole("combobox", { name: "Sort by" }), {
      target: { value: "score-desc" },
    });
    expect(nav.push).toHaveBeenCalledWith(
      "/en/evaluations?city=Lima&orderBy=cupping_score&orderDirection=desc",
      { scroll: false },
    );
  });
});
