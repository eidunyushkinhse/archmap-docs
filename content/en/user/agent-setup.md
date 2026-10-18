---
title: Connect an AI agent to ArchMap
order: 15
---

::: note
An AI agent (Claude Code, Claude Desktop, or any other agent that supports MCP) works with ArchMap through the ArchMap MCP server. The server runs on your computer alongside the agent and connects to ArchMap with your account. To install it, you need git and Python 3.11 or later.
:::

## Install the MCP server

To install the MCP server, follow these steps:

1. Clone the ArchMap repository:

    ```bash
    git clone https://github.com/eidunyushkinhse/archmap.git
    ```

2. Go to the `archmap/mcp` directory and install the server's dependencies:

    ```bash
    cd archmap/mcp
    python3 -m venv venv
    ./venv/bin/pip install -r requirements.txt
    ```

::: note
On Windows, create the virtual environment with `python -m venv venv`, and then install the dependencies with `venv\Scripts\pip install -r requirements.txt`.
:::

## Configure your account

To configure your account, follow these steps:

1. In the `mcp` directory, copy `.env.example` to `.env`.
2. In `.env`, set the following parameters:
    - `ARCHMAP_URL`: the address you use to open ArchMap in your browser, without a path (for example, `https://archmap.example.com`);
    - `ARCHMAP_USERNAME` and `ARCHMAP_PASSWORD`: your ArchMap username and password.

::: note
Git ignores the `.env` file. Don't put your password in the agent's configuration: that file may end up in a repository.
:::

## Connect the server to the agent

To connect the MCP server to the agent, follow these steps:

1. Open the agent's MCP configuration file:
    - for Claude Code, `.mcp.json` in the directory where you start the agent;
    - for Claude Desktop, `claude_desktop_config.json`.
2. Add the `archmap` server to the file, replacing `/path/to/archmap/mcp` with the full path to the `mcp` directory:

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

3. Restart the agent. If it asks for permission to start the `archmap` server, allow it.
4. To check the connection, ask the agent to list your ArchMap projects. It replies with the projects available to your account and your role in each.

::: note
On Windows, set `command` to the path to `venv\Scripts\python.exe`.
:::

::: note
If ArchMap uses HTTPS with a certificate issued by an internal certificate authority, add `SSL_CERT_FILE` with the path to the root certificate file (for example, `/etc/ssl/certs/ca-certificates.crt`) to the `env` block. If you connect through a proxy, add the ArchMap address to `NO_PROXY` in the same block.
:::

::: note
The agent has the same access in ArchMap as your account. If you're a reader, the agent can't change anything in the project: ArchMap rejects any edit with **Insufficient permissions**.
:::

::: note
You can't connect an agent to the demo site: signing in with a username and password is disabled there.
:::
