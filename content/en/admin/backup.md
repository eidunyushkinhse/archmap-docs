---
title: Back up and restore the database
order: 10
---

::: note
ArchMap keeps all its data in the PostgreSQL database and stores nothing on disk. So backing up ArchMap means backing up the database. Do it regularly and always before an upgrade.
:::

## Back up the database {#backup}

To back up the database, run the command for your installation method:

- Docker Compose (in the directory with `compose.yaml`):

    ```bash
    docker compose exec db pg_dump -U archmap -Fc archmap > archmap-$(date +%F).dump
    ```

- Kubernetes or a server (from a machine that can reach the database):

    ```bash
    pg_dump -Fc -h pg.example.com -U archmap archmap > archmap-$(date +%F).dump
    ```

::: note
The `pg_dump` version must be the same as the PostgreSQL server version or newer.
:::

::: note
On a server, the installer backs up the database before every upgrade that changes the database schema and keeps the last five backups in `/opt/archmap/backups` (see [Upgrade on a server](update.md#server)).
:::

## Restore the database from a backup {#restore}

To restore the database from a backup, follow these steps:

1. Stop ArchMap:
    - Docker Compose: `docker compose stop archmap`;
    - Kubernetes: `kubectl -n archmap scale deploy/archmap --replicas=0`;
    - server: `sudo systemctl stop archmap`.
2. Restore the database from the backup file:
    - Docker Compose:

        ```bash
        docker compose exec -T db pg_restore -U archmap -d archmap --clean --if-exists < archmap-YYYY-MM-DD.dump
        ```

    - Kubernetes or a server:

        ```bash
        pg_restore --clean --if-exists -h pg.example.com -U archmap -d archmap archmap-YYYY-MM-DD.dump
        ```

3. Start ArchMap:
    - Docker Compose: `docker compose start archmap`;
    - Kubernetes: `kubectl -n archmap scale deploy/archmap --replicas=1`;
    - server: `sudo systemctl start archmap`.

::: note
Restoring replaces all data in the database with the data from the backup. Changes made after the backup are lost.
:::

::: note
The sign-in signing key isn't stored in the database but in the settings (on a server, in `/etc/archmap/archmap.env`; in Docker Compose, in the `archmap_data` volume; in Kubernetes, in a Secret). If the key is lost, your data is safe, and users just have to sign in again.
:::

::: note
You can save a single project as an archive in the interface and move it to another ArchMap server (see [Export and import a project](../architect/export-import.md)). An archive doesn't replace a database backup, because it doesn't include user accounts, members, or the layout of objects.
:::
