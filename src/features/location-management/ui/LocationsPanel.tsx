"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { UserLocation, UserLocationsPayload } from "@/shared/api";
import type { GeocodeOutcome } from "@/shared/lib/geocoding";
import { Button, Card, CardContent, FormStatus, LoadingStatus } from "@/shared/ui";
import { Plus } from "@/shared/ui/icons";
import { ContactDetails } from "@/entities/contact";
import { LocationCard } from "@/entities/location";
import { fetchOwnLocations } from "../api/locations";
import type { LocationFormValues } from "../model/location-form";
import { submitLocation } from "../model/submit-location";
import type { ListState, SubmitState } from "../model/types";
import { LocationForm, type LocationFormTexts } from "./LocationForm";

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
  locale: string;
  /** The page `h1`'s id: it names the list and takes focus after a creation. */
  headingId: string;
  texts: LocationsPanelTexts;
  /** Starts the write-scope sign in (user-account D6). */
  requestProfileWrite: (returnRoute: string) => void;
};

/** Where focus goes once the form has opened or closed (design.md D3). */
type FocusTarget = "name" | "add" | null;

// ─── Layout (summary §8) ───
// Toolbar or form, status and list 1.5rem apart.
const PANEL_CLASSES = ["flex", "flex-col", "gap-6"].join(" ");
// The empty card: the section card's width rule, full width up to 40rem.
const EMPTY_CARD_CLASSES = ["w-full", "md:max-w-160"].join(" ");
// The empty text, then its button, 1rem apart; the error text and Try again too.
const STACK_CLASSES = ["flex", "flex-col", "items-start", "gap-4"].join(" ");
// The toolbar: a start-aligned row, no padding, border or radius.
const TOOLBAR_CLASSES = ["flex", "justify-start"].join(" ");
// One column of cards 1.5rem apart.
const LIST_CLASSES = ["flex", "flex-col", "gap-6"].join(" ");

/** The list state a read's response leads to (design.md D3). */
async function readOutcome(userUlid: string): Promise<ListState> {
  try {
    const response = await fetchOwnLocations(userUlid);
    if (response.status !== 200) return { status: "error" };
    const body = (await response.json()) as UserLocationsPayload;
    return { status: "ready", locations: body.data ?? [] };
  } catch {
    return { status: "error" };
  }
}

function hasNoMap(location: UserLocation): boolean {
  return location.latitud == null || location.longitud == null;
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
  locale,
  headingId,
  texts,
  requestProfileWrite,
}: LocationsPanelProps): ReactNode {
  const rootRef = useRef<HTMLDivElement>(null);
  const mounted = useRef(true);
  const geocodeCache = useRef(new Map<string, GeocodeOutcome>());
  const focusTarget = useRef<FocusTarget>(null);
  const [list, setList] = useState<ListState>({ status: "loading" });
  const [formOpen, setFormOpen] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [status, setStatus] = useState<string | null>(null);

  const read = useCallback(async (): Promise<void> => {
    const next = await readOutcome(userUlid);
    if (mounted.current) setList(next);
  }, [userUlid]);

  useEffect(() => {
    mounted.current = true;
    void read();
    return () => {
      mounted.current = false;
    };
  }, [read]);

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

  function reload(): void {
    setList({ status: "loading" });
    void read();
  }

  function openForm(): void {
    setStatus(null);
    setSubmitState("idle");
    focusTarget.current = "name";
    setFormOpen(true);
  }

  function closeForm(): void {
    focusTarget.current = "add";
    setFormOpen(false);
  }

  async function handleSubmit(values: LocationFormValues): Promise<void> {
    setSubmitState("submitting");
    const outcome = await submitLocation(values, geocodeCache.current);
    if (!mounted.current) return;
    if (outcome.status !== "created") {
      setSubmitState(outcome.status);
      return;
    }
    setSubmitState("idle");
    setFormOpen(false);
    setStatus(
      outcome.hadCoordinates
        ? texts.locationCreated
        : `${texts.locationCreated} ${texts.locationCreatedNoMap}`,
    );
    document.getElementById(headingId)?.focus();
    reload();
  }

  const form = (
    <LocationForm
      locale={locale}
      texts={texts}
      submitState={submitState}
      onSubmit={(values) => void handleSubmit(values)}
      onCancel={closeForm}
      requestProfileWrite={requestProfileWrite}
    />
  );

  const addButton = (
    <div data-add-location className={TOOLBAR_CLASSES}>
      <Button variant="primary" size="base" icon={Plus} onClick={openForm}>
        {texts.addLocation}
      </Button>
    </div>
  );

  let content: ReactNode;
  if (list.status === "loading") {
    content = <LoadingStatus text={texts.loading} />;
  } else if (list.status === "error") {
    content = (
      <div className={STACK_CLASSES}>
        <p className="type-body">{texts.locationsLoadError}</p>
        <Button variant="action-4" size="base" onClick={reload}>
          {texts.retry}
        </Button>
      </div>
    );
  } else if (list.locations.length === 0) {
    content = formOpen ? (
      form
    ) : (
      <Card variant="section" className={EMPTY_CARD_CLASSES}>
        <CardContent>
          <div className={STACK_CLASSES}>
            <p className="type-body">{texts.locationsEmptyText}</p>
            {addButton}
          </div>
        </CardContent>
      </Card>
    );
  } else {
    content = (
      <>
        {formOpen ? form : addButton}
        {status !== null && <FormStatus kind="success" text={status} />}
        <ul aria-labelledby={headingId} className={LIST_CLASSES}>
          {list.locations.map((location) => {
            const primary = location.contacts?.find((contact) => contact.isPrimary === true);
            return (
              <li key={location.ulid}>
                <LocationCard
                  name={location.name ?? ""}
                  description={location.description}
                  details={primary ? <ContactDetails contact={primary} texts={texts} /> : undefined}
                  noMapText={hasNoMap(location) ? texts.locationNoMap : undefined}
                />
              </li>
            );
          })}
        </ul>
      </>
    );
  }

  return (
    <div ref={rootRef} className={PANEL_CLASSES}>
      {content}
    </div>
  );
}
