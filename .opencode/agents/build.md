---
model: scaleway/glm-5.2
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
  - action: shell
    resource: "ls *"
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
  # Git: stage and commit
  - action: shell
    resource: "git add *"
    effect: allow
  - action: shell
    resource: "git commit *"
    effect: allow
  # Git: staging limits
  - action: shell
    resource: "git add openspec/*"
    effect: deny
  - action: shell