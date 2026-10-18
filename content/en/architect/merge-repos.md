---
title: Merge files from several repositories into one project
order: 5
---

::: note
If the system lives in several repositories, the agent describes each repository in a separate YAML file. ArchMap merges these files into one project. Objects with the same name or the same source become one object, which collects the relationships and components from all files. Whatever ArchMap can't resolve on its own, it asks you about.
:::

## Merge files

To create a project from several files, follow these steps:

1. Copy the prompt in the **New project** window with **AI agent** selected (see [Import a diagram an agent built from code](import-agent.md)).
2. Run the agent with this prompt in each of the system's repositories. Save the YAML file from each run.
3. In the **New project** window, add all the files to the field on the right in one of the following ways:
    - drag all the files into the field at once;
    - click **Upload files…** and select several files;
    - paste the text of the first file into the field, then click **+** above the field and paste the next one.
4. Wait for the check to finish. If **Not everything matched perfectly** appears, answer the questions under it (see [Answer merge questions](#questions)).
5. Click **Create project**, and then **Open project**.

::: note
Each file has its own tab above the field, showing its number and name. Click a tab to view the file, or click × on the tab to remove the file.
:::

::: note
The prompt is the same for all repositories. It sets naming rules, so the same object gets the same name in different files. Don't change the system name between runs.
:::

## Answer merge questions {#questions}

To answer the merge questions, follow these steps:

1. Under **Not everything matched perfectly**, find the **Can't merge without your decisions** block. It shows the first question.
2. If it isn't clear why the question came up, expand **why this question came up** under it.
3. Select an answer.
4. Click **Next →**. On the last question, the button is called **Finish →**.
5. When there are no more questions, the block shows a summary: **Review complete** or **N questions left unanswered**.

::: note
None of the questions is required, and **Create project** is always available. Each question has an **If you don't answer, …** footnote that tells you what ArchMap will do without your answer.
:::

::: note
**← Back** takes you to the previous question, and **All questions** shows the full list with your answers. In the summary, **Back to skipped** and **Review answers** reopen the questions. Your answers are kept whichever way you navigate.
:::

::: note
The questions are of the following kinds:
- **different field values**: the same object has a different description, technology, role, type, or status in different files. Select the correct value;
- **relationship to a container**: one file describes a service's components, while in another file a relationship leads to the service itself. Select the component the object is actually connected to, or **Keep on container “…”**;
- **objects without relationships**: a group of objects isn't connected to the rest of the diagram. Select **Draw a relationship** and specify what each object is connected to, or select **Leave as is**;
- **similar names**: two objects have almost the same name (for example, “Order Service” and “Orders Service”). Select **One object** and set the name of the merged object, or select **Different objects**;
- **different contents**: when importing archives, the same logic diagram, specification, table, channel, or parameter is described differently. Select a version; for logic diagrams, you can also select **Add all**.
:::

::: note
ArchMap never adds relationships or merges objects on its own, only based on your answers. Nothing from the files is deleted.
:::

::: note
Inconsistencies that a single answer can't resolve are listed under the questions in the **Needs manual fixes** list. To expand the list, click its title. Fix these inconsistencies in the project after you create it.
:::
