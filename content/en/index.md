---
title: ArchMap documentation
description: ArchMap guides for three roles: diagram readers, architects, and administrators.
---
ArchMap describes a software system as a tree of objects of arbitrary depth. Each level of the tree has its own architecture diagram, and each object has its own page with documentation.

You can [connect your own AI agent](user/agent-setup.md) to ArchMap over MCP. For readers, the agent answers questions about how the system works: which service is responsible for what, who writes to a table, which channels an event goes through. It takes the answers from the project's diagrams and documentation.

For architects, the agent helps document the system. An agent with access to the source code studies the services and writes diagrams, operation logic, and facts from code straight into ArchMap.

::: note
Documenting with an AI agent is currently in beta: double-check the agent's results and fix them by hand where needed.
:::

The documentation is organized by role. Choose a guide in the tree on the left or use the search at the top of the page. So far, only the user guide is available in English.
