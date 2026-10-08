import type { ReactNode } from "react";
import type { OfferingDetail, Session } from "@/shared/api";
import { Badge, Link } from "@/shared/ui";

// ─── UI-specific types (declared before the component) ───

export type DetailHeaderTexts = {
  verifiedLabel: string;
  provisionalLabel: string;
  coffeeshopCaption: string;
  roasterCaption: string;
  evaluateLabel: string;
  viewEvaluationsLabel: string;
};

export type DetailHeaderProps = {
  offering: OfferingDetail;
  locale: string;
  session: Session;
  texts: DetailHeaderTexts;
};

// The badge, the heading, the captions and the actions row, 0.5rem apart.
const HEADER_CLASSES = ["flex", "flex-col", "items-start", "gap-2"].join(" ");

// The actions row: wrapping, 1rem apart both ways, start-aligned
// (add-public-evaluations design.md D9).
const ACTIONS_CLASSES = ["flex", "flex-wrap", "items-start", "gap-4"].join(" ");

/**
 * The detail header (add-offering-catalog design.md D9; spec "Offering detail
 * page" — "Header"): the status badge, the coffee name as the page heading,
 * the coffeeshop and roaster captions, and the actions row: "View
 * evaluations" always, then the Evaluate link for a signed-in specialist only
 * (add-public-evaluations design.md D9). No score renders here.
 */
export function DetailHeader({
  offering,
  locale,
  session,
  texts,
}: DetailHeaderProps): ReactNode {
  const isVerified = offering.verificationStatus === "verified";
  const isSpecialist =
    session.state === "authenticated" && session.user.role === "specialist";
  const coffeeshopCaption =
    `${texts.coffeeshopCaption} ${offering.location?.name ?? ""}`.trim();
  const roasterCaption =
    `${texts.roasterCaption} ${offering.coffeeInventory?.roastery?.name ?? ""}`.trim();

  return (
    <div className={HEADER_CLASSES}>
      <Badge variant={isVerified ? "verified" : "provisional"}>
        {isVerified ? texts.verifiedLabel : texts.provisionalLabel}
      </Badge>
      <h1 className="type-heading">{offering.coffeeInventory?.coffee?.name}</h1>
      <p className="type-label">{coffeeshopCaption}</p>
      <p className="type-label">{roasterCaption}</p>
      <div className={ACTIONS_CLASSES}>
        <Link href={`/${locale}/evaluations?offeringId=${offering.ulid ?? ""}`}>
          {texts.viewEvaluationsLabel}
        </Link>
        {isSpecialist ? (
          <Link
            href={`/${locale}/manage/evaluations/new?offering=${offering.ulid ?? ""}`}
          >
            {texts.evaluateLabel}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
