## Подготовить базу PostgreSQL {#postgres}

::: note
ArchMap хранит все данные в PostgreSQL версии 15 или новее. Базу готовит администратор PostgreSQL, а таблицы ArchMap создаст сам при первом запуске. Расширения не нужны.
:::

Чтобы подготовить базу, выполните следующие действия:

1. Создайте пользователя и базу в кодировке UTF-8, владельцем которой будет этот пользователь:

    ```sql
    CREATE ROLE archmap LOGIN PASSWORD 'ПАРОЛЬ';
    CREATE DATABASE archmap OWNER archmap ENCODING 'UTF8' TEMPLATE template0;
    ```

2. В файле `pg_hba.conf` разрешите пользователю `archmap` подключаться к базе `archmap` с адресов, с которых работает ArchMap.
3. Перечитайте настройки PostgreSQL:

    ```sql
    SELECT pg_reload_conf();
    ```

4. Составьте адрес базы для ArchMap (например, `postgresql://archmap:ПАРОЛЬ@pg.example.com:5432/archmap`).

::: note
Спецсимволы пароля в адресе базы нужно закодировать: `@` → `%40`, `:` → `%3A`, `/` → `%2F`, `%` → `%25`, `#` → `%23`, `?` → `%3F`. Если PostgreSQL требует TLS, допишите к адресу `?sslmode=require`.
:::
