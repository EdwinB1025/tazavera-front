import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { CoffeeshopsScreen } from "./CoffeeshopsScreen";

afterEach(() => {
  cleanup();
  block.suspend = false;
});

/**
 * Directory screen (add-coffeeshop-directory design.md D7; specs "Directory
 * heading and results column" and "Coffee shop directory page"). The async
 * list block is replaced by a stub that can suspend, so the fallback shows.
 */

const block = vi.hoisted(() => ({ suspend: false }));

vi.mock("@/widgets/coffeeshop-list", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/widgets/coffeeshop-list")>();
  return {
    ...actual,
    Coffeeshops: () => {
      if (block.suspend) throw new Promise<void>(() => {});
      return <div data-testid="coffeeshops-block" />;
    },
  };
});

describe("CoffeeshopsScreen", () => {
  it("renders the eyebrow, heading and intro of the locale (spec: Heading block)", () => {
    render(<CoffeeshopsScreen locale="es" searchParams={{}} />);
    expect(screen.getByText("Cafeterías").className).toContain("type-eyebrow");
    expect(screen.getByRole("heading", { level: 1, name: "Explora coffees" })).toBeTruthy();
    expect(screen.getByText("Cafeterías de especialidad y sus ubicaciones.")).toBeTruthy();
  });

  it("shows three skeleton cards in the one-column list while loading (spec: Loading)", () => {
    block.suspend = true;
    const { container } = render(<CoffeeshopsScreen locale="es" searchParams={{}} />);
    const column = container.querySelector(".grid.grid-cols-1.gap-6");
    expect(column?.children).toHaveLength(3);
    expect(screen.queryByTestId("coffeeshops-block")).toBeNull();
  });
});
