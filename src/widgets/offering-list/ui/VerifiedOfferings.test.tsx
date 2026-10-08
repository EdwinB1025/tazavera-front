import { describe, it, expect } from "vitest";
import type { ReactElement } from "react";
import { VerifiedOfferings } from "./VerifiedOfferings";
import type { OfferingsProps } from "./Offerings";
import type { OfferingListTexts } from "./OfferingList";

/**
 * The landing's request (refine-list-pagination design.md D8; the landing spec
 * "Page size"): `VerifiedOfferings` is sync and returns the async `Offerings`
 * element, so its props are asserted without rendering it. The query carries
 * `perPage=6`, and no `path` is passed, so `perPage` never reaches the links.
 */

describe("VerifiedOfferings", () => {
  it("requests six verified offerings for the page, without a path", () => {
    const element = VerifiedOfferings({
      locale: "es",
      page: 3,
      texts: {} as OfferingListTexts,
    }) as ReactElement<OfferingsProps>;

    expect(element.props.query).toEqual({
      verified: "1",
      page: "3",
      perPage: "6",
    });
    expect(element.props.path).toBeUndefined();
  });
});
