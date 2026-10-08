## MODIFIED Requirements

### Requirement: Offering card content
Each offering card SHALL show the offering's data as mapped from the API: the cupping score out of 100 with a rating badge classifying it — exceptional at 90 or above, excellent at 85 or above and below 90, good at 80 or above and below 85, commercial below 80; the verification state badge (verified or provisional); the coffee name; the coffeeshop name and the roaster name as labeled captions; one origin line joining country, region, process and variety and omitting any null value; the taxonomy badges of the offering; and a footer with the evaluation count, the defective evaluation count, a View action for a signed-in user only and an Evaluate action for a signed-in specialist only, both supplied by the entry-page list as the card's actions and both rendered as action buttons.

#### Scenario: Score and rating tier
- **WHEN** an offering carries a cupping average
- **THEN** the card shows the score out of 100 with the rating badge of its range — exceptional at 90 or above, excellent from 85 to below 90, good from 80 to below 85, commercial below 80 — and the badge's text is the word of that tier in the active locale (in Spanish Excepcional at 90 or above, Excelente from 85 to below 90, Bueno from 80 to below 85, Comercial below 80), not the score

#### Scenario: Score row above the content
- **WHEN** an offering card renders at any viewport width
- **THEN** the score, the `/100` scale and the rating badge sit on one row above the card's main content

#### Scenario: No score
- **WHEN** an offering carries no cupping average
- **THEN** the card shows no score and no rating badge and the rest of its content renders normally

#### Scenario: Origin line skips null values
- **WHEN** any of country, region, process or variety is null on an offering's coffee
- **THEN** the origin line omits that value and joins the remaining values, keeping the fixed order country, region, process, variety

#### Scenario: Footer counts
- **WHEN** an offering card renders
- **THEN** its footer shows the offering's evaluation count and defective evaluation count, separated by a visible gap, with the card's actions grouped apart from the counts at the end of the footer

#### Scenario: View link for everyone
- **WHEN** a signed-in user, whatever the role, sees an offering card
- **THEN** a View action button renders and activating it opens the offering's detail route in the active locale, built from the offering's identifier

#### Scenario: No View action for anonymous visitors
- **WHEN** an anonymous visitor sees an offering card
- **THEN** no View action renders on the card

#### Scenario: Evaluate link for specialists
- **WHEN** the viewer is signed in with the specialist role
- **THEN** the footer shows an Evaluate action button that opens the new-evaluation route of the active locale with the offering's identifier

#### Scenario: No Evaluate link for other viewers
- **WHEN** the viewer is anonymous or signed in with another role
- **THEN** no Evaluate action renders on the card

### Requirement: Taxonomy badges on the offering card
The taxonomy badges of an offering card SHALL come from the offering's consensus — every taxonomy reference of its CATA concordance, including nested children, where the notes marked on several aromatic attributes are already condensed into the single `aromatics` group — and never from its per-attribute sensory taxonomy. Each taxonomy value SHALL render once, however many times its reference appears. Each badge SHALL carry the taxonomy's name in the active locale and the taxonomy's data color, arranged in three rows by level (0, 1, 2), each row wrapping its badges so that no row overflows the card below the medium breakpoint (768px). A reference that resolves to no taxonomy SHALL render no badge, and an offering without a consensus SHALL render no taxonomy badge.

#### Scenario: Names by locale
- **WHEN** an offering card renders in the active locale
- **THEN** each taxonomy badge shows the taxonomy's name in that locale

#### Scenario: Rows by level
- **WHEN** an offering carries taxonomy references at levels 0, 1 and 2
- **THEN** the badges render in three rows, one per level, each row wrapping its badges rather than overflowing the card

#### Scenario: Unresolved reference
- **WHEN** a taxonomy reference matches no taxonomy
- **THEN** no badge renders for that reference and the remaining badges render normally

#### Scenario: Values from the consensus
- **WHEN** an offering carries both a per-attribute sensory taxonomy and a CATA concordance
- **THEN** the card's badges are exactly the resolved references of the CATA concordance and no reference found only in the sensory taxonomy renders

#### Scenario: Each value once
- **WHEN** the same taxonomy reference appears more than once in the offering's CATA concordance
- **THEN** its badge renders once

#### Scenario: No consensus
- **WHEN** an offering's CATA concordance is empty, whatever its sensory taxonomy holds
- **THEN** the card renders no taxonomy badge and the rest of its content renders normally

### Requirement: Offering card actions
The offering card's footer SHALL render, in its group of actions, the actions its consumer supplies for that card, in the order supplied. The card SHALL render no action of its own, so it renders no action at all when the consumer supplies none.

#### Scenario: Consumer actions after View
- **WHEN** a consumer renders offering cards and supplies actions for them
- **THEN** each card renders those actions in the footer's group of actions, in the order supplied

#### Scenario: No consumer actions
- **WHEN** a consumer supplies no actions for a card
- **THEN** no action renders in the footer and the footer shows only the counts
