## MODIFIED Requirements

### Requirement: Offering card content
Each offering card SHALL show the offering's data as mapped from the API: the cupping score out of 100 with a rating badge classifying it — exceptional at 90 or above, excellent at 85 or above and below 90, good at 80 or above and below 85, commercial below 80; the verification state badge (verified or provisional); the coffee name; the coffeeshop name and the roaster name as labeled captions; one origin line joining country, region, process and variety and omitting any null value; the taxonomy badges of the offering; and a footer with the evaluation count, the defective evaluation count, in this order a View action for a signed-in user only, a "View evaluations" action for every viewer and an Evaluate action for a signed-in specialist only, all supplied by the entry-page list as the card's actions and all rendered as action buttons.

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

#### Scenario: View evaluations action for everyone
- **WHEN** any viewer, anonymous or signed in, sees an offering card
- **THEN** a "View evaluations" action button renders after the View action and before the Evaluate action, with the same text as the offering detail's "View evaluations" link, and activating it opens `/{locale}/evaluations?offeringId={ulid}` in the active locale with the offering's identifier
