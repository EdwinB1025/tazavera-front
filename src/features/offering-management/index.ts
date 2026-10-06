/**
 * Public API of the `offering-management` feature slice (Feature-Sliced
 * Design): the coffeeshop's own list, its selection and delete flows, the
 * create flow and the session gate of the management routes.
 */
export { fetchOwnOfferings } from "./api/management";
export type { OwnOfferingsResult, WriteOutcome } from "./api/management";
export { useOwnOfferings } from "./model/own-offerings";
export type {
  OfferingSelection,
  OwnOfferings,
  OwnOfferingsState,
} from "./model/own-offerings";
export { ManagementGate } from "./ui/ManagementGate";
export type { ManagementGateProps, ManagementGateTexts } from "./ui/ManagementGate";
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
