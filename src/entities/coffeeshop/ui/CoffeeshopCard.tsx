import type { ReactNode } from "react";
import type { CoffeeshopSummary } from "@/shared/api";
import { Badge, Card, CardContent, CardFooter, Link } from "@/shared/ui";
import { uniqueCities } from "../model/locations";

// ─── UI-specific types (declared before the component) ───

/** Every label of the card, as props; `{count}` is replaced by the number. */
export type CoffeeshopCardTexts = {
  verifiedBadge: string;
  locationsCount: string;
  offeringsCount: string;
  verifiedCount: string;
  viewLabel: string;
};

export type CoffeeshopCardProps = {
  coffeeshop: CoffeeshopSummary;
  locale: string;
  texts: CoffeeshopCardTexts;
  /** Rendered after the View link, e.g. the map action (design.md D7). */
  actions?: ReactNode;
};

const CITY_SEPARATOR = " · ";
const CONTENT_CLASSES = ["flex", "flex-col", "gap-2"].join(" ");
const FOOTER_CLASSES = ["flex", "flex-wrap", "items-center", "gap-4"].join(" ");
const FOOTER_COUNTS_CLASSES = ["flex", "flex-wrap", "gap-4"].join(" ");
const FOOTER_LINKS_CLASSES = ["ml-auto", "flex", "flex-wrap", "items-center", "gap-4"].join(" ");

function withCount(text: string, count: number | undefined): string {
  return text.replace("{count}", String(count ?? 0));
}

/**
 * One coffee shop of the directory in the shared stacked card
 * (add-coffeeshop-directory design.md D7; spec "Coffee shop card"): the
 * verified badge when it has a verified offering, the name, the locations
 * count, its cities once each, the offering counts and the View link.
 */
export function CoffeeshopCard({ coffeeshop, locale, texts, actions }: CoffeeshopCardProps): ReactNode {
  const cities = uniqueCities(coffeeshop.locations ?? []).join(CITY_SEPARATOR);
  return (
    <Card layout="stacked">
      <CardContent className={CONTENT_CLASSES}>
        {(coffeeshop.verifiedOfferingsCount ?? 0) > 0 ? (
          <Badge variant="verified">{texts.verifiedBadge}</Badge>
        ) : null}
        <h3 className="type-card-heading">{coffeeshop.name}</h3>
        <p className="type-label">{withCount(texts.locationsCount, coffeeshop.locationsCount)}</p>
        {cities ? <p className="type-meta">{cities}</p> : null}
      </CardContent>
      <CardFooter className={FOOTER_CLASSES}>
        <div className={FOOTER_COUNTS_CLASSES}>
          <span className="type-meta">{withCount(texts.offeringsCount, coffeeshop.offeringsCount)}</span>
          <span className="type-meta">
            {withCount(texts.verifiedCount, coffeeshop.verifiedOfferingsCount)}
          </span>
        </div>
        <div className={FOOTER_LINKS_CLASSES}>
          <Link href={`/${locale}/coffeeshops/${coffeeshop.ulid ?? ""}`}>{texts.viewLabel}</Link>
          {actions}
        </div>
      </CardFooter>
    </Card>
  );
}
