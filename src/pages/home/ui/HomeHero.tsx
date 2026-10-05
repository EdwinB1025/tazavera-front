import type { ReactNode } from "react";
import Image from "next/image";
import { Link } from "@/shared/ui";
import { ExploreButton } from "./ExploreButton";

// ─── UI-specific types (declared before the component) ───

/** Every hero text, as props (design.md D11). */
export type HomeHeroTexts = {
  eyebrow: string;
  headingBefore: string;
  headingAccent: string;
  headingAfter: string;
  paragraph: string;
  exploreLabel: string;
  coffeeshopRegisterLabel: string;
  specialistRegisterLabel: string;
  photoAlt: string;
};

export type HomeHeroProps = {
  locale: string;
  texts: HomeHeroTexts;
};

// ─── Settled pieces (no interface text; design.md D11, D12) ───
const PHOTO_SRC = "/images/coffee-beans.png";
// The photograph's intrinsic size in pixels (design.md D12), the dimensions
// of `public/images/coffee-beans.png`.
const PHOTO_WIDTH = 500;
const PHOTO_HEIGHT = 500;

/** The one emphasized heading run (spec: "Settled Spanish heading"). */
const ACCENT_CLASSES = "text-text-accent";

/**
 * Hero of the entry page (design.md D10, D11, D12; the landing spec "Entry
 * page hero"). The heading renders as three parts so exactly one word takes
 * the accent color (spec "Hero presentation", "Settled Spanish heading"), the
 * two registration links address the registration routes of the active
 * locale (spec "Registration destinations"), and the photograph is hidden
 * below `md` and renders beside the text from `md` up (spec "Responsive
 * hero"). Every text arrives as a prop (design.md D11).
 */
export function HomeHero({ locale, texts }: HomeHeroProps): ReactNode {
  return (
    <section className="md:flex md:items-center md:gap-8">
      <div>
        <p className="type-eyebrow-strong">{texts.eyebrow}</p>
        <h1 className="type-heading">
          {texts.headingBefore}
          <span className={ACCENT_CLASSES}>{texts.headingAccent}</span>
          {texts.headingAfter}
        </h1>
        <p className="type-body">{texts.paragraph}</p>
        <ExploreButton label={texts.exploreLabel} />
        <nav>
          <Link href={`/${locale}/register/coffeeshop`}>
            {texts.coffeeshopRegisterLabel}
          </Link>
          <Link href={`/${locale}/register`}>
            {texts.specialistRegisterLabel}
          </Link>
        </nav>
      </div>
      <Image
        src={PHOTO_SRC}
        width={PHOTO_WIDTH}
        height={PHOTO_HEIGHT}
        alt={texts.photoAlt}
        className="hidden md:block"
      />
    </section>
  );
}
