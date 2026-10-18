---
title: ArchMap documentation
description: ArchMap guides for three roles: viewers (users), architects, and administrators.
---
ArchMap describes a software system as a tree of objects of arbitrary depth, each tree level having its own architecture diagram, and each object having its own documentation page.

You can [connect your AI agent](user/agent-setup.md) to ArchMap via MCP. For viewers, the agent answers questions about how the system works: which service handles what, who writes to a given table, which channels an event passes through. Its answers are based on the project's diagrams and documentation.

For architects, the agent helps document the system. Given access to the source code, it analyzes the services and writes diagrams, operation logic, and facts from the code directly to ArchMap.

::: note
AI-assisted documentation is in beta. Review the agent's output and correct it manually where needed.
:::

The documentation is organized by role. Pick a guide from the tree on the left or use the search at the top of the page.
