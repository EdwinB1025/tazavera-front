# Corrections — add-register-landing

## Round 1

1. Entry-page hero: the About us action below "Explorar cafés" becomes a button instead of a text link (Product owner's browser check, 2026-11-11: a button followed by a link looks unbalanced). It uses the existing `action-1` button treatment, the same one as the entry-page "Register" button and the `/join` option buttons, at the default size. Its text (`heroAboutLabel`: "Sobre nosotros" and its ca and en entries), its destination (`/{locale}/about`) and its position stay as they are: in the hero's actions column, below the explore button, 1rem apart. No new text, token or style. The landing spec's hero requirement and design.md D6, which call it a link, change accordingly.

### Status

2026-11-11 — `openspec validate add-register-landing --strict`: valid.

1. Changes specified behaviour (the hero's About us action is a button, not a text link). Updated: landing spec delta "Entry page hero" (the action is an `action-1` button at the standard size, 1rem below the explore action in the same column; the base-controls exception is dropped for it; scenarios "Hero presentation" and "Registration destinations" name a button), "Page layout" (the "single text link" rule also covers a single action button; scenario "Link groups" names the hero's About us button); app-shell spec delta scenario "Registration links named" (names the hero's About us button); design.md Files table and D6; proposal.md What Changes, Capabilities and Impact. Tasks created: 7.1 (test-first), 7.2 (implementation), 7.3 (full checks and QA run).
