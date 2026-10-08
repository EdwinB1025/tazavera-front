---
description: Designs, reviews, verifies and archives changes with OpenSpec (/opsx-explore, /opsx-propose, /opsx-update, /opsx-verify, /opsx-archive). Writes only inside openspec/changes/ and the status sections of docs/design/.
mode: primary
model: xiaomi/mimo-v2.6-pro
permissions:
  # ─── OVERNIGHT VERSION (opencode run --auto): nothing may stay on "ask".
  # ─── Restore in the morning: git restore .opencode/agents/

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
  - action: edit
    resource: "*docs/backlog.md"
    effect: allow
  # Archived changes only change through openspec archive
  - action: edit
    resource: "*openspec/changes/archive/*"
    effect: deny
  - action: edit
    resource: "*openspec*config.yaml*"
    effect: deny

  # ─── Skills: never implements ───
  - action: skill
    resource: "openspec-apply*"
    effect: deny

  # ─── Shell: overnight, deny anything not listed below ───
  - action: shell
    resource: "*"
    effect: deny
  # OpenSpec CLI
  - action: shell
    resource: "openspec *"
    effect: allow
  - action: shell
    resource: "npx openspec *"
    effect: allow
  # Project checks (read-only)
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
  - action: shell
    resource: "head *"
    effect: allow
  # Overnight: no writes through the shell, no chaining
  - action: shell
    resource: "*>*"
    effect: deny
  - action: shell
    resource: "*<<*"
    effect: deny
  - action: shell
    resource: "*&&*"
    effect: deny
  - action: shell
    resource: "*;*"
    effect: deny
  - action: shell
    resource: "*|*"
    effect: deny
  # Git: read state, in this folder or another worktree (-C), with or without pager
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
    resource: "git show*"
    effect: allow
  - action: shell
    resource: "git branch --show-current*"
    effect: allow
  - action: shell
    resource: "git branch --list*"
    effect: allow
  - action: shell
    resource: "git worktree list*"
    effect: allow
  - action: shell
    resource: "git rev-parse*"
    effect: allow
  - action: shell
    resource: "git ls-files*"
    effect: allow
  - action: shell
    resource: "git --no-pager status*"
    effect: allow
  - action: shell
    resource: "git --no-pager diff*"
    effect: allow
  - action: shell
    resource: "git --no-pager log*"
    effect: allow
  - action: shell
    resource: "git --no-pager show*"
    effect: allow
  - action: shell
    resource: "git -C * status*"
    effect: allow
  - action: shell
    resource: "git -C * diff*"
    effect: allow
  - action: shell
    resource: "git -C * log*"
    effect: allow
  - action: shell
    resource: "git -C * show*"
    effect: allow
  - action: shell
    resource: "git -C * branch --show-current*"
    effect: allow
  - action: shell
    resource: "git ls-tree*"
    effect: allow
  - action: shell
    resource: "git -C * ls-tree*"
    effect: allow
  # Git: stage only its own files, and commit (current worktree only)
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
    resource: "git add docs/backlog.md"
    effect: allow
  - action: shell
    resource: "git commit *"
    effect: allow
  # Git: hard limits (after the allows, so they win)
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
  # Overnight: archive denied (it stays the product owner's call)
  - action: shell
    resource: "openspec archive*"
    effect: deny
  - action: shell
    resource: "npx openspec archive*"
    effect: deny
  # ─── Overnight: stay inside this worktree ───
  - action: external_directory
    resource: "*"
    effect: deny
---