---
description: Designs changes with OpenSpec (/opsx-propose). Writes only inside openspec/.
mode: primary
model: xiaomi/mimo-v2.6-pro
permissions:
  - action: edit
    resource: "*"
    effect: deny
  # Edición permitida: solo el cambio y los dos archivos de diseño que escribe
  - action: edit
    resource: "*openspec/changes/*"
    effect: allow
  - action: edit
    resource: "*docs/design/*/design-summary.md"
    effect: allow
  - action: edit
    resource: "*docs/design/*/corrections.md"
    effect: allow
  # Excepción: los cambios archivados solo cambian con openspec archive
  - action: edit
    resource: "*openspec/changes/archive/*"
    effect: deny
  # Deny más específico SIEMPRE al final (la última coincidencia gana)
  - action: edit
    resource: "*openspec*config.yaml*"
    effect: deny
  - action: shell
    resource: "*"
    effect: ask
  - action: shell
    resource: "openspec *"
    effect: allow
  # Never implements: cannot load the apply workflow
  - action: skill
    resource: "opsx-apply*"
    effect: deny
  - action: skill
    resource: "openspec-apply*"
    effect: deny
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
  - action: shell
    resource: "git add openspec/specs*"
    effect: allow
  # Git: stage and commit only its own change folder
  - action: shell
    resource: "git add openspec/changes/*"
    effect: allow
  - action: shell
    resource: "git commit *"
    effect: allow
  - action: shell
    resource: "openspec archive*"
    effect: ask
  - action: shell
    resource: "git add docs/design/*/design-summary.md"
    effect: allow
  - action: shell
    resource: "git add docs/design/*/corrections.md"
    effect: allow
  # Git: hard limits
  - action: shell
    resource: "git commit --amend*"
    effect: deny
  - action: shell
    resource: "*--no-verify*"
    effect: deny
  - action: shell
    resource: "git add openspec/specs*"
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
---