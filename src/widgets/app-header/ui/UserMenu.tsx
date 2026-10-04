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

// The avatar control takes the nav-avatar* treatment (design summary §3) and
// the shared focus indicator.
const TRIGGER_CLASSES = [
  "type-button",
  "flex",
  "h-10",
  "w-10",
  "items-center",
  "justify-center",
  "rounded-full",
  "bg-nav-avatar",
  "text-nav-text-dark",
  "hover:bg-nav-avatar-hover",
  "focus-visible:focus-ring",
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
        {initials}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
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
