import type { ReactNode } from "react";
import type { CoffeeshopLocation } from "@/shared/api";
import { ContactDetails } from "@/entities/contact";
import { LocationCard } from "@/entities/location";
import { countUnlocated, toMapPoints } from "@/entities/coffeeshop";
import { LocationsMapLoader } from "@/shared/ui";
import { toLocationCardData } from "../lib/location-card-data";
import type { CoffeeshopDetailTexts } from "./texts";

export type LocationsPanelProps = {
  /** The coffee shop, for the map's labels. */
  ulid: string;
  name: string;
  locations: CoffeeshopLocation[];
  texts: CoffeeshopDetailTexts;
};

// One location card per row, 1.5rem apart, filling the container.
const LIST_CLASSES = ["grid", "grid-cols-1", "gap-6"].join(" ");
// The map block, then the cards 2rem below it.
const PANEL_CLASSES = ["flex", "flex-col", "gap-8"].join(" ");
const MAP_BLOCK_CLASSES = ["flex", "flex-col", "gap-2"].join(" ");
const MAP_CLASSES = "h-80 border border-border-subtle rounded-container overflow-hidden";
const HELP_ID = "coffeeshop-locations-map-help";

/**
 * The Locations tab (add-coffeeshop-directory design.md D11, D14; spec
 * "Coffee shop Locations tab"): the help line, the map of the located
 * locations (no panel link) and the unlocated count, then one location card
 * per location, with its contact rows and the not-on-the-map line when it
 * lacks a coordinate.
 */
export function LocationsPanel({ ulid, name, locations, texts }: LocationsPanelProps): ReactNode {
  const coffeeshop = { ulid, name, locations };
  const points = toMapPoints([coffeeshop]);
  const unlocated = countUnlocated([coffeeshop]);
  return (
    <div className={PANEL_CLASSES}>
      <div className={MAP_BLOCK_CLASSES}>
        <p id={HELP_ID} className="type-body">
          {texts.mapHelp}
        </p>
        {points.length === 0 ? (
          <p className="type-body">{texts.mapEmpty}</p>
        ) : (
          <LocationsMapLoader
            points={points}
            helpId={HELP_ID}
            className={MAP_CLASSES}
            texts={{
              mapLabel: texts.mapLabel,
              zoomIn: texts.zoomIn,
              zoomOut: texts.zoomOut,
              closePanel: texts.closePanel,
              osmAttribution: texts.osmAttribution,
              osmContributors: texts.osmContributors,
              mapLoading: texts.mapLoading,
            }}
          />
        )}
        {unlocated > 0 ? (
          <p className="type-meta">{texts.unlocatedCount.replace("{count}", String(unlocated))}</p>
        ) : null}
      </div>
      <ul className={LIST_CLASSES}>
        {locations.map((location, index) => {
          const data = toLocationCardData(location);
          return (
            <li key={location.ulid ?? index}>
              <LocationCard
                name={data.name}
                description={data.description}
                details={data.contact ? <ContactDetails contact={data.contact} texts={texts} /> : undefined}
                noMapText={data.located ? undefined : texts.locationNoMap}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
