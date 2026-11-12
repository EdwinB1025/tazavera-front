import type { LocationFormTexts } from "@/features/location-management";
import { getMessages } from "@/shared/lib/i18n";

/**
 * The new-location form's texts for a locale (require-first-location-on-
 * registration D5), shared by Manage locations and the first location step:
 * the form keys of the `location-management` catalog and the contact labels
 * of the `contact` catalog. Server-side only (reads the catalogs from disk).
 */
export function locationFormTexts(locale: string): LocationFormTexts {
  const catalog = getMessages("location-management", locale);
  const contactCatalog = getMessages("contact", locale);

  return {
    newLocationHeading: catalog.newLocationHeading,
    locationGroupLegend: catalog.locationGroupLegend,
    contactGroupLegend: catalog.contactGroupLegend,
    locationNameLabel: catalog.locationNameLabel,
    locationDescriptionLabel: catalog.locationDescriptionLabel,
    geocodingHelp: catalog.geocodingHelp,
    geocodingAttribution: catalog.geocodingAttribution,
    osmContributors: catalog.osmContributors,
    save: catalog.save,
    cancel: catalog.cancel,
    genericError: catalog.genericError,
    requiredError: catalog.requiredError,
    emailFormatError: catalog.emailFormatError,
    contactAddressLabel: contactCatalog.contactAddressLabel,
    contactPostalCodeLabel: contactCatalog.contactPostalCodeLabel,
    contactCityLabel: contactCatalog.contactCityLabel,
    contactCountryLabel: contactCatalog.contactCountryLabel,
    contactPhoneLabel: contactCatalog.contactPhoneLabel,
    contactEmailLabel: contactCatalog.contactEmailLabel,
    contactWebLabel: contactCatalog.contactWebLabel,
    contactSocialLabel: contactCatalog.contactSocialLabel,
  };
}
