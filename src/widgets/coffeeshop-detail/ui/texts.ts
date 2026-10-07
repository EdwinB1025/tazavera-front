import type { MessageCatalog } from "@/shared/lib/i18n";
import type { ContactTexts } from "@/entities/contact";

/** Every text of the detail (add-coffeeshop-directory design.md D8, D11). */
export type CoffeeshopDetailTexts = ContactTexts & {
  backToDirectory: string;
  detailError: string;
  retryLabel: string;
  verifiedBadge: string;
  locationsCount: string;
  offeringsCount: string;
  verifiedCount: string;
  tabOfferings: string;
  tabLocations: string;
  locationNoMap: string;
};

/** The detail texts from the `coffeeshops`, `contact` and `landing` catalogs of one locale. */
export function coffeeshopDetailTexts(
  coffeeshops: MessageCatalog,
  contact: MessageCatalog,
  landing: MessageCatalog,
): CoffeeshopDetailTexts {
  return {
    contactAddressLabel: contact.contactAddressLabel,
    contactPostalCodeLabel: contact.contactPostalCodeLabel,
    contactCityLabel: contact.contactCityLabel,
    contactCountryLabel: contact.contactCountryLabel,
    contactPhoneLabel: contact.contactPhoneLabel,
    contactEmailLabel: contact.contactEmailLabel,
    contactWebLabel: contact.contactWebLabel,
    contactSocialLabel: contact.contactSocialLabel,
    backToDirectory: coffeeshops.backToDirectory,
    detailError: coffeeshops.detailError,
    retryLabel: landing.listRetryLabel,
    verifiedBadge: coffeeshops.verifiedBadge,
    locationsCount: coffeeshops.locationsCount,
    offeringsCount: coffeeshops.offeringsCount,
    verifiedCount: coffeeshops.verifiedCount,
    tabOfferings: coffeeshops.tabOfferings,
    tabLocations: coffeeshops.tabLocations,
    locationNoMap: coffeeshops.locationNoMap,
  };
}
