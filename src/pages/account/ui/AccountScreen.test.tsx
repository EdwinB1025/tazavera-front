import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { getMessages } from "@/shared/lib/i18n";
import type { AccountClientProps } from "./AccountClient";
import { AccountScreen } from "@/pages/account";
import { AccountSection } from "@/features/user-account";

/**
 * Account screen (design.md D1, D3 and D10). The server screen loads the
 * `account` catalog of the route's locale, renders the heading block and
 * passes the client region its texts, every value read from the catalog
 * under its own key. The client region is replaced to record its props.
 */

const client = vi.hoisted(() => ({ props: null as AccountClientProps | null }));

vi.mock("./AccountClient", () => ({
  AccountClient: (props: AccountClientProps) => {
    client.props = props;
    return <div data-testid="account-client" />;
  },
}));

afterEach(() => {
  cleanup();
  client.props = null;
});

const es = getMessages("account", "es");

describe("AccountScreen", () => {
  it("renders the heading block from the catalog", () => {
    render(<AccountScreen locale="es" />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      es.accountTitle,
    );
    expect(screen.getByText(es.accountIntro)).toBeTruthy();
    expect(screen.getByTestId("account-client")).toBeTruthy();
  });

  it("fills the page container with the sections, each card's content capped from md", () => {
    render(<AccountScreen locale="es" />);
    const column = screen.getByTestId("account-client").parentElement!;
    expect(column.classList.contains("w-full")).toBe(true);
    expect(column.classList.contains("max-w-lg")).toBe(false);
    cleanup();

    render(
      <AccountSection heading="fx-heading">
        <p>fx-content</p>
      </AccountSection>,
    );
    const content = screen.getByText("fx-content").parentElement!;
    expect(content.classList.contains("md:max-w-160")).toBe(true);
    expect(content.closest(".bg-surface-section")).toBeNull();
  });
});
