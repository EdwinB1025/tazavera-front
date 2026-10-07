import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup, screen } from "@testing-library/react";
import { LocationCard } from "@/entities/location";

// No global test setup in this project, so RTL auto-cleanup does not run.
afterEach(() => {
  cleanup();
});

/**
 * LocationCard (design.md D9; spec "Own locations list"): one location in the
 * stacked content card — the name as `h2`, the description when present, the
 * consumer's details slot and the no-map line only when its text is given.
 * Spacing follows summary §8: description 0.5rem below the name, details and
 * no-map line 1rem below, icon 1rem and 0.5rem from its text.
 */

const NAME = "fx-name";
const DESCRIPTION = "fx-description";
const NO_MAP = "fx-no-map";
const DETAILS = <dl data-testid="details" />;

describe("LocationCard (design.md D9)", () => {
  it("renders a stacked content card with the name as h2", () => {
    const { container } = render(<LocationCard name={NAME} />);
    const card = container.firstElementChild as HTMLElement;
    expect(card.className).toContain("border-l-4");
    expect(card.className).toContain("flex-col");
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading.textContent).toBe(NAME);
    expect(heading.className).toBe("type-card-heading");
  });

  it("renders the description 0.5rem below the name when it is a non-empty string", () => {
    render(<LocationCard name={NAME} description={DESCRIPTION} />);
    const description = screen.getByText(DESCRIPTION);
    expect(description.className).toBe("mt-2 type-body");
  });

  it.each([null, undefined, ""])("renders no description for %j", (description) => {
    const { container } = render(<LocationCard name={NAME} description={description} />);
    expect(container.querySelector(".type-body")).toBeNull();
  });

  it("renders the details slot 1rem below, after the description", () => {
    render(<LocationCard name={NAME} description={DESCRIPTION} details={DETAILS} />);
    const details = screen.getByTestId("details");
    const wrapper = details.parentElement as HTMLElement;
    expect(wrapper.className).toBe("mt-4");
    const description = screen.getByText(DESCRIPTION);
    expect(
      description.compareDocumentPosition(details) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("renders the no-map line with an aria-hidden icon only when noMapText is given", () => {
    const { rerender, container } = render(
      <LocationCard name={NAME} details={DETAILS} noMapText={NO_MAP} />,
    );
    const line = screen.getByText(NO_MAP).closest("p") as HTMLElement;
    expect(line.className).toBe("mt-4 flex items-center gap-2 type-meta");
    const icon = line.querySelector("svg") as SVGElement;
    expect(icon.getAttribute("aria-hidden")).toBe("true");
    expect(icon.getAttribute("class")).toContain("size-4");
    expect(
      screen.getByTestId("details").compareDocumentPosition(line) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    rerender(<LocationCard name={NAME} details={DETAILS} />);
    expect(screen.queryByText(NO_MAP)).toBeNull();
    expect(container.querySelector("svg")).toBeNull();
  });
});
