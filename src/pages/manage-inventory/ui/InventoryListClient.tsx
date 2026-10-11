"use client";

import type { ReactNode } from "react";
import type { CoffeeInventoryQuery } from "@/shared/api";
import { signIn, useSession } from "@/features/auth";
import { SessionGate, SignedOutPrompt } from "@/shared/ui";
import {
  InventoryResults,
  InventorySkeletonGrid,
  type InventoryResultsTexts,
} from "./InventoryResults";

// ─── UI-specific types (declared before the component) ───

export type InventoryListTexts = InventoryResultsTexts & {
  eyebrow: string;
  heading: string;
  intro: string;
  signedOut: string;
  signIn: string;
};

export type InventoryListClientProps = {
  locale: string;
  /** The filters the address carries (none by default). */
  query?: CoffeeInventoryQuery;
  /** The number of applied filters. */
  count?: number;
  texts: InventoryListTexts;
};

// The heading block and the toolbar, 2rem apart (design.md D6).
const SECTION_CLASSES = ["flex", "flex-col", "gap-8"].join(" ");
// The eyebrow, the heading and the intro, 0.5rem apart.
const HEADING_BLOCK_CLASSES = ["flex", "flex-col", "gap-2"].join(" ");

/**
 * The inventory list's client region (add-coffee-inventory-explorer design.md
 * D6; specs "Access to the coffee inventory pages" and "Coffee inventory
 * list"): the heading block, then the gate — skeleton cards while the session
 * resolves, the signed-out prompt for an anonymous visitor, the 404 for
 * another role and the results for a signed-in coffeeshop.
 */
export function InventoryListClient({
  locale,
  query = {},
  count = 0,
  texts,
}: InventoryListClientProps): ReactNode {
  const session = useSession();
  return (
    <div className={SECTION_CLASSES}>
      <div className={HEADING_BLOCK_CLASSES}>
        <p className="type-eyebrow">{texts.eyebrow}</p>
        <h1 className="type-heading">{texts.heading}</h1>
        <p className="type-body">{texts.intro}</p>
      </div>
      <SessionGate
        session={session}
        loading={<InventorySkeletonGrid />}
        signedOut={
          <SignedOutPrompt
            text={texts.signedOut}
            signInLabel={texts.signIn}
            onSignIn={() => signIn(`/${locale}/manage/inventory`)}
          />
        }
        allows={(user) => user.role === "coffeeshop"}
      >
        {() => <InventoryResults locale={locale} query={query} count={count} texts={texts} />}
      </SessionGate>
    </div>
  );
}
