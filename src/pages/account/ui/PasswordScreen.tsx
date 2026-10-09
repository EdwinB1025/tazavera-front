import type { ReactNode } from "react";
import { getMessages } from "@/shared/lib/i18n";
import { BackLink, PageSection } from "@/shared/ui";
import { PasswordClient, type PasswordClientTexts } from "./PasswordClient";

// ─── UI-specific types (declared before the component) ───

export type PasswordScreenProps = {
  locale: string;
};

/**
 * The Change password view (design.md D4; spec "Change password view"): a
 * server composition with the account page's shell, a back link to the
 * account page, the heading block and the client region, which receives
 * every text as props.
 */
export function PasswordScreen({ locale }: PasswordScreenProps): ReactNode {
  const catalog = getMessages("account", locale);

  const texts: PasswordClientTexts = {
    loading: catalog.loading,
    signedOutText: catalog.signedOutText,
    signIn: catalog.signIn,
    changePassword: catalog.changePassword,
    currentPasswordLabel: catalog.currentPasswordLabel,
    newPasswordLabel: catalog.newPasswordLabel,
    passwordConfirmationLabel: catalog.passwordConfirmationLabel,
    passwordHelp: catalog.passwordHelp,
    showPassword: catalog.showPassword,
    hidePassword: catalog.hidePassword,
    requiredError: catalog.requiredError,
    passwordMismatchError: catalog.passwordMismatchError,
    forgotPasswordLink: catalog.forgotPasswordLink,
    save: catalog.save,
    passwordUpdated: catalog.passwordUpdated,
    genericError: catalog.genericError,
    stepUpText: catalog.stepUpText,
    stepUpButton: catalog.stepUpButton,
  };

  return (
    <div className="flex-1">
      <PageSection surface="page" containerClassName="flex flex-col">
        <div className="flex w-full flex-col gap-8">
          <div className="flex flex-col items-start gap-4">
            <BackLink fallback={`/${locale}/account`}>{catalog.backToAccount}</BackLink>
            <h1 className="type-heading">{catalog.passwordHeading}</h1>
          </div>
          <PasswordClient locale={locale} texts={texts} />
        </div>
      </PageSection>
    </div>
  );
}
