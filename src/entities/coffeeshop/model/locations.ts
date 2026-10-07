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
