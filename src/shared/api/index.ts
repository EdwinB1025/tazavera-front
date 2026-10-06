/**
 * Public API of the `shared/api` segment (Feature-Sliced Design).
 *
 * Named type aliases derived from the generated `schema.ts` (design.md D4).
 * The generated file is never edited and no generated type is redefined or
 * widened here: everything is built from `operations`, because the contract
 * declares no named schemas (`components.schemas` is `never`). The request
 * client and the token functions are exported for `src/features/auth`
 * (design.md D9); the UI-specific types of design.md D7 stay inside the
 * segment and are never re-exported here.
 */
import type { operations } from "./schema";

export { configureClient, publicRequest, request } from "./client";
export { clearTokens, exchangeCode, getTokens, refreshTokens } from "./tokens";

type UserResponse =
  operations["getTheAuthenticatedUser"]["responses"][200]["content"]["application/json"];
type ListOfferingsResponse =
  operations["listOfferings"]["responses"][200]["content"]["application/json"];
type ListTaxonomiesResponse =
  operations["listOlfactoryTaxonomies"]["responses"][200]["content"]["application/json"];

/** `data` of `GET /user`. All fields are optional in the contract. */
export type SessionUser = NonNullable<UserResponse["data"]>;

/** Role values the shell branches on. */
export type UserRole = SessionUser["role"];

/** What the shell receives from the session owner. */
export type Session =
  | { state: "loading" }
  | { state: "anonymous" }
  | { state: "authenticated"; user: SessionUser };

/** One item of `GET /offerings` `data`; every field is optional in the contract. */
export type OfferingSummary = NonNullable<ListOfferingsResponse["data"]>[number];

/** `meta` of the offerings pagination; the list reads `current_page` and `last_page`. */
export type OfferingsPageMeta = NonNullable<ListOfferingsResponse["meta"]>;

/** One node of an offering's `sensoryTaxonomy` tree: `ref`, `type`, `level`, `count`, `children`. */
export type OfferingTaxonomyNode = NonNullable<
  OfferingSummary["sensoryTaxonomy"]
>[number];

/** One node of `GET /taxonomies` `data`: `ulid`, `level`, `nameEs`, `nameEn`, `nameCa`, `color`, `children`. */
export type TaxonomyNode = NonNullable<ListTaxonomiesResponse["data"]>[number];

/** What `GET /taxonomies` returns: `data` of taxonomy nodes. */
export type TaxonomiesPayload = {
  data: TaxonomyNode[];
};

type ListMyEvaluationsResponse =
  operations["listMyEvaluations"]["responses"][200]["content"]["application/json"];
type GetAnOfferingResponse =
  operations["getAnOffering"]["responses"][200]["content"]["application/json"];

/**
 * One item of `GET /user/evaluations` `data`. The `data` of `getMyEvaluation`,
 * `createAnEvaluation` and `updateAnEvaluation` has the same shape and reuses it.
 */
export type EvaluationItem = NonNullable<ListMyEvaluationsResponse["data"]>[number];

/** `meta` of `GET /user/evaluations`: `current_page`, `last_page`, `per_page`, `total`. */
export type EvaluationPageMeta = NonNullable<ListMyEvaluationsResponse["meta"]>;

/** The `descriptive` block of an evaluation: per-axis `{score, note}`. */
export type EvaluationDescriptive = NonNullable<EvaluationItem["descriptive"]>;

/** The `affective` block of an evaluation: per-axis `{score, note}`, `overall` included. */
export type EvaluationAffective = NonNullable<EvaluationItem["affective"]>;

/** The `extrinsics` block of an evaluation; the form writes `generalObservation` only. */
export type EvaluationExtrinsics = NonNullable<EvaluationItem["extrinsics"]>;

/** One item of an evaluation's `tastes`: `{ref, type}`. */
export type EvaluationTaste = NonNullable<EvaluationItem["tastes"]>[number];

/** The request body of `POST /user/evaluations`. */
export type EvaluationCreateBody =
  operations["createAnEvaluation"]["requestBody"]["content"]["application/json"];

/** The request body of `PUT /user/evaluations/{evaluation_ulid}`: the create body without `offeringId`. */
export type EvaluationUpdateBody = Omit<EvaluationCreateBody, "offeringId">;

/** `data` of `GET /offerings/{offering_ulid}`. */
export type OfferingDetail = NonNullable<GetAnOfferingResponse["data"]>;
