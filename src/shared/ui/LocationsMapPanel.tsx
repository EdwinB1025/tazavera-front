"use client";

import { type ReactNode } from "react";
import { Button } from "./Button";
import { Card, CardContent } from "./Card";
import { X } from "./icons";
import type { LocationsMapPoint } from "./LocationsMap";

// ─── UI-specific types (declared before the component) ───

export type LocationsMapPanelProps = {
  point: LocationsMapPoint;
  headingId: string;
  renderPanelLink?: (point: LocationsMapPoint) => ReactNode;
  closeLabel: string;
  onClose: () => void;
  className: string;
};

/** The selected-location panel; Escape or Close closes it. */
export function LocationsMapPanel({
  point,
  headingId,
  renderPanelLink,
  closeLabel,
  onClose,
  className,
}: LocationsMapPanelProps): ReactNode {
  return (
    <div
      role="region"
      aria-labelledby={headingId}
      className={className}
      onKeyDown={(event) => {
        if (event.key === "Escape") onClose();
      }}
    >
      <Card>
        <CardContent className="relative flex flex-col gap-1 p-4">
          <h2 id={headingId} className="type-card-heading pr-10">
            {point.title}
          </h2>
          <p className="type-label">{point.subtitle}</p>
          <p className="type-meta">{point.addressLine}</p>
          {renderPanelLink ? <div className="mt-2">{renderPanelLink(point)}</div> : null}
          <div className="absolute top-2 right-2">
            <Button
              variant="action-4"
              size="sm"
              icon={X}
              aria-label={closeLabel}
              onClick={onClose}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
