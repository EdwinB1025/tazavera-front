import type { ReactNode } from "react";
import { Button, Card, CardContent } from "@/shared/ui";
import { Plus } from "@/shared/ui/icons";

// ─── UI-specific types (declared before the components) ───

export type LocationsLoadErrorProps = {
  text: string;
  retryLabel: string;
  onRetry: () => void;
};

export type LocationsEmptyCardProps = {
  text: string;
  /** The add button. */
  children: ReactNode;
};

export type AddLocationButtonProps = {
  label: string;
  onAdd: () => void;
};

// The empty card fills the container (widen-location-and-offering-forms D1).
const EMPTY_CARD_CLASSES = "w-full";
// The empty card's content: full width, at most 40rem from `md`, start-aligned.
const EMPTY_CONTENT_CLASSES = ["w-full", "md:max-w-160"].join(" ");
// The empty text, then its button, 1rem apart; the error text and Try again too.
const STACK_CLASSES = ["flex", "flex-col", "items-start", "gap-4"].join(" ");
// The toolbar: a start-aligned row, no padding, border or radius.
const TOOLBAR_CLASSES = ["flex", "justify-start"].join(" ");

/** The read error with "Try again" (design.md D3). */
export function LocationsLoadError({
  text,
  retryLabel,
  onRetry,
}: LocationsLoadErrorProps): ReactNode {
  return (
    <div className={STACK_CLASSES}>
      <p className="type-body">{text}</p>
      <Button variant="action-4" size="base" onClick={onRetry}>
        {retryLabel}
      </Button>
    </div>
  );
}

/** The empty card with its text and the add button (spec "Empty locations state"). */
export function LocationsEmptyCard({ text, children }: LocationsEmptyCardProps): ReactNode {
  return (
    <Card variant="section" className={EMPTY_CARD_CLASSES}>
      <CardContent>
        <div className={EMPTY_CONTENT_CLASSES}>
          <div className={STACK_CLASSES}>
            <p className="type-body">{text}</p>
            {children}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/** The toolbar with "Add location"; the panel's focus effect finds it by `data-add-location`. */
export function AddLocationButton({ label, onAdd }: AddLocationButtonProps): ReactNode {
  return (
    <div data-add-location className={TOOLBAR_CLASSES}>
      <Button variant="primary" size="base" icon={Plus} onClick={onAdd}>
        {label}
      </Button>
    </div>
  );
}
