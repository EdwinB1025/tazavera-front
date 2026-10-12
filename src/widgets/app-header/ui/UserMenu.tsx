"use client";

import type { ReactNode } from "react";
import NextLink from "next/link";
import type { SessionUser } from "@/shared/api";
import { apiWebPageUrl } from "@/shared/api";
import { openSecurityPopup } from "@/shared/lib/security-popup";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/shared/ui";
import {
  ChevronDown,
  ClipboardList,
  Compass,
  LogOut,
  MapPin,
  ShieldCheck,
  User,
} from "@/shared/ui/icons";

// ─── UI-specific types (declared before the component) ───
// Every interface text arrives as a prop (design.md D10). The user's name is
// data, not text: the trigger's initials and accessible name are built from
// `data.name` and `data.surname` (design.md D5 field mapping).

export type UserMenuTexts = {
  myAccount: string;
  security: string;
  manageOfferings: string;
  /** The coffee shop's locations entry, after "Manage offerings" (add-manage-locations-menu-entry D1). */
  manageLocations?: string;
  /** The coffee shop's inventory entry, after "Manage locations" (add-coffee-inventory-explorer D9). */
  exploreInventory?: string;
  manageEvaluations: string;
  /** The specialist's offerings entry (refine-header-aut D5). */
  exploreOfferings: string;
  signOut: string;
};

export type UserMenuProps = {
  user: SessionUser;
  locale: string;
  texts: UserMenuTexts;
  /** The session's sign out (spec: "Sign out"). */
  onSignOut: () => void;
};

// ─── The ghost trigger (design.md D3, D4) ───
// A menu trigger, not an action control: no fill and no border at rest or on
// hover, the content switching between the header's navigation text colours
// (one colour owner: `type-button` binds none), and focus keeping the shared
// indicator (spec: "Header menu triggers"). One hit target: the circle takes
// its hover pair while the pointer is anywhere on the control — `group` here,
// `group-hover:` on the circle (design.md D4).
const TRIGGER_CLASSES = [
  "type-button",
  "group",
  "flex",
  "h-10",
  "items-center",
  "gap-2",
  "rounded-field",
  "px-3",
  "text-nav-text",
  "hover:text-nav-text-hover",
  "focus-visible:focus-ring",
].join(" ");

// ─── One class list for the circle (design.md D5) ───
// The same list in both themes: the theme difference lives entirely in the
// token values. The boundary width is unconditional and only its colour is
// transparent in the traditional theme.
const CIRCLE_CLASSES = [
  "flex",
  "size-8",
  "shrink-0",
  "items-center",
  "justify-center",
  "rounded-full",
  "bg-nav-avatar",
  "text-nav-text-dark",
  "group-hover:bg-nav-avatar-hover",
  "border",
  "border-nav-avatar-border",
].join(" ");

// ─── Entry destinations ───
// `/[locale]/account` and `/[locale]/manage/*` are internal routes: they get
// the internal `Link` treatment (`base-controls`: internal routes only), so
// they navigate client-side and a reload — which would wipe the in-memory
// tokens `add-auth` keeps — never happens. Only the API's `/user/security` is
// an external destination and stays a native anchor (design.md), opened in a
// popup window so the tab keeps its tokens (open-security-pages-in-popup D4).
// The internal entries render `next/link` and not the shared `Link`, so they
// take the header menu entry treatment and no inline-link look; each entry
// leads with a decorative icon (add-user-menu-icons D1, D2).

/**
 * User menu (design.md D5; spec "Signed-in header and user menu").
 *
 * Opens from the avatar control carrying the user's initials and accessible
 * name. It offers the account entry pointing at `/[locale]/account`, the
 * security entry as the API's web page rendered
 * natively (an external destination, not the internal link treatment per
 * `base-controls`), the management entry for the user's
 * role, for a coffee shop the locations entry after it
 * (add-manage-locations-menu-entry D1) and then the inventory entry
 * (add-coffee-inventory-explorer D9), for a specialist the offerings entry
 * (refine-header-aut D5), and
 * sign out.
 */
export function UserMenu({
  user,
  locale,
  texts,
  onSignOut,
}: UserMenuProps): ReactNode {
  const initials = `${user.name?.charAt(0) ?? ""}${user.surname?.charAt(0) ?? ""}`.toUpperCase();
  const name = `${user.name ?? ""} ${user.surname ?? ""}`.trim();
  const securityUrl = apiWebPageUrl("/user/security", user.ulid);
  const management: { text: string; href: `/${string}` } | null =
    user.role === "coffeeshop"
      ? { text: texts.manageOfferings, href: `/${locale}/manage/offerings` }
      : user.role === "specialist"
        ? { text: texts.manageEvaluations, href: `/${locale}/manage/evaluations` }
        : null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={TRIGGER_CLASSES} aria-label={name}>
        <span className={CIRCLE_CLASSES}>{initials}</span>
        <span className="hidden md:inline">{name}</span>
        <ChevronDown className="hidden md:block size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" surface="nav">
        <DropdownMenuItem asChild>
          <NextLink href={`/${locale}/account`}>
            <User aria-hidden className="size-4" />
            {texts.myAccount}
          </NextLink>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a href={securityUrl} onClick={(event) => openSecurityPopup(event)}>
            <ShieldCheck aria-hidden className="size-4" />
            {texts.security}
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {management && (
          <DropdownMenuItem asChild>
            <NextLink href={management.href}>
              <ClipboardList aria-hidden className="size-4" />
              {management.text}
            </NextLink>
          </DropdownMenuItem>
        )}
        {user.role === "coffeeshop" && (
          <DropdownMenuItem asChild>
            <NextLink href={`/${locale}/manage/locations`}>
              <MapPin aria-hidden className="size-4" />
              {texts.manageLocations}
            </NextLink>
          </DropdownMenuItem>
        )}
        {user.role === "coffeeshop" && (
          <DropdownMenuItem asChild>
            <NextLink href={`/${locale}/manage/inventory`}>
              <Compass aria-hidden className="size-4" />
              {texts.exploreInventory}
            </NextLink>
          </DropdownMenuItem>
        )}
        {user.role === "specialist" && (
          <DropdownMenuItem asChild>
            <NextLink href={`/${locale}/offerings`}>
              <Compass aria-hidden className="size-4" />
              {texts.exploreOfferings}
            </NextLink>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onSelect={onSignOut}>
          <LogOut aria-hidden className="size-4" />
          {texts.signOut}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
