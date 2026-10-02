---
model: scaleway/glm-5.2
permissions:
  # Files: everything except openspec/, apart from checking off tasks
  - action: edit
    resource: "openspec/**"
    effect: deny
  - action: edit
    resource: "openspec/changes/*/tasks.md"
    effect: allow
  - action: edit
    resource: "contracts/**"
    effect: deny
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
  # Git: hard limits
  - action: shell
    resource: "git add openspec/*"
    effect: deny
  - action: shell
    resource: "git add openspec/changes/*/tasks.md"
    effect: allow
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
  - action: shell
    resource: "openspec archive*"
    effect: deny
  # OpenSpec CLI: read-only commands only (validate, archive and authoring are the architect's)
  - action: shell
    resource: "openspec *"
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
  # Cannot load the architect's workflows
  - action: skill
    resource: "opsx-propose*"
    effect: deny
  - action: skill
    resource: "opsx-explore*"
    effect: deny
  - action: skill
    resource: "opsx-verify*"
    effect: deny
  - action: skill
    resource: "opsx-archive*"
    effect: deny
  - action: skill
    resource: "openspec-propose*"
    effect: deny
  - action: skill
    resource: "openspec-explore*"
    effect: deny
  - action: skill
    resource: "openspec-verify*"
    effect: deny
  - action: skill
    resource: "openspec-archive*"
    effect: deny
---