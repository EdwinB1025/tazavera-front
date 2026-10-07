import { describe, it, expectTypeOf } from "vitest";
import type { operations } from "./schema";
import type { EvaluationItem } from "./index";

/**
 * The evaluation aliases the public reads reuse (add-public-evaluations
 * design.md D2; tasks 1.2): `offeringId` is nullable through `EvaluationItem`
 * only, and both generated public evaluation shapes fit the alias.
 */

type GetAnEvaluationData = NonNullable<
  operations["getAnEvaluation"]["responses"][200]["content"]["application/json"]["data"]
>;
type ListEvaluationsItem = NonNullable<
  operations["listEvaluations"]["responses"][200]["content"]["application/json"]["data"]
>[number];

describe("EvaluationItem (design.md D2)", () => {
  it("accepts a null offeringId and still a ULID string", () => {
    expectTypeOf<null>().toExtend<EvaluationItem["offeringId"]>();
    expectTypeOf<"01K6A3M8Q2V7XH4T9B5N1RCW0D">().toExtend<EvaluationItem["offeringId"]>();
  });

  it("fits the generated getAnEvaluation data and listEvaluations item", () => {
    expectTypeOf<GetAnEvaluationData>().toExtend<EvaluationItem>();
    expectTypeOf<ListEvaluationsItem>().toExtend<EvaluationItem>();
  });
});
