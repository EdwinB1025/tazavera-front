import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { getMessages } from "@/shared/lib/i18n";
import type { ManageLocationsClientProps } from "./ManageLocationsClient";
import { ManageLocationsScreen } from "@/pages/manage-locations";

/**
 * The locations screen (design.md D2, D11): the server screen loads the
 * `location-management` catalog of the route's locale and renders the
 * heading block; the client region is replaced to record its props, as
 * `AccountScreen.test.tsx` does.
 */

const client = vi.hoisted(() => ({ props: null as ManageLocationsClientProps | null }));

vi.mock("./ManageLocationsClient", () => ({
  ManageLocationsClient: (props: ManageLocationsClientProps) => {
    client.props = props;
    return <div data-testid="locations-client" />;
  },
}));

afterEach(() => {
  cleanup();
  client.props = null;
});

describe("ManageLocationsScreen", () => {
  it.each(["es", "en", "ca"])("renders the heading block in %s", (locale) => {
    const catalog = getMessages("location-management", locale);
    render(<ManageLocationsScreen locale={locale} />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading.textContent).toBe(catalog.pageTitle);
    expect(heading.getAttribute("tabindex")).toBe("-1");
    expect(screen.getByText(catalog.pageIntro)).toBeTruthy();
    expect(screen.getByTestId("locations-client")).toBeTruthy();
    expect(client.props?.locale).toBe(locale);
  });
});
