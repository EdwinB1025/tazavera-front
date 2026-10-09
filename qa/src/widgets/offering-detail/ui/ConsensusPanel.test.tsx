import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import type { OfferingDetail, TaxonomyNode } from "@/shared/api";
import { getMessages } from "@/shared/lib/i18n";
import type { FlavorWheelProps } from "@/shared/ui";
import { ConsensusPanel } from "@/widgets/offering-detail/ui/ConsensusPanel";
import type { ConsensusPanelTexts } from "@/widgets/offering-detail/ui/ConsensusPanel";

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
      "detailCataHeading",
      "detailNotVerifiedMessage",
      "wheelLabel",
      "wheelHint",
      "wheelNotesToggle",
      "wheelGroupsLabel",
      "wheelGroupAromatics",
      "detailAxesHeading",
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

/** The grid item holding `element`: its ancestor that is a child of the card grid. */
function gridItemOf(element: Element): Element {
  let item = element;
  while (!classTokens(item.parentElement!).includes("lg:grid-cols-2")) {
    item = item.parentElement!;
  }
  return item;
}

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

  it("pairs the status card with the attributes card: neither spans both columns, the attributes card first", () => {
    renderPanel(AVERAGES);
    const attributes = gridItemOf(
      screen.getByRole("heading", { level: 2, name: TEXTS.detailAttributesHeading }),
    );
    const status = gridItemOf(
      screen.getByRole("heading", { level: 2, name: TEXTS.detailStatusHeading }),
    );
    expect(classTokens(status)).not.toContain("lg:col-span-2");
    expect(attributes.nextElementSibling).toBe(status);
  });

  it("shows no not-verified message for a verified offering", () => {
    renderPanel(AVERAGES);
    expect(screen.queryByText(TEXTS.detailNotVerifiedMessage)).toBeNull();
  });

  it("formats the value in the route's locale", () => {
    renderPanel(AVERAGES, "en");
    expect(screen.getAllByRole("meter")[0].getAttribute("aria-valuetext")).toBe(
      "7.2 de 9",
    );
    expect(screen.getByText("7.2/9")).toBeDefined();
  });

  it("finds the attribute heading and labels in the catalog and the bean texts in the scales area of each locale (design.md D16)", () => {
    for (const locale of ["es", "en", "ca"]) {
      const catalog = getMessages("catalog", locale);
      for (const key of [
        "detailAttributesHeading",
        "detailNotVerifiedMessage",
        ...ATTRIBUTE_KEYS,
      ]) {
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
    cataConcordance: [
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

  it("reads the two groups from the CATA concordance only, never from the sensory taxonomy (spec: Consensus Defects and Main tastes)", () => {
    renderPanel({
      ...OFFERING,
      cataConcordance: [],
      sensoryTaxonomy: IDENTIFIED.cataConcordance,
    });
    for (const heading of [
      TEXTS.detailMainTastesHeading,
      TEXTS.detailDefectsHeading,
    ]) {
      const card = cardOf(heading);
      expect(badgesIn(card)).toEqual([]);
      expect(legendBeside(card)).toEqual([]);
      expect(card.textContent).toContain(TEXTS.detailTasteEmpty);
    }
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

describe("ConsensusPanel — CATA wheel (specs: Consensus taste trees, Mouthfeel group in the CATA wheel; design.md D14, D19)", () => {
  const FLORAL = "01JROOTFLORAL000000000000A";
  const JASMINE = "01JCHILDJASMINE0000000000A";
  const FRUITY = "01JROOTFRUITY000000000000A";
  const BODY = "01JROOTBODY00000000000000A";

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
    {
      ulid: BODY,
      level: 0,
      nameEs: "Sensación en boca",
      nameEn: "Mouthfeel",
      nameCa: "Sensació en boca",
      color: "#6b6f76",
      categories: ["mouthfeel"],
    },
  ];

  const TREES: OfferingDetail = {
    ...OFFERING,
    evaluationCount: 5,
    sensoryTaxonomy: [
      {
        ref: FLORAL,
        type: "aroma",
        level: 0,
        count: 3,
        children: [{ ref: JASMINE, type: "aroma", level: 1, count: 2 }],
      },
    ],
    cataConcordance: [
      { ref: FRUITY, type: "aromatics", level: 0, count: 4, children: [] },
      { ref: BODY, type: "aromatics", level: 0, count: 2, children: [] },
      { ref: SWEET, type: "main_tastes", level: 0, count: 4, children: [] },
    ],
  };

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

  it("spans both grid columns with the CATA card", () => {
    renderTrees(TREES);
    expect(classTokens(gridItemOf(cardOf(TEXTS.detailCataHeading)))).toContain(
      "lg:col-span-2",
    );
  });

  it("passes the wheel texts: label, hint, the empty text, the notes toggle and the groups label", () => {
    renderTrees(TREES);
    expect(wheelCalls()).toHaveLength(1);
    expect(wheelCalls()[0].texts).toEqual({
      label: TEXTS.wheelLabel,
      hint: TEXTS.wheelHint,
      emptyMessage: TEXTS.detailTasteEmpty,
      notesToggle: TEXTS.wheelNotesToggle,
      groupsLabel: TEXTS.wheelGroupsLabel,
    });
  });

  it("renders the wheel, with empty nodes, for a non-empty concordance without an aromatic root", () => {
    renderTrees({
      ...TREES,
      cataConcordance: TREES.cataConcordance!.filter(
        (node) => node.type !== "aromatics",
      ),
    });
    const cata = cardOf(TEXTS.detailCataHeading);
    expect(cata.querySelector("[data-testid='flavor-wheel']")).not.toBeNull();
    expect(wheelCalls()[0].nodes).toEqual([]);
  });

  it("finds the CATA heading and the wheel texts in the catalog of each locale, and no sensory heading (design.md D16)", () => {
    for (const locale of ["es", "en", "ca"]) {
      const catalog = getMessages("catalog", locale);
      for (const key of [
        "detailCataHeading",
        "wheelLabel",
        "wheelHint",
        "wheelCount",
        "wheelNotesToggle",
        "wheelGroupsLabel",
        "wheelGroupAromatics",
      ]) {
        expect(catalog[key], `${locale}.${key}`).toEqual(expect.any(String));
      }
      expect(catalog.detailSensoryHeading, locale).toBeUndefined();
    }
    expect(getMessages("catalog", "es").wheelCount).toBe(
      "{count} de {total} evaluadores",
    );
  });
});

describe("ConsensusPanel — detail by axis (spec: Consensus detail by axis; design.md D18)", () => {
  const FLORAL = "01JROOTFLORAL000000000000A";
  const JASMINE = "01JCHILDJASMINE0000000000A";
  const BODY = "01JROOTBODY00000000000000A";
  const SMOOTH = "01JCHILDSMOOTH00000000000A";

  const AXIS_TAXONOMIES: TaxonomyNode[] = [
    ...TAXONOMIES,
    {
      ulid: FLORAL,
      level: 0,
      nameEs: "Floral",
      nameEn: "Floral",
      nameCa: "Floral",
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
      ulid: BODY,
      level: 0,
      nameEs: "Sensación en boca",
      nameEn: "Mouthfeel",
      nameCa: "Sensació en boca",
      color: "#6b6f76",
      categories: ["mouthfeel"],
      children: [
        {
          ulid: SMOOTH,
          level: 1,
          nameEs: "Suave",
          nameEn: "Smooth",
          nameCa: "Suau",
          color: "#7d818a",
          categories: ["mouthfeel"],
        },
      ],
    },
  ];

  const AXES: OfferingDetail = {
    ...OFFERING,
    evaluationCount: 5,
    sensoryTaxonomy: [
      {
        ref: FLORAL,
        type: "fragrance",
        level: 0,
        count: 3,
        children: [{ ref: JASMINE, type: "fragrance", level: 1, count: 2 }],
      },
      {
        ref: BODY,
        type: "mouthfeel",
        level: 0,
        count: 2,
        children: [{ ref: SMOOTH, type: "mouthfeel", level: 1, count: 2 }],
      },
      { ref: SWEET, type: "main_tastes", level: 0, count: 4, children: [] },
    ],
  };

  const AXIS_KEYS = [
    "attrFragrance",
    "attrAroma",
    "attrFlavor",
    "attrAftertaste",
    "attrMouthfeel",
  ] as const;

  function renderAxes(offering: OfferingDetail = AXES) {
    return render(
      <ConsensusPanel
        offering={offering}
        taxonomies={AXIS_TAXONOMIES}
        locale="es"
        texts={TEXTS}
      />,
    );
  }

  function header(key: (typeof AXIS_KEYS)[number]): HTMLElement {
    return screen.getByRole("button", {
      name: TEXTS[key as keyof ConsensusPanelTexts] as string,
    });
  }

  /** Expands the axis section and returns its body. */
  function open(key: (typeof AXIS_KEYS)[number]): HTMLElement {
    const button = header(key);
    fireEvent.click(button);
    return document.getElementById(button.getAttribute("aria-controls")!)!;
  }

  function badgesIn(element: Element): string[] {
    return Array.from(element.querySelectorAll("[data-taxonomy]")).map(
      (badge) => badge.textContent ?? "",
    );
  }

  function sharesIn(element: Element): string[] {
    return Array.from(element.querySelectorAll(".type-meta")).map(
      (line) => line.textContent ?? "",
    );
  }

  /** The panel-grid item holding the detail by axis. */
  function axesItem(): Element {
    return gridItemOf(
      screen.getByRole("heading", { level: 2, name: TEXTS.detailAxesHeading }),
    );
  }

  it("renders the detail heading on the page background, spanning both columns", () => {
    renderAxes();
    const heading = screen.getByRole("heading", {
      level: 2,
      name: TEXTS.detailAxesHeading,
    });
    const item = axesItem();
    expect(item.contains(heading)).toBe(true);
    expect(heading.closest(".bg-surface-card")).toBeNull();
    expect(classTokens(item)).toContain("lg:col-span-2");
  });

  it("builds the mouthfeel section from the mouthfeel category", () => {
    renderAxes();
    const body = open("attrMouthfeel");
    expect(badgesIn(body)).toEqual(["Sensación en boca", "Suave"]);
    expect(body.textContent).not.toContain("Jazmín");
    expect(sharesIn(body)).toEqual(["Sensación en boca 2/5", "Suave 2/5"]);
  });

  it("finds the detail heading in the catalog of each locale (design.md D16)", () => {
    for (const locale of ["es", "en", "ca"]) {
      expect(
        getMessages("catalog", locale).detailAxesHeading,
        locale,
      ).toEqual(expect.any(String));
    }
  });
});
