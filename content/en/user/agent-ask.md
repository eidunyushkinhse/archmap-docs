---
title: Ask an AI agent about the system
order: 16
---

::: note
The agent answers based on the project's documentation in ArchMap. It searches all of it (objects, logic diagrams, API specifications, tables, channels, configuration parameters, and business processes) and reads what it finds. The ArchMap interface searches object names only, so when your question is about what's inside the documentation, it's easier to ask the agent.
:::

## Ask a question

To ask a question about the system, follow these steps:

1. Start an agent with the ArchMap MCP server connected (see [Connect an AI agent to ArchMap](agent-setup.md)).
2. Write your question and include the project name. If you don't remember the name, ask the agent to list your projects first.
3. Send the question. The agent searches the documentation and answers with references to its sources: the object's path, the logic diagram name, and the line number.
4. Double-check important conclusions in ArchMap: open the object page and the diagram that the agent refers to (see [Find service documentation](find-service.md), [View operation and worker logic](logic.md)).

::: note
Example questions:
- “Which services write to orders.status in the Yarmarka Marketplace project?”
- “What happens when an order is paid in Yarmarka? Walk me through the business process.”
- “Which configuration parameters does Order API depend on, and what do they control?”
- “Where in Yarmarka can the error ‘…’ occur, and what does the service do next?”
:::

::: note
Paste log lines in full. Variable parts, such as IDs, paths, and dates, don't get in the way of the search, and distinctive words help pinpoint the right place.
:::

::: note
The answers come from the agent, not from ArchMap, and the agent can draw wrong conclusions. It also can't know anything that isn't in the documentation: ArchMap describes the system only as far as it has been documented.
:::
