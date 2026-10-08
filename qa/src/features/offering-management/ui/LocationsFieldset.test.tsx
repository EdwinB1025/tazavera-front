import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, within } from "@testing-library/react";
import type { LocationItem } from "@/shared/api";
import { LocationsFieldset } from "@/features/offering-management/ui/LocationsFieldset";

// No global test setup in this project, so RTL auto-cleanup does not run.
afterEach(() => {
  cleanup();
});

/**
 * The locations group (design.md D10; spec "Creating offerings"). Written
 * before `./LocationsFieldset` exists (task 7.1).
 */

const TEXTS = {
  locationsLegend: "Locations",
  locationsLoading: "Loading your locations…",
  locationsEmpty: "You have no locations registered.",
  locationsError: "Your locations could not be loaded.",
  retryLabel: "Retry",
};

const GRACIA: LocationItem = { ulid: "01L1", name: "Tazavera Gràcia" };
const BORN: LocationItem = { ulid: "01L2", name: "Tazavera Born" };

type Props = Partial<Parameters<typeof LocationsFieldset>[0]>;

function renderGroup(props: Props = {}) {
  const onToggle = vi.fn();
  const onRetry = vi.fn();
  render(
    <LocationsFieldset
      locations={{ state: "success", data: [GRACIA, BORN] }}
      selected={[]}
      onToggle={onToggle}
      onRetry={onRetry}
      texts={TEXTS}
      {...props}
    />,
  );
  return { onToggle, onRetry };
}

function group(): HTMLElement {
  return screen.getByRole("group", { name: /Locations/ });
}

describe("LocationsFieldset (design.md D10)", () => {
  it("is a fieldset whose legend carries the required asterisk", () => {
    renderGroup();
    const fieldset = group();
    expect(fieldset.tagName).toBe("FIELDSET");
    const legend = fieldset.querySelector("legend")!;
    expect(legend.textContent).toContain(TEXTS.locationsLegend);
    expect(legend.querySelector('[aria-hidden="true"]')?.textContent).toBe("*");
  });

  it("renders one checkbox per location labelled by its name, checked as selected", () => {
    renderGroup({ selected: ["01L2"] });
    const boxes = within(group()).getAllByRole("checkbox");
    expect(boxes).toHaveLength(2);
    const gracia = within(group()).getByRole("checkbox", { name: "Tazavera Gràcia" });
    const born = within(group()).getByRole("checkbox", { name: "Tazavera Born" });
    expect((gracia as HTMLInputElement).checked).toBe(false);
    expect((born as HTMLInputElement).checked).toBe(true);
  });

  it("activating a checkbox reports its location", () => {
    const { onToggle } = renderGroup();
    fireEvent.click(screen.getByRole("checkbox", { name: "Tazavera Gràcia" }));
    expect(onToggle).toHaveBeenCalledWith("01L1");
  });

  it("while loading, the loading line takes the options' place", () => {
    renderGroup({ locations: { state: "loading" } });
    expect(within(group()).getByText(TEXTS.locationsLoading)).toBeTruthy();
    expect(screen.queryAllByRole("checkbox")).toHaveLength(0);
  });

  it("with no locations, the empty message takes the options' place", () => {
    renderGroup({ locations: { state: "success", data: [] } });
    expect(within(group()).getByText(TEXTS.locationsEmpty)).toBeTruthy();
    expect(screen.queryAllByRole("checkbox")).toHaveLength(0);
  });

  it("on a failure, the error line and Retry take the options' place; Retry reports", () => {
    const { onRetry } = renderGroup({ locations: { state: "error" } });
    expect(within(group()).getByText(TEXTS.locationsError)).toBeTruthy();
    expect(screen.queryAllByRole("checkbox")).toHaveLength(0);
    fireEvent.click(within(group()).getByRole("button", { name: TEXTS.retryLabel }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("disabled, every checkbox is unavailable", () => {
    renderGroup({ disabled: true });
    for (const box of screen.getAllByRole("checkbox")) {
      expect((box as HTMLInputElement).disabled).toBe(true);
    }
  });
});
