---
title: Document database structure
order: 7
---

::: note
A database's structure consists of tables and columns and is documented in the **Structure** section of the database page. Changes in the section are saved when you leave the field.
:::

## Describe a table manually {#table}

To describe a table, follow these steps:

1. On the database page, in the **Structure** section, click **+ Table** and select **Manually**. A new table appears.
2. Enter the table name and briefly describe what the table is for.
3. If the database has namespaces (for example, schemas in PostgreSQL), enter the table's namespace.
4. Click **+ Column** and fill in the column:
    - the name and type;
    - the **key** (primary key) and **req.** (value required) check boxes;
    - in the **References** list, the column that the foreign key points to;
    - the meaning of the value.
5. Repeat the previous step for the remaining columns.

::: note
The buttons for deleting a table or a column are to the right of their rows. **Show diagram** in the **Structure** section displays an ER diagram of the foreign-key relationships between tables.
:::

::: note
ArchMap builds the **Accessed by** line of a table from the `reads:` and `writes:` markers in logic diagram steps (see [Refer to tables, channels, and parameters](logic.md#markers)).
:::

## Describe the structure with an AI agent {#agent}

<!--@include: ../_shared/agent-beta.md-->

::: note
The agent documents every database the repository's code works with, including databases that belong to other services. It reads migrations and ORM models, and if there are none, it reconstructs tables and columns from the SQL queries in the code. The agent doesn't connect to the database itself.
:::

::: note
Before you run the agent, add every database the repository's code works with to the diagram. The prompt gives the agent the list of the project's databases, and the agent assigns tables only to them.
:::

To document a database's structure with an agent, follow these steps:

1. On the database page, in the **Structure** section, click **+ Table** and select **With an AI agent**. The **Describe structure with an AI agent** window opens.
2. Click **Copy prompt**.
3. Start the agent in the repository of a service that works with the database. Paste the prompt and send it. The agent saves its files to the `archmap-docs/` directory of the repository.
4. Add the files from `archmap-docs/` to the window in one of the following ways:
    - drag the files into the field on the right;
    - click **Upload files…** and select the files;
    - click **+ paste from clipboard** and paste the file's text.

    The check appears under the field. It shows which tables will be written and how many columns each one has.
5. Click **Apply**. The window closes, and the tables appear in the **Structure** section.
6. If other services also work with the database, repeat steps 2–5 in their repositories.

::: note
The most complete structure comes from the repository of the service that owns the database, because that's where its migrations are. Other services' repositories add the columns visible in their queries. Columns from different repositories are added to the tables already documented, and nothing is duplicated.
:::

::: note
Each file from the agent belongs to one database, and the agent writes the database's address on the file's first line (for example, `# archmap-node: Yarmarka Marketplace / Order Service / Orders DB`). That's why a single run can document several databases. Tables from a file without this line go to the database whose page you opened the window from.
:::

::: note
By default, what's already documented stays as it is, and the agent only adds missing tables and columns. If a column in a file is described differently from ArchMap, the check shows the difference in the **Check:** list, and ArchMap keeps the existing description. To replace old descriptions with new ones, select **Overwrite filled fields** before you apply. Nothing is deleted with any setting.
:::

::: note
For a table reconstructed from queries, the **key** and **req.** check boxes of its columns are cleared, and a type is set only if it follows from the code. The agent doesn't document indexes, partitioning, or migration history.
:::

::: note
This window doesn't record which services read and write the tables. That's what the `reads:` and `writes:` markers in logic diagrams are for, so it's best to document the database structure before the logic. The agent then refers to table names that are already known when it documents the logic (see [Document the system with an AI agent](agent-docs.md#order)).
:::

<!--@include: ../_shared/agent-remarks.md-->

::: note
An agent connected via MCP can also document the structure. Ask it in your own words (for example, “Document the structure of the Orders DB in the Yarmarka project from this repository”). The agent shows you a plan and writes the tables to the project after you confirm (see [Connect your agent via MCP](mcp.md)).
:::
