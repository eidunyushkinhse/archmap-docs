---
title: View the logic of an operation or worker
order: 5
---

::: note
A logic diagram describes, step by step, one operation of a service (a request handler or a scenario) or a worker (background job): what the service accepts, what it checks, where it writes, and what it returns. An operation's diagram can be bound to an endpoint from the service's OpenAPI spec.
:::

## Open a logic diagram

To view the logic of an operation or worker, follow these steps:

1. Open the service page (see [Find a service's documentation](find-service.md)) and scroll to the **Logic** section. The diagrams are grouped into the **Operations** and **Workers** lists; next to an operation's diagram is the endpoint it handles.
2. Click a diagram in the list. A window with the diagram opens.

![Logic section](../images/object-logic.png "Logic section on a service page: operations with endpoints and workers")

::: note
In case a service has many diagrams, you can collapse and expand the **Operations** and **Workers** lists with the arrow to the left of the heading.
:::

::: note
The **in N processes** button to the right of a diagram shows which business-process steps this diagram documents. Click it, then click a process in the list that opens, and the process opens (see [View a business process](processes.md)).
:::

## Read the diagram

To read the diagram in the window that opens, follow these steps:

1. Follow the steps from top to bottom along the arrows. A diamond is a check; the **Yes** and **No** branches come out of it.
2. Adjust the zoom. To do this, use the mouse wheel or the buttons in the lower-right corner of the window: zoom out, zoom in, fit the diagram to the window. Drag the diagram to move it.
3. Read the **Accesses** line below the diagram: which tables, broker channels, and configuration parameters the steps access. The “reads”, “writes”, “publishes”, “consumes”, and “depends on” markers also appear in the diagram steps themselves (see [View a database structure](db.md), [View broker channels](channels.md), [View a service's configuration](config.md)).
4. The **Used in processes** line leads to the business processes in which this operation is a step. Click the process name, and it opens.
5. Close the window with the cross in the upper-right corner or with the <kbd>Esc</kbd> key.

![Logic diagram window](../images/logic-viewer.png "Diagram of the Create order operation: steps, a check with branches, and the Used in processes and Accesses lines")

::: note
The **Show code** button in the window header opens the diagram's source text in Mermaid notation. You can copy the text but not change it.
:::

::: note
A check mark after an access means that the table, channel, or parameter was found in the project documentation; a warning sign with an explanation means that nothing was found for the marker.
:::

::: note
The **Not documented** block below the line in the **Logic** section lists the operations and workers that the AI agent found in the code but whose diagrams have not been written yet. You can open such a row, but it has no diagram yet.
:::

::: note
For a container service, the **Logic** section collects the diagrams of its components, grouped by component. The left part of a row opens the diagram; the right part, **from …**, leads to the page of the component that owns the diagram.
:::
