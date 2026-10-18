---
title: Install ArchMap with Docker Compose
order: 1
---

::: note
Docker Compose is the quickest way to run ArchMap on a single machine: ArchMap and PostgreSQL run in two containers. You need Docker with Compose v2, git, and internet access, because the image is built from source, and Node.js and Python are installed during the build.
:::

## Start ArchMap

To install and start ArchMap, follow these steps:

1. Clone the ArchMap source code:

    ```bash
    git clone https://github.com/eidunyushkinhse/archmap.git
    cd archmap
    ```

2. If needed, create a `.env` file next to `compose.yaml` and set the database password and the port in it:

    ```bash
    POSTGRES_PASSWORD=strong-password
    ARCHMAP_PORT=8080
    ```

3. Start the containers:

    ```bash
    docker compose up -d
    ```

    The first build takes a few minutes.

4. Create the first administrator. The command asks for the password twice:

    ```bash
    docker compose exec archmap archmap-admin create-admin admin
    ```

5. Open `http://localhost:8080` in your browser and sign in with the administrator account.
6. Create accounts for your colleagues (see [Create user accounts and assign roles](users.md)).

::: note
Set the database password before the first start, because PostgreSQL stores it when it creates its data directory. If you don't set a password, `archmap` is used.
:::

::: note
The data is kept in Docker volumes: `archmap_db` (the database) and `archmap_data` (the sign-in signing key, created on the first start). As long as the volumes are intact, recreating the containers loses nothing.
:::

## Give your colleagues access

::: note
The container serves ArchMap over plain HTTP. Passwords and tokens travel over the network unencrypted, so if colleagues are going to use ArchMap, put a reverse proxy with TLS (for example, nginx) in front of the container.
:::

To give your colleagues access to ArchMap, follow these steps:

1. Set up a reverse proxy with TLS that forwards all requests to the ArchMap port (`8080` by default). The proxy must accept requests of up to 64 MB and wait up to 300 seconds for a response, because importing a large archive can take that long.
2. In `compose.yaml`, add the following line to the `environment` section of the `archmap` service:

    ```yaml
    TRUST_FORWARDED_FOR: "true"
    ```

3. Restart the containers:

    ```bash
    docker compose up -d
    ```

::: note
With `TRUST_FORWARDED_FOR`, ArchMap takes the user's address from the `X-Forwarded-For` header that the proxy adds. Without it, the sign-in rate limit would treat all users as the proxy's single address. If there's no proxy, don't turn this setting on, or users could forge the header themselves.
:::

::: note
To upgrade ArchMap or back up the database, see [Upgrade ArchMap to a new version](update.md) and [Back up and restore the database](backup.md).
:::
