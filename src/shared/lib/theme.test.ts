import { describe, it, expect, beforeEach } from "vitest";
import { readTheme, setTheme, THEME_COOKIE } from "@/shared/lib/theme";

/**
 * Theme preference contract (design.md D12, design summary §1; spec "Theme
 * selection"). Written before the module exists (task 5.2); the import fails
 * to resolve until then, so the file runs and fails as required.
 *
 * The preference is a cookie, not a browser-storage item: only cookies reach
 * the server, so the root layout can read it while rendering and put
 * `data-theme="dark"` on `<html>` in the server-rendered markup — no flash and
 * no inline script. The module therefore resolves the theme from a cookie
 * string alone (the request's `cookie` header on the server,
 * `document.cookie` in the browser), and a choice writes the cookie and
 * applies `data-theme` to the document root immediately, without a reload.
 */

beforeEach(() => {
  // isolate the browser side between cases
  document.cookie = `${THEME_COOKIE}=; max-age=0; path=/`;
  document.documentElement.removeAttribute("data-theme");
});

describe("theme preference cookie (design.md D12)", () => {
  it("resolves the theme from a cookie string alone (server-rendered, no inline script)", () => {
    expect(readTheme("theme=dark")).toBe("dark");
    expect(readTheme(`other=1; ${THEME_COOKIE}=dark; more=2`)).toBe("dark");
    expect(readTheme("theme=traditional")).toBe("traditional");
  });

  it("falls back to the traditional theme when no cookie was chosen (spec: No theme chosen yet)", () => {
    expect(readTheme(undefined)).toBe("traditional");
    expect(readTheme(null)).toBe("traditional");
    expect(readTheme("other=1")).toBe("traditional");
  });

  it("falls back without throwing on an unreadable cookie (spec: Unusable stored choice)", () => {
    const unreadable = `${THEME_COOKIE}=%E0%A4%A`;
    expect(() => readTheme(unreadable)).not.toThrow();
    expect(readTheme(unreadable)).toBe("traditional");
  });

  it("falls back on a cookie naming a theme the application does not offer (spec: Unusable stored choice)", () => {
    expect(readTheme("theme=neon")).toBe("traditional");
    expect(readTheme("theme=")).toBe("traditional");
  });

  it("writes the cookie and applies data-theme to the document root immediately (spec: Choosing a theme)", () => {
    setTheme("dark");
    expect(document.cookie).toContain(`${THEME_COOKIE}=dark`);
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");

    setTheme("traditional");
    expect(document.cookie).toContain(`${THEME_COOKIE}=traditional`);
    expect(document.documentElement.getAttribute("data-theme")).toBe("traditional");
  });

  it("keeps the choice across a reload (spec: The choice survives a reload)", () => {
    setTheme("dark");
    // a reload re-reads the stored preference from the cookie string
    expect(readTheme(document.cookie)).toBe("dark");
  });
});
