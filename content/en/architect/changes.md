---
title: Plan changes to the system
order: 13
---

::: note
An object's status shows its place in the plan of changes: **Existing** (running now), **Planned** (to be added), or **Deprecated** (to be retired). Based on these statuses, viewers can see the system as it is, as it will be, and the transition between the two (see [View planned changes](../user/changes.md)).
:::

## Mark planned changes

To mark changes, follow these steps:

1. Add the objects that will appear in the system and their relationships (see [Add objects and containers](nodes.md)).
2. Open the new object's page.
3. In the **Properties** section, select **Planned** in the **Status** row.
4. Open the page of the object that will be retired, and select **Deprecated** in the **Status** row.

::: note
You can also set the status in the diagram editor, in the object's properties panel on the right.
:::

::: note
Relationships of a new object are green on the diagram, and those of a deprecated object are red. Relationships don't have a status of their own: their color follows the status of the objects at their ends.
:::

## Check the plan

To check how the system will look after the changes, follow these steps:

1. Open a project or object page.
2. Above the diagram, select the **To be** view. Deprecated objects are dimmed.
3. Check that the diagram stays connected without the deprecated objects, that is, that the new objects have taken over their relationships.
4. Select the **As is** view and check that the current system doesn't depend on the planned objects.

::: note
The **As is** / **Transition** / **To be** switch appears only if the project has objects with the **Planned** or **Deprecated** status.
:::

## Accept the transition after rollout

::: note
Once the changes are rolled out, turn the plan into reality: new objects become existing, and retired objects are removed from the diagram.
:::

To accept the transition, follow these steps:

1. Open the diagram editor (see [Add objects and containers](nodes.md#editor)).
2. In the editor header, click **Accept transition** next to the view switch. A window opens with a list of changes.
3. Review the lists:
    - **Will become existing**: objects with the **Planned** status;
    - **Will be deleted**: objects with the **Deprecated** status;
    - **Will go along**: components of deleted objects that aren't marked as deprecated themselves.
4. Click **Accept transition**.

::: note
Accepting the transition can't be undone. Deleted objects disappear together with their components, relationships, logic diagrams, and specifications. The transition is accepted for the whole project at once, not for a single level.
:::

::: note
If you may need the old diagram, copy the project or download its archive before you accept the transition (see [Export and import a project](export-import.md)).
:::
