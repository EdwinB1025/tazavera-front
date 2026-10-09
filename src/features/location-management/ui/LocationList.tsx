import type { ReactNode } from "react";
import type { UserLocation } from "@/shared/api";
import { ContactDetails, type ContactTexts } from "@/entities/contact";
import { LocationCard } from "@/entities/location";

// ─── UI-specific types (declared before the component) ───

export type LocationListProps = {
  locations: UserLocation[];
  /** The page `h1`'s id: it names the list. */
  headingId: string;
  texts: ContactTexts & { locationNoMap: string };
};

// One column of cards 1.5rem apart.
const LIST_CLASSES = ["flex", "flex-col", "gap-6"].join(" ");

function hasNoMap(location: UserLocation): boolean {
  return location.latitud == null || location.longitud == null;
}

/** The location cards with their primary contact (spec "Own locations list"). */
export function LocationList({ locations, headingId, texts }: LocationListProps): ReactNode {
  return (
    <ul aria-labelledby={headingId} className={LIST_CLASSES}>
      {locations.map((location) => {
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
  );
}
