---
title: Справочник переменных окружения
order: 14
---

## Изменить настройку

Чтобы изменить настройку ArchMap, выполните следующие действия:

1. Задайте переменную для своего способа установки:
    - сервер: в файле `/etc/archmap/archmap.env` в формате `ПЕРЕМЕННАЯ=значение`, без пробелов вокруг `=`;
    - Docker Compose: в файле `compose.yaml` в разделе `environment` сервиса `archmap`;
    - Kubernetes: в значении чарта из раздела `config` (см. [Значения Helm-чарта](#helm)) или, если такого значения нет, в значении `extraEnv`.
2. Перезапустите ArchMap:
    - сервер: `sudo systemctl restart archmap`;
    - Docker Compose: `docker compose up -d`;
    - Kubernetes: `helm upgrade archmap oci://ghcr.io/eidunyushkinhse/charts/archmap -n archmap --reuse-values -f archmap-values.yaml --wait`.

## Переменные окружения {#vars}

| Переменная | По умолчанию | Что задаёт |
| --- | --- | --- |
| `DATABASE_URL` | — | Адрес базы PostgreSQL (например, `postgresql://archmap:ПАРОЛЬ@pg.example.com:5432/archmap`). |
| `SECRET_KEY` | создаётся при установке | Ключ подписи входа, не короче 32 символов. После смены всем придётся войти заново. |
| `ALLOW_SIGNUP` | `false` | Регистрация через API без администратора. Формы регистрации в интерфейсе нет, оставляйте `false`. |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `10080` | Сколько минут действует вход пользователя (по умолчанию 7 дней). |
| `CORS_ORIGINS` | адрес сервера | Адреса, по которым пользователи открывают ArchMap, через запятую. Нужен, только если интерфейс и API живут на разных адресах. |
| `TRUST_FORWARDED_FOR` | `true` на сервере и в Kubernetes, `false` в Docker Compose | Брать адрес пользователя из заголовка `X-Forwarded-For`, который дописывает прокси. Без прокси перед ArchMap выключите. |
| `LOGIN_ATTEMPTS_PER_MINUTE` | `10` | Неудачных попыток входа в минуту с одного адреса (`0` снимает ограничение). На сервере вместо этого действует ограничение nginx. |
| `MAX_REQUEST_MB` | `64` | Наибольший размер запроса в МБ (например, при ввозе архива проекта). |
| `MCP_REQUESTS_PER_MINUTE` | `300` | Запросов ИИ-агента в минуту по одному токену (`0` снимает ограничение). |
| `MCP_ALLOWED_ORIGINS` | пусто | Адреса страниц, с которых браузер может обращаться к `…/mcp`, через запятую. |
| `DEMO_MODE` | `false` | Демо-режим (см. [Включить демо-режим](demo-mode.md)). |
| `DEMO_MAX_SANDBOXES` | `300` | Сколько песочниц демо-стенд держит одновременно. |
| `DEMO_START_PER_IP_PER_HOUR` | `10` | Сколько новых песочниц в час демо-стенд пускает с одного адреса. |

::: note
Только на сервере:

- `ARCHMAP_PORT` (по умолчанию `8000`): порт бэкенда на `127.0.0.1`, к нему обращается nginx;
- `ARCHMAP_WORKERS` (по умолчанию `2`): число рабочих процессов. При заметной нагрузке поставьте `4`;
- `ARCHMAP_BACKUP_DIR` (по умолчанию `/opt/archmap/backups`): папка для копий базы, которые установщик делает перед миграциями. Задайте её при запуске установщика (например, `sudo ARCHMAP_BACKUP_DIR=/srv/backups ./deploy/install.sh`).
:::

::: note
Только в Docker Compose и Kubernetes:

- `WEB_CONCURRENCY` (по умолчанию `2`): число рабочих процессов в контейнере;
- `MIGRATE_ON_START` (по умолчанию `true`): применять миграции при запуске контейнера. В Kubernetes чарт сам выключает это у приложения и применяет миграции в init-контейнере.

В Docker Compose в файле `.env` рядом с `compose.yaml` можно задать ещё `ARCHMAP_PORT` (порт на машине, по умолчанию `8080`) и `POSTGRES_PASSWORD` (пароль базы, по умолчанию `archmap`).
:::

::: note
Каждый рабочий процесс держит до 15 соединений с PostgreSQL. Если увеличиваете число процессов или подов, проверьте, что настройка `max_connections` базы не меньше произведения «поды × процессы × 15».
:::

## Значения Helm-чарта {#helm}

| Значение | По умолчанию | Что задаёт |
| --- | --- | --- |
| `database.url` | пусто | Адрес базы. Вместо него можно указать Secret. |
| `database.existingSecret`, `database.existingSecretKey` | пусто, `database-url` | Secret с адресом базы и имя ключа в нём. |
| `secretKey.value` | пусто | Ключ подписи входа. Если значение пустое, чарт создаст случайный ключ и сохранит его при обновлениях. |
| `secretKey.existingSecret`, `secretKey.existingSecretKey` | пусто, `secret-key` | Secret с ключом подписи и имя ключа в нём. |
| `config.allowSignup` | `false` | `ALLOW_SIGNUP`. |
| `config.workers` | `2` | Число рабочих процессов в поде (`WEB_CONCURRENCY`). |
| `config.loginAttemptsPerMinute` | `10` | `LOGIN_ATTEMPTS_PER_MINUTE`. |
| `config.maxRequestMb` | `64` | `MAX_REQUEST_MB`. Прокси перед ArchMap должен пропускать запросы не меньше этого размера. |
| `config.trustForwardedFor` | `true` | `TRUST_FORWARDED_FOR`. |
| `config.corsOrigins` | пусто | `CORS_ORIGINS`. |
| `extraEnv` | пусто | Другие переменные окружения списком `name`/`value` (например, `DEMO_MODE`). |
| `replicaCount` | `1` | Число подов. Миграции при нескольких подах идут по очереди. |
| `image.repository`, `image.tag` | `ghcr.io/eidunyushkinhse/archmap`, версия чарта | Образ ArchMap. |
| `imagePullSecrets` | пусто | Secret для загрузки образа из закрытого реестра. |
| `ingress.*` | выключено | Публикация через Ingress: `enabled`, `className`, `annotations`, `hosts`, `tls`. |
| `httpRoute.*` | выключено | Публикация через Gateway API: `enabled`, `parentRefs`, `hostnames`, `timeout` (по умолчанию `300s`). |
| `resources` | запрос 0,1 CPU и 256 МБ, предел 1 ГБ | Ресурсы пода. |
