import { describe, it, expect, beforeEach } from "vitest";
import { readTheme, THEME_COOKIE } from "@/shared/lib/theme";

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
});
