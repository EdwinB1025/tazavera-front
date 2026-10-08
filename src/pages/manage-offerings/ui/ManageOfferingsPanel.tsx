"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { TaxonomyNode } from "@/shared/api";
import { signIn, useSession } from "@/features/auth";
import { Link, SessionGate, SignedOutPrompt } from "@/shared/ui";
import { OwnOfferingsList, type OwnOfferingsListTexts } from "./OwnOfferingsList";
import { SkeletonGrid } from "./SkeletonGrid";

// ─── UI-specific types (declared before the component) ───

export type ManageOfferingsTexts = OwnOfferingsListTexts & {
  signedOutMessage: string;
  signInLabel: string;
  deletedStatus: string;
  eyebrow: string;
  listHeading: string;
  newOfferingLink: string;
};

export type ManageOfferingsPanelProps = {
  locale: string;
  /** The requested page from the route's query (`?page=n`). */
  page: number;
  /** `GET /taxonomies` resolved on the server; `null` when it failed. */
  taxonomies: TaxonomyNode[] | null;
  texts: ManageOfferingsTexts;
};

// ─── Layout (summary §6.2) ───
// Header → status region: 2rem.
const COLUMN_CLASSES = ["flex", "flex-col", "gap-8"].join(" ");
// Status region → the list: 1rem; with no status line, no gap.
const BODY_CLASSES = ["flex", "flex-col", "gap-4"].join(" ");
// Stacked and left-aligned below `md`; one wrapping row from `md`, spread and
// aligned to the bottom.
const HEADER_CLASSES = [
  "flex",
  "flex-col",
  "items-start",
  "gap-4",
  "md:flex-row",
  "md:flex-wrap",
  "md:items-end",
  "md:justify-between",
].join(" ");
// Eyebrow and h1 0.5rem apart.
const TITLE_GROUP_CLASSES = ["flex", "flex-col", "gap-2"].join(" ");

/**
 * The client composition of "My offerings" (design.md D1, D2, D6; spec "My
 * offerings list"). The header always renders — the "New offering" link only
 * for a signed-in coffeeshop — and the gate renders the own list in its
 * place: skeleton cards while the session resolves, the signed-out branch for
 * an anonymous visitor, the 404 for another role. The list loads on the
 * client because its filter is the session user's `ulid` (design.md D1).
 */
export function ManageOfferingsPanel({
  locale,
  page,
  taxonomies,
  texts,
}: ManageOfferingsPanelProps): ReactNode {
  const session = useSession();
  const route = `/${locale}/manage/offerings`;
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [deletedCount, setDeletedCount] = useState<number | null>(null);
  // Bumped by each successful delete: focus moves to the heading, because
  // the control that triggered the delete may be gone.
  const [focusRequest, setFocusRequest] = useState(0);
  useEffect(() => {
    if (focusRequest === 0) return;
    // After the confirmation has closed and returned focus to its trigger.
    const timer = setTimeout(() => headingRef.current?.focus(), 0);
    return () => clearTimeout(timer);
  }, [focusRequest]);
  const status =
    deletedCount === null ? null : `${texts.deletedStatus} ${deletedCount}`;
  const isCoffeeshop =
    session.state === "authenticated" && session.user.role === "coffeeshop";

  return (
    <div className={COLUMN_CLASSES}>
      <div className={HEADER_CLASSES}>
        <div className={TITLE_GROUP_CLASSES}>
          <p className="type-eyebrow-strong">{texts.eyebrow}</p>
          <h1 ref={headingRef} className="type-heading" tabIndex={-1}>
            {texts.listHeading}
          </h1>
        </div>
        {isCoffeeshop ? (
          <Link href={`/${locale}/manage/offerings/new`}>{texts.newOfferingLink}</Link>
        ) : null}
      </div>
      <div className={BODY_CLASSES}>
        {status !== null ? (
          <p role="status" className="type-body">
            {status}
          </p>
        ) : null}
        <SessionGate
          session={session}
          loading={<SkeletonGrid />}
          signedOut={
            <SignedOutPrompt
              text={texts.signedOutMessage}
              signInLabel={texts.signInLabel}
              onSignIn={() => signIn(route)}
            />
          }
          allows={(user) => user.role === "coffeeshop"}
        >
          {(user) => (
            <OwnOfferingsList
              coffeeshopUlid={user.ulid ?? ""}
              onDeleted={(count) => {
                setDeletedCount(count);
                setFocusRequest((value) => value + 1);
              }}
            locale={locale}
            page={page}
            route={route}
              taxonomies={taxonomies}
              texts={texts}
            />
          )}
        </SessionGate>
      </div>
    </div>
  );
}
