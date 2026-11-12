"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { GeocodeOutcome } from "@/shared/lib/geocoding";
import { FormStatus, LoadingStatus } from "@/shared/ui";
import type { ListState } from "../model/types";
import { useOwnLocations } from "../model/use-own-locations";
import type { LocationFormTexts } from "./LocationForm";
import { LocationList } from "./LocationList";
import { NewLocationForm } from "./NewLocationForm";
import {
  AddLocationButton,
  LocationsEmptyCard,
  LocationsLoadError,
} from "./LocationsPanelStates";

// ─── UI-specific types (declared before the component) ───

export type LocationsPanelTexts = LocationFormTexts & {
  loading: string;
  locationsLoadError: string;
  retry: string;
  locationsEmptyText: string;
  addLocation: string;
  locationCreated: string;
  locationCreatedNoMap: string;
  locationNoMap: string;
};

export type LocationsPanelProps = {
  userUlid: string;
  /** The page `h1`'s id: it names the list and takes focus after a creation. */
  headingId: string;
  texts: LocationsPanelTexts;
};

/** Where focus goes once the form has opened or closed (design.md D3). */
type FocusTarget = "name" | "add" | null;

// ─── Layout (summary §8) ───
// Toolbar or form, status and list 1.5rem apart.
const PANEL_CLASSES = ["flex", "flex-col", "gap-6"].join(" ");

type LocationsContentProps = {
  list: ListState;
  /** The open form, or `null` while it is closed. */
  form: ReactNode;
  addButton: ReactNode;
  status: string | null;
  onRetry: () => void;
  headingId: string;
  texts: LocationsPanelTexts;
};

/** The panel's state: loading, read error, empty card or form, or the list. */
function LocationsContent({
  list,
  form,
  addButton,
  status,
  onRetry,
  headingId,
  texts,
}: LocationsContentProps): ReactNode {
  if (list.status === "loading") return <LoadingStatus text={texts.loading} />;
  if (list.status === "error") {
    return (
      <LocationsLoadError
        text={texts.locationsLoadError}
        retryLabel={texts.retry}
        onRetry={onRetry}
      />
    );
  }
  if (list.locations.length === 0) {
    return (
      form ?? (
        <LocationsEmptyCard text={texts.locationsEmptyText}>{addButton}</LocationsEmptyCard>
      )
    );
  }
  return (
    <>
      {form ?? addButton}
      {status !== null && <FormStatus kind="success" text={status} />}
      <LocationList locations={list.locations} headingId={headingId} texts={texts} />
    </>
  );
}

/**
 * The session user's locations (design.md D3, D4; specs "Own locations
 * list", "Empty locations state", "Location form", "Location creation"): the
 * list read on mount, its loading and error states, the empty card, the
 * toolbar with "Add location", the form in its place while open, the
 * creation status and the cards. Focus moves to Name on reveal, back to
 * "Add location" on Cancel and to the page heading after a creation.
 */
export function LocationsPanel({
  userUlid,
  headingId,
  texts,
}: LocationsPanelProps): ReactNode {
  const rootRef = useRef<HTMLDivElement>(null);
  // The page's lookup cache, kept across closing and reopening the form; a
  // state initialiser rather than a ref, since it is read during render.
  const [geocodeCache] = useState(() => new Map<string, GeocodeOutcome>());
  const focusTarget = useRef<FocusTarget>(null);
  const { list, reload } = useOwnLocations(userUlid);
  const [formOpen, setFormOpen] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  // Runs once the form has opened or closed.
  useEffect(() => {
    const root = rootRef.current;
    if (focusTarget.current === "name") {
      root?.querySelector<HTMLElement>('[name="name"]')?.focus();
    } else if (focusTarget.current === "add") {
      root?.querySelector<HTMLElement>("[data-add-location] button")?.focus();
    }
    focusTarget.current = null;
  }, [formOpen]);

  function openForm(): void {
    setStatus(null);
    focusTarget.current = "name";
    setFormOpen(true);
  }

  function closeForm(): void {
    focusTarget.current = "add";
    setFormOpen(false);
  }

  /** The `201` outcome: close, status, focus to the page heading, reload. */
  function handleCreated(hadCoordinates: boolean): void {
    setFormOpen(false);
    setStatus(
      hadCoordinates
        ? texts.locationCreated
        : `${texts.locationCreated} ${texts.locationCreatedNoMap}`,
    );
    document.getElementById(headingId)?.focus();
    reload();
  }

  const form = (
    <NewLocationForm
      texts={texts}
      geocodeCache={geocodeCache}
      onCancel={closeForm}
      onCreated={handleCreated}
    />
  );
  const addButton = <AddLocationButton label={texts.addLocation} onAdd={openForm} />;

  return (
    <div ref={rootRef} className={PANEL_CLASSES}>
      <LocationsContent
        list={list}
        form={formOpen ? form : null}
        addButton={addButton}
        status={status}
        onRetry={reload}
        headingId={headingId}
        texts={texts}
      />
    </div>
  );
}
