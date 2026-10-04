import { describe, it, expect, afterEach, beforeAll, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
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
  profile: "texts.profile",
  editProfile: "texts.editProfile",
  changePassword: "texts.changePassword",
  deactivateAccount: "texts.deactivateAccount",
  deleteAccount: "texts.deleteAccount",
  security: "texts.security",
  themeSelector: "texts.themeSelector",
  manageOfferings: "texts.manageOfferings",
  manageEvaluations: "texts.manageEvaluations",
  signOut: "texts.signOut",
};

function renderHeader(session: Session = ANONYMOUS) {
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
      screen.getByRole("combobox", { name: TEXTS.languageSelector }).className,
    ).not.toContain("hidden");
    expect(screen.getByRole("button", { name: TEXTS.signIn }).className).not.toContain(
      "hidden",
    );
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

  it("shows no user menu while the session is anonymous (spec: Signed-out header renders)", () => {
    renderHeader();
    expect(screen.queryByRole("menu")).toBeNull();
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

  it("renders every interface text from its props (design.md D10)", () => {
    renderHeader();
    expect(screen.getByText(TEXTS.topRated)).toBeDefined();
    expect(screen.getByText(TEXTS.aboutUs)).toBeDefined();
    expect(screen.getByText(TEXTS.signIn)).toBeDefined();
    expect(
      screen.getByRole("combobox", { name: TEXTS.languageSelector }),
    ).toBeDefined();
  });
});

describe("PrimaryNav", () => {
  function renderNav() {
    return render(<PrimaryNav locale="es" texts={{ topRated: TEXTS.topRated, aboutUs: TEXTS.aboutUs }} />);
  }

  it("shows Top rated and About us with their destinations from the spec at md and up", () => {
    renderNav();
    const topRated = screen.getByRole("link", { name: TEXTS.topRated });
    expect(topRated.getAttribute("href")).toBe(
      "/es/offerings?verified=1&orderBy=cupping_avg&orderDirection=desc",
    );
    const aboutUs = screen.getByRole("link", { name: TEXTS.aboutUs });
    expect(aboutUs.getAttribute("href")).toBe("/es/about");
  });

  it("is hidden below the md breakpoint and shown from md up", () => {
    renderNav();
    const nav = screen.getByRole("navigation");
    expect(nav.className).toContain("hidden");
    expect(nav.className).toContain("md:flex");
  });

  it("builds its destinations from the active locale", () => {
    render(<PrimaryNav locale="ca" texts={{ topRated: TEXTS.topRated, aboutUs: TEXTS.aboutUs }} />);
    expect(screen.getByRole("link", { name: TEXTS.topRated }).getAttribute("href")).toBe(
      "/ca/offerings?verified=1&orderBy=cupping_avg&orderDirection=desc",
    );
    expect(screen.getByRole("link", { name: TEXTS.aboutUs }).getAttribute("href")).toBe(
      "/ca/about",
    );
  });
});

describe("LanguageSelect", () => {
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

  it("carries an accessible name (spec: Selector is named)", () => {
    renderSelect();
    expect(screen.getByRole("combobox", { name: TEXTS.languageSelector })).toBeDefined();
  });

  it("lists exactly the supported locales (spec: Only supported locales are offered)", () => {
    renderSelect();
    const select = screen.getByRole("combobox", { name: TEXTS.languageSelector });
    const values = Array.from(select.querySelectorAll("option")).map(
      (option) => option.value,
    );
    expect(values).toEqual(LOCALES);
  });

  it("calls back with the chosen locale (spec: Choosing a locale)", () => {
    const { onLocaleChange } = renderSelect();
    fireEvent.change(screen.getByRole("combobox", { name: TEXTS.languageSelector }), {
      target: { value: "en" },
    });
    expect(onLocaleChange).toHaveBeenCalledWith("en");
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
    fireEvent.click(screen.getByRole("button", { name: "Andrés Gómez" }));
  }

  it("opens from a control carrying the user's initials and an accessible name identifying the user", () => {
    renderSignedIn("specialist");
    const trigger = screen.getByRole("button", { name: "Andrés Gómez" });
    expect(trigger.textContent).toContain("AG");
  });

  it("offers the profile settings entries pointing at /es/account/*", () => {
    renderSignedIn("specialist");
    openMenu();
    const entries: Array<[string, string]> = [
      [TEXTS.profile, "/es/account/profile"],
      [TEXTS.editProfile, "/es/account/edit"],
      [TEXTS.changePassword, "/es/account/password"],
      [TEXTS.deactivateAccount, "/es/account/deactivate"],
      [TEXTS.deleteAccount, "/es/account/delete"],
    ];
    for (const [name, href] of entries) {
      expect(screen.getByRole("menuitem", { name }).getAttribute("href")).toBe(
        href,
      );
    }
  });

  it("renders the security entry as an external link, natively", () => {
    const { container } = renderSignedIn("specialist");
    openMenu();
    const security = container.querySelector(
      'a[href="https://api.tazavera.test/user/security"]',
    );
    expect(security).not.toBeNull();
    // not the internal Link treatment (base-controls: external destinations
    // are rendered natively)
    expect(security!.className).not.toContain("underline");
    expect(security!.className).not.toContain("text-text-link");
  });

  it("mounts the theme selector (spec: Theme selection)", () => {
    renderSignedIn("specialist");
    openMenu();
    expect(
      screen.getByRole("combobox", { name: TEXTS.themeSelector }),
    ).toBeDefined();
  });

  it("offers \"Manage offerings\" to /es/manage/offerings for a coffeeshop (spec: Management entry for a coffeeshop)", () => {
    renderSignedIn("coffeeshop");
    openMenu();
    expect(
      screen.getByRole("menuitem", { name: TEXTS.manageOfferings }).getAttribute("href"),
    ).toBe("/es/manage/offerings");
  });

  it("offers \"Manage evaluations\" to /es/manage/evaluations for a specialist (spec: Management entry for a specialist)", () => {
    renderSignedIn("specialist");
    openMenu();
    expect(
      screen.getByRole("menuitem", { name: TEXTS.manageEvaluations }).getAttribute("href"),
    ).toBe("/es/manage/evaluations");
  });

  it("offers no management entry for any other role (spec: No management entry for the role)", () => {
    renderSignedIn("customer");
    openMenu();
    expect(screen.queryByText(TEXTS.manageOfferings)).toBeNull();
    expect(screen.queryByText(TEXTS.manageEvaluations)).toBeNull();
  });

  it("invokes the session's sign out and closes (spec: Sign out)", () => {
    const { onSignOut } = renderSignedIn("specialist");
    openMenu();
    fireEvent.click(screen.getByRole("menuitem", { name: TEXTS.signOut }));
    expect(onSignOut).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menuitem", { name: TEXTS.signOut })).toBeNull();
  });

  it("closes when the pointer goes outside it", () => {
    renderSignedIn("specialist");
    openMenu();
    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole("menuitem", { name: TEXTS.signOut })).toBeNull();
  });
});
