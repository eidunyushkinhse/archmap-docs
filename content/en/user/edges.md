---
title: View service relationships
order: 4
---

::: note
Relationships in ArchMap are directed: from the caller to the object it calls. Each relationship has a description and a technology, which together make up the arrow label, separated by a dot (for example, “Order checkout and status · REST”).
:::

## View relationships in a table

To view a service's relationships in a table, follow these steps:

1. Open the service page (see [Find service documentation](find-service.md)).
2. Scroll down to the **Relationships** section. Each row is one relationship: the caller, the callee, the description, and the technology.
3. To open the object at the other end, click its name.

![Relationships section](../images/object-edges.png "The Relationships section of a service page: caller, callee, description, and technology")

::: note
The table lists only external relationships: those between the service (or its components) and objects outside it. To see how the service's components are connected to each other, expand the service on the diagram with the magnifier (see [Navigate between diagram levels](levels.md)) or open the components' pages.
:::

::: note
The table doesn't show whether a relationship is a call that expects a response or a message sent through a broker. You can tell by the technology and by whether the relationship leads to a message broker.
:::

## View relationships on the diagram

To view a service's relationships on the diagram, follow these steps:

1. On the service page, click the diagram in the **Diagram** section to make it interactive.
2. Click the service. All of its relationships are highlighted.
3. Double-click an arrow. The relationship is highlighted from end to end, including the segments it shares with other arrows.
4. If several relationships share the line, the **Select a relationship** window opens. Choose a relationship from the list.
5. To open the object at the other end, double-click it.

::: note
Objects from other levels have a dashed frame on the diagram. You can open their pages the same way, by double-clicking.
:::

::: note
If arrow labels clutter the diagram, hide them with the button in the upper-right corner. Click it again to show them.
:::
