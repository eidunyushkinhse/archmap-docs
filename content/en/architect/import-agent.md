---
title: Import a diagram an agent built from code
order: 4
---

<!--@include: ../_shared/agent-beta.md-->

::: note
ArchMap can build a system diagram from the system's source code. ArchMap gives you a prompt, you run your AI agent (for example, Claude Code or Qwen Code) with it in the system's repository, and the agent analyzes the code and returns a YAML file. ArchMap creates the project from this file.
:::

## Copy the prompt

To copy the prompt for the agent, follow these steps:

1. On the **Projects** screen, click **New project**. The **New project** window opens.
2. Select **AI agent**.
3. On the right, enter the system name in the **Name** field. The agent describes the system under this name, and the project gets the same name.
4. In the **Description language** list, select the language for the agent's descriptions of objects and relationships.
5. If needed, briefly describe how the repository is organized in the **Hints for the agent** field (for example, “monorepo, services in services/*”).
6. Click **Copy prompt**. The button label changes to **Prompt copied ✓**.

::: note
**Copy prompt** stays disabled until you fill in the **Name** field.
:::

::: note
If your browser doesn't allow copying, a field with the prompt appears under the button. Select the text in the field and copy it manually.
:::

## Run the agent

To get the YAML from the agent, follow these steps:

1. Start the AI agent in the system's repository directory.
2. Paste the prompt into the agent and send it. The agent analyzes the repository and outputs the diagram as YAML.
3. Save the agent's answer to a file with the `.yaml` extension, or copy its text.

::: note
The prompt is designed for agents that can run subagents: one subagent builds the diagram, and another checks it against the code, so you get a file that has already been reviewed. If the agent doesn't support subagents, it stops and tells you so.
:::

::: note
If the system lives in several repositories, run the agent with the same prompt in each of them. You get one YAML file per repository, and ArchMap merges them into one project (see [Merge files from several repositories into one project](merge-repos.md)).
:::

::: note
You can close the **New project** window while the agent is working. Later, open it again, select **AI agent**, and enter the same name.
:::

## Create a project from YAML {#create}

To create a project from the agent's file, follow these steps:

1. In the **New project** window, with **AI agent** selected, add the YAML to the field on the right in one of the following ways:
    - drag the file into the field;
    - click **Upload files…** and select the file;
    - paste the YAML text into the field.
2. Wait for the check to finish. One of the following lines appears under the field:
    - **Ready to import**: the file has been parsed, and you can create the project;
    - **Not everything matched perfectly**: there are questions or remarks below that you can resolve before creating the project;
    - **Something went wrong**: the file has an error, and the project can't be created.
3. Click **Create project**. A report replaces the field, showing how many objects and relationships were created.
4. Click **Open project**. The new project's page opens.

::: note
If the check finds an error, the **Something went wrong** line shows the line number and what's wrong. Send this text to the agent in the same session. When the agent outputs the fixed file, replace the text in the field with it.
:::

::: note
Questions appear under the status line when the files disagree with each other or when ArchMap can't resolve something on its own. None of the questions is required. If you don't answer, the project is created as described in the **If you don't answer, …** footnote under each question (see [Merge files from several repositories into one project](merge-repos.md#questions)).
:::

## Review the draft

::: note
The agent's diagram is a draft: the agent may have missed a relationship or named an object differently from your team's conventions.
:::

To review the draft, follow these steps:

1. Open the project page and go through the diagram level by level (see [Navigate between diagram levels](../user/levels.md)).
2. In the page header, click **Recommendations** (the light bulb). A panel opens with suggestions for what to add to the diagram: objects without relationships, relationships that lead to a container instead of a component, and more (see [Review diagram recommendations](alerts.md)).
3. Fix the diagram in the editor (see [Add objects and containers](nodes.md), [Add relationships between objects](edges.md)).

::: note
When the code changes, you can update the diagram the same way without losing your manual edits (see [Update the diagram after code changes](sync.md)).
:::

::: note
Building the diagram is only the beginning. The agent adds logic diagrams, database structures, broker channels, and configuration parameters with separate prompts (see [Document the system with an AI agent](agent-docs.md#order)).
:::
