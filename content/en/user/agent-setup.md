---
title: Connect an AI agent to ArchMap
order: 15
---

::: note
An AI agent (Claude Code, Claude Desktop, or another agent with MCP support) works with ArchMap through the MCP server. The server runs on your computer next to the agent and accesses ArchMap on behalf of your account. To install it, you need git and Python 3.11 or later.
:::

## Install the MCP server

To install the MCP server, follow these steps:

1. Download the ArchMap repository:

    ```bash
    git clone https://github.com/eidunyushkinhse/archmap.git
    ```

2. Go to the `archmap/mcp` folder and install the server's dependencies:

    ```bash
    cd archmap/mcp
    python3 -m venv venv
    ./venv/bin/pip install -r requirements.txt
    ```

::: note
On Windows, create the virtual environment with `python -m venv venv` and install the dependencies with `venv\Scripts\pip install -r requirements.txt`.
:::

## Specify your account

To specify your account, follow these steps:

1. In the `mcp` folder, copy the `.env.example` file to `.env`.
2. In the `.env` file, fill in the parameters:
    - `ARCHMAP_URL`: the address at which ArchMap opens in the browser, without a path (for example, `https://archmap.example.com`);
    - `ARCHMAP_USERNAME` and `ARCHMAP_PASSWORD`: your ArchMap username and password.

::: note
The `.env` file is not tracked by git. Do not put the password in the agent's configuration: its file may end up in a repository.
:::

## Connect the server to the agent

To connect the MCP server to the agent, follow these steps:

1. Open the agent's MCP server configuration file:
    - for Claude Code, it is the `.mcp.json` file in the folder from which you start the agent;
    - for Claude Desktop, it is the `claude_desktop_config.json` file.
2. Add the `archmap` server to the file. Replace `/path/to/archmap/mcp` with the full path to the `mcp` folder:

    ```json
    {
      "mcpServers": {
        "archmap": {
          "command": "/path/to/archmap/mcp/venv/bin/python",
          "args": ["-m", "archmap_mcp.server"],
          "env": {
            "PYTHONPATH": "/path/to/archmap/mcp"
          }
        }
      }
    }
    ```

3. Restart the agent. If the agent asks for permission to start the `archmap` server, allow it.
4. Check the connection. To do this, ask the agent to show the list of ArchMap projects. The agent replies with the projects available to your account and your role in each.

::: note
On Windows, in the `command` parameter, specify the path to `venv\Scripts\python.exe`.
:::

::: note
If ArchMap is served over HTTPS with a certificate from an internal certificate authority, add the `SSL_CERT_FILE` parameter with the path to the root certificate file (for example, `/etc/ssl/certs/ca-certificates.crt`) to the `env` block. If network access goes through a proxy, add the ArchMap address to the `NO_PROXY` parameter in the same block.
:::

::: note
The agent sees in ArchMap the same things as your account. With the reader role, the agent changes nothing in the project: ArchMap rejects an edit attempt with **Insufficient permissions**.
:::

::: note
You cannot connect an agent to the demo site: signing in with a username and password is disabled there.
:::
