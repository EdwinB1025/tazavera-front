import type { CoffeeshopLocation } from "@/shared/api";

/**
 * Pure reads of a coffee shop's locations (add-coffeeshop-directory design.md
 * D12). The coordinates arrive as decimal strings, or `null` when the location
 * has no position.
 */

/** Both coordinates parse to finite numbers. */
export function isLocated(location: CoffeeshopLocation): boolean {
  return [location.latitud, location.longitud].every(
    (value) => value != null && value.trim() !== "" && Number.isFinite(Number(value)),
  );
}

/** The non-null cities, each once, in first-occurrence order. */
export function uniqueCities(locations: readonly CoffeeshopLocation[]): string[] {
  const cities: string[] = [];
  for (const { city } of locations) {
    if (city != null && !cities.includes(city)) cities.push(city);
  }
  return cities;
}

// ─── Map points (design.md D12) ───

/** One located location as a map point (design.md D2). */
export type MapPoint = {
  id: string;
  groupId: string;
  lat: number;
  lng: number;
  label: string;
  title: string;
  subtitle: string;
  addressLine: string;
};

type CoffeeshopWithLocations = {
  ulid?: string;
  name?: string;
  locations?: CoffeeshopLocation[];
};

/** "{address}, {postalCode} {city}", null parts and their separators left out. */
function addressLineOf(location: CoffeeshopLocation): string {
  const place = [location.postalCode, location.city].filter((part) => part != null).join(" ");
  return [location.address, place].filter((part) => part != null && part !== "").join(", ");
}

/** For each coffee shop in API order, one point per location with both coordinates. */
export function toMapPoints(coffeeshops: readonly CoffeeshopWithLocations[]): MapPoint[] {
  return coffeeshops.flatMap((coffeeshop) =>
    (coffeeshop.locations ?? []).filter(isLocated).map((location) => ({
      id: location.ulid ?? "",
      groupId: coffeeshop.ulid ?? "",
      lat: Number(location.latitud),
      lng: Number(location.longitud),
      label: `${coffeeshop.name ?? ""} — ${location.name ?? ""}`,
      title: coffeeshop.name ?? "",
      subtitle: location.name ?? "",
      addressLine: addressLineOf(location),
    })),
  );
}

/** The locations of the page without both coordinates. */
export function countUnlocated(coffeeshops: readonly CoffeeshopWithLocations[]): number {
  return coffeeshops.reduce(
    (count, coffeeshop) => count + (coffeeshop.locations ?? []).filter((location) => !isLocated(location)).length,
    0,
  );
}

/** At least one location of the coffee shop has both coordinates. */
export function hasLocatedLocation(coffeeshop: CoffeeshopWithLocations): boolean {
  return (coffeeshop.locations ?? []).some(isLocated);
}
