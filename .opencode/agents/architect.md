---
description: Designs changes with OpenSpec (/opsx-propose). Writes only inside openspec/.
mode: primary
model: xiaomi/mimo-v2.6-pro
permissions:
  - action: edit
    resource: "*"
    effect: deny
  # Todo dentro de estas rutas
  - action: edit
    resource: "*openspec*changes*"
    effect: allow
  - action: edit
    resource: "*openspec*specs*"
    effect: allow
  - action: edit
    resource: "*docs*design*"
    effect: allow
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
  # Git: stage and commit only its own change folder
  - action: shell
    resource: "git add openspec/changes/*"
    effect: allow
  - action: shell
    resource: "git commit *"
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
  - action: shell
    resource: "openspec archive*"
    effect: deny
---