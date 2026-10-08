/**
 * Public API of the `coffeeshop-detail` widget (Feature-Sliced Design): the
 * detail block, its presentation, the tab of the address and the texts
 * (add-coffeeshop-directory design.md D8–D11).
 */
export { CoffeeshopDetail } from "./ui/CoffeeshopDetail";
export type { CoffeeshopDetailProps } from "./ui/CoffeeshopDetail";
export { CoffeeshopDetailContent } from "./ui/CoffeeshopDetailContent";
export type { CoffeeshopDetailContentProps, CoffeeshopDetailResult } from "./ui/CoffeeshopDetailContent";
export { coffeeshopDetailTexts } from "./ui/texts";
export type { CoffeeshopDetailTexts } from "./ui/texts";
export { toCoffeeshopTab } from "./lib/tab";
export type { CoffeeshopTab } from "./lib/tab";
