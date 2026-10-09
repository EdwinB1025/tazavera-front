/**
 * next-intl's navigation for the routing definition (adopt-next-intl-routing
 * design.md D6). `usePathname` answers the path without its locale prefix and
 * `useRouter().push(pathname, { locale })` opens it under another locale; the
 * language selector is its only user. Hrefs elsewhere carry their prefix.
 */
import { createNavigation } from "next-intl/navigation";
import { routing } from "@/shared/config/locales";

export const { usePathname, useRouter } = createNavigation(routing);
