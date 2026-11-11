# Corrections — add-register-landing

## Round 1

1. Entry-page hero: the About us action below "Explorar cafés" becomes a button instead of a text link (Product owner's browser check, 2026-11-11: a button followed by a link looks unbalanced). It uses the existing `action-1` button treatment, the same one as the entry-page "Register" button and the `/join` option buttons, at the default size. Its text (`heroAboutLabel`: "Sobre nosotros" and its ca and en entries), its destination (`/{locale}/about`) and its position stay as they are: in the hero's actions column, below the explore button, 1rem apart. No new text, token or style. The landing spec's hero requirement and design.md D6, which call it a link, change accordingly.

### Status

2026-11-11 — `openspec validate add-register-landing --strict`: valid.

1. Changes specified behaviour (the hero's About us action is a button, not a text link). Updated: landing spec delta "Entry page hero" (the action is an `action-1` button at the standard size, 1rem below the explore action in the same column; the base-controls exception is dropped for it; scenarios "Hero presentation" and "Registration destinations" name a button), "Page layout" (the "single text link" rule also covers a single action button; scenario "Link groups" names the hero's About us button); app-shell spec delta scenario "Registration links named" (names the hero's About us button); design.md Files table and D6; proposal.md What Changes, Capabilities and Impact. Tasks created: 7.1 (test-first), 7.2 (implementation), 7.3 (full checks and QA run).

## Round 2

Product owner's browser check, 2026-11-11: the About us button looks right; the hero's two actions go inline. Product owner delegated the approval of this round to the orchestrator ("fast track", no questions back), so the orchestrator committed it.

1. `src/pages/home/ui/HomeHero.tsx`, the hero's actions block: the two actions sit side by side instead of stacked. End state: the actions block is a row (`flex flex-row flex-wrap items-center gap-4`, with `mt-2` kept so it stays 1.5rem below the paragraph); "Explorar cafés" first, the About us button second, 1rem apart horizontally; each keeps its own width; when the row does not fit, the About us button wraps below the explore action with the same 1rem gap. Nothing else changes: same texts, destinations, `action-1` treatment and size, same start alignment of the block. The landing spec delta "Entry page hero" (and "Page layout" / "Link groups" where it states the vertical arrangement) and design.md D6/D14, which place the About us action below the explore action, change accordingly.
   Existing tests affected: the `src/pages/home/ui/HomeHero.test.tsx` assertion on the actions block's layout classes (column → row with wrap), and any scenario test that names "below the explore action".
   New test: none beyond updating that assertion; it fails on the current `flex-col` classes and passes on the row classes.
