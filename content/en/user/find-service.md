---
title: Find service documentation
order: 3
---

::: note
Everything about a service is on its page: properties, diagram, relationships, operation logic, API, configuration, and the business processes it takes part in. In the ArchMap interface, you can search for objects by name only. To search the documentation itself (logic diagrams, tables, channels, and parameters), use an AI agent connected via MCP (see [Ask an AI agent about the system](agent-ask.md)).
:::

## Find a service by name

To find a service by name, follow these steps:

1. Open the project.
2. Type part of the name in the **Search by name…** field above the object tree. Objects whose names contain the text are listed below the field.
3. Click an object in the list. Its page opens.

![Search by name in the tree](../images/tree-search.png "Search by name: “order” matches services, a database, and a worker")

::: note
Search results don't show where an object is in the tree. Its full path is shown at the top of its page.
:::

::: note
If you don't know the name, drill down from the project page level by level (see [Navigate between diagram levels](levels.md)).
:::

## Find the right section on a service page

To find what you need on a service page, scroll down to the section that answers your question:

- who the service communicates with, and how: **Relationships** (see [View service relationships](edges.md));
- how an operation or worker works: **Logic** (see [View operation and worker logic](logic.md));
- which endpoints the service's API has: **OpenAPI** (see [View a service's API](api.md));
- which configuration parameters the service reads: **Configuration** (see [View service configuration](config.md));
- which business processes the service is part of: **Participates in processes** (see [View a business process](processes.md));
- where the service's code lives: the **Source** field in **Properties** (see [Find a service's source code](source.md)).

::: note
The sections on a page depend on the object type. A service has **Logic**, **OpenAPI**, and **Configuration**. A database has **Structure** with its tables instead (see [View database structure](db.md)), and a message broker has **Channels** (see [View broker channels](channels.md)). A person has only **Properties**, **Diagram**, **Relationships**, and **Participates in processes**. **Logic**, **OpenAPI**, and **Participates in processes** are hidden when empty, while **Structure**, **Channels**, and **Configuration** are always shown and say so when nothing is documented.
:::

::: note
For a container service, the **Logic** and **OpenAPI** sections combine the documentation of its components, grouped by component.
:::
