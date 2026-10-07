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
type OfferingResponse =
  operations["getAnOffering"]["responses"][200]["content"]["application/json"];
type ListTaxonomiesResponse =
  operations["listOlfactoryTaxonomies"]["responses"][200]["content"]["application/json"];
type ListMyLocationsResponse =
  operations["listMyLocations"]["responses"][200]["content"]["application/json"];
type ListCoffeeInventoryResponse =
  operations["listCoffeeInventory"]["responses"][200]["content"]["application/json"];
type CreateOfferingsResponse =
  operations["createOfferings"]["responses"][201]["content"]["application/json"];

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

/** `data` of `GET /offerings/{offering_ulid}`: the offering detail both detail tabs show. */
export type OfferingDetail = NonNullable<OfferingResponse["data"]>;

/** One node of an offering's `sensoryTaxonomy` tree: `ref`, `type`, `level`, `count`, `children`. */
export type OfferingTaxonomyNode = NonNullable<
  OfferingSummary["sensoryTaxonomy"]
>[number];

/** One node of `GET /taxonomies` `data`: `ulid`, `level`, `nameEs`, `nameEn`, `nameCa`, `color`, `children`. */
export type TaxonomyNode = NonNullable<ListTaxonomiesResponse["data"]>[number];

/** Body of `POST /register` (`registerAUser`). */
export type RegisterPayload =
  operations["registerAUser"]["requestBody"]["content"]["application/json"];

/** Body of `PUT /users/{user_ulid}` (`updateAUser`); every field is optional in the contract. */
export type ProfileUpdatePayload =
  NonNullable<operations["updateAUser"]["requestBody"]>["content"]["application/json"];

/** Body of `PUT /users/{user_ulid}/password` (`updateUserPassword`). */
export type PasswordUpdatePayload =
  operations["updateUserPassword"]["requestBody"]["content"]["application/json"];

/** What `GET /taxonomies` returns: `data` of taxonomy nodes. */
export type TaxonomiesPayload = {
  data: TaxonomyNode[];
};

/** What `GET /locations` returns: `data` of the coffeeshop's locations. */
export type LocationsPayload = ListMyLocationsResponse;

/** One item of `GET /locations` `data`: `ulid`, `name`, `description`, `latitud`, `longitud`, `contacts`. */
export type LocationItem = NonNullable<LocationsPayload["data"]>[number];

/** What `GET /coffeeInventory` returns: `data` of inventory items. */
export type CoffeeInventoryPayload = ListCoffeeInventoryResponse;

/** One item of `GET /coffeeInventory` `data`: `ulid`, `roastLot`, `productionDate`, `coffee`, `roastery`. */
export type CoffeeInventoryItem = NonNullable<CoffeeInventoryPayload["data"]>[number];

/** What `POST /offerings` returns on 201: `data` of the created offerings and `message`. */
export type CreateOfferingsPayload = CreateOfferingsResponse;

type ListMyEvaluationsResponse =
  operations["listMyEvaluations"]["responses"][200]["content"]["application/json"];

type GeneratedEvaluationItem = NonNullable<ListMyEvaluationsResponse["data"]>[number];

/**
 * One item of `GET /user/evaluations` `data`. The `data` of `getMyEvaluation`,
 * `createAnEvaluation` and `updateAnEvaluation` has the same shape and reuses it.
 *
 * `offeringId` is narrowed to `string | null`: deleting an offering keeps its
 * specialists' evaluations without an offering, as the `deleteAnOffering` and
 * `deleteMultipleOfferings` descriptions state, while the response schema still
 * types it as a string. This alias is the one read point that widens it.
 */
export type EvaluationItem = Omit<GeneratedEvaluationItem, "offeringId"> & {
  offeringId?: string | null;
};

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
