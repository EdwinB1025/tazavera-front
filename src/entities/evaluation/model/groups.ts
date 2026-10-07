/**
 * The eight groups of the CVA combined form (spec "Evaluation form"; design.md
 * D2 and D7): their order, the axes of each part and the descriptor blocks.
 * Every screen reads the form layout from here; the request fields each axis
 * and block write are the body builder's (`body.ts`).
 */

/** The CVA axes; `overall` exists only in the affective part. */
export type AxisKey =
  | "fragrance"
  | "aroma"
  | "flavor"
  | "aftertaste"
  | "acidity"
  | "sweetness"
  | "mouthfeel"
  | "overall";

/** The axes of the descriptive part (0–15). */
export type DescriptiveAxisKey = Exclude<AxisKey, "overall">;

/** The two parts of a group: descriptive (intensity) and affective (preference). */
export type PartKey = "descriptive" | "affective";

/** The taxonomy `categories` value a descriptor block filters by (design.md D7). */
export type DescriptorBlockKey = "aromatics" | "main_tastes" | "mouthfeel" | "defects";

/**
 * The selection a block writes to. The two aromatics blocks are separate
 * selections: one per axis pair.
 */
export type DescriptorSelectionKey =
  | "fragranceAroma"
  | "flavorAftertaste"
  | "mainTastes"
  | "mouthfeel"
  | "defects";

export type GroupKey =
  | "fragranceAroma"
  | "flavorAftertaste"
  | "acidity"
  | "sweetness"
  | "mouthfeel"
  | "overall"
  | "defects"
  | "extrinsic";

export type DescriptorBlock = {
  key: DescriptorBlockKey;
  selection: DescriptorSelectionKey;
};

export type GroupPart<Axis extends AxisKey = AxisKey> = {
  axes: Axis[];
  blocks: DescriptorBlock[];
};

export type GroupDefinition = {
  key: GroupKey;
  descriptive: GroupPart<DescriptiveAxisKey> | null;
  affective: GroupPart | null;
  /** The extrinsics field the group writes, for the notes-only group. */
  notes: "generalObservation" | null;
};

const none: DescriptorBlock[] = [];

export const EVALUATION_GROUPS: readonly GroupDefinition[] = [
  {
    key: "fragranceAroma",
    descriptive: {
      axes: ["fragrance", "aroma"],
      blocks: [{ key: "aromatics", selection: "fragranceAroma" }],
    },
    affective: { axes: ["fragrance", "aroma"], blocks: none },
    notes: null,
  },
  {
    key: "flavorAftertaste",
    descriptive: {
      axes: ["flavor", "aftertaste"],
      blocks: [
        { key: "aromatics", selection: "flavorAftertaste" },
        { key: "main_tastes", selection: "mainTastes" },
      ],
    },
    affective: { axes: ["flavor", "aftertaste"], blocks: none },
    notes: null,
  },
  {
    key: "acidity",
    descriptive: { axes: ["acidity"], blocks: none },
    affective: { axes: ["acidity"], blocks: none },
    notes: null,
  },
  {
    key: "sweetness",
    descriptive: { axes: ["sweetness"], blocks: none },
    affective: { axes: ["sweetness"], blocks: none },
    notes: null,
  },
  {
    key: "mouthfeel",
    descriptive: {
      axes: ["mouthfeel"],
      blocks: [{ key: "mouthfeel", selection: "mouthfeel" }],
    },
    affective: { axes: ["mouthfeel"], blocks: none },
    notes: null,
  },
  {
    key: "overall",
    descriptive: null,
    affective: { axes: ["overall"], blocks: none },
    notes: null,
  },
  {
    key: "defects",
    descriptive: null,
    affective: { axes: [], blocks: [{ key: "defects", selection: "defects" }] },
    notes: null,
  },
  {
    key: "extrinsic",
    descriptive: null,
    affective: null,
    notes: "generalObservation",
  },
];
