/**
 * Public API of the `offering-management` feature slice (Feature-Sliced
 * Design): the coffeeshop's own list, its selection and delete flows and
 * the create flow.
 */
export { fetchOwnOfferings } from "./api/management";
export { useOwnOfferings } from "./model/own-offerings";
export type {
  OfferingSelection,
  OwnOfferings,
  OwnOfferingsResult,
  OwnOfferingsState,
} from "./model/own-offerings";
export { OfferingActions } from "./ui/OfferingActions";
export type { OfferingActionsProps, OfferingActionsTexts } from "./ui/OfferingActions";
export { SelectionToolbar } from "./ui/SelectionToolbar";
export type { SelectionToolbarProps, SelectionToolbarTexts } from "./ui/SelectionToolbar";
export { previousPageAfterDelete, useDeleteFlow } from "./model/delete-flow";
export type {
  DeleteError,
  DeleteFlow,
  DeleteFlowOptions,
  DeleteTarget,
} from "./model/delete-flow";
export { DeleteOfferingsDialog } from "./ui/DeleteOfferingsDialog";
export type {
  DeleteOfferingsDialogProps,
  DeleteOfferingsDialogTexts,
} from "./ui/DeleteOfferingsDialog";
export { useCreateFlow } from "./model/create-flow";
export type { CreateFlow, CreateStatus } from "./model/create-flow";
export { InventoryField } from "./ui/InventoryField";
export type { InventoryFieldProps, InventoryFieldTexts } from "./ui/InventoryField";
export type { CreateFlowOptions, LocationsResult, LocationsState } from "./model/create-flow";
export { LocationsFieldset } from "./ui/LocationsFieldset";
export type { LocationsFieldsetProps, LocationsFieldsetTexts } from "./ui/LocationsFieldset";
export { ManagementSidebarEntries } from "./ui/ManagementSidebarEntries";
export type { ManagementSidebarEntriesProps } from "./ui/ManagementSidebarEntries";
