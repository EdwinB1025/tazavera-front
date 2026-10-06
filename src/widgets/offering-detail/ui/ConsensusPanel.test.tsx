import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import type { OfferingDetail, TaxonomyNode } from "@/shared/api";
import { getMessages } from "@/shared/lib/i18n";
import { ConsensusPanel } from "./ConsensusPanel";
import type { ConsensusPanelTexts } from "./ConsensusPanel";
import { concordanceBand } from "../lib/concordance";

/**
 * Consensus panel tests (add-offering-catalog design.md D12–D14; specs
 * "Consensus score", "Consensus counts and concordances").
 */

// No global test setup in this project, so RTL auto-cleanup does not run.
afterEach(() => {
  cleanup();
});

/** The class tokens of an element, as exact names (no substring matching). */
function classTokens(element: Element): string[] {
  return (element.getAttribute("class") ?? "").split(/\s+/).filter(Boolean);
}

const TEXT_KEYS = [
  "ratingExceptionalLabel",
  "ratingExcellentLabel",
  "ratingGoodLabel",
  "ratingCommercialLabel",
  "detailStatusHeading",
  "fieldEvaluationCount",
  "fieldDefectiveCount",
  "fieldConcordanceAffective",
  "fieldConcordanceDescriptive",
  "concordanceLow",
  "concordanceModerate",
  "concordanceHigh",
  "concordanceExcellent",
] as const;

const TEXTS = Object.fromEntries(
  TEXT_KEYS.map((key) => [key, `texts.${key}`]),
) as unknown as ConsensusPanelTexts;

const TAXONOMIES: TaxonomyNode[] = [];

const OFFERING: OfferingDetail = {
  ulid: "01K6A3M8Q2V7XH4T9B5N1RCW0D",
  verificationStatus: "verified",
  cuppingAvg: "84.25",
  evaluationCount: 5,
  defectiveEvaluationCount: 1,
  concordanceAffective: "0.812",
  concordanceDescriptive: "0.740",
};

function renderPanel(offering: OfferingDetail = OFFERING) {
  return render(
    <ConsensusPanel
      offering={offering}
      taxonomies={TAXONOMIES}
      locale="es"
      texts={TEXTS}
    />,
  );
}

/** The [label, value] pairs of the card whose h2 is `heading`. */
function rowsUnder(heading: string): [string, string][] {
  const card = screen
    .getByRole("heading", { level: 2, name: heading })
    .closest(".bg-surface-card")!;
  return Array.from(card.querySelectorAll("dl > div")).map((row) => [
    row.querySelector("dt")!.textContent ?? "",
    row.querySelector("dd")!.textContent ?? "",
  ]);
}

describe("ConsensusPanel — score (spec: Consensus score; design.md D12)", () => {
  it("renders the score, /100 and the tier word badge in its own stacked card above the card grid", () => {
    const { container } = renderPanel();
    const score = container.querySelector(".type-score")!;
    expect(score.textContent).toBe("84.25");
    const row = score.parentElement!;
    expect(row.querySelector(".type-meta")!.textContent).toBe("/100");
    expect(row.textContent).toContain(TEXTS.ratingGoodLabel);
    const card = score.closest(".bg-surface-card")!;
    expect(classTokens(card)).toContain("flex-col");
    // Full width, above the grid: the score card is the panel's first child
    // and not inside the card grid.
    const root = container.firstElementChild!;
    expect(root.firstElementChild).toBe(card);
    expect(card.closest(".grid")).toBeNull();
  });

  it("uses the tier word of the score's range", () => {
    const cases: [string, string][] = [
      ["92.00", TEXTS.ratingExceptionalLabel],
      ["86.50", TEXTS.ratingExcellentLabel],
      ["80.00", TEXTS.ratingGoodLabel],
      ["79.99", TEXTS.ratingCommercialLabel],
    ];
    for (const [cuppingAvg, word] of cases) {
      const { container, unmount } = renderPanel({ ...OFFERING, cuppingAvg });
      expect(
        container.querySelector(".type-score")!.parentElement!.textContent,
      ).toContain(word);
      unmount();
    }
  });

  it("renders no score for a provisional offering (spec: Provisional offering)", () => {
    const { container } = renderPanel({
      ...OFFERING,
      verificationStatus: "provisional",
    });
    expect(container.querySelector(".type-score")).toBeNull();
    expect(container.textContent).not.toContain("/100");
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: TEXTS.detailStatusHeading,
      }),
    ).toBeDefined();
  });

  it("renders no score for a verified offering without a cupping average (spec: No score)", () => {
    const { container } = renderPanel({ ...OFFERING, cuppingAvg: undefined });
    expect(container.querySelector(".type-score")).toBeNull();
    expect(container.textContent).not.toContain("/100");
  });
});

describe("ConsensusPanel — status card (spec: Consensus counts and concordances; design.md D12)", () => {
  it("renders the counts and both concordances as labelled rows, each concordance with its band word (specs: Counts, Concordance with its scale)", () => {
    renderPanel();
    expect(rowsUnder(TEXTS.detailStatusHeading)).toEqual([
      [TEXTS.fieldEvaluationCount, "5"],
      [TEXTS.fieldDefectiveCount, "1"],
      [TEXTS.fieldConcordanceAffective, `0.812${TEXTS.concordanceHigh}`],
      [TEXTS.fieldConcordanceDescriptive, `0.740${TEXTS.concordanceModerate}`],
    ]);
    // The value and the band word are separate text runs.
    expect(screen.getByText("0.812")).toBeDefined();
    expect(screen.getByText(TEXTS.concordanceHigh)).toBeDefined();
  });

  it("renders no row for a missing count or concordance (spec: Missing value)", () => {
    renderPanel({
      ...OFFERING,
      defectiveEvaluationCount: undefined,
      concordanceDescriptive: undefined,
    });
    expect(rowsUnder(TEXTS.detailStatusHeading)).toEqual([
      [TEXTS.fieldEvaluationCount, "5"],
      [TEXTS.fieldConcordanceAffective, `0.812${TEXTS.concordanceHigh}`],
    ]);
  });
});

describe("concordanceBand (spec: Band boundaries; design.md D12)", () => {
  it("maps 0.49 to low, 0.50 to moderate, 0.75 to high and 0.90 to excellent", () => {
    expect(concordanceBand("0.49")).toBe("low");
    expect(concordanceBand("0.50")).toBe("moderate");
    expect(concordanceBand("0.74")).toBe("moderate");
    expect(concordanceBand("0.75")).toBe("high");
    expect(concordanceBand("0.89")).toBe("high");
    expect(concordanceBand("0.90")).toBe("excellent");
    expect(concordanceBand("1.000")).toBe("excellent");
  });
});

describe("ConsensusPanel texts in the catalog (design.md D16)", () => {
  it("finds the status heading, the count and concordance labels and the band words in each locale", () => {
    for (const locale of ["es", "en", "ca"]) {
      const catalog = getMessages("catalog", locale);
      for (const key of TEXT_KEYS.filter((key) => !key.startsWith("rating"))) {
        expect(catalog[key], `${locale}.${key}`).toEqual(expect.any(String));
      }
    }
  });
});
