---
title: View planned system changes
order: 12
---

::: note
An architect sets an object's status: **Existing**, **Planned** (the object will appear), or **Deprecated** (the object will be taken out of service). Based on these statuses, the diagram shows the system as it is now, after the changes, and the transition between them.
:::

## Find out an object's status

To find out whether an object is affected by planned changes, follow these steps:

1. On the diagram, find an object with a label above its name:
    - a green object labeled **new** is planned;
    - a red object labeled **deprecated** is being taken out of service.
2. Open the object page. In the **Properties** section, the **Status** row shows its status.

::: note
The relationships of a planned object are green on the diagram, and those of a deprecated object are red.
:::

## Switch the diagram view

To see the system before or after the changes, follow these steps:

1. Above the diagram on the project, object, or process page, select a view:
    - **As is**: what works now, including deprecated objects;
    - **Transition**: all objects at once; this view is selected by default;
    - **To be**: the target system without deprecated objects.
2. Look at the diagram. Objects that are not part of the selected view stay in place but become pale.

![Transition view](../images/changes-transition.png "Components of the Notification Service in the Transition view: SMS Sender is deprecated")

::: note
The view switch appears only if the project has planned or deprecated objects.
:::

::: note
In a business process, the view likewise dims the steps whose participants are not part of the selected view.
:::

::: note
The selected view is remembered separately for each project in this browser.
:::
