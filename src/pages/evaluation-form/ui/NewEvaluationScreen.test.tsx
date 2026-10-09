import { describe, it, expect, afterEach, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";

/**
 * The new-evaluation screen's unknown offering (show-item-not-found-message
 * design.md D4; spec "Evaluation form" — "An unknown offering or
 * evaluation"). The access gate is replaced by its children: the role rule
 * stays the gate's.
 */

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  notFound: () => {
    throw new Error("NEXT_HTTP_ERROR_FALLBACK;404");
  },
}));
vi.mock("@/widgets/evaluations-gate", () => ({
  EvaluationsGate: ({ children }: { children: ReactNode }) => children,
}));
vi.mock("@/entities/offering", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/entities/offering")>()),
  fetchOffering: async () => ({ ok: false, kind: "not-found" }),
}));
vi.mock("@/entities/taxonomy", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/entities/taxonomy")>()),
  fetchTaxonomies: async () => ({ ok: true, data: { data: [] } }),
}));

import { NewEvaluationScreen } from "./NewEvaluationScreen";

afterEach(cleanup);

describe("NewEvaluationScreen", () => {
  it("shows the offering's title and line with no retry for an unknown offering (spec: An unknown offering or evaluation)", async () => {
    render(await NewEvaluationScreen({ locale: "en", offering: "01JUNKNOWN" }));
    expect(screen.getByRole("heading", { level: 1, name: "Offering not found" })).toBeDefined();
    expect(screen.getByText("It may have been removed, or the link may be wrong.")).toBeDefined();
    expect(screen.queryByRole("button", { name: "Retry" })).toBeNull();
  });
});
