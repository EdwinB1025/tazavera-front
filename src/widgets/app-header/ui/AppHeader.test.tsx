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
  exploreCoffeeshops: "texts.exploreCoffeeshops",
  aboutUs: "texts.aboutUs",
  signIn: "texts.signIn",
  languageSelector: "texts.languageSelector",
  brandLink: "texts.brandLink",
  myAccount: "texts.myAccount",
  security: "texts.security",
  themeToggleToDark: "texts.themeToggleToDark",
  themeToggleToTraditional: "texts.themeToggleToTraditional",
  manageOfferings: "texts.manageOfferings",
  manageLocations: "texts.manageLocations",
  exploreInventory: "texts.exploreInventory",
  manageEvaluations: "texts.manageEvaluations",
  exploreOfferings: "texts.exploreOfferings",
  signOut: "texts.signOut",
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

// Each header menu entry: a decorative icon before its text, the header menu
// entry treatment and no inline-link look (add-user-menu-icons).
function expectHeaderMenuEntries(entries: HTMLElement[]) {
  expect(entries.length).toBeGreaterThan(0);
  for (const entry of entries) {
    const icon = entry.firstElementChild;
    expect(icon?.tagName.toLowerCase(), entry.textContent ?? "").toBe("svg");
    expect(icon?.getAttribute("aria-hidden")).toBe("true");
    const tokens = entry.className.split(/\s+/);
    expect(tokens).toEqual(
      expect.arrayContaining(["type-navlist-item", "hover:text-nav-text-hover"]),
    );
    expect(tokens).not.toContain("underline");
    expect(tokens).not.toContain("text-text-link");
  }
}

