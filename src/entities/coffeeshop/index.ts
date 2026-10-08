/**
 * Public API of the `entities/coffeeshop` slice (Feature-Sliced Design).
 *
 * The coffee shop card and the pure location reads
 * (add-coffeeshop-directory design.md D7, D12).
 */
export { CoffeeshopCard } from "./ui/CoffeeshopCard";
export type { CoffeeshopCardTexts } from "./ui/CoffeeshopCard";
export {
  countUnlocated,
  hasLocatedLocation,
  isLocated,
  toMapPoints,
} from "./model/locations";
export { fetchCoffeeshop } from "./api/coffeeshop";
