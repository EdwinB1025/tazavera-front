import { describe, it, expect, afterEach, beforeAll, beforeEach, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
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

import { ListScreen } from "@/pages/public-evaluations/ui/ListScreen";

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
  it("renders the eyebrow and h1, the toolbar 2rem below them, and the list in the section surface", () => {
    renderScreen({});
    expect(screen.getByText("Evaluations").className).toContain("type-eyebrow-strong");
    const heading = screen.getByRole("heading", { level: 1, name: "Specialist evaluations" });
    expect(heading.className).toContain("type-heading");
    const header = heading.closest("section") as HTMLElement;
    expect(header.className).toContain("bg-surface-page");
    expect((heading.parentElement?.parentElement as HTMLElement).className).toContain("gap-8");
    expect(screen.getByRole("combobox", { name: "Sort by" })).toBeDefined();
    const body = screen.getByTestId("public-list").closest("section") as HTMLElement;
    expect(body.className).toContain("bg-surface-section");
  });

  it("is unfiltered with no facet in the URL", () => {
    renderScreen({ orderBy: "cupping_score", orderDirection: "desc" });
    expect(list.props?.filtered).toBe(false);
  });
});
