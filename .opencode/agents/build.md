---
model: xiaomi/mimo-v2.6-pro
permissions:
  # ─── OVERNIGHT VERSION (opencode run --auto): nothing may stay on "ask".
  # ─── Restore in the morning: git restore .opencode/agents/

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
  # Overnight: agent and Claude configuration are off limits
  - action: edit
    resource: "*.opencode/*"
    effect: deny
  - action: edit
    resource: "*.claude/*"
    effect: deny
  # Dependencies: no manual edits overnight (the approved install updates them)
  - action: edit
    resource: "*package.json"
    effect: deny
  - action: edit
    resource: "*package-lock.json"
    effect: deny

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

  # ─── Shell: overnight, deny anything not listed below ───
  - action: shell
    resource: "*"
    effect: deny
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
  # Overnight: read-only checks and type generation the apply needs
  - action: shell
    resource: "npx next typegen*"
    effect: allow
  - action: shell
    resource: "npm ls*"
    effect: allow
  - action: shell
    resource: "git check-ignore*"
    effect: allow
  - action: shell
    resource: "git hash-object*"
    effect: allow
  - action: shell
    resource: "mkdir src/*"
    effect: allow
  - action: shell
    resource: "mkdir -p src/*"
    effect: allow
  # Overnight: servers never return, and node -e can write past the edit rules
  - action: shell
    resource: "npm run dev*"
    effect: deny
  - action: shell
    resource: "npm run start*"
    effect: deny
  - action: shell
    resource: "node -e *"
    effect: deny
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
  # Overnight: no writes through the shell (redirects, heredocs, find actions), no chaining
  - action: shell
    resource: "*>*"
    effect: deny
  - action: shell
    resource: "*<<*"
    effect: deny
  - action: shell
    resource: "*-delete*"
    effect: deny
  - action: shell
    resource: "*-exec*"
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
  # Overnight: delete throwaway files inside src/ only
  - action: shell
    resource: "rm src/*"
    effect: allow
  - action: shell
    resource: "rm -f src/*"
    effect: allow
  - action: shell
    resource: "rm -r*"
    effect: deny
  # Dependencies: denied overnight (add-landing adds none)
  - action: shell
    resource: "npm install*"
    effect: deny
  - action: shell
    resource: "npm i *"
    effect: deny
  - action: shell
    resource: "npm uninstall*"
    effect: deny
  # Task 6.2: the hero photograph (binary, cannot go through the edit tool)
  - action: shell
    resource: "mkdir -p public/images"
    effect: allow
  - action: shell
    resource: "cp docs/design/add-landing/coffee-beans.png public/images/coffee-beans.png"
    effect: allow
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
  # Overnight: never stage agent or Claude configuration
  - action: shell
    resource: "git add .opencode*"
    effect: deny
  - action: shell
    resource: "git add .claude*"
    effect: deny
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
  # ─── Overnight: stay inside this worktree ───
  - action: external_directory
    resource: "*"
    effect: deny
---