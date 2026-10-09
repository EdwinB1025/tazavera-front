import type { ReactNode } from "react";
import { describe, it, expect, afterEach, beforeAll, vi } from "vitest";
import {
  render,
  screen,
  cleanup,
  fireEvent,
  within,
} from "@testing-library/react";
import type { Session, SessionUser } from "@/shared/api";
import { AppHeader, PrimaryNav, LanguageSelect } from "@/widgets/app-header";

// No global test setup in this project, so RTL auto-cleanup does not run.
afterEach(() => {
  cleanup();
});

/**
 * App header tests, signed-out state (design.md D3, D5, D7, D10; design
 * summary §3; spec "Signed-out header", "Header brand and primary
 * navigation", "Language selection" and "Localized interface texts").
 *
 * Written before the slice exists (task 4.2); the import from
 * `@/widgets/app-header` fails to resolve until then, so the file runs and
 * fails as required.
 *
 * jsdom has no CSS engine: the `md` behaviour of the navigation and of the
 * two logotype forms is asserted through its exact class names
 * (`hidden md:flex`, `md:hidden`, `hidden md:inline-flex`) and the
 * `nav-button-*` treatment through the sign-in button's classes. Every text
 * arrives as a prop (design.md D10): the tests render with distinctive prop
 * strings and assert they are what renders.
 */

const ANONYMOUS: Session = { state: "anonymous" };
const LOCALES = ["es", "en", "ca"];
const TEXTS = {
  topRated: "texts.topRated",
  aboutUs: "texts.aboutUs",
  signIn: "texts.signIn",
  languageSelector: "texts.languageSelector",
  brandLink: "texts.brandLink",
  myAccount: "texts.myAccount",
  security: "texts.security",
  themeToggleToDark: "texts.themeToggleToDark",
  themeToggleToTraditional: "texts.themeToggleToTraditional",
  manageOfferings: "texts.manageOfferings",
  manageEvaluations: "texts.manageEvaluations",
  exploreOfferings: "texts.exploreOfferings",
  signOut: "texts.signOut",
  exploreCoffeeshops: "texts.exploreCoffeeshops",
  navigationMenu: "texts.navigationMenu",
};

function renderHeader(session: Session = ANONYMOUS, leading?: ReactNode) {
  const onSignIn = vi.fn();
  const onSignOut = vi.fn();
  const onLocaleChange = vi.fn();
  const utils = render(
    <AppHeader
      session={session}
      locale="es"
      locales={LOCALES}
      texts={TEXTS}
      onSignIn={onSignIn}
      onSignOut={onSignOut}
      onLocaleChange={onLocaleChange}
      leading={leading}
    />,
  );
  return { ...utils, onSignIn, onSignOut, onLocaleChange };
}

