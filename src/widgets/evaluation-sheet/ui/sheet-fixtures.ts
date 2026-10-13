import type { EvaluationItem, TaxonomyNode } from "@/shared/api";
import type { EvaluationSheetTexts } from "./EvaluationSheet";

/** Shared fixtures of the evaluation-sheet tests (tasks 3.1, 3.3, 4.1). */

export const SHEET_TEXTS: EvaluationSheetTexts = {
  summaryHeading: "Context",
  closedAtLabel: "Closed on",
  extractionMethodLabel: "Extraction method",
  defectiveCupLabel: "Defective cup",
  yes: "Yes",
  no: "No",
  intensityHeading: "Intensity",
  preferenceHeading: "Preference",
  descriptorsHeading: "Descriptors",
  noDescriptors: "No descriptors.",
  notesHeading: "Notes",
  extrinsicsHeading: "Extrinsic attributes",
  extrinsicLabels: {
    farming: "Farming",
    processing: "Processing",
    trading: "Trading",
    certifications: "Certifications",
    generalObservation: "General observation",
  },
  extractionLabels: { v60: "V60", espresso: "Espresso" },
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
  blockLabels: {
    fragranceAroma: "Fragrance / Aroma",
    flavorAftertaste: "Flavor / Aftertaste",
    mainTastes: "Main tastes",
    mouthfeel: "Mouthfeel",
    defects: "Defects",
  },
  scaleLabels: ["LOW", "MEDIUM", "HIGH"],
  intensityValueText: "{value}/15",
  intensityValueLabel: "{value} de 15",
  beanValueText: "{value}/9",
  beanValueLabel: "{value} de 9",
  showNotesLabel: "Show the notes under {label}",
  hideNotesLabel: "Hide the notes under {label}",
  ratingLabels: {
    "rating-exceptional": "Exceptional",
    "rating-excellent": "Excellent",
    "rating-good": "Good",
    "rating-commercial": "Commercial",
  },
};

export const TAXONOMIES: TaxonomyNode[] = [
  {
    ulid: "01JFRUITY",
    level: 0,
    nameEs: "Afrutado",
    nameEn: "Fruity",
    nameCa: "Afruitat",
    color: "#aa3344",
    categories: ["aromatics"],
    children: [
      {
        ulid: "01JBERRY",
        level: 1,
        nameEs: "Bayas",
        nameEn: "Berry",
        nameCa: "Baies",
        color: "#bb2233",
        categories: ["aromatics"],
        children: [],
      },
    ],
  },
  {
    ulid: "01JSWEET",
    level: 0,
    nameEs: "Dulce",
    nameEn: "Sweet",
    nameCa: "Dolç",
    color: "#ccaa00",
    categories: ["main_tastes"],
    children: [],
  },
] as TaxonomyNode[];

const axis = (score: number | null, note: string | null = null) => ({ score, note });

export const EVALUATION: EvaluationItem = {
  ulid: "01JEVAL0000000000000000001",
  offeringId: "01JOFFERA",
  status: "closed",
  cuppingScore: "84.25",
  extractionMethod: "v60",
  isDefective: false,
  closedAt: "2026-10-02T11:05:30.000000Z",
  createdAt: "2026-10-01T16:40:00.000000Z",
  descriptive: {
    fragrance: axis(11),
    aroma: axis(10),
    flavor: axis(9),
    aftertaste: axis(8),
    acidity: axis(7),
    sweetness: axis(6),
    mouthfeel: axis(null),
  },
  affective: {
    fragrance: axis(7),
    aroma: axis(6),
    flavor: axis(8),
    aftertaste: axis(7),
    acidity: axis(6),
    sweetness: axis(7),
    mouthfeel: axis(5),
    overall: axis(null),
  },
  tastes: [
    { ref: "01JBERRY", type: "fragrance" },
    { ref: "01JSWEET", type: "main_tastes" },
    { ref: "01JUNKNOWN", type: "flavor" },
  ],
  extrinsics: {
    farming: null,
    processing: null,
    trading: null,
    certifications: null,
    generalObservation: null,
  },
} as EvaluationItem;
