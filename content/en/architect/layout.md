---
title: Adjust a level's layout
order: 16
---

::: note
When a level is opened for the first time, ArchMap lays out the objects and routes the arrows between them. After that, you can adjust the layout manually, and your layout is saved for everyone who opens the project. ArchMap redraws the arrows and relationship labels itself based on where the objects are.
:::

## Move objects

To move objects, follow these steps:

1. Open the level's diagram in one of the following ways:
    - in the diagram editor (see [Open the diagram editor](nodes.md#editor));
    - on the project page or an object page.
2. Drag the object to the new position with the left mouse button. Green guides show that the object is centered on a neighbor, and pink ones show that the gaps between objects are equal.
3. To move several objects at once, select them in one of the following ways:
    - drag a selection frame over them with the left mouse button, starting from an empty area of the canvas;
    - click the objects while holding <kbd>Ctrl</kbd> (<kbd>⌘</kbd> on a Mac).

    Then drag any of the selected objects.

::: note
To pan the canvas, use the right mouse button, because the left button selects objects with a frame for architects.
:::

::: note
You can nudge a selected object with the arrow keys: by 5 pixels, or by 20 with <kbd>Shift</kbd>.
:::

::: note
You can undo a move like any other edit: with <kbd>Ctrl</kbd>+<kbd>Z</kbd> or **Undo** in the upper-left corner of the diagram (see [Undo an action](nodes.md#undo)).
:::

::: note
The diagram on an object page has its own layout, separate from the level in the editor. Objects you move on the page don't move in the editor, and vice versa.
:::

::: note
You can't shape arrows manually. If an arrow is routed awkwardly, move the objects it connects.
:::

## Expand a container on the diagram

To show a container's components right on the level, follow these steps:

1. Find a container on the diagram. Containers have an **Expand contents** magnifier.
2. Click the magnifier. The container turns into a frame with its components inside.
3. If needed, move the components inside the frame.
4. To hide the components, click **Collapse** in the corner of the frame.

::: note
Expanded containers are saved in the layout, so they're still expanded the next time you open the level. Readers see the diagram with containers collapsed and expand them themselves.
:::

## Re-lay out a level

::: note
If manual edits have made the diagram messy, you can return the level to the automatic layout.
:::

To re-lay out a level, follow these steps:

1. Open the level in the editor, or the diagram on a project or object page.
2. Click **Re-lay out level**:
    - in the editor, it's on the right side of the header;
    - on a page, it's in the upper-right corner of the diagram.

    A confirmation window opens.
3. Click **Yes, re-lay out**. ArchMap lays out the level's objects again.

::: note
Re-laying out a level can't be undone. All manual position changes on this level are lost, and the editor's undo history is cleared. Expanded containers stay expanded, and their components are laid out again. Other levels don't change.
:::
