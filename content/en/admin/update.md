---
title: Upgrade ArchMap to a new version
order: 9
---

::: note
New ArchMap versions are released with tags such as `v1.2.3`. Database migrations are applied automatically during an upgrade. ArchMap migrations only add new things, so the previous version usually keeps working with the upgraded database. Back up the database before you upgrade (see [Back up and restore the database](backup.md)).
:::

## Upgrade Docker Compose

To upgrade ArchMap installed with Docker Compose, follow these steps:

1. Back up the database (see [Back up the database](backup.md#backup)).
2. In the directory with `compose.yaml`, get the new version of the source code:

    ```bash
    git pull
    ```

3. Rebuild and restart the containers:

    ```bash
    docker compose up -d --build
    ```

    The container applies the database migrations when it starts.

## Upgrade in Kubernetes

To upgrade ArchMap in Kubernetes, follow these steps:

1. Back up the database (see [Back up the database](backup.md#backup)).
2. Upgrade the release to the new chart version and keep the previous values:

    ```bash
    helm upgrade archmap oci://ghcr.io/eidunyushkinhse/charts/archmap -n archmap \
      --version NEW_VERSION --reuse-values --wait
    ```

    The new pod first applies the migrations in an init container and then replaces the old pod.

::: note
The sign-in signing key is kept during the upgrade, so users don't have to sign in again.
:::

::: note
To go back to the previous version, run `helm rollback archmap -n archmap`. If the new version changed the database so that the previous version can't work with it, restore the database from the backup first.
:::

## Upgrade on a server {#server}

To upgrade ArchMap on a server, follow these steps:

1. Build the distribution archive of the new version (see [Build the distribution archive](install-server.md#bundle)).
2. Copy the archive and the `.sha256` file to the server, verify the archive, and unpack it:

    ```bash
    sha256sum -c archmap-*.tar.gz.sha256
    tar -xzf archmap-*.tar.gz && cd archmap-*-linux-x86_64
    ```

3. Run the installer without parameters:

    ```bash
    sudo ./deploy/install.sh
    ```

    The installer backs up the database, applies the migrations, switches `/opt/archmap/current` to the new release, and restarts the service. Your settings and the nginx configuration stay the same.

::: note
If the new version changes the database schema, the installer saves a database backup to `/opt/archmap/backups` before the migrations and keeps the last five backups. If the backup fails (for example, `pg_dump` of the required version is missing), the installation stops before the migrations. If you've already made a backup yourself, run the installer with `--no-backup`.
:::

::: note
If the new release doesn't report that it's ready within a minute, the installer switches back to the previous release and exits with an error. The service keeps running on the previous release. To go back to the previous version after a successful upgrade, use the command that the installer prints at the end.
:::

## Connect AI agents on a server installed before /mcp {#mcp}

::: note
If ArchMap was installed on a server before the version that connects AI agents at `…/mcp`, the nginx configuration doesn't have this address, because the installer doesn't rewrite it. Agents can't connect, and the installer shows a warning during the upgrade.
:::

To open the `/mcp` address on such a server, follow these steps:

1. Open `/etc/nginx/conf.d/archmap.conf`.
2. In the `server { … }` block, next to `location /api/`, add the following:

    ```nginx
    location = /mcp {
        proxy_pass http://archmap_backend;
        proxy_read_timeout 300s;
        proxy_buffering off;
    }
    location ^~ /.well-known/oauth- {
        proxy_pass http://archmap_backend;
    }
    ```

3. Check the configuration and reload it:

    ```bash
    sudo nginx -t && sudo systemctl reload nginx
    ```

::: note
If the installer wrote the nginx configuration, you can run it again with the same `--server-name`, `--tls-cert`, and `--tls-key` parameters instead of editing the file. The installer rewrites the whole configuration, including the new addresses and security headers.
:::
