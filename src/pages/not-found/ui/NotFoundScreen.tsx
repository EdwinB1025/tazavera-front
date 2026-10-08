import type { ReactNode } from "react";
import { DEFAULT_LOCALE, isSupportedLocale } from "@/shared/config/locales";
import { getMessages } from "@/shared/lib/i18n";
import { Card, CardAside, CardContent, Link, PageSection } from "@/shared/ui";

// ─── UI-specific types (declared before the component) ───

export type NotFoundScreenProps = {
  locale: string;
};

/**
 * Not-found screen (design.md D1–D5; spec "Not-found page"). A server
 * composition of shared pieces: the `shell` catalog of the locale gives the
 * heading, the text and the link back to the root of the locale. An
 * unsupported locale resolves to DEFAULT_LOCALE, as in the shell.
 */
export function NotFoundScreen({ locale }: NotFoundScreenProps): ReactNode {
  const activeLocale = isSupportedLocale(locale) ? locale : DEFAULT_LOCALE;
  const catalog = getMessages("shell", activeLocale);

  return (
    <div className="flex-1">
      <PageSection surface="page" containerClassName="flex flex-col">
        <div className="w-full">
          <Card variant="section">
            <CardAside>
              <h1 className="type-subheading">{catalog.notFoundTitle}</h1>
            </CardAside>
            <CardContent>
              <div className="flex flex-col items-start gap-4">
                <p className="type-body">{catalog.notFoundText}</p>
                <Link variant="back" href={`/${activeLocale}`}>
                  {catalog.notFoundHomeLink}
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageSection>
    </div>
  );
}
