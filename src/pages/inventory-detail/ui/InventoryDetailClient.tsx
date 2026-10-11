"use client";

import type { ReactNode } from "react";
import { signIn, useSession } from "@/features/auth";
import { useCoffeeInventory } from "@/features/offering-management";
import { BackLink, Button, LoadingStatus, SessionGate, SignedOutPrompt } from "@/shared/ui";
import { InventoryDetailView, type InventoryDetailViewTexts } from "./InventoryDetailView";
import { InventoryNotFound } from "./InventoryNotFound";

// ─── UI-specific types (declared before the component) ───

export type InventoryDetailTexts = InventoryDetailViewTexts & {
  back: string;
  loading: string;
  error: string;
  retry: string;
  signedOut: string;
  signIn: string;
  notFoundTitle: string;
  notFoundLine: string;
};

export type InventoryDetailClientProps = {
  locale: string;
  ulid: string;
  texts: InventoryDetailTexts;
};

// The back link → the content below it: 1.5rem.
const COLUMN_CLASSES = ["flex", "flex-col", "items-start", "gap-6"].join(" ");
// The error message and its retry, 1rem apart.
const ERROR_CLASSES = ["flex", "flex-col", "items-start", "gap-4"].join(" ");

/** The content below the back link, the not-found notice standing alone. */
function WithBackLink({ locale, texts, children }: { locale: string; texts: InventoryDetailTexts; children: ReactNode }): ReactNode {
  return (
    <div className={COLUMN_CLASSES}>
      <BackLink fallback={`/${locale}/manage/inventory`}>{texts.back}</BackLink>
      {children}
    </div>
  );
}

/** The item read for a signed-in coffeeshop and its states. */
function DetailRead({ locale, ulid, texts }: InventoryDetailClientProps): ReactNode {
  const { inventory, retry } = useCoffeeInventory({}, true);
  if (inventory.state === "success") {
    const item = inventory.items.find((candidate) => candidate.ulid === ulid);
    if (!item) {
      return (
        <InventoryNotFound
          locale={locale}
          title={texts.notFoundTitle}
          line={texts.notFoundLine}
          backLabel={texts.back}
        />
      );
    }
    return (
      <WithBackLink locale={locale} texts={texts}>
        <InventoryDetailView locale={locale} item={item} texts={texts} />
      </WithBackLink>
    );
  }
  return (
    <WithBackLink locale={locale} texts={texts}>
      {inventory.state === "loading" ? (
        <LoadingStatus text={texts.loading} />
      ) : (
        <div className={ERROR_CLASSES}>
          <p className="type-body">{texts.error}</p>
          <Button variant="primary" onClick={retry}>
            {texts.retry}
          </Button>
        </div>
      )}
    </WithBackLink>
  );
}

/**
 * The inventory detail's client region (add-coffee-inventory-explorer
 * design.md D7; specs "Access to the coffee inventory pages" and "Coffee
 * inventory detail"): the coffeeshop gate around the item read, which finds
 * the route's `ulid` among the returned items.
 */
export function InventoryDetailClient({ locale, ulid, texts }: InventoryDetailClientProps): ReactNode {
  const session = useSession();
  return (
    <SessionGate
      session={session}
      loading={
        <WithBackLink locale={locale} texts={texts}>
          <LoadingStatus text={texts.loading} />
        </WithBackLink>
      }
      signedOut={
        <WithBackLink locale={locale} texts={texts}>
          <SignedOutPrompt
            text={texts.signedOut}
            signInLabel={texts.signIn}
            onSignIn={() => signIn(`/${locale}/manage/inventory/${ulid}`)}
          />
        </WithBackLink>
      }
      allows={(user) => user.role === "coffeeshop"}
    >
      {() => <DetailRead locale={locale} ulid={ulid} texts={texts} />}
    </SessionGate>
  );
}
