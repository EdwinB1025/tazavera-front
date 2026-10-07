/**
 * Public API of the `manage-evaluations` feature slice (Feature-Sliced Design).
 *
 * The chrome of the specialist's evaluations area (design.md D2): the access
 * gate every evaluation route renders around its content (D13).
 */
export { EvaluationsAccess } from "./ui/EvaluationsAccess";
export type { EvaluationsAccessProps, EvaluationsAccessTexts } from "./ui/EvaluationsAccess";
export { EvaluationsSidebarEntry } from "./ui/EvaluationsSidebarEntry";
export type { EvaluationsSidebarEntryProps, SidebarEntryTexts } from "./ui/EvaluationsSidebarEntry";
