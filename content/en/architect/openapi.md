---
title: Add a service's OpenAPI specification
order: 11
---

::: note
An OpenAPI specification describes a service's HTTP API. A service has one specification. You can add it only to a service without components, because a container's **OpenAPI** section collects the specifications of its components.
:::

## Add a specification manually

To add a specification, follow these steps:

1. On the service page, in the **OpenAPI** section, click **+ Add** and select **Manually**. The specification window opens in edit mode.
2. Paste the specification text in YAML or JSON format. Its preview appears on the right.
3. Click **Save**. The **Specification** row appears in the **OpenAPI** section.

::: note
An invalid specification is saved too, but the preview doesn't update until the text is valid.
:::

## Get a specification from an agent {#agent}

<!--@include: ../_shared/agent-beta.md-->

To get a specification from an agent, follow these steps:

1. On the service page, in the **OpenAPI** section, click **+ Add** and select **With an AI agent**. The specification window opens with the prompt on the left and a field for the file on the right.
2. Copy the prompt and start the agent in the service's repository directory. The agent finds the specification in the repository or composes it from the code, and saves the file to the `archmap-docs/` directory.
3. Drag the specification file into the field on the right.
4. Click **Apply**.

::: note
If the repository already has a specification file, the agent copies it as is instead of retelling it.
:::

<!--@include: ../_shared/agent-remarks.md-->

## Edit or delete a specification

To edit a specification, follow these steps:

1. On the service page, in the **OpenAPI** section, click **Specification**. The specification window opens.
2. In the window header, click **Edit** and select one of the following:
    - **Manually**, to correct the text;
    - **With an AI agent**, to replace the specification with a new one from the agent.
3. Make your changes and click **Save** (in the agent window, the button is called **Apply**).

::: note
To delete a specification, clear its text in **Manually** mode and save.
:::

## Link an endpoint to a logic diagram

To link an endpoint of the specification to a logic diagram, follow these steps:

1. Open the logic diagram that describes how the endpoint is handled, and switch to edit mode (see [Write a logic diagram for an operation or worker](logic.md)).
2. In the **Endpoint** field, enter the method and path exactly as in the specification (for example, `POST /orders`).
3. Click **Save**.

::: note
If a container still has a specification of its own (for example, one added before the service got components), a warning appears in the **OpenAPI** section. Move the specification to a component with **Distribute to components**.
:::
