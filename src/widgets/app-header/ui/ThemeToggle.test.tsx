import { describe, it, expect, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { ThemeToggle } from "@/widgets/app-header";
import { THEME_COOKIE, type Theme } from "@/shared/lib/theme";

// No global test setup in this project, so RTL auto-cleanup does not run.
afterEach(() => {
  cleanup();
});

beforeEach(() => {
  // isolate the browser side between cases
  document.cookie = `${THEME_COOKIE}=; max-age=0; path=/`;
  document.documentElement.removeAttribute("data-theme");
});

/**
 * Theme switch tests (refine-header-aut design.md D1–D3; spec "Theme
 * switch"). Written before the component exists (task 1.1); the import of
 * `ThemeToggle` fails to resolve until then.
 */
const TEXTS = {
  themeToggleToDark: "theme.toDark",
  themeToggleToTraditional: "theme.toTraditional",
};

function renderToggle(initialTheme: Theme = "traditional") {
  return render(<ThemeToggle initialTheme={initialTheme} texts={TEXTS} />);
}

describe("ThemeToggle", () => {
  it("switches the theme, keeping the choice in the cookie (spec: Switching the theme)", () => {
    renderToggle();
    fireEvent.click(screen.getByRole("button", { name: TEXTS.themeToggleToDark }));
    expect(document.cookie).toContain(`${THEME_COOKIE}=dark`);
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("names the current and the target theme, the name following the theme (spec: Switch is named)", () => {
    renderToggle();
    const toggle = screen.getByRole("button", { name: TEXTS.themeToggleToDark });
    expect(toggle.hasAttribute("aria-pressed")).toBe(false);
    fireEvent.click(toggle);
    expect(toggle.getAttribute("aria-label")).toBe(TEXTS.themeToggleToTraditional);
  });

  it("shows a sun in traditional and a moon in dark, with no visible text (spec: Switch icon)", () => {
    const { container } = renderToggle();
    expect(container.querySelector("svg.lucide-sun")).not.toBeNull();
    expect(screen.getByRole("button").textContent).toBe("");
    cleanup();
    const dark = renderToggle("dark");
    expect(dark.container.querySelector("svg.lucide-moon")).not.toBeNull();
  });

  it("renders as a ghost icon control with the nav text colours and the focus ring (spec: Switch presentation)", () => {
    renderToggle();
    expect(screen.getByRole("button").className).toBe(
      "flex size-10 items-center justify-center rounded-field text-nav-text hover:text-nav-text-hover focus-visible:focus-ring",
    );
  });
});
