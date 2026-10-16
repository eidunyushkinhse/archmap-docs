# Стенд для скриншотов документации

Скриншоты снимаются с локального ArchMap на ОТДЕЛЬНОЙ чистой базе `archmap_docs`: в ней
только две учётки (`architect`, `reader`, пароль — `DOCS_STAND_PASSWORD`, по умолчанию
`docs-stand-2026`) и три проекта из архивов знания: «Маркетплейс «Ярмарка»», «Zabbix 7»,
«Grafana». Рабочие проекты владельца в кадр не попадают (репозиторий публичный).

1. Экспортировать архивы эталонов из рабочей базы (GET /api/v1/export/archive с
   X-Project-Id) в папку, например `~/archmap-docs-archives/`: `yarmarka.zip`, `zabbix.zip`,
   `grafana.zip`.
2. Поднять стек соседнего репозитория archmap на базе стенда. ВАЖНО: одного `DB_NAME` мало —
   бэкенд читает `DATABASE_URL` из `backend/.env`, поэтому его надо переопределить явно:
   ```bash
   DB_NAME=archmap_docs DATABASE_URL=postgresql://postgres:postgres@localhost:5432/archmap_docs ./dev.sh
   ```
3. Один раз посеять: `bash scripts/stand/seed.sh ~/archmap-docs-archives`.
4. Снимать: `node scripts/stand/shots.mjs projects` (экран «Проекты»),
   `node scripts/stand/shots.mjs home "Маркетплейс «Ярмарка»"` (страница проекта).
   Файлы ложатся в `content/images/` (или `OUT=…`). Окно 1440×900, масштаб 2, учётка
   `reader` (другая — `DOCS_USER`/`DOCS_PASS`).

Корневой уровень «Ярмарки» на стенде расставлен руками (PUT /views/root/layout): авто-раскладка
кладёт шесть объектов в столбик, и на странице проекта они нечитаемы.