describe("AppHeader, signed-out state", () => {
  it("links the brand logotype to the locale root", () => {
    renderHeader();
    const logo = screen.getByRole("link", { name: "TAZAVERA" });
    expect(logo.getAttribute("href")).toBe("/es");
  });

  it("keeps the logotype, the selector and the session control below md (spec: Primary navigation on a small viewport)", () => {
    const { container } = renderHeader();
    // Both logotype forms link to the locale root: the drawing alone below md
    // (its wrapper hides from md up) and the wordmark form from md (hidden
    // below it), so the logotype stays visible at every size (design.md D7).
    const logoLinks = Array.from(container.querySelectorAll('a[href="/es"]'));
    expect(logoLinks).toHaveLength(2);
    const wrappers = logoLinks.map((link) => link.parentElement!);
    expect(wrappers.some((w) => w.classList.contains("md:hidden"))).toBe(true);
    expect(
      wrappers.some(
        (w) =>
          w.classList.contains("hidden") && w.classList.contains("md:inline-flex"),
      ),
    ).toBe(true);
    // the selector and the session control are never gated by a breakpoint
    expect(
      screen.getByRole("button", { name: TEXTS.languageSelector }).className,
    ).not.toContain("hidden");
    expect(screen.getByRole("button", { name: TEXTS.signIn }).className).not.toContain(
      "hidden",
    );
    // the theme switch stays visible too (refine-header-aut)
    expect(
      screen.getByRole("button", { name: TEXTS.themeToggleToDark }).className,
    ).not.toContain("hidden");
    // the navigation menu control shows below md and hides from md
    // (fix-production-aut-findings design.md D7)
    const menu = screen.getByRole("button", { name: TEXTS.navigationMenu });
    const tokens = menu.className.split(/\s+/);
    expect(tokens).toContain("md:hidden");
    expect(tokens).not.toContain("hidden");
  });

  it("groups the logotype and the primary navigation on the left", () => {
    renderHeader();
    const header = screen.getByRole("banner");
    expect(header.children).toHaveLength(2);
    const left = header.children[0] as HTMLElement;
    // both logotype forms (icon below md, inline from md) and the navigation
    expect(left.querySelectorAll('a[href="/es"]')).toHaveLength(2);
    expect(within(left).getByText(TEXTS.topRated)).toBeDefined();
    expect(within(left).getByText(TEXTS.aboutUs)).toBeDefined();
    // and nothing of the right-hand controls
    expect(
      within(left).queryByRole("button", { name: TEXTS.languageSelector }),
    ).toBeNull();
    expect(within(left).queryByRole("button", { name: TEXTS.signIn })).toBeNull();
    // the group itself is never gated by a breakpoint (design.md D14: only
    // the navigation and the logotype form change at `md`)
    expect(left.className).not.toContain("hidden");
  });

  it("fits a small viewport (spec: Header fits a small viewport)", () => {
    renderHeader(ANONYMOUS, <button type="button">sidebar</button>);
    const header = screen.getByRole("banner");
    const left = header.children[0] as HTMLElement;
    // the selector keeps its name; its locale code is hidden visually below md
    const language = screen.getByRole("button", { name: TEXTS.languageSelector });
    expect(within(language).getByText("ES").className).toBe("sr-only md:not-sr-only");
    // the left group tightens below md
    expect(left.className.split(/\s+/)).toEqual(
      expect.arrayContaining(["gap-2", "md:gap-4"]),
    );
    // the theme toggle keeps its full size
    const theme = screen.getByRole("button", { name: TEXTS.themeToggleToDark });
    expect(theme.className.split(/\s+/)).toEqual(
      expect.arrayContaining(["shrink-0", "size-10"]),
    );
  });

  it("pushes the language selector, the theme switch and Sign in to the right edge as one group, in that order, after the left group (spec: Header grouping on every viewport)", () => {
    renderHeader();
    const header = screen.getByRole("banner");
    expect(header.children).toHaveLength(2);
    const left = header.children[0] as HTMLElement;
    const right = header.children[1] as HTMLElement;
    // one group holding the right-hand controls, in order (refine-header-aut)
    const language = within(right).getByRole("button", { name: TEXTS.languageSelector });
    const theme = within(right).getByRole("button", { name: TEXTS.themeToggleToDark });
    const signIn = within(right).getByRole("button", { name: TEXTS.signIn });
    expect(
      language.compareDocumentPosition(theme) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      theme.compareDocumentPosition(signIn) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    // a tighter gap below md so the group fits at 375px
    expect(right.className.split(/\s+/)).toEqual(
      expect.arrayContaining(["gap-2", "md:gap-4"]),
    );
    // in DOM order after the left group
    expect(
      left.compareDocumentPosition(right) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    // pushed to the right edge ...
    expect(right.className).toContain("ml-auto");
    // ... on every viewport: the group itself is never gated by a breakpoint
    expect(right.className).not.toContain("hidden");
    expect(right.className).not.toMatch(/md:(hidden|flex|block)/);
  });

  it("carries focus-visible:focus-ring on every interactive control", () => {
    const { container } = renderHeader();
    const controls = Array.from(
      container.querySelectorAll("a, button, select"),
    );
    expect(controls.length).toBeGreaterThan(0);
    for (const control of controls) {
      expect(control.className).toContain("focus-visible:focus-ring");
    }
  });
});

describe("PrimaryNav", () => {
  function renderNav() {
    return render(<PrimaryNav locale="es" texts={{ topRated: TEXTS.topRated, exploreCoffeeshops: TEXTS.exploreCoffeeshops, aboutUs: TEXTS.aboutUs }} />);
  }

  it("shows Top rated, Explore coffee shops and About us in that order with their destinations at md and up (spec: Primary navigation on a medium or larger viewport)", () => {
    renderNav();
    expect(screen.getAllByRole("link").map((link) => link.textContent)).toEqual([
      TEXTS.topRated,
      TEXTS.exploreCoffeeshops,
      TEXTS.aboutUs,
    ]);
    const topRated = screen.getByRole("link", { name: TEXTS.topRated });
    expect(topRated.getAttribute("href")).toBe(
      "/es/offerings?verified=1&orderBy=cupping_avg&orderDirection=desc",
    );
    const explore = screen.getByRole("link", { name: TEXTS.exploreCoffeeshops });
    expect(explore.getAttribute("href")).toBe("/es/coffeeshops");
    const aboutUs = screen.getByRole("link", { name: TEXTS.aboutUs });
    expect(aboutUs.getAttribute("href")).toBe("/es/about");
  });

  it("is hidden below the md breakpoint and shown from md up", () => {
    renderNav();
    const nav = screen.getByRole("navigation");
    expect(nav.className).toContain("hidden");
    expect(nav.className).toContain("md:flex");
  });

  // ─── Navigation items (corrections.md round 2, correction 1; design.md D14) ───

  it("renders its entries as navigation items with no underline (spec: Navigation entries are navigation items)", () => {
    renderNav();
    for (const name of [TEXTS.topRated, TEXTS.aboutUs]) {
      const entry = screen.getByRole("link", { name });
      for (const cls of [
        "type-navbar-item",
        "h-16",
        "items-center",
        "justify-center",
        "px-6",
        "focus-visible:focus-ring",
      ]) {
        expect(entry.classList.contains(cls)).toBe(true);
      }
      expect(entry.className).not.toMatch(/(^|\s|:)underline(\s|$)/);
    }
    expect(screen.getByRole("navigation").classList.contains("md:ml-4")).toBe(true);
  });

  it("takes the hover fill on entries that are not the current page (spec: Navigation entry hover)", () => {
    renderNav();
    for (const name of [TEXTS.topRated, TEXTS.aboutUs]) {
      const entry = screen.getByRole("link", { name });
      expect(entry.classList.contains("hover:bg-nav-hover")).toBe(true);
      expect(entry.classList.contains("hover:text-nav-text-hover")).toBe(true);
      expect(entry.getAttribute("aria-current")).toBeNull();
    }
  });

  it("marks the entry of the current route as the current page (spec: Current page entry)", () => {
    render(
      <PrimaryNav
        locale="es"
        currentPath="/es/about"
        texts={{ topRated: TEXTS.topRated, exploreCoffeeshops: TEXTS.exploreCoffeeshops, aboutUs: TEXTS.aboutUs }}
      />,
    );
    const about = screen.getByRole("link", { name: TEXTS.aboutUs });
    expect(about.getAttribute("aria-current")).toBe("page");
    expect(about.classList.contains("border-b-2")).toBe(true);
    expect(about.classList.contains("border-nav-indicator")).toBe(true);
    expect(about.classList.contains("hover:bg-nav-hover")).toBe(false);
    expect(about.classList.contains("hover:text-nav-text-hover")).toBe(false);
    const topRated = screen.getByRole("link", { name: TEXTS.topRated });
    expect(topRated.getAttribute("aria-current")).toBeNull();
    expect(topRated.classList.contains("hover:bg-nav-hover")).toBe(true);    cleanup();
    render(
      <PrimaryNav
        locale="es"
        currentPath="/es/coffeeshops"
        texts={{ topRated: TEXTS.topRated, exploreCoffeeshops: TEXTS.exploreCoffeeshops, aboutUs: TEXTS.aboutUs }}
      />,
    );
    const explore = screen.getByRole("link", { name: TEXTS.exploreCoffeeshops });
    expect(explore.getAttribute("aria-current")).toBe("page");
    expect(explore.classList.contains("border-nav-indicator")).toBe(true);
  });

  it("matches the current page by path, ignoring the query", () => {
    render(
      <PrimaryNav
        locale="es"
        currentPath="/es/offerings"
        texts={{ topRated: TEXTS.topRated, exploreCoffeeshops: TEXTS.exploreCoffeeshops, aboutUs: TEXTS.aboutUs }}
      />,
    );
    expect(
      screen.getByRole("link", { name: TEXTS.topRated }).getAttribute("aria-current"),
    ).toBe("page");
    expect(
      screen.getByRole("link", { name: TEXTS.aboutUs }).getAttribute("aria-current"),
    ).toBeNull();
  });
});

describe("NavigationMenu (spec: Header brand and primary navigation; fix-production-aut-findings design.md D7)", () => {
  function renderAt(currentPath?: string) {
    render(
      <AppHeader
        session={ANONYMOUS}
        locale="es"
        locales={LOCALES}
        texts={TEXTS}
        onSignIn={vi.fn()}
        onSignOut={vi.fn()}
        onLocaleChange={vi.fn()}
        currentPath={currentPath}
      />,
    );
  }

  it("shows an icon-only control named from the catalog, with the focus ring, hidden from md (spec: Navigation menu control)", () => {
    renderAt();
    const trigger = screen.getByRole("button", { name: TEXTS.navigationMenu });
    expect(trigger.querySelector("svg")).not.toBeNull();
    expect(trigger.textContent).toBe("");
    const tokens = trigger.className.split(/\s+/);
    expect(tokens).toEqual(
      expect.arrayContaining(["md:hidden", "focus-visible:focus-ring"]),
    );
  });

  it("lists the primary navigation entries in order with their destinations, the current one marked (spec: Navigation menu on a small viewport)", () => {
    renderAt("/es/coffeeshops");
    fireEvent.pointerDown(screen.getByRole("button", { name: TEXTS.navigationMenu }));
    const entries = screen.getAllByRole("menuitem");
    expect(entries.map((entry) => entry.textContent)).toEqual([
      TEXTS.topRated,
      TEXTS.exploreCoffeeshops,
      TEXTS.aboutUs,
    ]);
    expect(entries.map((entry) => entry.getAttribute("href"))).toEqual([
      "/es/offerings?verified=1&orderBy=cupping_avg&orderDirection=desc",
      "/es/coffeeshops",
      "/es/about",
    ]);
    expect(entries.map((entry) => entry.getAttribute("aria-current"))).toEqual([
      null,
      "page",
      null,
    ]);
  });

  it("shows a decorative icon and the header look on every entry (spec: Navigation menu entries carry icons and the header look)", () => {
    renderAt();
    fireEvent.pointerDown(screen.getByRole("button", { name: TEXTS.navigationMenu }));
    expectHeaderMenuEntries(screen.getAllByRole("menuitem"));
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

  function openMenu() {
    fireEvent.pointerDown(
      screen.getByRole("button", { name: TEXTS.languageSelector }),
    );
  }

  it("lists exactly the supported locales as menu entries (spec: Only supported locales are offered)", () => {
    renderSelect();
    openMenu();
    const entries = screen.getAllByRole("menuitemradio");
    expect(entries.map((entry) => entry.textContent)).toEqual([
      "Español",
      "English",
      "Català",
    ]);
  });

  it("calls back with the chosen locale (spec: Choosing a locale)", () => {
    const { onLocaleChange } = renderSelect();
    openMenu();
    fireEvent.click(screen.getByRole("menuitemradio", { name: "English" }));
    expect(onLocaleChange).toHaveBeenCalledWith("en");
  });

  it("choosing the current language changes nothing (spec: Choosing the current language changes nothing)", () => {
    // with value="es" the Español entry is the language already active
    // (design.md D7: choosing it closes the menu and calls back nothing)
    const { onLocaleChange } = renderSelect();
    openMenu();
    fireEvent.click(screen.getByRole("menuitemradio", { name: "Español" }));
    expect(screen.queryByRole("menu")).toBeNull();
    expect(onLocaleChange).not.toHaveBeenCalled();
  });

  it("shows globe, code and chevron on every viewport (spec: Trigger content on every viewport)", () => {
    renderSelect();
    const trigger = screen.getByRole("button", { name: TEXTS.languageSelector });
    expect(trigger.querySelector("svg.lucide-globe")).not.toBeNull();
    expect(trigger.textContent).toContain("ES");
    expect(trigger.querySelector("svg.lucide-chevron-down")).not.toBeNull();
    // the trigger itself is gated by no breakpoint
    expect(trigger.className).not.toContain("hidden");
    expect(trigger.className).not.toContain("md:");
  });

  it("renders each language in its own name with its own lang attribute (spec: Each language in its own name)", () => {
    renderSelect();
    openMenu();
    const entries: Array<[string, string]> = [
      ["Español", "es"],
      ["English", "en"],
      ["Català", "ca"],
    ];
    for (const [name, lang] of entries) {
      expect(
        screen.getByRole("menuitemradio", { name }).getAttribute("lang"),
      ).toBe(lang);
    }
  });

  it("marks the current language as the single choice (spec: Current language is marked)", () => {
    renderSelect();
    openMenu();
    const current = screen.getByRole("menuitemradio", { name: "Español" });
    expect(current.getAttribute("aria-checked")).toBe("true");
    const others = screen
      .getAllByRole("menuitemradio")
      .filter((entry) => entry !== current);
    for (const other of others) {
      expect(other.getAttribute("aria-checked")).not.toBe("true");
    }
  });

  it("shows the check indicator on the current language only, in the entry's text colour (spec: Current choice is marked with an indicator)", () => {
    renderSelect();
    openMenu();
    const current = screen.getByRole("menuitemradio", { name: "Español" });
    const check = current.querySelector("svg.lucide-check");
    expect(check).not.toBeNull();
    // design.md D7: the indicator follows the entry's text through
    // currentColor, so neither it nor its wrapper carries a colour of its own
    const wrapper = current.querySelector(
      '[data-slot="dropdown-menu-radio-item-indicator"]',
    )!;
    for (const el of [check!, wrapper]) {
      const tokens = (el.getAttribute("class") ?? "").split(/\s+/);
      expect(tokens.filter((cls) => /(^|:)text-/.test(cls))).toEqual([]);
    }
    const others = screen
      .getAllByRole("menuitemradio")
      .filter((entry) => entry !== current);
    for (const other of others) {
      expect(other.querySelector("svg.lucide-check")).toBeNull();
    }
  });

  it("renders as a ghost trigger with no fill and no border (spec: Triggers are not action controls)", () => {
    renderSelect();
    const trigger = screen.getByRole("button", { name: TEXTS.languageSelector });
    // no fill and no border, at rest or in any state (design.md D3)
    expect(trigger.className).not.toMatch(/(^|:)bg-/);
    expect(trigger.className).not.toMatch(/(^|:)border/);
  });

  it("carries the trigger content colours `text-nav-text` with `hover:text-nav-text-hover` (spec: Trigger content follows the navigation text colours)", () => {
    renderSelect();
    const trigger = screen.getByRole("button", { name: TEXTS.languageSelector });
    expect(trigger.classList.contains("text-nav-text")).toBe(true);
    expect(trigger.classList.contains("hover:text-nav-text-hover")).toBe(true);
  });

  it("renders its menu with the nav treatment (spec: Menu surface extends the header)", () => {
    renderSelect();
    openMenu();
    const panel = screen.getByRole("menu");
    expect(panel.classList.contains("bg-nav-surface")).toBe(true);
    expect(panel.classList.contains("text-nav-text")).toBe(true);
    expect(panel.classList.contains("rounded-field")).toBe(true);
    expect(panel.classList.contains("bg-surface-card")).toBe(false);
    expect(panel.classList.contains("text-text-primary")).toBe(false);
    expect(panel.classList.contains("rounded-container")).toBe(false);
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
    process.env.NEXT_PUBLIC_APP_URL = "https://tazavera.test";
  });

  function renderSignedIn(role: string) {
    return renderHeader({ state: "authenticated", user: { ...USER, role } });
  }

  function openMenu() {
    fireEvent.pointerDown(screen.getByRole("button", { name: "Andrés Gómez" }));
  }

  it("opens from a control carrying the user's initials and an accessible name identifying the user", () => {
    renderSignedIn("specialist");
    const trigger = screen.getByRole("button", { name: "Andrés Gómez" });
    expect(trigger.textContent).toContain("AG");
  });

  // ─── The user control as a header menu trigger (spec: "Header menu
  // triggers" and "Signed-in header and user menu"; design.md D3, D4, D5) ───
  // Written before task 3.2 restyles the trigger, so the cases below run and
  // fail until then. The circle and the name are found through their own
  // text, the chevron through its icon class, so every assertion stays about
  // classes. The name and the chevron carry the build's chosen breakpoint
  // pair — `hidden md:inline` and `hidden md:block` — asserted as chosen.

  it("renders as a ghost trigger with no fill and no border (spec: Triggers are not action controls)", () => {
    renderSignedIn("specialist");
    const trigger = screen.getByRole("button", { name: "Andrés Gómez" });
    // no fill and no border at rest (design.md D3)
    const tokens = trigger.className.split(/\s+/).filter(Boolean);
    expect(tokens.filter((cls) => /(^|:)bg-/.test(cls))).toEqual([]);
    expect(tokens.filter((cls) => /(^|:)border/.test(cls))).toEqual([]);
  });

  it("carries the trigger content colours `text-nav-text` with `hover:text-nav-text-hover` (spec: Trigger content follows the navigation text colours)", () => {
    renderSignedIn("specialist");
    const trigger = screen.getByRole("button", { name: "Andrés Gómez" });
    expect(trigger.classList.contains("text-nav-text")).toBe(true);
    expect(trigger.classList.contains("hover:text-nav-text-hover")).toBe(true);
  });

  it("shows the circle, the name and a chevron from md (spec: Name and chevron on a medium or larger viewport)", () => {
    renderSignedIn("specialist");
    const trigger = screen.getByRole("button", { name: "Andrés Gómez" });
    expect(within(trigger).getByText("AG")).toBeDefined();
    // the name and the chevron show from md up (the build's chosen classes)
    const name = within(trigger).getByText("Andrés Gómez");
    expect(name.classList.contains("hidden")).toBe(true);
    expect(name.classList.contains("md:inline")).toBe(true);
    const chevron = trigger.querySelector("svg.lucide-chevron-down");
    expect(chevron).not.toBeNull();
    expect(chevron!.classList.contains("hidden")).toBe(true);
    expect(chevron!.classList.contains("md:block")).toBe(true);
  });

  it("shows the initials circle alone below md (spec: Initials circle alone on a small viewport)", () => {
    renderSignedIn("specialist");
    const trigger = screen.getByRole("button", { name: "Andrés Gómez" });
    // the name and the chevron hide below md and show from md up ...
    const name = within(trigger).getByText("Andrés Gómez");
    expect(name.classList.contains("hidden")).toBe(true);
    expect(name.classList.contains("md:inline")).toBe(true);
    const chevron = trigger.querySelector("svg.lucide-chevron-down");
    expect(chevron).not.toBeNull();
    expect(chevron!.classList.contains("hidden")).toBe(true);
    expect(chevron!.classList.contains("md:block")).toBe(true);
    // ... while the circle is never breakpoint-gated
    const circle = within(trigger).getByText("AG");
    expect(circle.className).not.toContain("hidden");
    expect(circle.className).not.toContain("md:");
  });

  it("keeps the visible focus ring on keyboard focus (spec: Trigger keeps the focus ring on keyboard focus)", () => {
    renderSignedIn("specialist");
    const trigger = screen.getByRole("button", { name: "Andrés Gómez" });
    // the shared focus indicator, and no focus treatment of its own
    expect(trigger.classList.contains("focus-visible:focus-ring")).toBe(true);
    expect(trigger.classList.contains("outline-none")).toBe(false);
    expect(
      trigger.className.split(/\s+/).filter((cls) => /(^|:)ring-/.test(cls)),
    ).toEqual([]);
  });

  it("renders one circle class list in both themes (spec: Initials circle in the traditional theme, Initials circle in the dark theme, Circle boundary in the dark theme)", () => {
    renderSignedIn("specialist");
    const trigger = screen.getByRole("button", { name: "Andrés Gómez" });
    const circle = within(trigger).getByText("AG");
    // design.md D5: one class list; the theme difference lives entirely in
    // the token values, so no class is chosen at render per theme
    for (const cls of [
      "bg-nav-avatar",
      "text-nav-text-dark",
      "border",
      "border-nav-avatar-border",
    ]) {
      expect(circle.classList.contains(cls), cls).toBe(true);
    }
    // the circle takes the hover pair while the pointer is anywhere on the
    // trigger (design.md D4): `group` on the trigger and the hover class on
    // the circle — the build's chosen wiring, asserted as chosen
    expect(trigger.classList.contains("group")).toBe(true);
    expect(
      circle.classList.contains("group-hover:bg-nav-avatar-hover"),
    ).toBe(true);
    // no theme-scoped class and no foreign treatment on the circle
    expect(circle.className).not.toContain("theme-dark:");
    const tokens = circle.className.split(/\s+/).filter(Boolean);
    expect(tokens.filter((cls) => /(^|:)nav-button-/.test(cls))).toEqual([]);
    expect(tokens.filter((cls) => /(^|:)action-primary-/.test(cls))).toEqual([]);
  });

  it("offers one account entry pointing at /es/account, before the Security entry (spec: Menu content)", () => {
    renderSignedIn("specialist");
    openMenu();
    const account = screen.getByRole("menuitem", { name: TEXTS.myAccount });
    expect(account.getAttribute("href")).toBe("/es/account");
    const accountEntries = screen
      .getAllByRole("menuitem")
      .filter((entry) => entry.getAttribute("href")?.startsWith("/es/account"));
    expect(accountEntries).toEqual([account]);
    for (const old of [
      "/es/account/profile",
      "/es/account/edit",
      "/es/account/password",
      "/es/account/deactivate",
      "/es/account/delete",
    ]) {
      expect(document.querySelector(`a[href="${old}"]`), old).toBeNull();
    }
    const security = screen.getByRole("menuitem", { name: TEXTS.security });
    expect(
      account.compareDocumentPosition(security) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("points the account entry at /{locale}/account for the active locale (spec: The account entry points at the account page)", () => {
    render(
      <AppHeader
        session={{ state: "authenticated", user: { ...USER, role: "specialist" } }}
        locale="ca"
        locales={LOCALES}
        texts={TEXTS}
        onSignIn={vi.fn()}
        onSignOut={vi.fn()}
        onLocaleChange={vi.fn()}
      />,
    );
    openMenu();
    expect(
      screen.getByRole("menuitem", { name: TEXTS.myAccount }).getAttribute("href"),
    ).toBe("/ca/account");
  });

  it("renders the security entry as an external link, natively", () => {
    renderSignedIn("specialist");
    openMenu();
    // The menu content is portaled, so it is queried through the screen.
    const security = screen.getByRole("menuitem", { name: TEXTS.security });
    expect(security.getAttribute("href")).toBe(
      "https://tazavera.test/user/security",
    );
    // not the internal Link treatment (base-controls: external destinations
    // are rendered natively)
    expect(security.className).not.toContain("underline");
    expect(security.className).not.toContain("text-text-link");
  });

  it("opens the security entry in a popup window on a plain click and the tab does not navigate (open-security-pages-in-popup D4)", () => {
    const open = vi.fn().mockReturnValue({ closed: false });
    vi.stubGlobal("open", open);
    try {
      renderSignedIn("specialist");
      openMenu();
      const notPrevented = fireEvent.click(
        screen.getByRole("menuitem", { name: TEXTS.security }),
      );
      expect(notPrevented).toBe(false);
      expect(open).toHaveBeenCalledWith(
        "https://tazavera.test/user/security",
        "tazavera-security",
        "popup",
      );
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("shows the theme switch in the header and no theme selector in the menu (spec: Signed-in header and user menu)", () => {
    renderSignedIn("specialist");
    expect(
      screen.getByRole("button", { name: TEXTS.themeToggleToDark }),
    ).toBeDefined();
    openMenu();
    expect(screen.queryByRole("combobox")).toBeNull();
  });

  it("offers \"Manage offerings\" to /es/manage/offerings for a coffeeshop (spec: Management entry for a coffeeshop)", () => {
    renderSignedIn("coffeeshop");
    openMenu();
    expect(
      screen.getByRole("menuitem", { name: TEXTS.manageOfferings }).getAttribute("href"),
    ).toBe("/es/manage/offerings");
    // only a specialist gets the offerings entry (spec: Menu content)
    expect(screen.queryByText(TEXTS.exploreOfferings)).toBeNull();
  });

  it("offers \"Manage locations\" to /es/manage/locations right after \"Manage offerings\" for a coffeeshop (spec: Manage locations entry for a coffeeshop)", () => {
    renderSignedIn("coffeeshop");
    openMenu();
    const offerings = screen.getByRole("menuitem", { name: TEXTS.manageOfferings });
    const locations = screen.getByRole("menuitem", { name: TEXTS.manageLocations });
    expect(locations.getAttribute("href")).toBe("/es/manage/locations");
    const items = screen.getAllByRole("menuitem");
    expect(items.indexOf(locations)).toBe(items.indexOf(offerings) + 1);
  });

  it("offers \"Explore coffee inventory\" to /es/manage/inventory right after \"Manage locations\" for a coffeeshop (spec: Explore coffee inventory entry for a coffeeshop)", () => {
    renderSignedIn("coffeeshop");
    openMenu();
    const locations = screen.getByRole("menuitem", { name: TEXTS.manageLocations });
    const inventory = screen.getByRole("menuitem", { name: TEXTS.exploreInventory });
    expect(inventory.getAttribute("href")).toBe("/es/manage/inventory");
    const items = screen.getAllByRole("menuitem");
    expect(items.indexOf(inventory)).toBe(items.indexOf(locations) + 1);
  });

  it("offers \"Manage evaluations\" to /es/manage/evaluations followed by \"Explore offerings\" to /es/offerings for a specialist (spec: Management entry for a specialist)", () => {
    renderSignedIn("specialist");
    openMenu();
    const manage = screen.getByRole("menuitem", { name: TEXTS.manageEvaluations });
    expect(manage.getAttribute("href")).toBe("/es/manage/evaluations");
    const explore = screen.getByRole("menuitem", { name: TEXTS.exploreOfferings });
    expect(explore.getAttribute("href")).toBe("/es/offerings");
    const items = screen.getAllByRole("menuitem");
    expect(items.indexOf(explore)).toBe(items.indexOf(manage) + 1);
  });

  it("offers the account entry and sign out with no management entry for any other role (spec: No management entry for the role)", () => {
    renderSignedIn("customer");
    openMenu();
    expect(screen.queryByText(TEXTS.manageOfferings)).toBeNull();
    expect(screen.queryByText(TEXTS.manageEvaluations)).toBeNull();
    expect(
      screen.getByRole("menuitem", { name: TEXTS.myAccount }).getAttribute("href"),
    ).toBe("/es/account");
    expect(screen.getByRole("menuitem", { name: TEXTS.signOut })).toBeDefined();
  });

  it("shows a decorative icon and the header look on every entry (spec: Menu entries carry icons and the header look)", () => {
    renderSignedIn("specialist");
    openMenu();
    expectHeaderMenuEntries(screen.getAllByRole("menuitem"));
  });
});
