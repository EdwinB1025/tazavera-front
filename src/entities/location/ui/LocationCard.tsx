import type { ReactNode } from "react";
import { Card, CardContent } from "@/shared/ui";
import { MapPinOff } from "@/shared/ui/icons";

// ─── UI-specific types (declared before the component) ───

export type LocationCardProps = {
  name: string;
  description?: string | null;
  /** The contact details, filled by the consumer (design.md D9). */
  details?: ReactNode;
  /** The no-map line renders only when given. */
  noMapText?: string;
};

/**
 * One location in the stacked content card (design.md D9; spec "Own
 * locations list"): the name, the description when present, the consumer's
 * details and the no-map line. It reads no catalog: every text is a prop.
 */
export function LocationCard({
  name,
  description,
  details,
  noMapText,
}: LocationCardProps): ReactNode {
  return (
    <Card layout="stacked">
      <CardContent>
        <h2 className="type-card-heading">{name}</h2>
        {description ? <p className="mt-2 type-body">{description}</p> : null}
        {details ? <div className="mt-4">{details}</div> : null}
        {noMapText ? (
          <p className="mt-4 flex items-center gap-2 type-meta">
            <MapPinOff className="size-4" aria-hidden />
            {noMapText}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
