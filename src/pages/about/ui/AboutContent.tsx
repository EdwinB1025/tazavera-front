import type { ReactNode } from "react";
import { Card, CardContent, Link } from "@/shared/ui";
import { ExploreButton } from "./ExploreButton";

// ─── UI-specific types (declared before the component) ───

/** Every about text, as props (design.md D11). */
export type AboutContentTexts = {
  eyebrow: string;
  headingBefore: string;
  headingAccent: string;
  headingAfter: string;
  storyText: string;
  stepProvisional: string;
  stepCupping: string;
  stepConsensus: string;
  audienceText: string;
  coffeeshopRegisterLabel: string;
  specialistRegisterLabel: string;
  closingLabel: string;
};

export type AboutContentProps = {
  locale: string;
  texts: AboutContentTexts;
};

// ─── Settled pieces (no interface text; design.md D10, D11) ───

/** The one emphasized heading run (the landing spec "About us page"). */
const ACCENT_CLASSES = "text-text-accent";

// The five sections of the design summary §5 alternate the page and section
// surfaces, starting at `bg-surface-page` (spec "Sections and order").
const SECTION_BACKGROUNDS = [
  "bg-surface-page",
  "bg-surface-section",
  "bg-surface-page",
  "bg-surface-section",
  "bg-surface-page",
] as const;

/**
 * Content of the About us page (design.md D10, D11; the landing spec "About
 * us page"). The five sections render in the design summary §5 order with the
 * alternating backgrounds above (spec "Sections and order"), the evaluation
 * steps fill three shared cards (spec "How we evaluate"), the two registration
 * links address the registration routes of the active locale (spec
 * "Registration links"), and the closing action opens the entry page of that
 * locale (spec "Closing action"). Every text arrives as a prop (design.md
 * D11).
 */
export function AboutContent({ locale, texts }: AboutContentProps): ReactNode {
  return (
    <div>
      <section className={SECTION_BACKGROUNDS[0]}>
        <p className="type-eyebrow-strong">{texts.eyebrow}</p>
        <h1 className="type-heading">
          {texts.headingBefore}
          <span className={ACCENT_CLASSES}>{texts.headingAccent}</span>
          {texts.headingAfter}
        </h1>
      </section>

      <section className={SECTION_BACKGROUNDS[1]}>
        <p className="type-body">{texts.storyText}</p>
      </section>

      <section className={SECTION_BACKGROUNDS[2]}>
        <div className="flex flex-col gap-6 md:flex-row">
          <Card>
            <CardContent>
              <p className="type-body">{texts.stepProvisional}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <p className="type-body">{texts.stepCupping}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <p className="type-body">{texts.stepConsensus}</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className={SECTION_BACKGROUNDS[3]}>
        <p className="type-body">{texts.audienceText}</p>
        <nav>
          <Link href={`/${locale}/register/coffeeshop`}>
            {texts.coffeeshopRegisterLabel}
          </Link>
          <Link href={`/${locale}/register`}>
            {texts.specialistRegisterLabel}
          </Link>
        </nav>
      </section>

      <section className={SECTION_BACKGROUNDS[4]}>
        <ExploreButton locale={locale} label={texts.closingLabel} />
      </section>
    </div>
  );
}
