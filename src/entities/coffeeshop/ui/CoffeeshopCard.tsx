import type { ReactNode } from "react";
import type { CoffeeshopSummary } from "@/shared/api";
import { ActionGroup, Badge, Card, CardContent, CardFooter, RouteButton } from "@/shared/ui";
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
  /** Rendered after the View action, e.g. the map action (design.md D7). */
  actions?: ReactNode;
};

const CITY_SEPARATOR = " · ";
const CONTENT_CLASSES = ["flex", "flex-col", "gap-2"].join(" ");
const FOOTER_CLASSES = ["flex", "flex-wrap", "items-center", "gap-4"].join(" ");
const FOOTER_COUNTS_CLASSES = ["flex", "flex-wrap", "gap-4"].join(" ");
// The actions' group fills the footer's row below `md` and sits at its end
// from `md` (unify-action-button-widths D3).
const FOOTER_LINKS_CLASSES = ["max-md:w-full", "md:ml-auto"].join(" ");

function withCount(text: string, count: number | undefined): string {
  return text.replace("{count}", String(count ?? 0));
}

/**
 * One coffee shop of the directory in the shared stacked card
 * (add-coffeeshop-directory design.md D7; spec "Coffee shop card"): the
 * verified badge when it has a verified offering, the name, the locations
 * count, its cities once each, the offering counts and the View action, an
 * action button (fix-production-aut-findings design.md D4).
 */
export function CoffeeshopCard({ coffeeshop, locale, texts, actions }: CoffeeshopCardProps): ReactNode {
  const cities = uniqueCities(coffeeshop.locations ?? []).join(CITY_SEPARATOR);
  return (
    <Card layout="stacked">
      <CardContent className={CONTENT_CLASSES}>
        {(coffeeshop.verifiedOfferingsCount ?? 0) > 0 ? (
          <Badge variant="verified">{texts.verifiedBadge}</Badge>
        ) : null}
        <h2 className="type-card-heading">{coffeeshop.name}</h2>
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
        <ActionGroup align="end" className={FOOTER_LINKS_CLASSES}>
          <RouteButton href={`/${locale}/coffeeshops/${coffeeshop.ulid ?? ""}`} variant="action-3" size="sm">
            {texts.viewLabel}
          </RouteButton>
          {actions}
        </ActionGroup>
      </CardFooter>
    </Card>
  );
}