describe("AppHeader, signed-out state", () => {
  it("renders the header bar on bg-nav-surface at h-16 (design summary §3)", () => {
    renderHeader();
    const header = screen.getByRole("banner");
    expect(header.className).toContain("bg-nav-surface");
    expect(header.className).toContain("h-16");
  });

  // ─── Header layout (design.md D14; unplanned fix: corrections.md round 3) ───
  // The logo and the primary navigation form the left group; the language
  // selector and the session control form one right-hand group, pushed to the
  // right edge and never hidden, so the two groups hold on every viewport
  // (spec: "Header grouping on every viewport").

  it("renders the leading slot first in the left group, before the logotype (add-sidebar-slot design.md D6)", () => {
    renderHeader(ANONYMOUS, <button type="button">leading-control</button>);
    const left = screen.getByRole("banner").children[0] as HTMLElement;
    const leading = within(left).getByRole("button", { name: "leading-control" });
    expect(left.firstElementChild).toBe(leading);
    const logo = left.querySelector('a[href="/es"]')!;
    expect(
      leading.compareDocumentPosition(logo) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("keeps the left group unchanged without a leading slot (add-sidebar-slot design.md D6)", () => {
    renderHeader();
    const left = screen.getByRole("banner").children[0] as HTMLElement;
    expect(left.firstElementChild!.classList.contains("md:hidden")).toBe(true);
    // The only control in the left group is the small-viewport navigation
    // menu (fix-production-aut-findings D7); no leading control renders.
    expect(
      within(left).getAllByRole("button").map((button) => button.getAttribute("aria-label")),
    ).toEqual([TEXTS.navigationMenu]);
  });

  it("renders the Sign in action in the nav-button-* tokens", () => {
    renderHeader();
    const signIn = screen.getByRole("button", { name: TEXTS.signIn });
    expect(signIn.className).toContain("bg-nav-button-bg");
    expect(signIn.className).toContain("text-nav-button-text");
    expect(signIn.className).toContain("border-nav-button-border");
  });

  it("invokes the session's sign in (spec: Sign in starts from the current route)", () => {
    const { onSignIn } = renderHeader();
    fireEvent.click(screen.getByRole("button", { name: TEXTS.signIn }));
    expect(onSignIn).toHaveBeenCalledTimes(1);
  });

  it("renders every interface text from its props (design.md D10)", () => {
    renderHeader();
    expect(screen.getByText(TEXTS.topRated)).toBeDefined();
    expect(screen.getByText(TEXTS.aboutUs)).toBeDefined();
    expect(screen.getByText(TEXTS.signIn)).toBeDefined();
    expect(
      screen.getByRole("button", { name: TEXTS.languageSelector }),
    ).toBeDefined();
  });

  it("passes the current path to the primary navigation (design.md D14)", () => {
    render(
      <AppHeader
        session={ANONYMOUS}
        locale="es"
        locales={LOCALES}
        texts={TEXTS}
        currentPath="/es/about"
        onSignIn={vi.fn()}
        onSignOut={vi.fn()}
        onLocaleChange={vi.fn()}
      />,
    );
    expect(
      screen.getByRole("link", { name: TEXTS.aboutUs }).getAttribute("aria-current"),
    ).toBe("page");
  });
});

describe("PrimaryNav", () => {
  it("builds its destinations from the active locale", () => {
    render(<PrimaryNav locale="ca" texts={{ topRated: TEXTS.topRated, aboutUs: TEXTS.aboutUs, exploreCoffeeshops: "texts.exploreCoffeeshops" }} />);
    expect(screen.getByRole("link", { name: TEXTS.topRated }).getAttribute("href")).toBe(
      "/ca/offerings?verified=1&orderBy=cupping_avg&orderDirection=desc",
    );
    expect(screen.getByRole("link", { name: TEXTS.aboutUs }).getAttribute("href")).toBe(
      "/ca/about",
    );
  });
});

describe("LanguageSelect (spec: Language selection)", () => {
  // design.md D7: the language control is a menu — a ghost trigger carrying
  // the globe, the uppercased locale code and a chevron on every viewport,
  // and one single-choice entry per supported locale, each in its own name
  // with its own `lang` attribute. Written before the menu control exists
  // (task 2.2), so every case below runs and fails until then.
  function renderSelect() {
    const onLocaleChange = vi.fn();
    const utils = render(
      <LanguageSelect
        label={TEXTS.languageSelector}
        locales={LOCALES}
        value="es"
        onLocaleChange={onLocaleChange}
      />,
    );
    return { ...utils, onLocaleChange };
  }

  it("carries an accessible name naming the current language (spec: Selector is named)", () => {
    // the composed string passed as its label is the trigger's accessible name
    renderSelect();
    expect(
      screen.getByRole("button", { name: TEXTS.languageSelector }),
    ).toBeDefined();
  });
});

describe("UserMenu (spec: Signed-in header and user menu)", () => {
  // design.md D5 field mapping: the control's initials and accessible name
  // come from data.name and data.surname; the management entry from
  // data.role. The profile-settings entries point at /[locale]/account/* and
  // the management entry at /[locale]/manage/*; the security entry is the
  // API's web page, rendered natively (spec: "Menu content").
  const USER: SessionUser = {
    ulid: "01M35F5RX4ADGC3CSDXXYB08DD",
    name: "Andrés",
    surname: "Gómez",
    email: "andres@tazavera.test",
    role: "specialist",
  };

  beforeAll(() => {
    process.env.NEXT_PUBLIC_API_URL = "https://api.tazavera.test";
  });

  function renderSignedIn(role: string) {
    return renderHeader({ state: "authenticated", user: { ...USER, role } });
  }

  function openMenu() {
    fireEvent.pointerDown(screen.getByRole("button", { name: "Andrés Gómez" }));
  }

  it("renders the user menu with the nav treatment (spec: Menu surface extends the header)", () => {
    renderSignedIn("specialist");
    openMenu();
    const panel = screen.getByRole("menu");
    expect(panel.classList.contains("bg-nav-surface")).toBe(true);
    expect(panel.classList.contains("text-nav-text")).toBe(true);
    expect(panel.classList.contains("rounded-field")).toBe(true);
    expect(panel.classList.contains("bg-surface-card")).toBe(false);
    expect(panel.classList.contains("text-text-primary")).toBe(false);
    expect(panel.classList.contains("rounded-container")).toBe(false);
  });

  it("groups the avatar with the language selector on the right (corrections.md round 3)", () => {
    renderSignedIn("specialist");
    const header = screen.getByRole("banner");
    expect(header.children).toHaveLength(2);
    const left = header.children[0] as HTMLElement;
    const right = header.children[1] as HTMLElement;
    // the left group keeps both logotype forms and the navigation, with none
    // of the right-hand controls
    expect(left.querySelectorAll('a[href="/es"]')).toHaveLength(2);
    expect(within(left).queryByRole("button", { name: TEXTS.languageSelector })).toBeNull();
    expect(within(left).queryByRole("button", { name: "Andrés Gómez" })).toBeNull();
    // the session control is the avatar, in the same right-hand group
    expect(
      within(right).getByRole("button", { name: TEXTS.languageSelector }),
    ).toBeDefined();
    expect(within(right).getByRole("button", { name: "Andrés Gómez" })).toBeDefined();
    // in DOM order after the left group, at the right edge, and never gated
    // by a breakpoint: the grouping holds on every viewport (design.md D14)
    expect(
      left.compareDocumentPosition(right) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(right.className).toContain("ml-auto");
    expect(right.className).not.toContain("hidden");
  });

  it("invokes the session's sign out and closes (spec: Sign out)", () => {
    const { onSignOut } = renderSignedIn("specialist");
    openMenu();
    fireEvent.click(screen.getByRole("menuitem", { name: TEXTS.signOut }));
    expect(onSignOut).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menuitem", { name: TEXTS.signOut })).toBeNull();
  });

  it("closes when the pointer goes outside it", async () => {
    renderSignedIn("specialist");
    openMenu();
    // Radix arms its outside-pointerdown listener on the next tick and defers
    // a left-button dismissal to the click that completes it.
    await new Promise((resolve) => setTimeout(resolve, 0));
    fireEvent.pointerDown(document.body);
    fireEvent.click(document.body);
    expect(screen.queryByRole("menuitem", { name: TEXTS.signOut })).toBeNull();
  });
});
