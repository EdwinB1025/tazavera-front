# Spec Delta

## ADDED Requirements

### Requirement: Collapsible section
A collapsible section SHALL present a header that spans the full width of its container, with the consumer's title at the start and a chevron at the end, and a body that the header shows and hides. The section SHALL start collapsed unless its consumer opens it initially, and activating the header with a pointer or the keyboard SHALL toggle it. The header SHALL expose whether the section is expanded and SHALL reference the body in both states; its accessible name SHALL be the title only, and any extra header content the consumer adds SHALL be exposed as its description. The chevron SHALL point down while collapsed and up while expanded, and SHALL never be the only carrier of the state. While collapsed, the body SHALL show nothing and its content SHALL be out of the tab order and the accessibility tree, while keeping its state for the next opening. Opening and closing SHALL animate the body's height over 0.25s, and SHALL happen instantly when the user prefers reduced motion. The header SHALL show the shared focus indicator when focused from the keyboard, and the section SHALL contribute no text of its own: the consumer supplies the title, the extra header content and the body.

#### Scenario: Collapsed by default
- **WHEN** a collapsible section renders without being opened initially by its consumer
- **THEN** the header reports it collapsed, the chevron points down, the body shows nothing and none of its content can be reached with the keyboard or by assistive technology

#### Scenario: Toggle
- **WHEN** the user activates the header of a collapsed section, by pointer or by keyboard
- **THEN** the header reports it expanded, the chevron points up and the body's content shows and is reachable; activating the header again collapses it

#### Scenario: Initially open
- **WHEN** the consumer opens the section initially
- **THEN** it renders expanded, with the body's content shown and reachable

#### Scenario: Body referenced in both states
- **WHEN** the section is collapsed or expanded
- **THEN** the header references the body, and the referenced body is present

#### Scenario: Content kept while collapsed
- **WHEN** the user changes something inside the body, collapses the section and opens it again
- **THEN** the body's content shows the same state as before it collapsed

#### Scenario: Accessible name and description
- **WHEN** the header renders with a title and extra header content
- **THEN** the header's accessible name is the title only, and the extra content is its description

#### Scenario: Reduced motion
- **WHEN** the user prefers reduced motion and toggles the section
- **THEN** the body opens or closes and the chevron turns without animation

#### Scenario: Keyboard focus
- **WHEN** the header receives focus from the keyboard
- **THEN** it shows the shared focus indicator

#### Scenario: Consumer content only
- **WHEN** a consuming capability fills a collapsible section
- **THEN** the rendered text is exactly what the consumer supplied, and the section adds no visible or accessible text of its own
