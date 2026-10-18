---
title: Export and import a project
order: 19
---

::: note
A project archive (zip) holds all of a project's knowledge: the diagram, logic diagrams, specifications, database structures, broker channels, configuration, and business processes. You can recreate the project from an archive (for example, on another ArchMap server) or load the archive into an existing project. To learn how to download an archive or the diagram YAML, see [Export a project](../user/export.md).
:::

## Create a project from an archive or YAML

To create a project from an archive or a YAML file, follow these steps:

1. On the **Projects** screen, click **New project**. The **New project** window opens.
2. Select **Import**.
3. On the right, add files to the field in one of the following ways:
    - drag `.zip` or `.yaml` files into the field;
    - click **Upload files…** and select the files;
    - paste YAML text into the field.
4. Enter the project name in the **Name** field. If you added a single archive, the name and description are taken from it, and **Name and description from the archive** appears above the field.
5. Wait for the check to finish. **Ready to import**, **Not everything matched perfectly**, or **Something went wrong** appears under the field (see [Create a project from YAML](import-agent.md#create)).
6. Click **Create project**. A report of what was created replaces the field.
7. Click **Open project**.

::: note
If you add several files, ArchMap merges them into one project and asks questions if needed (see [Merge files from several repositories into one project](merge-repos.md)).
:::

::: note
Object positions and members aren't included in the archive. ArchMap lays out the new project's diagrams again, and you become its owner (see [Share a project and assign roles](access.md)).
:::

## Load an archive into an existing project

::: note
You can load another project's archive into an existing project. The diagrams are merged, and all the documentation comes along with them. ArchMap doesn't delete anything, move objects, or replace the project's documentation without your choice.
:::

To load an archive into a project, follow these steps:

1. Open the project page.
2. Click **Diagram actions** (the three dots) in the upper-right corner.
3. Select **Import project (zip)**. The **Import project from archive** window opens.
4. Add archives in one of the following ways:
    - drag `.zip` files into the field;
    - click **Add archive…** and select the files.
5. Wait while ArchMap works out what will be added. A summary appears under the field:
    - **New**: how many objects and relationships will be added;
    - **Coming in**: how many logic diagrams, specifications, tables, channels, parameters, and processes will be transferred;
    - **Found in project**: which objects from the archive ArchMap recognized in the project, and by what;
    - **Will appear**: which objects will be created.
6. If there are questions under the summary, answer them (see [Answer merge questions](merge-repos.md#questions)).
7. Click **Apply**. The **Archives loaded** report appears in the window.
8. Click **Done**.

::: note
If the documentation in the archive differs from the project's (for example, the same logic diagram has different text), ArchMap asks which version to keep. To resolve all such questions at once, click **Keep what's in the project** or **Take from the new archives** under the questions.
:::

::: note
If the project changed while the window was open, ArchMap recalculates the summary and asks you to review it and click **Apply** again.
:::

::: note
To update a project from an agent's YAML rather than an archive, use **Import diagram** (see [Update the diagram after code changes](sync.md)).
:::
