import type { ReactNode } from "react";
import { getMessages } from "@/shared/lib/i18n";
import { PageSection } from "@/shared/ui";
import {
  RegisterLandingClient,
  type RegisterLandingTexts,
} from "./RegisterLandingClient";

// ─── UI-specific types (declared before the component) ───

export type RegisterLandingScreenProps = {
  locale: string;
};

/**
 * Registration landing screen (design.md D1 and D3; spec "Registration
 * landing"). A server composition: it loads the `account` catalog of the
 * route's locale, renders the heading block and the client region, which
 * receives every text as props.
 */
export function RegisterLandingScreen({
  locale,
}: RegisterLandingScreenProps): ReactNode {
  const catalog = getMessages("account", locale);

  const texts: RegisterLandingTexts = {
    loading: catalog.loading,
    specialistTitle: catalog.registerLandingSpecialistTitle,
    specialistText: catalog.registerLandingSpecialistText,
    specialistAction: catalog.registerLandingSpecialistAction,
    coffeeshopTitle: catalog.registerLandingCoffeeshopTitle,
    coffeeshopText: catalog.registerLandingCoffeeshopText,
    coffeeshopAction: catalog.registerLandingCoffeeshopAction,
  };

  return (
    <div className="flex-1">
      <PageSection surface="page" containerClassName="flex flex-col">
        <div className="flex w-full flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h1 className="type-heading">{catalog.registerLandingTitle}</h1>
            <p className="type-body">{catalog.registerLandingIntro}</p>
          </div>
          <RegisterLandingClient locale={locale} texts={texts} />
        </div>
      </PageSection>
    </div>
  );
}
