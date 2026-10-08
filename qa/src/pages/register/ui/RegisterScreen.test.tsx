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
  it("shows the specialist title and the intro on the specialist route", () => {
    render(<RegisterScreen locale="es" role="specialist" />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      es.registerSpecialistTitle,
    );
    expect(screen.getByText(es.registerIntro)).toBeTruthy();
  });

  it("shows the coffeeshop title on the coffeeshop route", () => {
    render(<RegisterScreen locale="es" role="coffeeshop" />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      es.registerCoffeeshopTitle,
    );
  });

  it("while anonymous renders the form labelled by the page heading, with every text from the catalog", () => {
    auth.session = { state: "anonymous" };
    render(<RegisterScreen locale="es" role="specialist" />);
    const heading = screen.getByRole("heading", { level: 1 });
    const form = document.querySelector("form")!;
    expect(form.getAttribute("aria-labelledby")).toBe(heading.id);
    for (const key of [
      "nameLabel",
      "surnameLabel",
      "emailLabel",
      "passwordLabel",
      "passwordConfirmationLabel",
      "passwordHelp",
      "registerSubmit",
    ]) {
      expect(document.body.textContent?.includes(es[key]!), key).toBe(true);
    }
    expect(screen.getAllByRole("button", { name: es.showPassword })).toHaveLength(2);
  });
});
