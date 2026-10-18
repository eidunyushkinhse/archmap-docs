---
title: Build a business process
order: 12
---

::: note
A business process is built from the architecture you've already documented. Its participants are objects from the diagram, and a message between them can only follow a relationship that exists on the diagram. This keeps processes and the diagram consistent: if a relationship is missing, you add it to the diagram first, which you can do right from the process. To see how viewers see processes, read [View a business process](../user/processes.md).
:::

## Create a process

To create a process, follow these steps:

1. Open the project and click **Processes** in the upper-right corner. The list of processes opens on the left.
2. Click **New process** above the list. An empty process appears, open in edit mode.
3. On the toolbar above the diagram, click **Participant**. The tree of diagram objects opens.
4. Select the objects that take part in the process and click **Add**. The participants appear at the top of the diagram.
5. Add messages (see [Add a message](#message)).
6. On the toolbar above the diagram, click **Done**.

::: note
A new process is called “New process”. Give it a name of its own (see [Rename a process](#rename)).
:::

::: note
To reorder participants, drag their headers left or right. The × in the corner of a header removes the participant together with its messages.
:::

## Add a message {#message}

To add a message, follow these steps:

1. Open the process and click **Edit** on the toolbar above the diagram.
2. Under the lifeline of the participant that sends the message, click the circle and drag an arrow to the receiving participant. The **Add message** window opens with the relationships between them.
3. Select what is being sent:
    - **call**: a request over a synchronous relationship;
    - **reply**: a response to a call over the same relationship;
    - **event**: a message over an asynchronous relationship (for example, through a broker).
4. Click **Add message**. The step appears at the bottom of the diagram, labeled with the relationship's description.

::: note
If there's no relationship between the participants, the window warns you and offers to describe one. To describe it, fill in **What is sent** and **Technology**, select a **Channel type**, and click **Add relationship to diagram**. The relationship appears on the diagram and in the window as a message option.
:::

::: note
The channel type (synchronous or asynchronous) belongs to the relationship and is shared by all process steps that use it. An asynchronous relationship has no replies.
:::

::: note
For an action a participant performs on itself (for example, validating an order), drag the arrow from the participant's circle back to the same participant. This step doesn't need a relationship on the diagram.
:::

## Configure a step {#step}

To change a step's label or link a logic diagram to it, follow these steps:

1. In edit mode, click the step's arrow or label. The **Scenario step** panel opens.
2. If needed, change the step's label.
3. In the **Logic diagram** field, click **Select** and find the logic diagram of the operation that performs the step. You can search by diagram name, operation, or object.
4. Click **Save**.

::: note
Viewers open the linked diagram by clicking the step's label. Steps without a logic diagram show up in **Recommendations**.
:::

::: note
To reorder steps, drag a step up or down. To delete a step, click **Delete** on the **Scenario step** panel.
:::

## Mark branches, loops, and parallel steps

To group steps into a fragment, follow these steps:

1. In edit mode, on the toolbar above the diagram, select a fragment type next to **Fragment:**:
    - **alt**: one of the branches runs;
    - **opt**: the steps run only if a condition is met;
    - **loop**: the steps repeat;
    - **par**: the steps run in parallel.
2. Drag the pointer across the rows of the steps that belong to the fragment.
3. On the fragment panel, enter the condition (for example, “payment succeeded”) and click **Add**.
4. For an **alt** fragment, add the next branch. To do this, click **+ else** in the fragment header, enter the branch condition, and click **Add**. The branch boundary appears in a free spot in the fragment. Drag it to the step where the branch begins.

::: note
You can drag a fragment's boundaries to include more or fewer steps. Fragments can be nested. To delete a fragment, click its header.
:::

## Import a process from Mermaid {#import}

To import a process, follow these steps:

1. In **Processes** mode, click **Import from Mermaid** above the process list. The import window opens.
2. Paste a Mermaid sequence diagram into the **Diagram text** field.
3. Click **Parse**. A list of the diagram's participants appears.
4. Enter a name in the **Process name** field.
5. For each participant, check which diagram object it was matched to, and select a different object if needed.
6. Click **Import**. The new process opens.

::: note
A participant that isn't matched to an object stays in the process without a diagram object. A step without a single matching relationship becomes a dangling step. Such participants and steps show up in **Recommendations**. To link a participant to an object, use the button in its header. To find relationships for dangling steps, click **Restore relationships** on the toolbar above the diagram.
:::

::: note
You can also export a process back to Mermaid (see [Export a project](../user/export.md#export-a-business-process-to-mermaid)).
:::

## Rename a process {#rename}

To rename a process, follow these steps:

1. In the process list on the left, double-click the process name. An input field replaces the name.
2. Enter a new name.
3. Press <kbd>Enter</kbd>.

::: note
The new name is also saved when you click anywhere else on the screen. To cancel renaming, press <kbd>Esc</kbd>.
:::

## Duplicate or delete a process

To duplicate or delete a process, follow these steps:

1. In the process list, hover over the process and click **···**.
2. Select **Duplicate** or **Delete**.

::: note
You can undo any change to a process with the undo buttons on the toolbar above the diagram, or with <kbd>Ctrl</kbd>+<kbd>Z</kbd> and <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Z</kbd>.
:::
