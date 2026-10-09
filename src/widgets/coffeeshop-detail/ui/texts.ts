import type { MessageCatalog } from "@/shared/lib/i18n";
import type { ContactTexts } from "@/entities/contact";

/** Every text of the detail (add-coffeeshop-directory design.md D8, D11). */
export type CoffeeshopDetailTexts = ContactTexts & {
  backToDirectory: string;
  detailError: string;
  notFoundTitle: string;
  notFoundLine: string;
  retryLabel: string;
  verifiedBadge: string;
  locationsCount: string;
  offeringsCount: string;
  verifiedCount: string;
  tabOfferings: string;
  tabLocations: string;
  locationNoMap: string;
  mapLabel: string;
  mapHelp: string;
  mapEmpty: string;
  unlocatedCount: string;
  zoomIn: string;
  zoomOut: string;
  closePanel: string;
  osmAttribution: string;
  osmContributors: string;
  mapLoading: string;
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
    notFoundTitle: coffeeshops.detailNotFoundTitle,
    notFoundLine: coffeeshops.detailNotFoundLine,
    retryLabel: landing.listRetryLabel,
    verifiedBadge: coffeeshops.verifiedBadge,
    locationsCount: coffeeshops.locationsCount,
    offeringsCount: coffeeshops.offeringsCount,
    verifiedCount: coffeeshops.verifiedCount,
    tabOfferings: coffeeshops.tabOfferings,
    tabLocations: coffeeshops.tabLocations,
    locationNoMap: coffeeshops.locationNoMap,
    mapLabel: coffeeshops.mapLabel,
    mapHelp: coffeeshops.mapHelp,
    mapEmpty: coffeeshops.mapEmpty,
    unlocatedCount: coffeeshops.unlocatedCount,
    zoomIn: coffeeshops.zoomIn,
    zoomOut: coffeeshops.zoomOut,
    closePanel: coffeeshops.closePanel,
    osmAttribution: coffeeshops.osmAttribution,
    osmContributors: coffeeshops.osmContributors,
    mapLoading: coffeeshops.mapLoading,
  };
}
