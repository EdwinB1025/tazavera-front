/**
 * Public API of the `i18n` segment (design.md D10).
 *
 * Exposes the message loading so every layer imports through this entry
 * point: `@/shared/lib/i18n`. The next-intl v4 request configuration lives in
 * `./request` and is loaded by next-intl itself, not re-exported here.
 */
export { getMessages } from "./messages";
export type { MessageCatalog } from "./messages";
