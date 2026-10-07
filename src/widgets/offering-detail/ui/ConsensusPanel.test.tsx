import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import type { OfferingDetail, TaxonomyNode } from "@/shared/api";
import { getMessages } from "@/shared/lib/i18n";
import { buildFlavorWheelNodes, buildTaxonomyLookup } from "@/entities/taxonomy";
import type { FlavorWheelProps } from "@/shared/ui";
import { ConsensusPanel } from "./ConsensusPanel";
import type { ConsensusPanelTexts } from "./ConsensusPanel";
import { concordanceBand } from "../lib/concordance";

/**
 * Consensus panel tests (add-offering-catalog design.md D12–D14; specs
 * "Consensus score", "Consensus counts and concordances").
 */

// The wheel is mocked: these tests assert the props the panel feeds it
// (design.md D14; the wheel's own behaviour is add-flavor-wheel's).
const flavorWheel = vi.hoisted(() => vi.fn());
vi.mock("@/shared/ui", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/shared/ui")>()),
  FlavorWheel: (props: FlavorWheelProps) => {
    flavorWheel(props);
    return <div data-testid="flavor-wheel" />;
  },
}));

// No global test setup in this project, so RTL auto-cleanup does not run.
afterEach(() => {
  cleanup();
  flavorWheel.mockClear();
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

const ATTRIBUTE_KEYS = [
  "attrFragrance",
  "attrAroma",
  "attrFlavor",
  "attrAftertaste",
  "attrAcidity",
  "attrSweetness",
  "attrMouthfeel",
  "attrOverall",
] as const;

const TEXTS = {
  ...Object.fromEntries(
    [
      ...TEXT_KEYS,
      ...ATTRIBUTE_KEYS,
      "detailAttributesHeading",
      "detailMainTastesHeading",
      "detailDefectsHeading",
      "detailTasteEmpty",
      "detailSensoryHeading",
      "detailCataHeading",
      "wheelLabel",
      "wheelHint",
      "wheelNotesToggle",
    ].map((key) => [key, `texts.${key}`]),
  ),
  wheelCount: "{count} de {total} evaluadores",
  beanValue: "{value}/9",
  beanValueLabel: "{value} de 9",
} as unknown as ConsensusPanelTexts;

const SWEET = "01JROOTSWEET0000000000000A";
const SOUR = "01JROOTSOUR00000000000000A";
const FERMENTED = "01JROOTFERMENTED000000000A";
const VINEGAR = "01JCHILDVINEGAR0000000000A";
const WINEY = "01JCHILDWINEY000000000000A";

const TAXONOMIES: TaxonomyNode[] = [
  {
    ulid: SWEET,
    level: 0,
    nameEs: "Dulce",
    nameEn: "Sweet",
    nameCa: "Dolç",
    color: "#666666",
    categories: ["main_tastes"],
  },
  {
    ulid: SOUR,
    level: 0,
    nameEs: "Ácido",
    nameEn: "Sour",
    nameCa: "Àcid",
    color: "#777777",
    categories: ["main_tastes"],
  },
  {
    ulid: FERMENTED,
    level: 0,
    nameEs: "Fermentado",
    nameEn: "Fermented",
    nameCa: "Fermentat",
    color: "#111111",
    categories: ["defects"],
    children: [
      {
        ulid: VINEGAR,
        level: 1,
        nameEs: "Vinagre",
        nameEn: "Vinegar",
        nameCa: "Vinagre",
        color: "#222222",
        categories: ["defects"],
      },
      {
        ulid: WINEY,
        level: 1,
        nameEs: "Vinoso",
        nameEn: "Winey",
        nameCa: "Vinós",
        color: "#333333",
        categories: ["defects"],
      },
    ],
  },
];

const OFFERING: OfferingDetail = {
  ulid: "01K6A3M8Q2V7XH4T9B5N1RCW0D",
  verificationStatus: "verified",
  cuppingAvg: "84.25",
  evaluationCount: 5,
  defectiveEvaluationCount: 1,
  concordanceAffective: "0.812",
  concordanceDescriptive: "0.740",
};

function renderPanel(offering: OfferingDetail = OFFERING, locale = "es") {
  return render(
    <ConsensusPanel
      offering={offering}
      taxonomies={TAXONOMIES}
      locale={locale}
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

describe("ConsensusPanel — SCA attributes (spec: Consensus SCA attribute averages; design.md D12)", () => {
  const AVERAGES: OfferingDetail = {
    ...OFFERING,
    fragranceAffectiveAvg: "7.2",
    aromaAffectiveAvg: "7.8",
    flavorAffectiveAvg: "7.5",
    aftertasteAffectiveAvg: "7.1",
    acidityAffectiveAvg: "7.4",
    sweetnessAffectiveAvg: "7.6",
    mouthfeelAffectiveAvg: "7.0",
    overallAffectiveAvg: "8",
  };

  it("renders one read-only bean scale per attribute in the settled order, inside the attributes card", () => {
    renderPanel(AVERAGES);
    const card = screen
      .getByRole("heading", { level: 2, name: TEXTS.detailAttributesHeading })
      .closest(".bg-surface-card")!;
    const meters = screen.getAllByRole("meter");
    expect(meters).toHaveLength(8);
    for (const meter of meters) {
      expect(card.contains(meter)).toBe(true);
    }
    const names = meters.map((meter) => {
      const labelId = meter.getAttribute("aria-labelledby")!;
      return document.getElementById(labelId)!.textContent;
    });
    expect(names).toEqual(
      ATTRIBUTE_KEYS.map((key) => TEXTS[key as keyof ConsensusPanelTexts]),
    );
    // The card spans both grid columns from `lg`.
    expect(classTokens(card.parentElement!)).toContain("lg:col-span-2");
  });

  it("passes the parsed value with one decimal in the value text and label (the settled '7,2 de 9' reading)", () => {
    renderPanel(AVERAGES);
    const fragrance = screen.getAllByRole("meter")[0];
    expect(fragrance.getAttribute("aria-valuenow")).toBe("7.2");
    expect(fragrance.getAttribute("aria-valuetext")).toBe("7,2 de 9");
    expect(screen.getByText("7,2/9")).toBeDefined();
    // A whole value is still stated with its decimal.
    const overall = screen.getAllByRole("meter")[7];
    expect(overall.getAttribute("aria-valuenow")).toBe("8");
    expect(overall.getAttribute("aria-valuetext")).toBe("8,0 de 9");
  });

  it("formats the value in the route's locale", () => {
    renderPanel(AVERAGES, "en");
    expect(screen.getAllByRole("meter")[0].getAttribute("aria-valuetext")).toBe(
      "7.2 de 9",
    );
    expect(screen.getByText("7.2/9")).toBeDefined();
  });

  it("reaches the scale as a fraction for a fractional value (spec: Fractional value)", () => {
    renderPanel(AVERAGES);
    const fragrance = screen.getAllByRole("meter")[0];
    // 7.2: seven full beans and the eighth cut at 20%.
    const cut = fragrance.querySelectorAll('[data-slot="bean"]')[7]
      .lastElementChild as HTMLElement;
    expect(cut.style.clipPath).toBe("inset(0 80% 0 0)");
  });

  it("renders no scale for a missing average and keeps the rest (spec: Missing average)", () => {
    renderPanel({ ...AVERAGES, aromaAffectiveAvg: undefined });
    const meters = screen.getAllByRole("meter");
    expect(meters).toHaveLength(7);
    const names = meters.map(
      (meter) =>
        document.getElementById(meter.getAttribute("aria-labelledby")!)!
          .textContent,
    );
    expect(names).not.toContain(TEXTS.attrAroma);
  });

  it("finds the attribute heading and labels in the catalog and the bean texts in the scales area of each locale (design.md D16)", () => {
    for (const locale of ["es", "en", "ca"]) {
      const catalog = getMessages("catalog", locale);
      for (const key of ["detailAttributesHeading", ...ATTRIBUTE_KEYS]) {
        expect(catalog[key], `${locale}.${key}`).toEqual(expect.any(String));
      }
      const scales = getMessages("scales", locale);
      expect(scales.beanValue).toBe("{value}/9");
      expect(scales.beanValueLabel).toBe(
        locale === "en" ? "{value} of 9" : "{value} de 9",
      );
    }
  });
});

describe("ConsensusPanel — Main tastes and Defects (spec: Consensus Defects and Main tastes; design.md D13)", () => {
  const IDENTIFIED: OfferingDetail = {
    ...OFFERING,
    evaluationCount: 5,
    sensoryTaxonomy: [
      { ref: SWEET, type: "main_tastes", level: 0, count: 4, children: [] },
      { ref: SOUR, type: "main_tastes", level: 0, count: 2, children: [] },
      {
        ref: "01JUNRESOLVED000000000000A",
        type: "main_tastes",
        level: 0,
        count: 1,
        children: [],
      },
      {
        ref: FERMENTED,
        type: "defects",
        level: 0,
        count: 1,
        children: [{ ref: VINEGAR, type: "defects", level: 1, count: 1 }],
      },
    ],
  };

  function cardOf(heading: string): Element {
    return screen
      .getByRole("heading", { level: 2, name: heading })
      .closest(".bg-surface-card")!;
  }

  function badgesIn(element: Element): string[] {
    return Array.from(element.querySelectorAll("[data-taxonomy]")).map(
      (badge) => badge.textContent ?? "",
    );
  }

  function legendBeside(card: Element): string[] {
    const block = card.parentElement!;
    return Array.from(block.querySelectorAll(".type-meta"))
      .filter((line) => !card.contains(line))
      .map((line) => line.textContent ?? "");
  }

  it("renders the identified main tastes as taxonomy badges with the group's name as the selection legend (spec: Identified notes)", () => {
    renderPanel(IDENTIFIED);
    const card = cardOf(TEXTS.detailMainTastesHeading);
    expect(badgesIn(card)).toEqual(["Dulce", "Ácido"]);
    expect(card.querySelector("fieldset legend")!.textContent).toBe(
      TEXTS.detailMainTastesHeading,
    );
  });

  it("renders the identified defects from the descriptor rows, level-1 notes under their level-0 row", () => {
    renderPanel(IDENTIFIED);
    const card = cardOf(TEXTS.detailDefectsHeading);
    expect(badgesIn(card)).toEqual(["Vinagre"]);
    expect(card.textContent).toContain("Fermentado");
    expect(card.textContent).not.toContain("Vinoso");
  });

  it("renders no badge for an unresolved reference and keeps the rest (spec: Unresolved reference)", () => {
    renderPanel(IDENTIFIED);
    expect(badgesIn(cardOf(TEXTS.detailMainTastesHeading))).toHaveLength(2);
  });

  it("renders each card's consensus legend beside it: one type-meta line per note, {name} {count}/{total}, in card order", () => {
    renderPanel(IDENTIFIED);
    const tastes = cardOf(TEXTS.detailMainTastesHeading);
    expect(legendBeside(tastes)).toEqual(["Dulce 4/5", "Ácido 2/5"]);
    expect(legendBeside(cardOf(TEXTS.detailDefectsHeading))).toEqual([
      "Vinagre 1/5",
    ]);
    const block = tastes.parentElement!;
    expect(classTokens(block)).toEqual(
      expect.arrayContaining([
        "flex",
        "flex-col",
        "md:flex-row",
        "lg:col-span-2",
      ]),
    );
    expect(classTokens(tastes)).toContain("flex-1");
  });

  it("shows the empty text and no legend for a group with no identified note (spec: Empty group)", () => {
    renderPanel({
      ...IDENTIFIED,
      sensoryTaxonomy: IDENTIFIED.sensoryTaxonomy!.filter(
        (node) => node.type !== "defects",
      ),
    });
    const card = cardOf(TEXTS.detailDefectsHeading);
    expect(card.textContent).toContain(TEXTS.detailTasteEmpty);
    expect(badgesIn(card)).toEqual([]);
    expect(legendBeside(card)).toEqual([]);
  });

  it("finds the two headings and the empty text in the catalog of each locale (design.md D16)", () => {
    for (const locale of ["es", "en", "ca"]) {
      const catalog = getMessages("catalog", locale);
      for (const key of [
        "detailMainTastesHeading",
        "detailDefectsHeading",
        "detailTasteEmpty",
      ]) {
        expect(catalog[key], `${locale}.${key}`).toEqual(expect.any(String));
      }
    }
  });
});

describe("ConsensusPanel — taste trees (spec: Consensus taste trees; design.md D14)", () => {
  const FLORAL = "01JROOTFLORAL000000000000A";
  const JASMINE = "01JCHILDJASMINE0000000000A";
  const FRUITY = "01JROOTFRUITY000000000000A";

  const WHEEL_TAXONOMIES: TaxonomyNode[] = [
    ...TAXONOMIES,
    {
      ulid: FLORAL,
      level: 0,
      nameEs: "Floral",
      nameEn: "Floral",
      nameCa: "Floral",
      descriptionEs: "Notas de flores",
      color: "#AA00AA",
      categories: ["aromatics"],
      children: [
        {
          ulid: JASMINE,
          level: 1,
          nameEs: "Jazmín",
          nameEn: "Jasmine",
          nameCa: "Gessamí",
          color: "#BB00BB",
          categories: ["aromatics"],
        },
      ],
    },
    {
      ulid: FRUITY,
      level: 0,
      nameEs: "Afrutado",
      nameEn: "Fruity",
      nameCa: "Afruitat",
      color: "#CC0000",
      categories: ["aromatics"],
    },
  ];

  const TREES: OfferingDetail = {
    ...OFFERING,
    evaluationCount: 5,
    sensoryTaxonomy: [
      {
        ref: FLORAL,
        type: "aromatics",
        level: 0,
        count: 3,
        children: [{ ref: JASMINE, type: "aromatics", level: 1, count: 2 }],
      },
      { ref: SWEET, type: "main_tastes", level: 0, count: 4, children: [] },
    ],
    cataConcordance: [
      { ref: FRUITY, type: "aromatics", level: 0, count: 4, children: [] },
    ],
  };

  const countLabel = (count: number, total: number) =>
    `${count} de ${total} evaluadores`;

  function renderTrees(offering: OfferingDetail) {
    return render(
      <ConsensusPanel
        offering={offering}
        taxonomies={WHEEL_TAXONOMIES}
        locale="es"
        texts={TEXTS}
      />,
    );
  }

  function cardOf(heading: string): Element {
    return screen
      .getByRole("heading", { level: 2, name: heading })
      .closest(".bg-surface-card")!;
  }

  function wheelCalls(): FlavorWheelProps[] {
    return flavorWheel.mock.calls.map(([props]) => props as FlavorWheelProps);
  }

  it("renders one wheel per tree, each in the card of its heading (spec: One wheel per tree)", () => {
    renderTrees(TREES);
    for (const heading of [
      TEXTS.detailSensoryHeading,
      TEXTS.detailCataHeading,
    ]) {
      expect(
        cardOf(heading).querySelectorAll("[data-testid='flavor-wheel']"),
      ).toHaveLength(1);
    }
    expect(screen.getAllByTestId("flavor-wheel")).toHaveLength(2);
  });

  it("feeds each wheel the nodes built from its tree, the lookup, evaluationCount and the count template", () => {
    renderTrees(TREES);
    const lookup = buildTaxonomyLookup(WHEEL_TAXONOMIES, "es");
    const [sensory, cata] = wheelCalls();
    expect(sensory.nodes).toEqual(
      buildFlavorWheelNodes(TREES.sensoryTaxonomy!, lookup, 5, countLabel),
    );
    expect(cata.nodes).toEqual(
      buildFlavorWheelNodes(TREES.cataConcordance!, lookup, 5, countLabel),
    );
    expect(sensory.nodes[0].countLabel).toBe("3 de 5 evaluadores");
    expect(cata.nodes[0].countLabel).toBe("4 de 5 evaluadores");
    expect(sensory.total).toBe(5);
    expect(cata.total).toBe(5);
  });

  it("passes the wheel texts: label, hint, the empty text and the notes toggle", () => {
    renderTrees(TREES);
    expect(wheelCalls()).toHaveLength(2);
    for (const props of wheelCalls()) {
      expect(props.texts).toEqual({
        label: TEXTS.wheelLabel,
        hint: TEXTS.wheelHint,
        emptyMessage: TEXTS.detailTasteEmpty,
        notesToggle: TEXTS.wheelNotesToggle,
      });
    }
  });

  it("shows the empty text and no wheel for an empty tree (spec: Empty tree)", () => {
    renderTrees({ ...TREES, cataConcordance: [] });
    const cata = cardOf(TEXTS.detailCataHeading);
    expect(cata.textContent).toContain(TEXTS.detailTasteEmpty);
    expect(cata.querySelector("[data-testid='flavor-wheel']")).toBeNull();
    expect(screen.getAllByTestId("flavor-wheel")).toHaveLength(1);
  });

  it("renders the wheel, with empty nodes, for a non-empty tree without an aromatic root", () => {
    renderTrees({
      ...TREES,
      sensoryTaxonomy: TREES.sensoryTaxonomy!.filter(
        (node) => node.type !== "aromatics",
      ),
    });
    const sensory = cardOf(TEXTS.detailSensoryHeading);
    expect(sensory.querySelector("[data-testid='flavor-wheel']")).not.toBeNull();
    expect(wheelCalls()[0].nodes).toEqual([]);
  });

  it("finds the two headings and the wheel texts in the catalog of each locale (design.md D16)", () => {
    for (const locale of ["es", "en", "ca"]) {
      const catalog = getMessages("catalog", locale);
      for (const key of [
        "detailSensoryHeading",
        "detailCataHeading",
        "wheelLabel",
        "wheelHint",
        "wheelCount",
        "wheelNotesToggle",
      ]) {
        expect(catalog[key], `${locale}.${key}`).toEqual(expect.any(String));
      }
    }
    expect(getMessages("catalog", "es").wheelCount).toBe(
      "{count} de {total} evaluadores",
    );
  });
});
