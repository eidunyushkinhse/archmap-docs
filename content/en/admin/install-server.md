---
title: Install ArchMap on a server
order: 3
---

::: note
To install ArchMap on a Linux server, you need just one distribution archive. The server doesn't need Python or Node.js, because the archive already contains a portable Python with all dependencies, the backend, and the built interface. The installer sets up a systemd service and an nginx site.
:::

::: note
You'll need:

- a Linux x86_64 server with systemd and glibc 2.17 or later (any recent distribution will do);
- root or sudo privileges during installation;
- nginx from the distribution's repository;
- 1–2 GB of memory and about 1 GB of disk space (the installer keeps the last three releases);
- `pg_dump` of the same or a later version than the PostgreSQL server (the `postgresql-client` package), for database backups before upgrades;
- a dedicated DNS name for ArchMap and a TLS certificate for it (serving ArchMap under a path isn't supported).
:::

<!--@include: ../_shared/postgres.md-->

## Build the distribution archive {#bundle}

To build the distribution archive, follow these steps:

1. On a machine with internet access (Linux x86_64 with git, Node.js 22 or later, and curl), clone the ArchMap source code:

    ```bash
    git clone https://github.com/eidunyushkinhse/archmap.git
    cd archmap
    ```

2. Build the distribution:

    ```bash
    deploy/build-bundle.sh
    ```

    The `dist-bundle` directory now contains the `archmap-<date>-<commit>-linux-x86_64.tar.gz` archive (about 55 MB) and its `.sha256` checksum file.

## Install ArchMap {#install}

To install ArchMap on a server, follow these steps:

1. Copy the archive and the `.sha256` file to the server.
2. Verify the archive and unpack it:

    ```bash
    sha256sum -c archmap-*.tar.gz.sha256
    tar -xzf archmap-*.tar.gz && cd archmap-*-linux-x86_64
    ```

3. Run the installer with the server name and the certificate:

    ```bash
    sudo ./deploy/install.sh --server-name archmap.example.com \
      --tls-cert /etc/ssl/archmap.crt --tls-key /etc/ssl/archmap.key
    ```

    On the first run, the installer creates the `/etc/archmap/archmap.env` settings file with a random signing key and stops.

4. Add the database URL to `/etc/archmap/archmap.env`:

    ```bash
    DATABASE_URL=postgresql://archmap:PASSWORD@pg.example.com:5432/archmap
    ```

5. Run the same installer command again. The installer checks the database, applies migrations, places the release in `/opt/archmap`, starts the `archmap` service, and configures nginx.
6. Create the first administrator. The command asks for the password twice:

    ```bash
    sudo archmap-admin create-admin admin
    ```

7. Open the ArchMap address (for example, `https://archmap.example.com`) and sign in with the administrator account.
8. Create accounts for your colleagues (see [Create user accounts and assign roles](users.md)).

::: note
Without `--tls-cert` and `--tls-key`, ArchMap runs over plain HTTP. Only do this in a trusted test network, because passwords and tokens travel unencrypted.
:::

::: note
If the installer stops at the database check, the message tells you what to fix: the connection, the PostgreSQL version, the database encoding, or the user's privileges.
:::

::: note
Where things are after installation:

- `/opt/archmap/releases/<version>`: releases (the last three are kept);
- `/opt/archmap/current`: a link to the running release;
- `/etc/archmap/archmap.env`: settings (see [Environment variable reference](env.md));
- `/etc/systemd/system/archmap.service`: the service, which runs as the `archmap` user;
- `/etc/nginx/conf.d/archmap.conf`: the nginx site;
- `/usr/local/bin/archmap-admin`: administration commands.
:::

## Get a Let's Encrypt certificate

::: note
If the server is reachable from the internet, you can get a free certificate from Let's Encrypt. To do this, install ArchMap over HTTP first, and then run the installer again with the certificate.
:::

To install ArchMap with a Let's Encrypt certificate, follow these steps:

1. Install ArchMap without a certificate (see [Install ArchMap](#install)):

    ```bash
    sudo ./deploy/install.sh --server-name archmap.example.com
    ```

2. Get a certificate with certbot:

    ```bash
    sudo certbot certonly --nginx -d archmap.example.com --deploy-hook "systemctl reload nginx"
    ```

3. Run the installer again with the new certificate:

    ```bash
    sudo ./deploy/install.sh --server-name archmap.example.com \
      --tls-cert /etc/letsencrypt/live/archmap.example.com/fullchain.pem \
      --tls-key /etc/letsencrypt/live/archmap.example.com/privkey.pem
    ```

4. In `/etc/archmap/archmap.env`, change the address in the `CORS_ORIGINS` variable from `http://` to `https://`.
5. Restart the service:

    ```bash
    sudo systemctl restart archmap
    ```

::: note
The `certbot.timer` service renews the certificate, and nginx reloads it automatically after renewal.
:::

## Install without nginx

::: note
If the server already sits behind your own reverse proxy, you don't need nginx. With `--no-nginx`, the installer sets up only the ArchMap service, and you configure the proxy yourself.
:::

To install ArchMap without nginx, follow these steps:

1. Run the installer with `--no-nginx`:

    ```bash
    sudo ./deploy/install.sh --no-nginx
    ```

2. Configure your reverse proxy to:
    - serve the interface files from `/opt/archmap/current/frontend` and respond to unknown paths with `index.html`;
    - forward the `/api/`, `/mcp`, and `/.well-known/oauth-` paths to `127.0.0.1:8000`;
    - wait up to 300 seconds for responses on `/mcp` and `/api/`;
    - accept requests of up to 64 MB.

::: note
Use the nginx configuration that the installer writes as a template (the `render_nginx` function in `deploy/install.sh`).
:::
