import { describe, it, expect, afterEach, vi } from "vitest";
import { render, cleanup, screen, fireEvent } from "@testing-library/react";
import { getMessages } from "@/shared/lib/i18n";
import type { Session } from "@/shared/api";
import type { VerifiedOfferingsProps } from "@/widgets/offering-list";
import { HomeScreen } from "@/pages/home";

// No global test setup in this project, so RTL auto-cleanup does not run.
afterEach(() => {
  cleanup();
  block.suspend = false;
  block.props = null;
  auth.session = { state: "anonymous" };
  router.push.mockReset();
});

/**
 * Home screen tests (design.md D9, D10, D11; the landing spec "Entry page
 * hero" and "Localized page texts"). The screen is a thin composition: it
 * loads the `landing` catalog of the route's locale and feeds every text down
 * as props (design.md D10, D11), passes no session (add-specialist-evaluations
 * design.md D6: the Evaluate link reads it itself), and wraps the offerings block
 * in a `Suspense` boundary whose fallback is the skeleton cards (design.md
 * D9). The block is replaced at its public API: it is an async Server
 * Component — untestable in Vitest (the testing rule) — and the stub records
 * the props the screen passes; the skeleton card stub counts the fallback.
 *
 * The previous case of `add-app-shell` ("fills the main area with no content")
 * is replaced here: design.md D13 fills that main area with the hero and the
 * list, which is the behaviour these cases pin.
 */

const block = vi.hoisted(() => ({
  suspend: false,
  props: null as VerifiedOfferingsProps | null,
}));

// The entry-page "Register" button reads the session and navigates with the
// App Router (add-register-landing D5): both are mocked by module (test
// infrastructure), each test setting the session state it needs.
const auth = vi.hoisted(() => ({
  session: { state: "anonymous" } as Session,
}));

const router = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock("@/features/auth", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/features/auth")>()),
  useSession: () => auth.session,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => router,
}));

vi.mock("@/widgets/offering-list", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/widgets/offering-list")>();
  return {
    ...actual,
    VerifiedOfferings: (props: VerifiedOfferingsProps) => {
      block.props = props;
      // Never settles, so the boundary keeps showing its fallback.
      if (block.suspend) throw new Promise<void>(() => {});
      return <div data-testid="offerings-block" />;
    },
    OfferingSkeletonCard: () => <div data-testid="skeleton-card" />,
  };
});

describe("HomeScreen", () => {
  it("reads the catalog of the locale the route asks for (spec: 'Texts follow the locale')", () => {
    render(<HomeScreen locale="ca" page={undefined} />);
    const ca = getMessages("landing", "ca");
    const es = getMessages("landing", "es");
    const rendered = document.body.textContent ?? "";
    expect(rendered.includes(ca.heroEyebrow)).toBe(true);
    expect(rendered.includes(es.heroEyebrow)).toBe(false);
  });

  it("wraps the block in Suspense with the skeleton cards as fallback (design.md D9)", () => {
    block.suspend = true;
    render(<HomeScreen locale="es" page={undefined} />);
    // The block has not resolved: skeleton cards render in its place and the
    // hero renders normally outside the boundary.
    expect(screen.queryByTestId("offerings-block")).toBeNull();
    expect(screen.getAllByTestId("skeleton-card").length).toBeGreaterThan(1);
    expect(screen.getByRole("heading", { level: 1 })).toBeTruthy();
  });

  describe("Entry page Register button (spec: 'Entry page Register button'; add-register-landing D5)", () => {
    const es = getMessages("landing", "es");

    it("Register button for an anonymous visitor on a small viewport", () => {
      render(<HomeScreen locale="es" page={undefined} />);
      const button = screen.getByRole("button", { name: es.heroRegisterAction });
      const heading = screen.getByRole("heading", { level: 1 });
      expect(
        button.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
      expect(button.parentElement!.classList.contains("lg:hidden")).toBe(true);
      fireEvent.click(button);
      expect(router.push).toHaveBeenCalledWith("/es/join");
    });

    it("No Register button while resolving or signed in", () => {
      for (const session of [
        { state: "loading" },
        { state: "authenticated", user: {} },
      ] as Session[]) {
        auth.session = session;
        const { unmount } = render(<HomeScreen locale="es" page={undefined} />);
        expect(
          screen.queryByRole("button", { name: es.heroRegisterAction }),
        ).toBeNull();
        unmount();
      }
    });
  });

  describe("Page layout (spec: 'Entry page sections', 'Centered content', 'Side and section spacing', 'Grid by viewport'; design.md D14)", () => {
    function classTokens(element: Element): string[] {
      return (element.getAttribute("class") ?? "").split(/\s+/).filter(Boolean);
    }

    function sections(container: HTMLElement): Element[] {
      return Array.from(container.firstElementChild!.children);
    }

    it("renders the hero and the offerings block as two sections, on the page and the section background", () => {
      const { container } = render(<HomeScreen locale="es" page={undefined} />);
      const [hero, list] = sections(container);
      expect(sections(container).map((section) => section.tagName)).toEqual([
        "SECTION",
        "SECTION",
      ]);
      expect(classTokens(hero)).toContain("bg-surface-page");
      expect(classTokens(list)).toContain("bg-surface-section");
      expect(hero.querySelector("h1")).not.toBeNull();
      expect(
        list.querySelector('[data-testid="offerings-block"]'),
      ).not.toBeNull();
    });

    it("pads every section and centers its content in the container", () => {
      const { container } = render(<HomeScreen locale="es" page={undefined} />);
      for (const section of sections(container)) {
        expect(classTokens(section)).toEqual(
          expect.arrayContaining(["py-12", "md:py-16"]),
        );
        expect(classTokens(section.firstElementChild!)).toEqual(
          expect.arrayContaining([
            "mx-auto",
            "w-full",
            "max-w-6xl",
            "px-4",
            "md:px-8",
          ]),
        );
      }
    });

  });
});
