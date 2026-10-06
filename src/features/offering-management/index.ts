/**
 * Public API of the `offering-management` feature slice (Feature-Sliced
 * Design): the coffeeshop's own list, its selection and delete flows, the
 * create flow and the session gate of the management routes.
 */
export { fetchOwnOfferings } from "./api/management";
export type { OwnOfferingsResult } from "./api/management";
export { useOwnOfferings } from "./model/own-offerings";
export type { OwnOfferings, OwnOfferingsState } from "./model/own-offerings";
export { ManagementGate } from "./ui/ManagementGate";
export type { ManagementGateProps, ManagementGateTexts } from "./ui/ManagementGate";
