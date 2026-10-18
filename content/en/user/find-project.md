---
title: Find a project and explore the system
order: 1
---

::: note
A project in ArchMap describes one system: its objects, the relationships between them, documentation, and business processes. A project is visible to all its members and, if the owner has opened it to all users, to everyone signed in to ArchMap. A project you have not been added to does not appear in the list and does not open by a direct link. The project owner adds members.
:::

## Find a project

To find a project, follow these steps:

1. Sign in to ArchMap. The **Projects** screen opens with the list of projects available to you.
2. If there are many projects, type part of a name or description in the **Search by name or description** field. The list narrows as you type.
3. Click the project card. The project page opens.

![Projects screen](../images/projects-list.png "Projects screen: the Active and Archive tabs, search, and project cards")

::: note
An archived project (the **Archive** tab) does not open until the owner restores it.
:::

::: note
If you followed a link to a page inside a project, that page opens after you sign in. The **ArchMap** logo in the upper-left corner leads to the project list.
:::

To switch to another project without returning to the list, follow these steps:

1. In the header, click the project name. The project list opens.
2. Select a project in one of the following ways:
    - click the project in the list;
    - type part of its name in the **Search projects** field and click the project found.

## Explore the system

To explore the system, follow these steps:

1. Open the project page. The **System diagram** section shows the root level: the top-level systems and the relationships between them.
2. In the **System diagram** section, activate the diagram. To do this, click it.
3. Adjust the zoom and position of the diagram in one of the following ways:
    - zoom with the mouse wheel;
    - drag the diagram by an empty spot;
    - click the zoom buttons in the lower-left corner of the diagram.
4. On the diagram, click an object. The object is selected and all its relationships are highlighted.
5. On a container object, click the **Expand contents** magnifier. The container's components appear inside its frame, and the relationships extend to them. The **Collapse** button in the corner of the frame hides them.
6. Double-click an arrow. The relationship is highlighted along its whole length. If several relationships run along one line, ArchMap offers to choose one.
7. Press <kbd>Esc</kbd> or click outside the diagram. The diagram becomes static again.

![Project page](../images/project-home.png "Project page: header with counters, object tree on the left, and the System diagram section")

::: note
The **Legend** button in the lower-right corner of the diagram explains object shapes, status colors, and frames. The button in the upper-right corner hides and shows relationship labels.
:::

::: note
If the project describes planned changes, an **As is** / **Transition** / **To be** switch appears above the diagram (see [View planned system changes](changes.md)).
:::

::: note
If other members are editing the project, the diagram on the page updates by itself, and the label **Diagram updated in another session** appears above it for a few seconds.
:::

To view the list of the system's business processes, follow these steps:

1. On the project page, scroll to the **Business processes** section.
2. In the list, click the row of a process. The project switches to **Processes** mode, and the selected process opens (see [View a business process](processes.md)).

::: note
There is no **Business processes** section if no processes have been documented in the project yet.
:::

## Go to the first level

To go from the root diagram to an object's level, open the object page in one of the following ways:

- double-click the object on the diagram;
- click the object in the tree on the left.

::: note
How to move further between levels is described in [Navigate diagram levels](levels.md). You can find a specific service by search without going down level by level (see [Find a service's documentation](find-service.md)).
:::
