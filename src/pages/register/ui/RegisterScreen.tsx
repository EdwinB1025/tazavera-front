import type { ReactNode } from "react";
import type { RegisterRole } from "@/features/user-account";
import { getMessages } from "@/shared/lib/i18n";
import { PageSection } from "@/shared/ui";
import { RegisterClient, type RegisterClientTexts } from "./RegisterClient";

// ─── UI-specific types (declared before the component) ───

export type RegisterScreenProps = {
  locale: string;
  role: RegisterRole;
};

/** The page heading's id: it names the registration form (design.md D9). */
const TITLE_ID = "register-title";

/**
 * Registration screen (design.md D1, D3 and D10; spec "Registration routes").
 * A server composition: it loads the `account` catalog of the route's locale,
 * renders the heading block for the route's role and the client region, which
 * receives every text as props.
 */
export function RegisterScreen({ locale, role }: RegisterScreenProps): ReactNode {
  const catalog = getMessages("account", locale);

  const texts: RegisterClientTexts = {
    nameLabel: catalog.nameLabel,
    surnameLabel: catalog.surnameLabel,
    emailLabel: catalog.emailLabel,
    passwordLabel: catalog.passwordLabel,
    passwordConfirmationLabel: catalog.passwordConfirmationLabel,
    passwordHelp: catalog.passwordHelp,
    showPassword: catalog.showPassword,
    hidePassword: catalog.hidePassword,
    requiredError: catalog.requiredError,
    emailFormatError: catalog.emailFormatError,
    passwordMismatchError: catalog.passwordMismatchError,
    registerSubmit: catalog.registerSubmit,
    genericError: catalog.genericError,
    registerSuccessTitle: catalog.registerSuccessTitle,
    registerSuccessText: catalog.registerSuccessText,
    signIn: catalog.signIn,
    loading: catalog.loading,
  };

  const title =
    role === "coffeeshop"
      ? catalog.registerCoffeeshopTitle
      : catalog.registerSpecialistTitle;

  return (
    <div className="flex-1">
      <PageSection surface="page" containerClassName="flex flex-col">
        <div className="mx-auto flex w-full max-w-lg flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h1 id={TITLE_ID} className="type-heading">
              {title}
            </h1>
            <p className="type-body">{catalog.registerIntro}</p>
          </div>
          <RegisterClient
            locale={locale}
            role={role}
            labelledBy={TITLE_ID}
            texts={texts}
          />
        </div>
      </PageSection>
    </div>
  );
}
