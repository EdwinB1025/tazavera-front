/**
 * Shared icon source for Tazavera.
 *
 * This is the ONLY module in `src/` allowed to import `lucide-react`
 * (enforced by `icons.test.ts`). Every icon is consumed through this entry
 * point so there is a single audit point, sizing stays consistent and the
 * library can be swapped later. The project's own SVGs join this module too:
 * the coffee-bean mark below (design.md D4 of `add-evaluation-scales`).
 *
 * Icons render with `currentColor`, so they follow the control's text color
 * through every state and theme (spec: "Shared icon source").
 */
import { createElement, type ReactNode } from "react";

export { Loader2, ArrowLeft, Eye, EyeOff, Globe, ChevronDown, ChevronRight, Check, Clock, PanelLeft, SlidersHorizontal, X, Trash2, List, Plus, MapPin, MapPinOff, type LucideIcon } from "lucide-react";

// ─── Bean mark (the project's own SVG) ────────────────────────────────────
// Artwork from the MVC `resources/views/flux/icon/coffee-bean.blade.php`, the
// path reused as it is because Product owner drew it (design.md D4, Open 7 a).
// The number inside the bean is dropped. The disc is the MVC circle that fills
// the viewBox (its `scale(0.58)` transform dropped, design.md D4: "a full
// circle filling the viewBox"), and the bean path is scaled about the centre
// so the whole drawing, stroke included, sits inside the disc (the MVC drawing
// overflows its disc). The layers take their colors from the theme tokens
// through `fill-`/`stroke-` utilities, the `Logo.tsx` `fill-logo-*` precedent.

/** Painted state of the mark (design.md D4). */
export type BeanMarkVariant = "on" | "off";

export type BeanMarkProps = {
  /** `"on"` for a filled bean, `"off"` for an empty one. */
  variant: BeanMarkVariant;
};

const BEAN_VIEW_BOX = "-2.4 -2.4 28.80 28.80";
const BEAN_PATH_D =
  "M19.151,4.868a6.744,6.744,0,0,0-5.96-1.69,12.009,12.009,0,0,0-6.54,3.47,11.988,11.988,0,0,0-3.48,6.55,6.744,6.744,0,0,0,1.69,5.95,6.406,6.406,0,0,0,4.63,1.78,11.511,11.511,0,0,0,7.87-3.56C21.3,13.428,22.1,7.818,19.151,4.868Zm-14.99,8.48a11.041,11.041,0,0,1,3.19-5.99,10.976,10.976,0,0,1,5.99-3.19,8.016,8.016,0,0,1,1.18-.09,5.412,5.412,0,0,1,3.92,1.49.689.689,0,0,1,.11.13,6.542,6.542,0,0,1-2.12,1.23,7.666,7.666,0,0,0-2.96,1.93,7.666,7.666,0,0,0-1.93,2.96,6.589,6.589,0,0,1-1.71,2.63,6.7,6.7,0,0,1-2.63,1.71,7.478,7.478,0,0,0-2.35,1.36A6.18,6.18,0,0,1,4.161,13.348Zm12.49,3.31c-3.55,3.55-8.52,4.35-11.08,1.79a1.538,1.538,0,0,1-.12-.13,6.677,6.677,0,0,1,2.13-1.23,7.862,7.862,0,0,0,2.96-1.93,7.738,7.738,0,0,0,1.93-2.96,6.589,6.589,0,0,1,1.71-2.63,6.589,6.589,0,0,1,2.63-1.71,7.6,7.6,0,0,0,2.34-1.37C20.791,9.2,19.821,13.488,16.651,16.658Z";
// Scaled about the centre (12,12) of the disc: the drawing's stroked outer
// radius is 10.80 viewBox units and the disc's is 14.4, so 1.33 keeps the
// whole drawing inside while the disc just contains it.
const BEAN_PATH_TRANSFORM = "translate(12 12) scale(1.33) translate(-12 -12)";

const BEAN_DISC_CLASSES: Record<BeanMarkVariant, string> = {
  on: "fill-evaluation-bean-on",
  off: "fill-evaluation-bean-off",
};

const BEAN_PATH_CLASSES: Record<BeanMarkVariant, string> = {
  on: "fill-evaluation-bean-mark-on stroke-evaluation-bean-mark-on",
  off: "fill-evaluation-bean-mark-off stroke-evaluation-bean-mark-off",
};

/**
 * Coffee-bean mark of the evaluation scales (design.md D4). Decorative
 * artwork: `aria-hidden`, and it renders at the size of its container (the
 * bean button sizes it).
 */
export function BeanMark({ variant }: BeanMarkProps): ReactNode {
  return createElement(
    "svg",
    {
      viewBox: BEAN_VIEW_BOX,
      width: "100%",
      height: "100%",
      focusable: "false",
      "aria-hidden": true,
    },
    createElement("rect", {
      x: "-2.4",
      y: "-2.4",
      width: "28.80",
      height: "28.80",
      rx: "14.4",
      className: BEAN_DISC_CLASSES[variant],
    }),
    createElement("path", {
      d: BEAN_PATH_D,
      transform: BEAN_PATH_TRANSFORM,
      strokeWidth: "1.4",
      className: BEAN_PATH_CLASSES[variant],
    }),
  );
}
