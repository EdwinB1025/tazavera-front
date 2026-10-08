import { describe, it, expect, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { ThemeSelect } from "@/widgets/app-header";
import { THEME_COOKIE } from "@/shared/lib/theme";

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
 * Theme selector tests (design.md D12; spec "Theme selection"). Written
 * before the component exists (task 5.2); the import of `ThemeSelect` fails
 * to resolve until then, so the file runs and fails as required.
 *
 * The selector offers exactly the application's themes (the theme values are
 * data, not interface text) and carries an accessible name; choosing one
 * writes the preference cookie and applies `data-theme` to the document root
 * immediately, without a reload.
 */
describe("ThemeSelect", () => {
  function renderSelect() {
    return render(<ThemeSelect label="theme.select" />);
  }

  it("carries an accessible name (spec: Selector is named)", () => {
    renderSelect();
    expect(screen.getByRole("combobox", { name: "theme.select" })).toBeDefined();
  });

  it("choosing a theme writes the cookie and applies it to the document root immediately (spec: Choosing a theme)", () => {
    renderSelect();
    fireEvent.change(screen.getByRole("combobox", { name: "theme.select" }), {
      target: { value: "dark" },
    });
    expect(document.cookie).toContain(`${THEME_COOKIE}=dark`);
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  // ─── The menu treatment (refine-app-header design.md D9; spec: "Theme
  // selector inside the menu") ─── The selector keeps its geometry and the
  // shared focus indicator and takes the header menu row treatment in place
  // of the cream input block. Written before task 3.2 restyles the control,
  // so it runs and fails until then.

  it("renders in the treatment of the menu around it (design.md D9)", () => {
    renderSelect();
    const select = screen.getByRole("combobox", { name: "theme.select" });
    // the geometry and the focus indicator stay
    for (const cls of [
      "h-10",
      "w-full",
      "px-3",
      "rounded-field",
      "focus-visible:focus-ring",
    ]) {
      expect(select.classList.contains(cls), cls).toBe(true);
    }
    // the nav row treatment of the header menus
    for (const cls of ["type-navlist-item", "bg-nav-surface", "border-border-strong"]) {
      expect(select.classList.contains(cls), cls).toBe(true);
    }
    // and none of the input block treatment
    for (const cls of ["type-control", "bg-surface-input"]) {
      expect(select.classList.contains(cls), cls).toBe(false);
    }
  });
});
