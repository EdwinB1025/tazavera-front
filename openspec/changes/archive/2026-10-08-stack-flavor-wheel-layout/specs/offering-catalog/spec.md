## MODIFIED Requirements

### Requirement: Mouthfeel group in the CATA wheel
When the CATA wheel holds aromatic and mouthfeel notes — a note is mouthfeel when its top-level taxonomy is in the mouthfeel category — each group SHALL occupy one contiguous arc, the arcs separated by a gap wider than between ordinary segments; a legend inside the wheel SHALL mark and name each arc, and a general legend below it, before the description panel, SHALL name the groups as text. With notes of one group only, no gap or group legend SHALL show.

#### Scenario: Two groups
- **WHEN** the CATA concordance carries aromatic and mouthfeel notes
- **THEN** the wheel shows the aromatic notes on one arc and the mouthfeel notes on another, the two arcs separated by gaps wider than the separation between ordinary segments, the inner legend marks and names each arc, and the general legend names both groups

#### Scenario: One group only
- **WHEN** the CATA concordance carries no mouthfeel note, or only mouthfeel notes
- **THEN** the wheel shows no group gap, no inner legend and no general legend

#### Scenario: Groups never by colour alone
- **WHEN** the two groups render
- **THEN** each group is named as text in the general legend, so telling the groups apart never rests on colour
