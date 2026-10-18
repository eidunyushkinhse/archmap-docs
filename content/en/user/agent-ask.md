---
title: Ask an AI agent about the system
order: 16
---

::: note
The agent answers from the project's documentation in ArchMap. It searches all of its contents (objects, logic diagrams, API specifications, tables, channels, configuration parameters, and business processes) and reads what it finds. The ArchMap interface searches only by object name, so questions about the contents are easier to ask the agent.
:::

## Ask a question

To ask a question about the system, follow these steps:

1. Start the agent that has the ArchMap MCP server connected (see [Connect an AI agent to ArchMap](agent-setup.md)).
2. Phrase the question and name the project in it. If you don't remember the project name, first ask the agent to show the list of projects.
3. Send the question. The agent finds what it needs in the documentation and answers, pointing to where it is written: the object's path, the name of the logic diagram, the line number in it.
4. Verify important conclusions in ArchMap. To do this, open the page of the object named and the relevant diagram (see [Find a service's documentation](find-service.md), [View the logic of an operation or worker](logic.md)).

::: note
Example questions:
- “Which services write to orders.status in the Yarmarka Marketplace project?”
- “What happens when an order is paid in the Yarmarka project? Describe it by the steps of the business process.”
- “Which configuration parameters does Order API depend on, and what do they switch?”
- “Where in the Yarmarka project does the error ‘…’ occur, and what does the service do after it?”
:::

::: note
Paste a log line into the question in full: the variable parts (identifiers, paths, dates) do not get in the way of the search, and rare words help find the right place.
:::

::: note
It is the agent that answers, not ArchMap: the agent can be wrong in its conclusions. The documentation in ArchMap describes the system as it was documented, so the agent cannot learn what is not in it.
:::
