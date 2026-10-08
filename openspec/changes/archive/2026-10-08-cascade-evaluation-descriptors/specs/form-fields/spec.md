## ADDED Requirements

### Requirement: Descriptor cascade
A descriptor cascade SHALL be a descriptor chip group over a taxonomy tree of up to three levels (0, 1 and 2). Every level-0 node SHALL be a chip. A node's children SHALL render only while that node is chosen: the level-0 chips sit in untitled rows broken right after each chosen level-0 node that has children, followed by its children's row titled with its label; after that row, each chosen level-1 node with children is followed by a row of its level-2 children titled with its label, with no indent. Choosing a node SHALL add only that node; unchoosing a node SHALL remove it and every descendant from the chosen set, so a node stays chosen only while every ancestor is chosen, and each change SHALL report the chosen nodes in tree order. Revealed chips SHALL join the group's single tab stop and its arrow-key reading order. In read-only mode the cascade SHALL show each chosen node in the row it belongs to, a node's children's row showing whenever the node or one of its descendants is chosen, so a chosen child whose parent is not chosen sits under its parent's title.

#### Scenario: Children hidden until the parent is chosen
- **WHEN** a cascade renders with a node that has children and is not chosen
- **THEN** none of that node's children render

#### Scenario: Choosing reveals the children unchosen
- **WHEN** the user chooses a node that has children
- **THEN** the cascade reports that node added alone and, once given that value, its children render unchosen in a row titled with its label

#### Scenario: Unchoosing removes the descendants
- **WHEN** the user unchooses a node while some of its children and grandchildren are chosen
- **THEN** the cascade reports none of them and, once given that value, their rows no longer render

#### Scenario: Level-2 row after its parent's row
- **WHEN** a chosen level-0 node has a chosen level-1 child that has children
- **THEN** a row titled with the level-1 child's label, holding its level-2 children, renders right after the row that holds that child

#### Scenario: Revealed chips join the keyboard order
- **WHEN** a node's children render after it is chosen and the user moves with the arrow keys from that node's chip
- **THEN** focus reaches the revealed chips in reading order within the same single tab stop

#### Scenario: Read-only child without its chosen parent
- **WHEN** a read-only cascade renders a chosen level-1 node whose level-0 parent is not chosen
- **THEN** the child renders as a taxonomy badge in a row titled with its parent's label, and the parent renders no badge
