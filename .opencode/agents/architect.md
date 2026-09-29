---
description: Designs changes with OpenSpec (/opsx-propose). Writes only inside openspec/.
mode: primary
model: xiaomi/mimo-v2.6-pro
permissions:
  - action: edit
    resource: "*"
    effect: deny
  - action: edit
    resource: "openspec/**"
    effect: allow
  - action: shell
    resource: "*"
    effect: ask
  - action: shell
    resource: "openspec *"
    effect: allow
  - action: shell
    resource: "ls *"
    effect: allow
---