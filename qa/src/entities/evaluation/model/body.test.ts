import { describe, it, expect } from "vitest";
import { buildCreateBody, buildUpdateBody } from "@/entities/evaluation/model/body";
import { emptyFormState } from "@/entities/evaluation/model/state";
import type { EvaluationFormState } from "@/entities/evaluation/model/state";

/**
 * The write-body builder (design.md D3, D7, D8, D9; spec "Saving a draft",
 * "Descriptor blocks", "Fragrance not evaluated"; tasks 2.3).
 */

const OFFERING = "01JOFFER000000000000000001";

function fullState(): EvaluationFormState & { roastLevel: "medium" } {
  return {
    roastLevel: "medium",
    extractionMethod: "v60",
    descriptive: {
      fragrance: { score: 7, note: "jasmine" },
      aroma: { score: 8, note: null },
      flavor: { score: 9, note: null },
      aftertaste: { score: 6, note: null },
      acidity: { score: 10, note: "bright" },
      sweetness: { score: 5, note: null },
      mouthfeel: { score: 4, note: null },
    },
    affective: {
      fragrance: { score: 6, note: null },
      aroma: { score: 7, note: null },
      flavor: { score: 8, note: "juicy" },
      aftertaste: { score: 5, note: null },
      acidity: { score: 7, note: null },
      sweetness: { score: 6, note: null },
      mouthfeel: { score: 6, note: null },
      overall: { score: 8, note: "lovely" },
    },
    descriptors: {
      fragranceAroma: ["01JTAXFLORAL0000000000000A"],
      flavorAftertaste: ["01JTAXFRUIT00000000000000B"],
      mainTastes: ["01JTAXSWEET00000000000000C"],
      mouthfeel: ["01JTAXSILKY00000000000000D"],
      defects: ["01JTAXMOULD00000000000000E"],
    },
    generalObservation: "Washed station",
    fragranceNotEvaluated: false,
  };
}

describe("buildCreateBody (design.md D3)", () => {
  it("builds the create body of a full state", () => {
    expect(buildCreateBody(fullState(), OFFERING)).toEqual({
      offeringId: OFFERING,
      extractionMethod: "v60",
      descriptive: {
        roastLevel: "medium",
        fragrance: { score: 7, note: "jasmine", cata: ["01JTAXFLORAL0000000000000A"] },
        aroma: { score: 8, note: null, cata: ["01JTAXFLORAL0000000000000A"] },
        flavor: { score: 9, note: null, cata: ["01JTAXFRUIT00000000000000B"] },
        aftertaste: { score: 6, note: null, cata: ["01JTAXFRUIT00000000000000B"] },
        acidity: { score: 10, note: "bright" },
        sweetness: { score: 5, note: null },
        mouthfeel: { score: 4, note: null, cata: ["01JTAXSILKY00000000000000D"] },
        mainTastes: ["01JTAXSWEET00000000000000C"],
      },
      affective: {
        overall: { score: 8, note: "lovely" },
        fragrance: { score: 6, note: null },
        aroma: { score: 7, note: null },
        flavor: { score: 8, note: "juicy" },
        aftertaste: { score: 5, note: null },
        acidity: { score: 7, note: null },
        sweetness: { score: 6, note: null },
        mouthfeel: { score: 6, note: null },
        defects: ["01JTAXMOULD00000000000000E"],
      },
      extrinsics: {
        farming: null,
        processing: null,
        trading: null,
        certifications: null,
        generalObservation: "Washed station",
      },
    });
  });

  it("sends an unset intensity as 0 and an unset preference as null (design.md D8)", () => {
    const state = { ...emptyFormState("light"), roastLevel: "light" as const };
    const body = buildCreateBody(state, OFFERING);
    expect(body.descriptive.acidity).toEqual({ score: 0, note: null });
    expect(body.descriptive.fragrance).toEqual({ score: 0, note: null, cata: [] });
    expect(body.affective.overall).toEqual({ score: null, note: null });
    expect(body.extractionMethod).toBeNull();
    expect(body.extrinsics?.generalObservation).toBeNull();
  });

  it("sends an open but empty note as null", () => {
    const state = fullState();
    state.descriptive.aroma = { score: 8, note: "" };
    expect(buildCreateBody(state, OFFERING).descriptive.aroma?.note).toBeNull();
  });

  it("sends each part's aroma score as its fragrance score with the option checked (design.md D9)", () => {
    const state = { ...fullState(), fragranceNotEvaluated: true };
    const body = buildCreateBody(state, OFFERING);
    expect(body.descriptive.fragrance?.score).toBe(8);
    expect(body.affective.fragrance?.score).toBe(7);
    expect(body.descriptive.fragrance?.cata).toEqual(["01JTAXFLORAL0000000000000A"]);
  });
});

describe("buildUpdateBody (design.md D4)", () => {
  it("builds the same body without offeringId", () => {
    const body = buildUpdateBody(fullState());
    expect(body).not.toHaveProperty("offeringId");
    const created: Partial<ReturnType<typeof buildCreateBody>> = buildCreateBody(
      fullState(),
      OFFERING,
    );
    delete created.offeringId;
    expect(body).toEqual(created);
  });
});
