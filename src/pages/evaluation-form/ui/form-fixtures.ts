import type { EvaluationItem, OfferingDetail } from "@/shared/api";
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
