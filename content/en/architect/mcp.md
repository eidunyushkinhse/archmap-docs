---
title: Connect your agent via MCP
order: 20
---

<!--@include: ../_shared/agent-beta.md-->

::: note
An AI agent connected to ArchMap via MCP not only answers questions about the documentation but also writes it. It builds the diagram from the code, updates it, documents logic diagrams, database structures, channels, and configuration, and links process steps. You don't have to carry YAML files and agent packages over to ArchMap windows by hand. To learn how to connect an agent, see [Connect an AI agent to ArchMap](../user/agent-setup.md).
:::

## Have the agent document the system

To have the agent change the documentation in ArchMap, follow these steps:

1. Connect the agent with a token that doesn't have **Read-only** selected (see [Connect an AI agent to ArchMap](../user/agent-setup.md)).
2. Start the agent in the system's repository directory.
3. Describe the task in your own words and name the project. For example:
    - “Build a diagram of the system from this repository and create a project called Yarmarka”;
    - “Update the Yarmarka project's diagram from the latest code”;
    - “Document the logic of the Catalog API operations in the Yarmarka project”;
    - “Document the structure of the catalog database in the Yarmarka project”.
4. Review the plan of changes that the agent shows you. It lists what will be created, changed, or marked as deprecated.
5. Confirm the plan. The agent writes the changes to the project.
6. Check the result in ArchMap and review any recommendations that appear (see [Review diagram recommendations](alerts.md)).

::: note
Before writing anything, the agent gets a plan of changes from ArchMap and only then applies it. If the agent didn't show you the plan, ask it to show the plan before applying.
:::

::: note
The agent takes its formatting rules from ArchMap itself. These are the same prompts that the **New project** and **Update from repository** windows and the logic and facts windows give you, so the result is the same as when you carry the files over by hand (see [Import a diagram an agent built from code](import-agent.md), [Document the system with an AI agent](agent-docs.md)).
:::

::: note
The agent can edit only projects where you're the owner or an editor, and it can create a new project only if you have the Architect account role. The agent can't delete anything. It marks whatever has disappeared from the code as **Deprecated**, and you can delete such objects with **Accept transition** (see [Plan changes to the system](changes.md)). The agent can't manage the project or its members either.
:::

::: note
The agent has access to the same recommendations that the **Recommendations** panel shows. You can ask it to find and fill gaps (for example, “find references to undocumented tables in the Yarmarka project and document them”).
:::

## Connect a local MCP server for archives

::: note
An agent connected by URL has no access to the disk, so it can't download a project archive, create a project from an archive, or load an archive into a project. For these tasks, connect the local ArchMap MCP server. It runs on the agent's computer and reads and writes archives on its disk. Otherwise, it works the same way as the server at the URL.
:::

To connect the local MCP server, follow these steps:

1. Make sure Python 3.11 or later and git are installed on the computer.
2. Clone the ArchMap source code and install the MCP server:

    ```bash
    git clone https://github.com/eidunyushkinhse/archmap.git
    cd archmap/mcp
    python3 -m venv venv
    ./venv/bin/pip install -r requirements.txt
    ```

3. Create the `mcp/.env` settings file from the template:

    ```bash
    cp .env.example .env
    ```

4. In `mcp/.env`, set the ArchMap address and a token (see [Issue a token](../user/agent-setup.md#issue-a-token)):

    ```bash
    ARCHMAP_URL=https://archmap.example.com
    ARCHMAP_TOKEN=archmap_...
    ```

5. Add the server to the agent's MCP settings file, with the full path to the `mcp` directory:

    ```json
    {
      "mcpServers": {
        "archmap": {
          "command": "/full/path/archmap/mcp/venv/bin/python",
          "args": ["-m", "archmap_mcp.server"],
          "env": {
            "PYTHONPATH": "/full/path/archmap/mcp"
          }
        }
      }
    }
    ```

6. Restart the agent and ask it to list your ArchMap projects.

::: note
Keep the token only in `mcp/.env`, because git ignores this file. Don't put the token in the agent's settings file if that file is in a repository.
:::

::: note
If ArchMap uses HTTPS with a certificate from an internal certificate authority, set the root certificate file in the `SSL_CERT_FILE` variable in the `env` block of the agent's settings (for example, `/etc/ssl/certs/ca-certificates.crt`).
:::

::: note
To make the agent save archives only to one directory, set it in the `ARCHMAP_EXPORT_DIR` variable in `mcp/.env` (for example, `ARCHMAP_EXPORT_DIR=~/archmap-exports`).
:::
