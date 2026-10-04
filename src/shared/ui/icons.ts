/**
 * Shared icon source for Tazavera.
 *
 * This is the ONLY module in `src/` allowed to import `lucide-react`
 * (enforced by `icons.test.ts`). Every icon is consumed through this entry
 * point so there is a single audit point, sizing stays consistent and the
 * library can be swapped later. The project's own SVGs (app logo, coffee
 * bean) join this module in later changes (6 and 2).
 *
 * Icons render with `currentColor`, so they follow the control's text color
 * through every state and theme (spec: "Shared icon source").
 */
export { Loader2, ArrowLeft, Eye, EyeOff, ChevronDown, ChevronRight, Check, PanelLeft, type LucideIcon } from "lucide-react";
