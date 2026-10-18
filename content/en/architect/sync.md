---
title: Update the diagram after code changes
order: 14
---

<!--@include: ../_shared/agent-beta.md-->

::: note
When new services and relationships appear in the code or old ones disappear, you can update the diagram with the same AI agent that built it. ArchMap compares the agent's answer with the diagram, shows a plan of changes, and writes it only after you confirm. Object positions, logic diagrams, specifications, and business processes stay in place, and ArchMap doesn't delete objects with any settings.
:::

## Copy the task for the agent

To copy the task for the agent, follow these steps:

1. Open the project page or the editor.
2. Click **Diagram actions** (the three dots) in the upper-right corner. A menu opens.
3. Select **Import diagram**. The **Update from repository** window opens.
4. On the left, in the **Description language** list, select the language for the agent's descriptions.
5. If needed, briefly describe what to take into account in the **Hints for the agent** field (for example, “ignore the legacy/ directory”).
6. Click **Copy task for the agent**. The button label changes to **Copied**.

::: note
Only architects who can edit the project see **Import diagram**.
:::

## Get the YAML from the agent

To get the YAML from the agent, follow these steps:

1. Start the AI agent in the system's repository directory.
2. Paste the task into the agent and send it. The agent analyzes the repository and outputs the diagram as YAML.
3. Save the agent's answer to a file with the `.yaml` extension, or copy its text.
4. If the system lives in several repositories, repeat steps 1–3 in each of them with the same task.

::: note
The task is the same for all repositories, and the system name is already in it. The agent records each object's source (code or dependency name), which lets ArchMap recognize the object even if the service has been renamed (see [Find a service's source code](../user/source.md)).
:::

## Review and apply the plan

To apply the changes to the diagram, follow these steps:

1. In the **Update from repository** window, add the YAML on the right in one of the following ways:
    - drag the files into the field (one file per repository);
    - click **Upload files…** and select the files;
    - click **Paste text** and paste the YAML into the **Paste the agent's YAML here** field.
2. Wait while ArchMap compares the YAML with the diagram. A summary and a plan of changes, grouped as follows, appear under the field:
    - **New objects** and **New relationships**: will be added to the diagram;
    - **Changed objects**: each shows which fields will change and how the object was matched;
    - **Back in YAML**: objects with the **Deprecated** status that are in the code again;
    - **Missing from YAML** and **Missing relationships**: objects and relationships that are no longer in the code.
3. Review the remarks under the plan, if any: **Worth noting** and **Worth a visual check**.
4. If needed, turn update settings on or off (see [Update settings](#options)). The plan is recalculated immediately.
5. Click **Apply**. The window closes, and a summary appears at the bottom of the screen (for example, “Diagram updated: 2 created, 3 updated”).

::: note
**Nothing to apply. The diagram already matches the YAML** in the summary means that the diagram in the code hasn't changed since the last update.
:::

::: note
If the file has an error, the **Can't read the YAML** block with a description of the error appears instead of the plan. Send this text to the agent in the same session, and the agent fixes the file and outputs it again.
:::

::: note
If the diagram was changed in another window or by another user while this window was open, ArchMap doesn't write the changes and asks you to reopen the window. This way, the plan always reflects the current diagram.
:::

## Update settings {#options}

By default, the update is cautious: it adds what's new and leaves everything you may have edited manually as it is. You can turn on each of the following settings with a check box in the **Update from repository** window:

- **Replace descriptions**: object descriptions are replaced with the ones in the YAML. Manual edits to descriptions are lost.
- **Rename objects**: objects get the names from the YAML. Without this setting, names stay as they are, and the plan shows the difference.
- **Update service internals**: the update covers not only services and databases but also their components.
- **Mark what's missing from the YAML as deprecated**: objects that have disappeared from the code get the **Deprecated** status and turn gray on the diagram (see [Plan changes to the system](changes.md)).
- **Restore what reappears**: objects that are back in the code lose the **Deprecated** status.
