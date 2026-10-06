import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  Link,
  PageSection,
  type PageSectionSurface,
} from "@/shared/ui";
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
// surfaces, starting at the page surface (spec "Sections and order").
const SECTION_BACKGROUNDS: readonly PageSectionSurface[] = [
  "page",
  "section",
  "page",
  "section",
  "page",
];

// ─── Page layout (design.md D14) ───
// Stacked blocks of one section, 1rem apart.
const STACK_CLASSES = ["flex", "flex-col", "gap-4"].join(" ");
// The three evaluation cards share the container width equally from `md`.
const STEPS_CLASSES = ["grid", "gap-6", "md:grid-cols-3"].join(" ");
// The registration links stay apart and wrap when the row has no room.
const LINK_GROUP_CLASSES = ["flex", "flex-wrap", "gap-x-6", "gap-y-2"].join(
  " ",
);

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
      <PageSection
        surface={SECTION_BACKGROUNDS[0]}
        containerClassName={STACK_CLASSES}
      >
        <p className="type-eyebrow-strong">{texts.eyebrow}</p>
        <h1 className="type-heading">
          {texts.headingBefore}
          <span className={ACCENT_CLASSES}>{texts.headingAccent}</span>
          {texts.headingAfter}
        </h1>
      </PageSection>

      <PageSection surface={SECTION_BACKGROUNDS[1]}>
        <p className="type-body">{texts.storyText}</p>
      </PageSection>

      <PageSection
        surface={SECTION_BACKGROUNDS[2]}
        containerClassName={STEPS_CLASSES}
      >
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
      </PageSection>

      <PageSection
        surface={SECTION_BACKGROUNDS[3]}
        containerClassName={STACK_CLASSES}
      >
        <p className="type-body">{texts.audienceText}</p>
        <nav className={LINK_GROUP_CLASSES}>
          <Link href={`/${locale}/register/coffeeshop`}>
            {texts.coffeeshopRegisterLabel}
          </Link>
          <Link href={`/${locale}/register`}>
            {texts.specialistRegisterLabel}
          </Link>
        </nav>
      </PageSection>

      <PageSection surface={SECTION_BACKGROUNDS[4]}>
        <ExploreButton locale={locale} label={texts.closingLabel} />
      </PageSection>
    </div>
  );
}
