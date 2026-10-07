import type { ReactNode } from "react";
import { getMessages } from "@/shared/lib/i18n";
import { PageSection } from "@/shared/ui";
import {
  ManageLocationsClient,
  type ManageLocationsClientTexts,
} from "./ManageLocationsClient";

// ─── UI-specific types (declared before the component) ───

export type ManageLocationsScreenProps = {
  locale: string;
};

/** The page heading's id: it names the list and takes focus after a creation (design.md D3). */
const HEADING_ID = "manage-locations-heading";

/**
 * The locations screen (design.md D2, D11; spec "Access to the locations
 * page"). A server composition: it loads the `location-management` and
 * `contact` catalogs of the route's locale, renders the heading block and the
 * client region, which receives every text as props.
 */
export function ManageLocationsScreen({ locale }: ManageLocationsScreenProps): ReactNode {
  const catalog = getMessages("location-management", locale);
  const contactCatalog = getMessages("contact", locale);

  const texts: ManageLocationsClientTexts = {
    loading: catalog.loading,
    signedOutText: catalog.signedOutText,
    signIn: catalog.signIn,
    locationsLoadError: catalog.locationsLoadError,
    retry: catalog.retry,
    locationsEmptyText: catalog.locationsEmptyText,
    addLocation: catalog.addLocation,
    locationCreated: catalog.locationCreated,
    locationCreatedNoMap: catalog.locationCreatedNoMap,
    locationNoMap: catalog.locationNoMap,
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
    stepUpText: catalog.stepUpText,
    stepUpButton: catalog.stepUpButton,
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

  return (
    <div className="flex-1">
      <PageSection surface="page">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h1 id={HEADING_ID} tabIndex={-1} className="type-heading">
              {catalog.pageTitle}
            </h1>
            <p className="type-body">{catalog.pageIntro}</p>
          </div>
          <ManageLocationsClient locale={locale} headingId={HEADING_ID} texts={texts} />
        </div>
      </PageSection>
    </div>
  );
}
