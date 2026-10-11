/**
 * Public API of the `offering-management` feature slice (Feature-Sliced
 * Design): the coffeeshop's own list, its selection and delete flows and
 * the create flow.
 */
export { useOwnOfferings } from "./model/own-offerings";
export type { OwnOfferings } from "./model/own-offerings";
export { OfferingActions } from "./ui/OfferingActions";
export type { OfferingActionsTexts } from "./ui/OfferingActions";
export { OfferingSelect } from "./ui/OfferingSelect";
export type { OfferingSelectTexts } from "./ui/OfferingSelect";
export { SelectionToolbar } from "./ui/SelectionToolbar";
export type { SelectionToolbarTexts } from "./ui/SelectionToolbar";
export { previousPageAfterDelete, useDeleteFlow } from "./model/delete-flow";
export type { DeleteTarget } from "./model/delete-flow";
export { DeleteOfferingsDialog } from "./ui/DeleteOfferingsDialog";
export type { DeleteOfferingsDialogTexts } from "./ui/DeleteOfferingsDialog";
export { useCreateFlow } from "./model/create-flow";
export { InventoryField } from "./ui/InventoryField";
export type { InventoryFieldTexts } from "./ui/InventoryField";
export { LocationsFieldset } from "./ui/LocationsFieldset";
export type { LocationsFieldsetTexts } from "./ui/LocationsFieldset";
export { ManagementSidebarEntries } from "./ui/ManagementSidebarEntries";
export { useCoffeeInventory } from "./model/inventory";
export type { InventoryState } from "./model/inventory";
