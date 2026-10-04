---
model: xiaomi/mimo-v2.6-pro
permissions:
  # ─── Edit: everything except OpenSpec, docs, contract and generated files ───
  - action: edit
    resource: "*openspec/*"
    effect: deny
  - action: edit
    resource: "*openspec/changes/*/tasks.md"
    effect: allow
  - action: edit
    resource: "*openspec/changes/archive/*"
    effect: deny
  - action: edit
    resource: "*docs/*"
    effect: deny
  - action: edit
    resource: "*AGENTS.md"
    effect: deny
  - action: edit
    resource: "*contracts/*"
    effect: deny
  - action: edit
    resource: "*src/shared/api/schema.ts"
    effect: deny
  # Dependencies need approval
  - action: edit
    resource: "*package.json"
    effect: ask
  - action: edit
    resource: "*package-lock.json"
    effect: ask

  # ─── Skills: cannot load the architect's workflows ───
  - action: skill
    resource: "openspec-propose*"
    effect: deny
  - action: skill
    resource: "openspec-explore*"
    effect: deny
  - action: skill
    resource: "openspec-update*"
    effect: deny
  - action: skill
    resource: "openspec-sync*"
    effect: deny
  - action: skill
    resource: "openspec-verify*"
    effect: deny
  - action: skill
    resource: "openspec-archive*"
    effect: deny

  # ─── Shell: ask for anything not listed below ───
  - action: shell
    resource: "*"
    effect: ask
  # Project checks and scripts
  - action: shell
    resource: "npm run *"
    effect: allow
  - action: shell
    resource: "npx tsc *"
    effect: allow
  - action: shell
    resource: "npx vitest *"
    effect: allow
  - action: shell
    resource: "node -e *"
    effect: allow
  # Read-only file inspection
  - action: shell
    resource: "ls *"
    effect: allow
  - action: shell
    resource: "cat *"
    effect: allow
  - action: shell
    resource: "head *"
    effect: allow
  - action: shell
    resource: "tail *"
    effect: allow
  - action: shell
    resource: "wc *"
    effect: allow
  - action: shell
    resource: "grep *"
    effect: allow
  - action: shell
    resource: "find *"
    effect: allow
  - action: shell
    resource: "sed -n *"
    effect: allow
  # Dependencies need approval
  - action: shell
    resource: "npm install*"
    effect: ask
  - action: shell
    resource: "npm i *"
    effect: ask
  - action: shell
    resource: "npm uninstall*"
    effect: ask
  # OpenSpec CLI: read-only commands only
  - action: shell
    resource: "openspec *"
    effect: deny
  - action: shell
    resource: "npx openspec *"
    effect: deny
  - action: shell
    resource: "openspec status*"
    effect: allow
  - action: shell
    resource: "openspec instructions*"
    effect: allow
  - action: shell
    resource: "openspec list*"
    effect: allow
  - action: shell
    resource: "openspec show*"
    effect: allow
  - action: shell
    resource: "npx openspec status*"
    effect: allow
  - action: shell
    resource: "npx openspec instructions*"
    effect: allow
  - action: shell
    resource: "npx openspec list*"
    effect: allow
  - action: shell
    resource: "npx openspec show*"
    effect: allow
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
    resource: "git ls-tree*"
    effect: allow
  - action: shell
    resource: "git -C * ls-tree*"
    effect: allow
  - action: shell
    resource: "git ls-tree*"
    effect: allow
  - action: shell
    resource: "git -C * ls-tree*"
    effect: allow
  # Git: stage and commit (current worktree only)
  - action: shell
    resource: "git add *"
    effect: allow
  - action: shell
    resource: "git commit *"
    effect: allow
  # Git: staging limits — OpenSpec is the architect's, except tasks.md
  - action: shell
    resource: "git add openspec/*"
    effect: deny
  - action: shell
    resource: "git add openspec/changes/*/tasks.md"
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
  # ─── Other worktrees of this project ───
  - action: external_directory
    resource: "*tazavera-front*"
    effect: allow
---