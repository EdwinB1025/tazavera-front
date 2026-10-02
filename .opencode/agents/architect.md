---
description: Designs, reviews, verifies and archives changes with OpenSpec (/opsx-explore, /opsx-propose, /opsx-update, /opsx-verify, /opsx-archive). Writes only inside openspec/changes/ and the status sections of docs/design/.
mode: primary
model: xiaomi/mimo-v2.6-pro
permissions:
  # ─── Edit: deny all, then allow only its own artifacts ───
  - action: edit
    resource: "*"
    effect: deny
  - action: edit
    resource: "*openspec/changes/*"
    effect: allow
  - action: edit
    resource: "*docs/design/*/design-summary.md"
    effect: allow
  - action: edit
    resource: "*docs/design/*/corrections.md"
    effect: allow
  # Archived changes only change through openspec archive
  - action: edit
    resource: "*openspec/changes/archive/*"
    effect: deny
  - action: edit
    resource: "*openspec*config.yaml*"
    effect: deny
  - action: edit
    resource: "*docs/backlog.md"
    effect: allow

  # ─── Skills: never implements ───
  - action: skill
    resource: "openspec-apply*"
    effect: deny

  # ─── Shell: ask for anything not listed below ───
  - action: shell
    resource: "*"
    effect: ask
  # OpenSpec CLI (all of it is the architect's)
  - action: shell
    resource: "openspec *"
    effect: allow
  - action: shell
    resource: "npx openspec *"
    effect: allow
  # Project checks, used by /opsx-verify (read-only)
  - action: shell
    resource: "npm run test*"
    effect: allow
  - action: shell
    resource: "npm run lint*"
    effect: allow
  - action: shell
    resource: "npm run build*"
    effect: allow
  - action: shell
    resource: "npx tsc *"
    effect: allow
  - action: shell
    resource: "ls *"
    effect: allow
  # Git: read state
  - action: shell
    resource: "git status*"
    effect: allow
  - action: shell
    resource: "git diff*"
    effect: allow
  - action: shell
    resource: "git log*"
    effect: allow
  - action: shell
    resource: "git branch --show-current"
    effect: allow
  # Git: stage only its own files, and commit
  - action: shell
    resource: "git add openspec/changes/*"
    effect: allow
  - action: shell
    resource: "git add openspec/specs*"
    effect: allow
  - action: shell
    resource: "git add docs/design/*/design-summary.md"
    effect: allow
  - action: shell
    resource: "git add docs/design/*/corrections.md"
    effect: allow
  - action: shell
    resource: "git commit *"
    effect: allow
  - action: shell
    resource: "git add docs/backlog.md"
    effect: allow
  - action: shell
    resource: "git show --stat *"
    effect: allow
  # Git: hard limits
  - action: shell
    resource: "git add -A*"
    effect: deny
  - action: shell
    resource: "git add .*"
    effect: deny
  - action: shell
    resource: "git commit -a*"
    effect: deny
  - action: shell
    resource: "git commit --amend*"
    effect: deny
  - action: shell
    resource: "*--no-verify*"
    effect: deny
  - action: shell
    resource: "git push*"
    effect: deny
  - action: shell
    resource: "git merge*"
    effect: deny
  - action: shell
    resource: "git rebase*"
    effect: deny
  - action: shell
    resource: "git reset*"
    effect: deny
  - action: shell
    resource: "git checkout*"
    effect: deny
  - action: shell
    resource: "git switch*"
    effect: deny
  # Archive only with Augusto's approval (last, so it wins over the allows above)
  - action: shell
    resource: "openspec archive*"
    effect: ask
  - action: shell
    resource: "npx openspec archive*"
    effect: ask
---