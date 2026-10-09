import type { ReactNode } from "react";
import { getMessages } from "@/shared/lib/i18n";
import { PageSection } from "@/shared/ui";
import { AccountClient, type AccountClientTexts } from "./AccountClient";

// ─── UI-specific types (declared before the component) ───

export type AccountScreenProps = {
  locale: string;
};

/**
 * Account screen (design.md D1, D3 and D10; spec "Account page and its
 * session gate"). A server composition: it loads the `account` and `contact`
 * catalogs of the route's locale, renders the heading block and the client
 * sections region, which receives every text as props.
 */
export function AccountScreen({ locale }: AccountScreenProps): ReactNode {
  const catalog = getMessages("account", locale);
  const contactCatalog = getMessages("contact", locale);

  const texts: AccountClientTexts = {
    loading: catalog.loading,
    signedOutText: catalog.signedOutText,
    signIn: catalog.signIn,
    profileHeading: catalog.profileHeading,
    editProfileHeading: catalog.editProfileHeading,
    profileDescription: catalog.profileDescription,
    roleLabel: catalog.roleLabel,
    nameLabel: catalog.nameLabel,
    surnameLabel: catalog.surnameLabel,
    emailLabel: catalog.emailLabel,
    emailVerificationLabel: catalog.emailVerificationLabel,
    emailVerified: catalog.emailVerified,
    emailNotVerified: catalog.emailNotVerified,
    emailFormatError: catalog.emailFormatError,
    save: catalog.save,
    profileUpdated: catalog.profileUpdated,
    requiredError: catalog.requiredError,
    securityHeading: catalog.securityHeading,
    securityDescription: catalog.securityDescription,
    changePassword: catalog.changePassword,
    twoFactor: catalog.twoFactor,
    passkeys: catalog.passkeys,
    verifyEmail: catalog.verifyEmail,
    emailVerifiedStatus: catalog.emailVerifiedStatus,
    done: catalog.done,
    dangerZoneHeading: catalog.dangerZoneHeading,
    deactivateHeading: catalog.deactivateHeading,
    deactivateText: catalog.deactivateText,
    deleteHeading: catalog.deleteHeading,
    deleteText: catalog.deleteText,
    deactivateConfirmTitle: catalog.deactivateConfirmTitle,
    deleteConfirmTitle: catalog.deleteConfirmTitle,
    confirmDeactivate: catalog.confirmDeactivate,
    confirmDelete: catalog.confirmDelete,
    cancel: catalog.cancel,
    genericError: catalog.genericError,
    stepUpText: catalog.stepUpText,
    stepUpButton: catalog.stepUpButton,
    stepUpOtherAccount: catalog.stepUpOtherAccount,
    contactHeading: catalog.contactHeading,
    contactDescription: catalog.contactDescription,
    contactEmptyText: catalog.contactEmptyText,
    contactAddButton: catalog.contactAddButton,
    contactLoadError: catalog.contactLoadError,
    retry: catalog.retry,
    contactSaved: catalog.contactSaved,
    contactExists: catalog.contactExists,
    urlFormatError: catalog.urlFormatError,
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
      <PageSection surface="page" containerClassName="flex flex-col">
        <div className="flex w-full flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h1 className="type-heading">{catalog.accountTitle}</h1>
            <p className="type-body">{catalog.accountIntro}</p>
          </div>
          <AccountClient locale={locale} texts={texts} />
        </div>
      </PageSection>
    </div>
  );
}
