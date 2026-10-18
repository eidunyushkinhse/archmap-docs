---
title: Navigate between diagram levels
order: 2
---

::: note
A project in ArchMap is a tree of objects. An object that has components is called a container. Only services can be containers: databases, brokers, and persons have no components. Each level shows the components of one container and the relationships between them. The root level is shown on the project page, and every other level on an object page.
:::

## Open an object page

To open an object page, do one of the following:

- double-click the object on the diagram of the project page or another object page;
- click the object in the tree on the left;
- type part of its name in the **Search by name…** field above the tree, and then click the object in the results.

![Object page](../images/object-page.png "The Order Service page: the path from the project root, properties, and a diagram of the object with its neighbors")

::: note
The diagram on an object page shows:
- the object itself;
- related objects on the same level (solid frame);
- related objects on other levels (dashed frame);
- all relationships among these objects, including the ones between the neighbors;
- the dashed frame of the parent container.

Objects on the same level that aren't related to this object aren't shown. To see them, open the parent's diagram.
:::

::: note
Below the diagram, the object page has the **Relationships**, **Logic**, **OpenAPI**, and **Participates in processes** sections (see [View service relationships](edges.md), [View operation and worker logic](logic.md), [View a service's API](api.md), [View a business process](processes.md)).
:::

## Go down a level

To see a container's components without leaving the diagram, follow these steps:

1. Find a container on the diagram. Containers have an **Expand contents** magnifier.
2. Click the magnifier. The container's components appear inside its frame, and the arrows now connect to them.
3. To go deeper, click the magnifier on any component that is a container itself.
4. To hide the components, click **Collapse** in the corner of the frame.

![Container expanded on the diagram](../images/object-page-expanded.png "A container expanded with the magnifier: its components are shown inside the frame, together with the neighbors")

::: note
You can expand containers this way on the project page and on any object page.
:::

::: note
You can expand up to two nested levels. Below that, the magnifier is disabled and suggests opening the component's page instead.
:::

To go to a component's level, follow these steps:

1. Expand the container with the **Expand contents** magnifier.
2. Double-click the component. Its page opens, showing the diagram of its level.

## Go up a level

To go up a level, do one of the following:

- in the **Project › …** path at the top of the object page, click an ancestor;
- to return to the project page and the root level, click **Project** at the start of the path;
- click an ancestor in the tree on the left.

## Use the object tree

To find an object in the tree on the left, follow these steps:

1. Click the arrow next to a container's name to expand it.
2. Click the object's name. Its page opens.

::: note
The tree automatically expands to the object whose page is open. To hide the tree, click **Collapse panel** at the bottom; to show it again, click **Expand panel**.
:::

::: note
The **Search by name…** field above the tree searches object names only. For other ways to find information, see [Find service documentation](find-service.md).
:::
