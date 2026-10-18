---
title: Review diagram recommendations
order: 15
---

::: note
ArchMap checks the project and suggests what else you could add: objects without relationships, relationships that lead to a container instead of a component, markers in logic diagrams that refer to undocumented facts, process steps without documentation, and more. Architects who can edit the project see the recommendations.
:::

## Open the recommendations

To open the recommendations, follow these steps:

1. Open the project page or the editor.
2. Click **Recommendations** (the light bulb):
    - on the project page, it's on the right side of the header;
    - in the editor, it's in the upper-right corner of the canvas.

    The **Recommendations** panel opens, with a section for each kind of recommendation.
3. Click an item in the panel. ArchMap shows what the recommendation refers to:
    - an object opens on its page (in the editor, it's selected on the diagram);
    - a relationship or a group of objects is highlighted in the editor;
    - a business process opens in **Processes** mode.
4. Fix what the recommendation points to (see [What the recommendations mean](#kinds)). The item disappears from the panel.

::: note
A dot in the corner of the **Recommendations** button means there are recommendations. If there are none, the panel shows **No recommendations. The diagram is fully documented.**
:::

::: note
Recommendations are optional. If you think the diagram is right as it is (for example, an object without relationships is there for reference), you can leave the recommendation as is.
:::

## What the recommendations mean {#kinds}

### Diagram

| Recommendation | What it means | How to fix it |
|---|---|---|
| **Objects without relationships** | The object isn't part of any relationship. | Add relationships (see [Add relationships between objects](edges.md)) or delete the object if you don't need it. |
| **Relationships to a container** | The relationship leads to a whole container instead of one of its components. | Move the end of the relationship to a component (see [Edit or delete a relationship](edges.md#edit)). |
| **Relationships to own component** | The relationship connects an object to one of its own components, although the nesting is already visible in the tree. | Delete the relationship or move it to another object. |
| **Isolated groups** | The diagram has split into several groups of objects that aren't connected to each other. This usually means a relationship between the groups is missing. | Add the missing relationship (see [Add relationships between objects](edges.md)). |
| **Persons inside a container** | An object with the **Person** shape is nested in a service, although people are outside the system. | Move it to the root level (see [Move an object to another container](nodes.md#move)). |

### Documentation

| Recommendation | What it means | How to fix it |
|---|---|---|
| **Containers with their own documentation** | A container still has its own logic diagrams or OpenAPI specification, although documentation should belong to its components. | On the container page, click **Distribute to components** and move the documentation to the components. |
| **References to undocumented data** | A `reads:` or `writes:` marker in a logic diagram refers to a table or column that isn't in any database structure. | Fix the name in the marker or document the table (see [Document database structure](db.md)). If several databases have a table with this name, specify the database explicitly (for example, `writes: Orders DB / orders`). |
| **References to undocumented channels** | A `publishes:` or `consumes:` marker refers to a channel that none of the project's brokers has. | Fix the name in the marker or document the channel (see [Document broker channels](channels.md)). If several brokers have a channel with this name, specify the broker explicitly (for example, `publishes: Kafka / orders.events`). |
| **References to undocumented parameters** | A `depends on:` marker refers to a parameter that isn't in the service's configuration. | Document the parameter (see [Document service configuration](config.md)). If it's ordinary text rather than a marker, remove the colon. |
| **Broker relationships without a channel** | A relationship with a broker has no channel, or its channel isn't one of the broker's channels. | Enter the topic or queue in the relationship's **Channel** field (see [Edit or delete a relationship](edges.md#edit)) or document the channel on the broker (see [Document broker channels](channels.md)). |
| **Objects with undocumented logic** | The object has operations from the list that aren't documented yet. | Document them (see [Document an operation from the list](logic.md#stub)) or delete the placeholders you don't need. |

### Business processes

| Recommendation | What it means | How to fix it |
|---|---|---|
| **Undocumented messages** | The relationship that a process step used has been removed from the diagram. | In the process, click **Restore relationships** on the toolbar above the diagram, or delete the step. |
| **Reply on an asynchronous channel** | A reply step uses an asynchronous relationship, which can't have replies. | On the **Scenario step** panel, select **Synchronous** in the **Channel type** field, or delete the step. |
| **Undocumented participants** | A process participant isn't matched to any object on the diagram. | Click **link** in the participant's header and select an object. |
| **Steps without a logic diagram** | No logic diagram is linked to a process step. | Link one on the **Scenario step** panel (see [Configure a step](processes.md#step)). |
