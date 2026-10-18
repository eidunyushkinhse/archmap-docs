---
title: Create the first administrator
order: 5
---

::: note
Right after installation, ArchMap has no accounts, and users can't sign up themselves. You create the first administrator with the `archmap-admin create-admin` server command, and the administrator then creates the other accounts in the interface (see [Create user accounts and assign roles](users.md)).
:::

## Create an administrator

To create the first administrator, follow these steps:

1. Run the command for your installation method, with the administrator's username (for example, `admin`):
    - Docker Compose (in the directory with `compose.yaml`):

        ```bash
        docker compose exec archmap archmap-admin create-admin admin
        ```

    - Kubernetes:

        ```bash
        kubectl -n archmap exec -it deploy/archmap -c archmap -- archmap-admin create-admin admin
        ```

    - server:

        ```bash
        sudo archmap-admin create-admin admin
        ```

2. Enter the password and repeat it. The command confirms that the administrator has been created.
3. Open ArchMap in your browser and sign in with this username and password.

::: note
The password must be at least 8 characters long and no longer than 72 bytes (72 Latin characters; non-Latin characters, such as Cyrillic, take two bytes each). You enter the password only in the console, so it doesn't stay in the command history.
:::

::: note
If a user with this username already exists, the command doesn't create a new one but makes the existing user an administrator: it grants them the Architect account role and unblocks them. The password stays the same.
:::

## Restore administrator access {#restore}

To restore access for an administrator who forgot their password or was blocked, follow these steps:

1. Run the `create-admin` command with `--reset-password` for your installation method (for example, on a server):

    ```bash
    sudo archmap-admin create-admin admin --reset-password
    ```

2. Enter the new password and repeat it.
3. Sign in to ArchMap with the new password.

::: note
The command makes the user an administrator, unblocks them, sets the new password, and ends the user's active sessions. An administrator resets other users' passwords in the interface (see [Reset a user's password](reset-password.md)).
:::
