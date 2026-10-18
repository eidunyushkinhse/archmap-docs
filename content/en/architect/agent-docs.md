---
title: Document the system with an AI agent
order: 6
---

<!--@include: ../_shared/agent-beta.md-->

::: note
An AI agent documents the system from its code. ArchMap gives the agent a prompt with formatting rules, the agent reads the repository and prepares the documentation, and ArchMap checks it and shows what will change in the project before anything is written. The agent can't delete anything from the project.
:::

::: note
You can work with the agent in two ways. In ArchMap windows, you copy a prompt, run the agent in the repository directory, and add the files it prepared to the window. Via MCP, the agent gets the prompt from ArchMap itself, shows you a plan of changes, and writes them to the project after you confirm (see [Connect your agent via MCP](mcp.md)). Both ways follow the same formatting rules.
:::

::: note
The prompt from an ArchMap window is designed for agents that can run subagents: one subagent writes the documentation, and another checks it against the code. If the agent doesn't support subagents, it stops and tells you so.
:::

## Document the system step by step {#order}

To document the system with an agent, follow these steps:

1. Build the system diagram from the code (see [Import a diagram an agent built from code](import-agent.md)). If the system lives in several repositories, merge them into one project (see [Merge files from several repositories into one project](merge-repos.md)).
2. Document the database structures (see [Document database structure](db.md#agent)).
3. Document the message broker channels (see [Document broker channels](channels.md#agent)).
4. Document the services' configuration parameters (see [Document service configuration](config.md#agent)).
5. If a service has many operations, list them first (see [List operations](logic.md#recon)).
6. Document the logic of operations and workers (see [Document logic with an AI agent](logic.md#agent)).
7. Add the services' OpenAPI specifications (see [Get a specification from an agent](openapi.md#agent)).
8. Link business process steps to logic diagrams (see [Configure a step](processes.md#step)).
9. Review the recommendations for the diagram (see [Review diagram recommendations](alerts.md)).

::: note
Logic diagrams come after tables, channels, and parameters because they refer to them with the “reads”, “writes”, “publishes”, “consumes”, and “depends on” markers. The logic prompt passes the agent the names of the tables, channels, and parameters that are already documented, and the agent uses these names in its markers. If you document the logic first, some markers may not match the names, and they show up in **Recommendations**.
:::

::: note
Listing operations is for large services. ArchMap creates an empty diagram for each operation in the list, and you can then document them one at a time. The agent can document a small service without a list, in a single batch.
:::

::: note
When the code changes, you can repeat these steps. **Update from repository** updates the diagram (see [Update the diagram after code changes](sync.md)), and the agent adds new tables, channels, parameters, and logic diagrams in the same windows as the first time.
:::
