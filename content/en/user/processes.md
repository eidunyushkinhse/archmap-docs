---
title: View a business process
order: 11
---

::: note
A business process shows, step by step, how services interact in one scenario (for example, when an order is paid): who calls whom, what they reply, and what events they publish. A process is drawn as a sequence diagram: the participants are at the top, and the steps go from top to bottom.
:::

## Open a process

To open a business process, follow these steps:

1. Open the project (see [Find a project and explore the system](find-project.md)).
2. In the upper-right corner, click **Processes**. The list of the project's processes opens on the left.
3. Click a process in the list. Its diagram appears on the right.

![Business process](../images/process-view.png "The Order payment process: participants at the top, steps in numbered order")

::: note
You can also open a process from other pages:
- on the project page, in the **Business processes** section;
- on a service page, in the **Participates in processes** section;
- in a logic diagram window, in the **Used in processes** line.

The **Objects** button in the upper-right corner returns you to the system diagram.
:::

## Read the diagram

To read a process diagram, follow these steps:

1. Follow the steps in numbered order. The arrow style shows the type of step:
    - solid line with a filled arrowhead: a call;
    - dashed line: a reply to a call;
    - solid line with an open arrowhead: an event (for example, publishing a message to a broker).
2. On the diagram, open the logic diagram of a step. To do this, click its underlined label. A window opens with the logic diagram of the operation that performs the step (see [View the logic of an operation or worker](logic.md)).
3. Above the diagram, open the page of a participant. To do this, hover over its name and click the arrow that appears. The object page opens.

::: note
A step label without an underline does not open: no logic diagram is bound to the step.
:::

::: note
A frame with a label in its upper-left corner groups steps that run by a special rule:
- **alt**: one of the branches runs; the condition of each branch is written in the frame;
- **opt**: the steps run only if the condition is met;
- **loop**: the steps repeat;
- **par**: the steps run in parallel.
:::

::: note
A step crossed out in red disagrees with the system diagram:
- **relationship removed**: the relationship the step used no longer exists;
- **no reply expected**: the step describes a reply, but the relationship has become asynchronous and expects no reply.
:::

::: note
The **scope** label next to the process name shows within which part of the system the process is described. **Whole diagram** means that the process covers the entire project.
:::

::: note
If planned or deprecated objects take part in the process, an **As is** / **Transition** / **To be** switch appears above the diagram (see [View planned system changes](changes.md)).
:::
