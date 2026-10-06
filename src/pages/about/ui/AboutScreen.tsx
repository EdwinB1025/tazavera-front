import type { ReactNode } from "react";
import { getMessages } from "@/shared/lib/i18n";
import { AboutContent } from "./AboutContent";
import type { AboutContentTexts } from "./AboutContent";

// ─── UI-specific types (declared before the component) ───

export type AboutScreenProps = {
  locale: string;
};

/**
 * About screen (design.md D10, D13; the landing spec "About us page" and
 * "Localized page texts"). Thin (design.md D10): it loads the `landing`
 * catalog for the route's locale through the area reader of `add-app-shell`
 * (design.md D11) and renders `AboutContent` with every text as a prop.
 */
export async function AboutScreen({
  locale,
}: AboutScreenProps): Promise<ReactNode> {
  const catalog = getMessages("landing", locale);

  const texts: AboutContentTexts = {
    eyebrow: catalog.aboutEyebrow,
    headingBefore: catalog.aboutHeadingBefore,
    headingAccent: catalog.aboutHeadingAccent,
    headingAfter: catalog.aboutHeadingAfter,
    storyText: catalog.aboutStoryText,
    stepProvisional: catalog.aboutStepProvisional,
    stepCupping: catalog.aboutStepCupping,
    stepConsensus: catalog.aboutStepConsensus,
    audienceText: catalog.aboutAudienceText,
    coffeeshopRegisterLabel: catalog.aboutCoffeeshopRegisterLabel,
    specialistRegisterLabel: catalog.aboutSpecialistRegisterLabel,
    closingLabel: catalog.aboutClosingLabel,
  };

  return <AboutContent locale={locale} texts={texts} />;
}
