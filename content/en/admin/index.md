---
title: Administrator guide
short: Administrator
order: 3
description: Installation, upgrades, user accounts, and backups.
---

Administrators install ArchMap, create user accounts, and keep the service running. You don't need to understand the diagrams, but it helps to know how [project roles](../architect/access.md#project-roles) work so that you grant account roles correctly.

ArchMap can be installed in three ways: with Docker Compose on a single machine, with a Helm chart in Kubernetes, or on a server with a systemd service and nginx. The last two also work in an isolated network without internet access.
