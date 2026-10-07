/**
 * Public API of the `entities/contact` slice (Feature-Sliced Design).
 *
 * The contact's read-only list and the UI types (design.md D1), so the
 * account section and later the location form import through this entry
 * point. The slice holds no state and sends no request.
 */
export { ContactDetails } from "./ui/ContactDetails";
export type { ContactDetailsProps } from "./ui/ContactDetails";
export type {
  ContactFieldErrors,
  ContactFieldKey,
  ContactFieldValues,
  ContactTexts,
} from "./model/types";
