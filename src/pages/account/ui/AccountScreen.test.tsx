import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { getMessages } from "@/shared/lib/i18n";
import type { AccountClientProps } from "./AccountClient";
import { AccountScreen } from "@/pages/account";

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
const contactEs = getMessages("contact", "es");

describe("AccountScreen", () => {
  it("renders the heading block from the catalog", () => {
    render(<AccountScreen locale="es" />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      es.accountTitle,
    );
    expect(screen.getByText(es.accountIntro)).toBeTruthy();
    expect(screen.getByTestId("account-client")).toBeTruthy();
  });

  it("passes the locale and the texts built from messages/es/account.json and messages/es/contact.json", () => {
    render(<AccountScreen locale="es" />);
    expect(client.props?.locale).toBe("es");
    const texts = client.props?.texts as Record<string, string>;
    for (const key of [
      "loading",
      "signedOutText",
      "signIn",
      "profileHeading",
      "passwordHeading",
      "securityHeading",
      "securityDescription",
      "securityLink",
      "dangerZoneHeading",
      "contactHeading",
      "contactDescription",
      "contactEmptyText",
      "contactAddButton",
      "contactLoadError",
      "retry",
      "contactSaved",
      "contactExists",
      "urlFormatError",
    ]) {
      expect(texts[key], key).toBeTypeOf("string");
      expect(texts[key], key).toBe(es[key]);
    }
    for (const key of [
      "contactAddressLabel",
      "contactPostalCodeLabel",
      "contactCityLabel",
      "contactCountryLabel",
      "contactPhoneLabel",
      "contactEmailLabel",
      "contactWebLabel",
      "contactSocialLabel",
    ]) {
      expect(texts[key], key).toBeTypeOf("string");
      expect(texts[key], key).toBe(contactEs[key]);
    }
    const catalogs: Record<string, string> = { ...es, ...contactEs };
    for (const [key, value] of Object.entries(texts)) {
      expect(value, key).toBe(catalogs[key]);
    }
  });
});
