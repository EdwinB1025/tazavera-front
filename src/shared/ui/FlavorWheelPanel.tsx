import type { ReactNode } from "react";
import { SWATCH_CLASSES, descriptionId, swatchStyle } from "./flavor-wheel-tree";
import type { FlavorWheelNode } from "./FlavorWheel";

export type FlavorWheelPanelProps = {
  active: FlavorWheelNode | null;
  legend: (node: FlavorWheelNode) => string;
  hint: string;
};

const PANEL_CLASSES =
  "flex min-h-24 flex-col gap-2 rounded-field border border-border-subtle p-4";

/** The fixed description panel: the active note, or the hint (design.md D7). */
export function FlavorWheelPanel({
  active,
  legend,
  hint,
}: FlavorWheelPanelProps): ReactNode {
  return (
    <div data-slot="flavor-wheel-panel" className={PANEL_CLASSES}>
      {active ? (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={SWATCH_CLASSES}
              style={swatchStyle(active)}
              aria-hidden="true"
            />
            <span className="type-subheading">{active.name}</span>
            <span className="type-body ms-auto tabular-nums">
              {legend(active)}
            </span>
          </div>
          {active.description !== null ? (
            <p id={descriptionId(active.id)} className="type-body">
              {active.description}
            </p>
          ) : null}
        </>
      ) : (
        <p className="type-body">{hint}</p>
      )}
    </div>
  );
}
