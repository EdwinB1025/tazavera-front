# Backlog — refactor candidates

Augusto adds entries; agents read the file. The architect checks it before /opsx:explore or /opsx:propose and flags any entry the change would affect, and removes the whole section of an entry only when archiving the change that resolves it.

One section per candidate, in this format:

## R<n> — <title>

- **Duplicated:** <code, classes or helpers that are repeated>
- **Where today:** <files>
- **Why it pays off now:** <upcoming change that would add copies>
- **Owning capability:** <capability>
- **Proposed change:** <change-id>
- **Open decision (Augusto):** <options, or "none">
- **Status:** proposed | accepted | deferred
- **Affects:** <changes that should wait for it or reference it>