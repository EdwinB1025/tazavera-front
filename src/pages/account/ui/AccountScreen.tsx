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
 * session gate"). A server composition: it loads the `account` catalog of the
 * route's locale, renders the heading block and the client sections region,
 * which receives every text as props.
 */
export function AccountScreen({ locale }: AccountScreenProps): ReactNode {
  const catalog = getMessages("account", locale);

  const texts: AccountClientTexts = {
    loading: catalog.loading,
    signedOutText: catalog.signedOutText,
    signIn: catalog.signIn,
    profileHeading: catalog.profileHeading,
    passwordHeading: catalog.passwordHeading,
    securityHeading: catalog.securityHeading,
    securityDescription: catalog.securityDescription,
    securityLink: catalog.securityLink,
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
  };

  return (
    <div className="flex-1">
      <PageSection surface="page" containerClassName="flex flex-col">
        <div className="flex w-full max-w-lg flex-col gap-8">
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
