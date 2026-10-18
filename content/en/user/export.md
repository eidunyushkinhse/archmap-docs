---
title: Export a project
order: 14
---

::: note
Export downloads the project's knowledge (for example, to pass the diagram to an AI agent or to keep a copy). Export is available to everyone who has access to the project, including readers.
:::

## Export the diagram to YAML

To export the diagram to YAML, follow these steps:

1. Open the page you need:
    - the project page, to export the diagram of the whole project;
    - an object page, to export the object together with all its components.
2. In the upper-right corner, click the **Diagram actions** button (three dots). A menu opens.
3. In the menu, select **Export diagram** (on an object page, the item is called **Export subtree**). A window with the YAML text opens.
4. In the window, click **Copy**. The text is copied to the clipboard.

![Diagram actions menu](../images/export-menu.png "Diagram actions menu on the project page")

::: note
The YAML contains the objects (name, type, role, technology, description, source) and the relationships between them. It has no logic diagrams, specifications, facts, or processes: they are in the project archive.
:::

## Download the project archive

To download the project archive, follow these steps:

1. Open the project page.
2. In the upper-right corner, click the **Diagram actions** button.
3. In the menu, select **Export project (zip)**. The browser downloads the archive.

::: note
The archive contains all the project's knowledge: the diagram, logic diagrams, OpenAPI specifications, database structures, broker channels, configuration, and business processes. The **Export project (zip)** item is available only on the project page.
:::

::: note
An architect can restore the project in ArchMap from the archive.
:::

## Export a business process to Mermaid

To export a business process, follow these steps:

1. Open the process (see [View a business process](processes.md)).
2. In the upper-right corner, click the **Diagram actions** button.
3. In the menu, select **Export process “…” (Mermaid)**. A window with the diagram text in Mermaid notation opens.
4. In the window, click **Copy**.
