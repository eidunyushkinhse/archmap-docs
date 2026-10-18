---
title: Write a logic diagram for an operation or worker
order: 10
---

::: note
A logic diagram is a Mermaid flowchart that describes one service operation or one worker step by step. The **Operation** kind describes a request handler or a client scenario, and the **Worker** kind describes a background job. To see how viewers see these diagrams, read [View operation and worker logic](../user/logic.md).
:::

::: note
Where to start depends on the size of the service:
- document a small service right away, manually (see [Create a diagram manually](#manual)) or with an AI agent (see [Document logic with an AI agent](#agent));
- in a large service (for example, a monolith with hundreds of endpoints), list the operations first (see [List operations](#recon)). The list shows which operations aren't documented yet, and you can document them one at a time.
:::

## Create a diagram manually {#manual}

To create a logic diagram, follow these steps:

1. On the service page, in the **Logic** section, click **+ Add** and select **Manually**. The new diagram window opens.
2. In the **Diagram name** field, enter the name of the operation or worker (for example, “Create order”).
3. In the **Kind** list, select **Operation** or **Worker**.
4. If the diagram describes an endpoint of the service's API, enter its method and path in the **Endpoint** field (for example, `POST /orders`).
5. Write the diagram in Mermaid syntax in the code field. The preview on the right updates as you type.
6. Click **Save**. The diagram appears in the **Logic** section.

::: note
Example diagram:

```text
flowchart TD
    A["Receive cart items and address"] --> B{"No more items than the limit?<br>depends on: MAX_ITEMS_PER_ORDER"}
    B -- No --> E["422: too many items"]
    B -- Yes --> C["Save the order with status “new”<br>writes: orders, order_items"]
    C --> D["Publish the “order created” event<br>publishes: orders.events"]
    D --> F["201: order number"]
```
:::

::: note
The endpoint links the diagram to the service's OpenAPI specification. Viewers can find the diagram by its endpoint, and the **Logic** section shows the endpoint next to the diagram name (see [Add a service's OpenAPI specification](openapi.md)).
:::

::: note
A diagram name must be unique within the object.
:::

## Edit or delete a diagram

To edit a diagram, follow these steps:

1. On the service page, in the **Logic** section, click the diagram. The diagram window opens.
2. In the window header, click **Edit** and select **Manually**.
3. Change the fields or the diagram code.
4. Click **Save**.

::: note
To delete a diagram, click **Delete diagram** at the bottom of the window in edit mode and confirm the deletion. **Cancel** leaves edit mode without saving.
:::

::: note
An agent can also rewrite a diagram. To do this, select **With an AI agent** in the **Edit** menu (see [Document logic with an AI agent](#agent)).
:::

## Refer to tables, channels, and parameters {#markers}

::: note
A marker in a step's label links the diagram to facts: a database table, a broker channel, or a configuration parameter. Viewers see these markers in the **Data access** line under the diagram, and the database, broker, and service pages show which diagrams access their facts.
:::

To add a marker, follow these steps:

1. In the diagram code, add a `<br>` line break after the step's label text.
2. Write a marker keyword with a colon, followed by the name of the fact:
    - `reads:` or `writes:` and a table or column name (for example, `writes: orders.status`);
    - `publishes:` or `consumes:` and a channel name (for example, `publishes: orders.events`);
    - `depends on:` and the name of a configuration parameter of the same service (for example, `depends on: MAX_ITEMS_PER_ORDER`).
3. Save the diagram. The reference appears in the **Data access** line under the diagram, with a check mark if the fact is found or with a warning if it isn't.

::: note
Separate several names with commas: `writes: orders, order_items`. If a step both reads and writes a table, use the combined marker `reads/writes: orders`.
:::

::: note
If several databases or brokers have a table or channel with the same name, put the object name before the fact name, separated by a slash: `writes: Orders DB / orders`. Parameters are looked up only in the service itself, so `depends on:` doesn't need an object name.
:::

::: note
The name in a marker must match a table, channel, or parameter documented in the project (see [Document database structure](db.md), [Document broker channels](channels.md), [Document service configuration](config.md)). Markers that don't match any fact show up in **Recommendations** (see [Review diagram recommendations](alerts.md)). If a colon follows one of these words in ordinary text (for example, “depends on: load”), remove the colon.
:::

## List operations {#recon}

<!--@include: ../_shared/agent-beta.md-->

::: note
A list helps with large services that have dozens or hundreds of operations, because the agent can't document all of them in one run. The agent compiles the list from the code, and ArchMap creates an empty placeholder diagram for each operation. Small services don't need this step.
:::

To list the operations, follow these steps:

1. On the service page, in the **Logic** section, click **+ Add** and select **List operations**. The **List operations with an AI agent** window opens.
2. Click **Copy prompt**.
3. Start the agent in the service's repository directory, paste the prompt, and send it. The agent saves the `archmap-recon.yaml` file to the repository root.
4. Drag `archmap-recon.yaml` into the field on the right. The check appears under the field. It shows which placeholders will be created.
5. Click **Apply**. The placeholders appear in the **Not documented** block of the **Logic** section.

::: note
The agent can document the operations from the list in batches (see [Document logic with an AI agent](#agent)) or one at a time (see [Document an operation from the list](#stub)).
:::

::: note
The list doesn't delete or overwrite anything. Diagrams that are already documented stay as they are. A diagram that the agent didn't find in the code goes to the **In the documentation but not found in the code** group. If it's really obsolete, delete it manually.
:::

::: note
You can compile the list again at any time. It adds placeholders only for operations that are new in the code.
:::

## Document logic with an AI agent {#agent}

<!--@include: ../_shared/agent-beta.md-->

::: note
The agent reads the service's code and draws a diagram for each operation and each worker. If the database structures, channels, and configuration are already documented, the agent adds markers with their names to the steps (see [Document the system with an AI agent](agent-docs.md#order)).
:::

::: note
If the list of operations is already compiled, the agent takes its work from the list and fills in the placeholders. When there are many operations, the agent documents them in batches, and each new run of the window continues with the operations that aren't documented yet.
:::

To document logic with an agent, follow these steps:

1. On the service page, in the **Logic** section, click **+ Add** and select **With an AI agent**. The **Describe logic with an agent** window opens.
2. Select a mode:
    - **Batch**: the agent documents all of the service's operations and workers, or the next part of the list if one has been compiled;
    - **One diagram**: the agent documents one operation or one worker. In the **What to describe** field, enter a worker or an endpoint (for example, `POST /orders`).
3. In the **Label language** field, select the language for the step labels.
4. If needed, refine the task in the **Hints for the agent** field (for example, “document only the billing service”).
5. Click **Copy prompt**.
6. Start the agent in the service's repository directory, paste the prompt, and send it. The agent saves the diagram files to the `archmap-docs/` directory of the repository.
7. Drag the files from `archmap-docs/` into the field on the right. The check appears under the field. It shows which diagrams will be created or updated.
8. If needed, correct a diagram's name or kind in the check.
9. Click **Apply** (in **One diagram** mode, the button is called **Add**). The diagrams appear in the **Logic** section.

::: note
By default, a diagram with the same name as one already in ArchMap isn't overwritten. To replace existing diagrams with new ones, select **Update existing diagrams** before you apply.
:::

::: note
In **One diagram** mode, **Add another** applies the diagram and keeps the window open for the next operation.
:::

<!--@include: ../_shared/agent-remarks.md-->

::: note
An agent connected via MCP can also write logic diagrams. Ask it in your own words (for example, “Document the logic of the Catalog API operations in the Yarmarka project”). The agent shows you a plan and writes the diagrams to the project after you confirm (see [Connect your agent via MCP](mcp.md)).
:::

## Document an operation from the list {#stub}

To document a placeholder operation, follow these steps:

1. On the service page, in the **Logic** section, expand the **Not documented** block and click the operation. A window opens with the message **This operation isn't documented yet**.
2. Click **Document** and select **With an AI agent**. The prompt in the window is already set up for this operation.
3. Copy the prompt, run the agent in the service's repository, and add the resulting file to the window.
4. Click **Apply**. The placeholder is filled in, and the operation moves from the **Not documented** block to the **Operations** list.

::: note
You can also document an operation from the list manually. To do this, select **Manually** in the **Document** menu and write the diagram the same way as when you create one (see [Create a diagram manually](#manual)).
:::
