import type { ReactNode } from "react";
import type { CoffeeshopLocation } from "@/shared/api";
import { ContactDetails } from "@/entities/contact";
import { LocationCard } from "@/entities/location";
import { toLocationCardData } from "../lib/location-card-data";
import type { CoffeeshopDetailTexts } from "./texts";

export type LocationsPanelProps = {
  locations: CoffeeshopLocation[];
  texts: CoffeeshopDetailTexts;
};

// One location card per row, 1.5rem apart, filling the container.
const LIST_CLASSES = ["grid", "grid-cols-1", "gap-6"].join(" ");

/**
 * The Locations tab (add-coffeeshop-directory design.md D11; spec "Coffee
 * shop Locations tab"): one location card per location, with its contact rows
 * and the not-on-the-map line when it lacks a coordinate.
 */
export function LocationsPanel({ locations, texts }: LocationsPanelProps): ReactNode {
  return (
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
  );
}
