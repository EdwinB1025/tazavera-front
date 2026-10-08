import type { EvaluationItem, OfferingDetail, TaxonomyNode } from "@/shared/api";
import type { EvaluationFormTexts } from "./EvaluationForm";

/**
 * Shared fixtures of the evaluation form tests: the form texts as the screen
 * passes them from the `evaluations` catalog, and an offering and evaluation
 * whose fields match the props of the screens.
 */

export const FORM_TEXTS: EvaluationFormTexts = {
  eyebrow: "Evaluation",
  backLabel: "My evaluations",
  coffeeshopCaption: "Coffeeshop:",
  roasterCaption: "Roaster:",
  roastLevelLabel: "Roast level",
  roastLevelPlaceholder: "Choose a roast level",
  extractionMethodLabel: "Extraction method",
  extractionMethodPlaceholder: "Choose a method",
  extractionLabels: {
    espresso: "Espresso",
    v60: "V60",
    chemex: "Chemex",
    aeropress: "AeroPress",
    french_press: "French press",
    moka: "Moka pot",
    cold_brew: "Cold brew",
    siphon: "Siphon",
    kalita: "Kalita Wave",
  },
  actions: {
    saveLabel: "Save draft",
    closeLabel: "Close evaluation",
    cancelLabel: "Cancel",
    savedMessage: "Draft saved.",
    closedMessage: "Evaluation closed.",
    incompleteMessage: "Complete every group before closing.",
    notYoursMessage: "This evaluation is not yours.",
    alreadyClosedMessage: "This evaluation is already closed.",
    failureMessage: "Something went wrong.",
    roastLevelRequired: "Choose the roast level.",
  },
  fragranceNotEvaluatedLabel: "Fragrance not evaluated — use aroma values",
  offeringMissingLabel: "Offering no longer exists",
  legend: {
    title: "Affective quality impression",
    labels: [
      "Extremely low",
      "Very low",
      "Moderately low",
      "Slightly low",
      "Neither high nor low",
      "Slightly high",
      "Moderately high",
      "Very high",
      "Extremely high",
    ],
  },
  blockLabels: {
    aromatics: "Aromatics",
    main_tastes: "Main tastes",
    mouthfeel: "Mouthfeel descriptors",
    defects: "Defects",
  },
  group: {
    groupNames: {
      fragranceAroma: "Fragrance / Aroma",
      flavorAftertaste: "Flavor / Aftertaste",
      acidity: "Acidity",
      sweetness: "Sweetness",
      mouthfeel: "Mouthfeel",
      overall: "Overall",
      defects: "Defects",
      extrinsic: "Extrinsic",
    },
    descriptiveHeading: "Descriptive",
    affectiveHeading: "Affective",
    axisLabels: {
      fragrance: "Fragrance",
      aroma: "Aroma",
      flavor: "Flavor",
      aftertaste: "Aftertaste",
      acidity: "Acidity",
      sweetness: "Sweetness",
      mouthfeel: "Mouthfeel",
      overall: "Overall",
    },
    scaleLabels: ["LOW", "MEDIUM", "HIGH"],
    intensityScale: "/15",
    preferenceScale: "/9",
    unsetScore: "–",
    completeLabel: "Complete",
    incompleteLabel: "Incomplete",
    addNoteLabel: "Add note",
    removeNoteLabel: "Remove note",
    noteLabel: "Note",
    extrinsicNoteLabel: "General observation",
  },
};

export const OFFERING: OfferingDetail = {
  ulid: "01JOFFER000000000000000001",
  location: { name: "Cafè del Born" },
  coffeeInventory: {
    coffee: { name: "Finca La Esperanza", roastLevel: "medium_light" },
    roastery: { name: "Nomad" },
  },
};

export const OPEN_EVALUATION: EvaluationItem = {
  ulid: "01JEVAL0000000000000000001",
  offeringId: OFFERING.ulid,
  status: "open",
  extractionMethod: "chemex",
  descriptive: {
    fragrance: { score: 7, note: "jasmine" },
    aroma: { score: 8, note: null },
    acidity: { score: 10, note: null },
  },
  affective: {
    aroma: { score: 6, note: null },
    overall: { score: 8, note: "lovely" },
  },
  extrinsics: { generalObservation: null },
  tastes: [],
  createdAt: "2026-10-06T09:12:45.000000Z",
  closedAt: null,
};

function taxon(ulid: string, level: number, name: string, categories: string[], children: TaxonomyNode[] = []): TaxonomyNode {
  return { ulid, level, nameEn: name, nameEs: name, nameCa: name, color: "#aa3355", categories, children: children as never };
}

/** One option per block: an aromatic, a main taste, a mouthfeel and a defect. */
export const TAXONOMIES: TaxonomyNode[] = [
  taxon("01JTAXFLORAL0000000000000A", 0, "Floral", ["aromatics"]),
  taxon("01JTAXSWEET00000000000000C", 0, "Sweet", ["main_tastes"]),
  taxon("01JTAXTEXTURE000000000000X", 0, "Texture", [], [
    taxon("01JTAXSILKY00000000000000D", 1, "Silky", ["mouthfeel"]),
  ]),
  taxon("01JTAXMOULD00000000000000E", 0, "Mouldy", ["defects"]),
];
