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

export { configureClient, publicRequest, REFERENCE_READ_INIT, request } from "./client";
export { clearTokens, exchangeCode, getTokens, refreshTokens } from "./tokens";
export { distinctCoffeeValues, fetchCoffees } from "./coffees";
export type { CoffeeSummary } from "./coffees";
export type { ApiResult } from "./result";

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
type ListMyContactsResponse =
  operations["listMyContacts"]["responses"][200]["content"]["application/json"];
type ListRoasteriesResponse =
  operations["listRoasteries"]["responses"][200]["content"]["application/json"];
type ListCoffeeShopsResponse =
  operations["listCoffeeShops"]["responses"][200]["content"]["application/json"];
type GetACoffeeShopResponse =
  operations["getACoffeeShop"]["responses"][200]["content"]["application/json"];

/** `data` of `GET /user`. All fields are optional in the contract. */
export type SessionUser = NonNullable<UserResponse["data"]>;

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

/** One item of `GET /roasteries` `data`: `ulid`, `name`, `description`. */
export type RoasterySummary = NonNullable<ListRoasteriesResponse["data"]>[number];

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

/** One item of `GET /users/{user_ulid}/contacts` `data`. */
export type Contact = NonNullable<ListMyContactsResponse["data"]>[number];

/** Body of `POST /users/{user_ulid}/contacts` (`createMyPrimaryContact`). */
export type ContactCreatePayload =
  operations["createMyPrimaryContact"]["requestBody"]["content"]["application/json"];

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

type ListEvaluationsQuery = NonNullable<operations["listEvaluations"]["parameters"]["query"]>;

/** The `evaluationType` values `GET /evaluations` accepts: `specialist` or `baseline`. */
export type EvaluationType = NonNullable<ListEvaluationsQuery["evaluationType"]>;

/** The `orderBy` values `GET /evaluations` accepts. */
export type EvaluationSortField = NonNullable<ListEvaluationsQuery["orderBy"]>;

/** The request body of `POST /user/evaluations`. */
export type EvaluationCreateBody =
  operations["createAnEvaluation"]["requestBody"]["content"]["application/json"];

/** The request body of `PUT /user/evaluations/{evaluation_ulid}`: the create body without `offeringId`. */
export type EvaluationUpdateBody = Omit<EvaluationCreateBody, "offeringId">;

/** One item of `GET /coffeeshops` (`listCoffeeShops`) `data`: a coffee shop with its locations. */
export type CoffeeshopSummary = NonNullable<ListCoffeeShopsResponse["data"]>[number];

/** `meta` of `GET /coffeeshops` (`listCoffeeShops`); the directory reads the pages and `total`. */
export type CoffeeshopsPageMeta = NonNullable<ListCoffeeShopsResponse["meta"]>;

/** `data` of `GET /coffeeshops/{user_ulid}` (`getACoffeeShop`): one coffee shop with its locations. */
export type CoffeeshopDetail = NonNullable<GetACoffeeShopResponse["data"]>;

/** The location fields the contract's examples carry as `null` (add-coffeeshop-directory design.md D2). */
type NullableLocationField =
  | "description"
  | "latitud"
  | "longitud"
  | "address"
  | "city"
  | "postalCode"
  | "country"
  | "phone"
  | "web"
  | "social";

type CoffeeshopLocationItem = NonNullable<CoffeeshopSummary["locations"]>[number];

/**
 * One location of a `listCoffeeShops` / `getACoffeeShop` item, with the fields
 * the contract's examples carry as `null` widened to `string | null` — the
 * single read point of that widening (design.md D2).
 */
export type CoffeeshopLocation = Omit<CoffeeshopLocationItem, NullableLocationField> & {
  [K in NullableLocationField]?: string | null;
};

type ListAUsersLocationsResponse =
  operations["listAUsersLocations"]["responses"][200]["content"]["application/json"];

/** What `GET /users/{user_ulid}/locations` returns: `data` of the user's locations. */
export type UserLocationsPayload = ListAUsersLocationsResponse;

/** One item of `GET /users/{user_ulid}/locations` `data`: `ulid`, `name`, `description`, `latitud`, `longitud`, `contacts`. */
export type UserLocation = NonNullable<UserLocationsPayload["data"]>[number];

/** Body of `POST /locations` (`createALocation`). */
export type CreateLocationPayload =
  operations["createALocation"]["requestBody"]["content"]["application/json"];
