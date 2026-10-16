#!/usr/bin/env bash
# Посев стенда документации — чистой БД archmap_docs для скриншотов (см. README рядом):
# две учётки — architect (общая роль «Архитектор») и reader («Пользователь»), три проекта
# из архивов знания (yarmarka.zip, zabbix.zip, grafana.zip в папке $1), reader — читатель
# во всех трёх. Стек ArchMap должен быть поднят на :8000/:5173 ИМЕННО на этой БД.
#   bash scripts/stand/seed.sh <папка с архивами>
set -euo pipefail
D="${1:?папка с архивами yarmarka.zip zabbix.zip grafana.zip}"
B=http://localhost:8000/api/v1
PASS="${DOCS_STAND_PASSWORD:-docs-stand-2026}"

for i in $(seq 1 60); do curl -sf http://localhost:8000/health >/dev/null && break; sleep 2; done
curl -sf http://localhost:8000/health >/dev/null || { echo "бэкенд не поднялся"; exit 1; }

reg() { curl -s -o /dev/null -w "register $1: %{http_code}\n" -X POST "$B/auth/register" -H 'Content-Type: application/json' \
  -d "{\"username\":\"$1\",\"password\":\"$PASS\",\"role\":\"$2\"}"; }
reg architect architect
reg reader viewer

login() { curl -s -X POST "$B/auth/login" -H 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode "username=$1" --data-urlencode "password=$PASS" | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])"; }
T=$(login architect)

imp() { # файл, имя, описание
  curl -s -X POST "$B/projects/import-unified" -H "Authorization: Bearer $T" \
    -F "files=@$D/$1" -F "name=$2" -F "description=$3" | python3 -c "
import sys,json; d=json.load(sys.stdin); print('import $2:', d.get('project_id') or d.get('id') or d)"; }
imp yarmarka.zip "Маркетплейс «Ярмарка»" "Онлайн-маркетплейс: каталог, поиск, заказы, оплата, доставка и уведомления."
imp zabbix.zip "Zabbix 7" "Сервер мониторинга Zabbix 7.0: схема построена по исходному коду."
imp grafana.zip "Grafana" "Ядро Grafana: схема построена по исходному коду репозитория grafana/grafana."

RID=$(curl -s "$B/users" -H "Authorization: Bearer $T" | python3 -c "import sys,json; print([u['id'] for u in json.load(sys.stdin) if u['username']=='reader'][0])")
curl -s "$B/projects" -H "Authorization: Bearer $T" | python3 -c "import sys,json; [print(p['id'], p['name']) for p in json.load(sys.stdin) if p['my_role']=='owner']" | while read -r pid name; do
  curl -s -o /dev/null -w "reader → $name: %{http_code}\n" -X PUT "$B/projects/$pid/members/$RID" -H "Authorization: Bearer $T" -H 'Content-Type: application/json' -d '{"role":"reader"}'
done
echo "--- проекты глазами reader:"
TR=$(login reader)
curl -s "$B/projects" -H "Authorization: Bearer $TR" | python3 -c "import sys,json; [print(' ', p['name'], '|', p['my_role'], '|', p['object_count'], 'об.', p['edge_count'], 'св.') for p in json.load(sys.stdin)]"
