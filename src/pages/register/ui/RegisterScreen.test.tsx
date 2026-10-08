import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import type { Session } from "@/shared/api";
import { getMessages } from "@/shared/lib/i18n";
import { RegisterScreen } from "@/pages/register";

/**
 * Registration screen (design.md D1, D3 and D10; specs "Registration routes"
 * and "Registration form"). The server screen loads the `account` catalog of
 * the route's locale, renders the heading block — the role's title and the
 * intro — and the client region, which receives every text as props. The
 * session and the router are mocked at their entry points.
 */

const auth = vi.hoisted(() => ({ session: { state: "loading" } as Session }));

vi.mock("@/features/auth", () => ({
  useSession: () => auth.session,
  signIn: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
}));

afterEach(() => {
  cleanup();
  auth.session = { state: "loading" };
});

const es = getMessages("account", "es");

describe("RegisterScreen", () => {
  it("while the session is loading shows the heading and the loading status and no form", () => {
    render(<RegisterScreen locale="es" role="specialist" />);
    expect(screen.getByRole("heading", { level: 1 })).toBeTruthy();
    expect(screen.getByRole("status").textContent).toBe(es.loading);
    expect(document.querySelector("form")).toBeNull();
  });

  it("fills the page container with the registration card, its content capped from md", () => {
    render(<RegisterScreen locale="es" role="specialist" />);
    const column = screen.getByRole("heading", { level: 1 }).parentElement!
      .parentElement!;
    expect(column.classList.contains("w-full")).toBe(true);
    expect(column.classList.contains("max-w-lg")).toBe(false);
    expect(column.classList.contains("mx-auto")).toBe(false);
    expect(
      screen.getByRole("status").closest(".md\\:max-w-160"),
    ).not.toBeNull();
  });
});
