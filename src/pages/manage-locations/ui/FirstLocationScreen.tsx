import type { ReactNode } from "react";
import { getMessages } from "@/shared/lib/i18n";
import { PageSection } from "@/shared/ui";
import { locationFormTexts } from "../lib/location-form-texts";
import { FirstLocationClient, type FirstLocationClientTexts } from "./FirstLocationClient";

// ─── UI-specific types (declared before the component) ───

export type FirstLocationScreenProps = {
  locale: string;
};

/** The page heading's id: it takes focus when the step opens (design.md D6). */
const HEADING_ID = "first-location-heading";

/**
 * The first location step (require-first-location-on-registration D3, D5;
 * offering-management "First location step"). A server composition, as
 * `ManageLocationsScreen`: it loads the catalogs of the route's locale,
 * renders the heading block and the client region, with "Later" as the
 * form's secondary label.
 */
export function FirstLocationScreen({ locale }: FirstLocationScreenProps): ReactNode {
  const catalog = getMessages("location-management", locale);

  const texts: FirstLocationClientTexts = {
    ...locationFormTexts(locale),
    cancel: catalog.firstLocationLater,
    loading: catalog.loading,
    signedOutText: catalog.signedOutText,
    signIn: catalog.signIn,
  };

  return (
    <div className="flex-1">
      <PageSection surface="page">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h1 id={HEADING_ID} tabIndex={-1} className="type-heading">
              {catalog.firstLocationTitle}
            </h1>
            <p className="type-body">{catalog.firstLocationIntro}</p>
          </div>
          <FirstLocationClient locale={locale} headingId={HEADING_ID} texts={texts} />
        </div>
      </PageSection>
    </div>
  );
}
