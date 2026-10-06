# Spec Delta

## MODIFIED Requirements

### Requirement: Offering card content
Each offering card SHALL show the offering's data as mapped from the API: the cupping score out of 100 with a rating badge classifying it — exceptional at 90 or above, excellent at 85 or above and below 90, good at 80 or above and below 85, commercial below 80; the verification state badge (verified or provisional); the coffee name; the coffeeshop name and the roaster name as labeled captions; one origin line joining country, region, process and variety and omitting any null value; the taxonomy badges of the offering; and a footer with the evaluation count, the defective evaluation count, a View link for every viewer and an Evaluate link for a signed-in specialist only.

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
- **THEN** its footer shows the offering's evaluation count and defective evaluation count, separated by a visible gap, with the card's links grouped apart from the counts at the end of the footer

#### Scenario: View link for everyone
- **WHEN** any viewer sees an offering card
- **THEN** a View link addresses the offering's detail route in the active locale, built from the offering's identifier

#### Scenario: Evaluate link for specialists
- **WHEN** the viewer is signed in with the specialist role
- **THEN** the footer shows an Evaluate link addressing the new-evaluation route of the active locale with the offering's identifier

#### Scenario: No Evaluate link for other viewers
- **WHEN** the viewer is anonymous or signed in with another role
- **THEN** no Evaluate link renders on the card
