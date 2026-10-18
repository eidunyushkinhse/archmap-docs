---
title: Document service configuration
order: 9
---

::: note
A service's configuration parameters (environment variables, flags, and settings) are documented in the **Configuration** section of the service page. Changes in the section are saved when you leave the field.
:::

::: note
ArchMap stores only a parameter's default value from the code. It doesn't store values for specific environments, such as test or production. Don't put passwords, tokens, or other secrets in the documentation.
:::

## Describe a parameter manually {#param}

To describe a parameter, follow these steps:

1. On the service page, in the **Configuration** section, click **+ Parameter** and select **Manually**. A new parameter appears.
2. Enter the parameter name exactly as it appears in the code (for example, `MAX_ITEMS_PER_ORDER`).
3. Enter the value type (for example, `int`, `bool`, or `duration`).
4. If the service won't start without the parameter, select **req.**.
5. Enter the default value from the code.
6. Describe what the parameter controls.

::: note
A parameter belongs to a service. If two services have the same parameter, describe it for each of them, because its purpose and default value may differ.
:::

::: note
ArchMap builds the **used by:** line of a parameter from the `depends on:` markers in the steps of the same service's logic diagrams (see [Refer to tables, channels, and parameters](logic.md#markers)).
:::

## Describe the configuration with an AI agent {#agent}

<!--@include: ../_shared/agent-beta.md-->

::: note
The agent looks for every place where the service's code reads configuration: environment variables, settings classes, and command-line flags. It completes the list with declarations from `.env.example`, docker-compose, Helm charts, and Kubernetes manifests. The agent describes a parameter's purpose by what the parameter changes in the code.
:::

::: note
The agent doesn't copy parameter values. From files with secrets (for example, `.env` or a Kubernetes Secret), it takes only the parameter names, and it records a default value only if one is set in the code.
:::

To document a service's configuration with an agent, follow these steps:

1. On the service page, in the **Configuration** section, click **+ Parameter** and select **With an AI agent**. The **Describe configuration with an AI agent** window opens.
2. Click **Copy prompt**.
3. Start the agent in the service's repository directory, paste the prompt, and send it. The agent saves its files to the `archmap-docs/` directory of the repository.
4. Add the files from `archmap-docs/` to the window in one of the following ways:
    - drag the files into the field on the right;
    - click **Upload files…** and select the files;
    - click **+ paste from clipboard** and paste the file's text.

    The check appears under the field. It shows which parameters will be written.
5. Click **Apply**. The window closes, and the parameters appear in the **Configuration** section.

::: note
If the repository contains several services, the agent creates a separate file for each and writes the service's address on the file's first line (for example, `# archmap-node: Yarmarka Marketplace / Order Service`). Parameters from a file without this line go to the service whose page you opened the window from.
:::

::: note
By default, parameters that are already documented stay as they are, and the agent only adds new ones. To replace parameters that have the same names with the descriptions from the files, select **Overwrite filled fields** before you apply. Other parameters are kept with any setting.
:::

::: note
This window doesn't record which logic diagram steps depend on a parameter. That's what the `depends on:` markers in logic diagrams are for, so it's best to document the configuration before the logic (see [Document the system with an AI agent](agent-docs.md#order)).
:::

<!--@include: ../_shared/agent-remarks.md-->

::: note
An agent connected via MCP can also document the configuration. Ask it in your own words (for example, “Document the configuration of the Order Service in the Yarmarka project from this repository”). The agent shows you a plan and writes the parameters to the project after you confirm (see [Connect your agent via MCP](mcp.md)).
:::
