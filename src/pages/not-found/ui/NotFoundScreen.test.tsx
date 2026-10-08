import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { NotFoundScreen } from "./NotFoundScreen";

/**
 * Not-found screen (design.md D6; spec "Not-found page"). The server screen
 * reads the `shell` catalog of the locale and renders the heading, the text
 * and the link back to the root of that locale.
 */

afterEach(() => {
  cleanup();
});

describe("NotFoundScreen", () => {
  it("shows the not-found title as the level-one heading and the not-found text", () => {
    render(<NotFoundScreen locale="es" />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Página no encontrada" }),
    ).toBeTruthy();
    expect(
      screen.getByText(
        "La página que buscas no existe o no tienes acceso a ella.",
      ),
    ).toBeTruthy();
  });

  it("links back to the root of the locale", () => {
    render(<NotFoundScreen locale="es" />);

    expect(
      screen.getByRole("link", { name: "Volver al inicio" }).getAttribute("href"),
    ).toBe("/es");
  });
});
