import { describe, it, expect } from "vitest";
import { buildUpdateBody } from "./body";
import { emptyFormState } from "./state";
import type { SendableFormState } from "./state";

/** The extrinsics of the write body (spec "Editing and sending the extrinsic fields"; tasks 1.1). */

describe("buildUpdateBody extrinsics", () => {
  it("sends the five extrinsic fields, an empty one as null", () => {
    const state: SendableFormState = {
      ...emptyFormState("medium"),
      roastLevel: "medium",
      extrinsics: { farming: "Smallholder", processing: "", trading: "Direct", certifications: null },
      generalObservation: "Clean",
    };
    expect(buildUpdateBody(state).extrinsics).toEqual({
      farming: "Smallholder",
      processing: null,
      trading: "Direct",
      certifications: null,
      generalObservation: "Clean",
    });
  });
});
