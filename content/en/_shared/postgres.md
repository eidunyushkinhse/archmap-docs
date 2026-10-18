## Prepare a PostgreSQL database {#postgres}

::: note
ArchMap stores all its data in PostgreSQL 15 or later. A PostgreSQL administrator prepares the database, and ArchMap creates its tables on the first start. No extensions are required.
:::

To prepare the database, follow these steps:

1. Create a user and a UTF-8 database owned by that user:

    ```sql
    CREATE ROLE archmap LOGIN PASSWORD 'PASSWORD';
    CREATE DATABASE archmap OWNER archmap ENCODING 'UTF8' TEMPLATE template0;
    ```

2. In `pg_hba.conf`, allow the `archmap` user to connect to the `archmap` database from the addresses ArchMap runs on.
3. Reload the PostgreSQL configuration:

    ```sql
    SELECT pg_reload_conf();
    ```

4. Compose the database URL for ArchMap (for example, `postgresql://archmap:PASSWORD@pg.example.com:5432/archmap`).

::: note
Special characters in the password must be encoded in the database URL: `@` → `%40`, `:` → `%3A`, `/` → `%2F`, `%` → `%25`, `#` → `%23`, `?` → `%3F`. If PostgreSQL requires TLS, append `?sslmode=require` to the URL.
:::
