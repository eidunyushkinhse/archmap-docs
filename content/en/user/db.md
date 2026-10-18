---
title: View database structure
order: 7
---

::: note
Database tables are linked to logic diagrams by the “reads” and “writes” markers in diagram steps (see [View operation and worker logic](logic.md)). Using these markers, the **Structure** section shows which services and diagrams access each table.
:::

## View a table

To view a database's structure, follow these steps:

1. Open the database page (see [Find service documentation](find-service.md)) and scroll down to the **Structure** section.
2. Click the arrow next to a table name to expand it. The table's columns and the **Accessed by** list appear.
3. In the **Accessed by** list, find the table or column you're interested in. Each row shows the service and the logic diagram that read or write it.

![Structure section](../images/facts-db.png "The Structure section of Orders DB with the orders table expanded")

::: note
Click **Show diagram** to see how the tables are related in an ER diagram. Click the diagram to open it in full screen.
:::

::: note
Rows in the **Accessed by** list don't link to logic diagrams. To open a diagram, use the **Logic** section on the service page (see [View operation and worker logic](logic.md)).
:::

::: note
**No tables documented** means that the database structure hasn't been documented in the project yet.
:::
