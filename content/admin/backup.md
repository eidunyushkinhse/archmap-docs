---
title: Сделать резервную копию и восстановить базу
order: 10
---

::: note
Все данные ArchMap хранятся в базе PostgreSQL: на диске приложение ничего не держит. Поэтому резервная копия ArchMap сводится к копии базы. Делайте её регулярно и обязательно перед обновлением.
:::

## Сделать копию базы

Чтобы сделать копию базы, выполните команду для своего способа установки:

- Docker Compose (в папке с файлом `compose.yaml`):

    ```bash
    docker compose exec db pg_dump -U archmap -Fc archmap > archmap-$(date +%F).dump
    ```

- Kubernetes или сервер (с машины, откуда доступна база):

    ```bash
    pg_dump -Fc -h pg.example.com -U archmap archmap > archmap-$(date +%F).dump
    ```

::: note
Версия `pg_dump` должна быть той же или новее, чем версия сервера PostgreSQL.
:::

::: note
На сервере установщик сам делает копию базы перед каждым обновлением, которое меняет её схему, и хранит пять последних копий в папке `/opt/archmap/backups` (см. [Обновить на сервере](update.md#обновить-на-сервере)).
:::

## Восстановить базу из копии

Чтобы восстановить базу из копии, выполните следующие действия:

1. Остановите ArchMap:
    - Docker Compose: `docker compose stop archmap`;
    - Kubernetes: `kubectl -n archmap scale deploy/archmap --replicas=0`;
    - сервер: `sudo systemctl stop archmap`.
2. Восстановите базу из файла копии:
    - Docker Compose:

        ```bash
        docker compose exec -T db pg_restore -U archmap -d archmap --clean --if-exists < archmap-ГГГГ-ММ-ДД.dump
        ```

    - Kubernetes или сервер:

        ```bash
        pg_restore --clean --if-exists -h pg.example.com -U archmap -d archmap archmap-ГГГГ-ММ-ДД.dump
        ```

3. Запустите ArchMap:
    - Docker Compose: `docker compose start archmap`;
    - Kubernetes: `kubectl -n archmap scale deploy/archmap --replicas=1`;
    - сервер: `sudo systemctl start archmap`.

::: note
Восстановление заменяет все данные в базе данными из копии: правки, сделанные после копии, пропадут.
:::

::: note
Ключ подписи входа хранится не в базе, а в настройках (на сервере в файле `/etc/archmap/archmap.env`, в Docker Compose в томе `archmap_data`, в Kubernetes в Secret). Если ключ потерян, данные не пострадают: всем пользователям просто придётся войти заново.
:::

::: note
Отдельный проект можно сохранить архивом из интерфейса и перенести на другой сервер ArchMap (см. [Экспортировать и импортировать проект](../architect/export-import.md)). Архив не заменяет копию базы: в него не попадают учётные записи, участники и расположение объектов.
:::
