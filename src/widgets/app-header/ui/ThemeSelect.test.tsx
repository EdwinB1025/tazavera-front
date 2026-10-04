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

  it("offers exactly the application's themes", () => {
    renderSelect();
    const values = Array.from(
      screen.getByRole("combobox", { name: "theme.select" }).querySelectorAll("option"),
    ).map((option) => option.value);
    expect(values).toEqual(["traditional", "dark"]);
  });

  it("choosing a theme writes the cookie and applies it to the document root immediately (spec: Choosing a theme)", () => {
    renderSelect();
    fireEvent.change(screen.getByRole("combobox", { name: "theme.select" }), {
      target: { value: "dark" },
    });
    expect(document.cookie).toContain(`${THEME_COOKIE}=dark`);
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });
});
