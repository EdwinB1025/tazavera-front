"use client";

import type { ReactNode } from "react";
import type { SessionUser } from "@/shared/api";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  Link,
} from "@/shared/ui";
import { ChevronDown } from "@/shared/ui/icons";
import { ThemeSelect } from "./ThemeSelect";

// ─── UI-specific types (declared before the component) ───
// Every interface text arrives as a prop (design.md D10). The user's name is
// data, not text: the trigger's initials and accessible name are built from
// `data.name` and `data.surname` (design.md D5 field mapping).

export type UserMenuTexts = {
  profile: string;
  editProfile: string;
  changePassword: string;
  deactivateAccount: string;
  deleteAccount: string;
  security: string;
  themeSelector: string;
  manageOfferings: string;
  manageEvaluations: string;
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

const ITEM_HREFS = {
  profile: "account/profile",
  editProfile: "account/edit",
  changePassword: "account/password",
  deactivateAccount: "account/deactivate",
  deleteAccount: "account/delete",
} as const;

// ─── Entry destinations ───
// `/[locale]/account/*` and `/[locale]/manage/*` are internal routes: they get
// the internal `Link` treatment (`base-controls`: internal routes only), so
// they navigate client-side and a reload — which would wipe the in-memory
// tokens `add-auth` keeps — never happens. Only the API's `/user/security` is
// an external destination and stays a native anchor (design.md).

/**
 * User menu (design.md D5; spec "Signed-in header and user menu").
 *
 * Opens from the avatar control carrying the user's initials and accessible
 * name. It offers the profile settings entries pointing at
 * `/[locale]/account/*`, the security entry as the API's web page rendered
 * natively (an external destination, not the internal link treatment per
 * `base-controls`), the theme selector, the management entry for the user's
 * role, and sign out.
 */
export function UserMenu({
  user,
  locale,
  texts,
  onSignOut,
}: UserMenuProps): ReactNode {
  const initials = `${user.name?.charAt(0) ?? ""}${user.surname?.charAt(0) ?? ""}`.toUpperCase();
  const name = `${user.name ?? ""} ${user.surname ?? ""}`.trim();
  const securityUrl = `${process.env.NEXT_PUBLIC_API_URL}/user/security`;
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
        {(Object.keys(ITEM_HREFS) as Array<keyof typeof ITEM_HREFS>).map(
          (key) => (
            <DropdownMenuItem key={key} asChild>
              <Link href={`/${locale}/${ITEM_HREFS[key]}`}>{texts[key]}</Link>
            </DropdownMenuItem>
          ),
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a href={securityUrl}>{texts.security}</a>
        </DropdownMenuItem>
        <div className="px-3 py-2">
          <ThemeSelect label={texts.themeSelector} />
        </div>
        <DropdownMenuSeparator />
        {management && (
          <DropdownMenuItem asChild>
            <Link href={management.href}>{management.text}</Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onSelect={onSignOut}>{texts.signOut}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
