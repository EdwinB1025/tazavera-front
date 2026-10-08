import type { CoffeeshopLocation, Contact } from "@/shared/api";
import { isLocated } from "@/entities/coffeeshop";

// ─── UI-specific types (design.md D2) ───

export type LocationCardData = {
  name: string;
  description: string | null;
  contact: Contact | null;
  located: boolean;
};

const CONTACT_KEYS = ["address", "postalCode", "city", "country", "phone", "web", "social"] as const;

/**
 * A flat directory location as the location card's data
 * (add-coffeeshop-directory design.md D11): the contact values the location
 * carries — no email — or `null` when it carries none, and whether it has
 * both coordinates.
 */
export function toLocationCardData(location: CoffeeshopLocation): LocationCardData {
  const contact: Contact = {};
  for (const key of CONTACT_KEYS) {
    const value = location[key];
    if (value != null) contact[key] = value;
  }
  return {
    name: location.name ?? "",
    description: location.description ?? null,
    contact: Object.keys(contact).length > 0 ? contact : null,
    located: isLocated(location),
  };
}
