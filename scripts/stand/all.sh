#!/usr/bin/env bash
# Пересъёмка всех снимков сайта документации со стенда archmap_docs (scripts/stand/README.md).
# По строке на снимок в порядке страниц: учётка, режим shots.mjs, аргументы, переменные кадра.
# Адреса стенда берутся из окружения (FRONTEND, BACKEND); без них shots.mjs смотрит на
# :5173/:8000. Кадры, которым на время съёмки нужны данные (статус «Согласовано», токен CI,
# напоминание о слиянии), готовят и убирают их сами внутри shots.mjs.
#   FRONTEND=http://localhost:5176 BACKEND=http://localhost:8003 bash scripts/stand/all.sh
#   … bash scripts/stand/all.sh tree-search.png legend-types.png   # только названные снимки
set -euo pipefail
cd "$(dirname "$0")"

P="Маркетплейс «Ярмарка»"
ONLY=" $* "
done_n=0

# run <снимок> <команда…>: команда выполняется, если снимок не отфильтрован аргументами.
# shots.mjs печатает имя каждого снятого файла: без этой строки в выводе кадр не снят.
# Свежесть файла по времени не сверяется: часы WSL2 бывают сдвинуты назад.
run() {
  local file=$1; shift
  if [[ "$ONLY" != "  " && "$ONLY" != *" $file "* ]]; then return 0; fi
  echo "── $file"
  local log
  if ! log=$("$@" 2>&1); then
    echo "$log"
    echo "снимок $file: съёмка упала" >&2
    exit 1
  fi
  echo "$log"
  if ! grep -qxF "$file" <<<"$log"; then
    echo "снимок $file не снят" >&2
    exit 1
  fi
  done_n=$((done_n + 1))
}

# Руководство пользователя (учётка reader: кнопок редактора в кадре нет; окна токенов снимает
# architect: у «Пользователя» список «Доступ» заперт на «Только чтение», а страница учит выбирать)
run projects-list.png          env DOCS_USER=reader node shots.mjs projects "$P"
run project-home.png           env DOCS_USER=reader node shots.mjs home "$P"
run object-page.png            env DOCS_USER=reader node shots.mjs node "$P" "Заказы"
run object-page-expanded.png   env DOCS_USER=reader node shots.mjs node "$P" "Оркестратор заказа" expand object-page-expanded.png
run legend-types.png           env DOCS_USER=reader node shots.mjs legend "$P" legend-types.png
run tree-search.png            env DOCS_USER=reader node shots.mjs search "$P" "заказ"
run object-edges.png           env DOCS_USER=reader CLIP_H=330 node shots.mjs section "Zabbix 7" "Zabbix" "Связи" object-edges.png
run object-logic.png           env DOCS_USER=reader node shots.mjs section "$P" "Order API" "Логика" object-logic.png
run logic-viewer.png           env DOCS_USER=reader node shots.mjs doc "$P" "Order API" "Создание заказа" logic-viewer.png
run api-viewer.png             env DOCS_USER=reader node shots.mjs doc "$P" "Order API" "Order API" api-viewer.png spec-open
run facts-db.png               env DOCS_USER=reader node shots.mjs section "$P" "БД заказов" "Структура" facts-db.png orders
run facts-channels.png         env DOCS_USER=reader node shots.mjs section "$P" "Kafka" "Каналы" facts-channels.png orders.events
run facts-config.png           env DOCS_USER=reader node shots.mjs section "$P" "Order API" "Конфигурация" facts-config.png
run source-props.png           env DOCS_USER=reader node shots.mjs head "$P" "Order API" source-props.png
run process-view.png           env DOCS_USER=reader CLIP_H=578 node shots.mjs process "$P" "Оплата заказа" process-view.png
run changes-transition.png     env DOCS_USER=reader node shots.mjs node "$P" "Сервис уведомлений" expand changes-transition.png
run deploy-canvas.png          env DOCS_USER=reader node shots.mjs deploy "$P" deploy-canvas.png labels-off
run versions-list-reader.png   env DOCS_USER=reader node shots.mjs versions "$P" "Заказы" versions-list-reader.png
run versions-diff-reader.png   env DOCS_USER=reader node shots.mjs versions "$P" "Заказы" versions-diff-reader.png 2
run export-menu.png            env DOCS_USER=reader node shots.mjs export "$P" export-menu.png
run mcp-tokens.png             env DOCS_USER=architect node shots.mjs tokens "$P" mcp-tokens.png -
run mcp-token-issued.png       env DOCS_USER=architect node shots.mjs tokens "$P" - mcp-token-issued.png
run password-dialog.png        env DOCS_USER=reader node shots.mjs password "$P" password-dialog.png

# Руководство архитектора (учётка architect)
run create-project.png         env DOCS_USER=architect node shots.mjs create "$P" create-project.png "Ярмарка: черновик переделки"
run map-editor.png             env DOCS_USER=architect node shots.mjs editor "$P" "Заказы" map-editor.png node "Order API"
run node-new.png               env DOCS_USER=architect node shots.mjs new-node "$P" "Заказы" "Оркестратор заказа" node-new.png open
run edge-arrows.png            env DOCS_USER=architect SIDE=right node shots.mjs editor "$P" "Заказы" edge-arrows.png hover "Оркестратор заказа" "Order API"
run deploy-sites.png           env DOCS_USER=architect node shots.mjs sites "$P" deploy-sites.png
run deploy-placing.png         env DOCS_USER=architect CLIP_H=600 LABELS=off node shots.mjs placing "$P" "Веб-витрина" deploy-placing.png "$P"
run deploy-placement.png       env DOCS_USER=architect node shots.mjs placement "$P" deploy-placement.png "Order API" "Auth API"
run status-pill.png            env DOCS_USER=architect node shots.mjs status "$P" "Order API" status-pill.png "Order API"
run status-children.png        env DOCS_USER=architect node shots.mjs status "$P" "Заказы" status-children.png "Оркестратор заказа" "Order API"
run versions-list.png          env DOCS_USER=architect node shots.mjs versions "$P" "Заказы" versions-list.png
run versions-diff.png          env DOCS_USER=architect node shots.mjs versions "$P" "Заказы" versions-diff.png 2
run versions-restore.png       env DOCS_USER=architect node shots.mjs versions "$P" "Заказы" versions-restore.png 2 restore

# Новые снимки (на страницы их ставит следующая правка текстов)
run ci-token-issued.png        env DOCS_USER=architect node shots.mjs ci-token "$P" ci-token-issued.png
run code-change-notice.png     env DOCS_USER=architect CLIP_H=112 node shots.mjs code-change "$P" code-change-notice.png
run schema-fullscreen-reader.png env DOCS_USER=reader node shots.mjs fullscreen "$P" schema-fullscreen-reader.png "Маркетплейс «Ярмарка»"

echo "снято: $done_n"
