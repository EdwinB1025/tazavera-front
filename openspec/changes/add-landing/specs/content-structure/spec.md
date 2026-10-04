# Spec Delta

## Purpose

Defines Tazavera's content containers: how a structured content block presents its regions — main content, an optional side column and an optional footer — across viewports and in both themes, for every screen that groups related content.

## ADDED Requirements

### Requirement: Card regions
A card SHALL present, in order, an optional side column set apart by a separator border, a main content region and an optional footer region. It SHALL render on the card surface with the container radius, an accent border on its leading edge and the theme's shadow treatment, and SHALL contribute no text or data of its own: the consuming capability fills its regions.

#### Scenario: Full regions
- **WHEN** a card renders with a side column and a footer
- **THEN** the side column comes first and sits beside the main content, its separator border lies on the boundary between them, and the footer renders below both

#### Scenario: Content only
- **WHEN** a card renders without a side column and without a footer
- **THEN** only the main content region renders

#### Scenario: Consumer content only
- **WHEN** a consuming capability fills a card
- **THEN** the rendered text and data are exactly what the consumer supplied

### Requirement: Card stacking on narrow viewports
Below the large breakpoint (1024px) the card's parts SHALL stack in their order — side column, main content, footer — with the separator border staying on the boundary between the side column and the main content.

#### Scenario: Stacked regions
- **WHEN** the viewport is narrower than 1024px
- **THEN** the side column renders above the main content with their boundary kept between them, and the footer renders below both

#### Scenario: Side-by-side side column
- **WHEN** the viewport is 1024px or wider
- **THEN** the side column renders beside the main content with its separator border between them
