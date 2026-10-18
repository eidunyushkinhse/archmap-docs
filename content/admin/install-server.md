---
title: Установить ArchMap на сервер
order: 3
---

::: note
Для установки на Linux-сервер достаточно одного архива поставки. Python и Node.js на сервере не нужны: в архиве уже есть переносной Python со всеми зависимостями, бэкенд и собранный интерфейс. Установщик настраивает службу systemd и сайт в nginx.
:::

::: note
Что понадобится:

- сервер Linux x86_64 с systemd и glibc 2.17 или новее (подходит любой дистрибутив последних лет);
- права root или sudo на время установки;
- nginx из репозитория дистрибутива;
- 1–2 ГБ памяти и около 1 ГБ на диске: установщик хранит три последних релиза;
- `pg_dump` той же или более новой версии, что сервер PostgreSQL (пакет `postgresql-client`): установщик делает копию базы перед обновлениями;
- отдельное DNS-имя для ArchMap и сертификат TLS для него: работа по подпути не поддерживается.
:::

<!--@include: ../_shared/postgres.md-->

## Собрать архив поставки

Чтобы собрать архив поставки, выполните следующие действия:

1. На машине с доступом в интернет (Linux x86_64 с git, Node.js 22 или новее и curl) скачайте исходный код ArchMap:

    ```bash
    git clone https://github.com/eidunyushkinhse/archmap.git
    cd archmap
    ```

2. Соберите поставку:

    ```bash
    deploy/build-bundle.sh
    ```

    В папке `dist-bundle` появятся архив `archmap-<дата>-<коммит>-linux-x86_64.tar.gz` (около 55 МБ) и файл с его контрольной суммой `.sha256`.

## Установить ArchMap

Чтобы установить ArchMap на сервер, выполните следующие действия:

1. Перенесите архив и файл `.sha256` на сервер.
2. Проверьте целостность архива и распакуйте его:

    ```bash
    sha256sum -c archmap-*.tar.gz.sha256
    tar -xzf archmap-*.tar.gz && cd archmap-*-linux-x86_64
    ```

3. Запустите установщик, указав имя сервера и сертификат:

    ```bash
    sudo ./deploy/install.sh --server-name archmap.example.com \
      --tls-cert /etc/ssl/archmap.crt --tls-key /etc/ssl/archmap.key
    ```

    При первом запуске установщик создаст файл настроек `/etc/archmap/archmap.env` со случайным ключом подписи и остановится.

4. Впишите в файл `/etc/archmap/archmap.env` адрес базы:

    ```bash
    DATABASE_URL=postgresql://archmap:ПАРОЛЬ@pg.example.com:5432/archmap
    ```

5. Запустите ту же команду установщика ещё раз. Установщик проверит базу, применит миграции, разложит релиз в `/opt/archmap`, запустит службу `archmap` и настроит nginx.
6. Создайте первого администратора. Команда дважды спросит пароль:

    ```bash
    sudo archmap-admin create-admin admin
    ```

7. Откройте адрес ArchMap (например, `https://archmap.example.com`) и войдите под учётной записью администратора.
8. Заведите учётные записи для коллег (см. [Создать учётные записи и назначить роли](users.md)).

::: note
Без параметров `--tls-cert` и `--tls-key` ArchMap будет работать по HTTP без шифрования. Так можно делать только в доверенном тестовом сегменте сети: пароли и токены пойдут открытым текстом.
:::

::: note
Если установщик остановился на проверке базы, сообщение назовёт, что поправить: подключение, версию PostgreSQL, кодировку базы или права пользователя.
:::

::: note
Что где лежит после установки:

- `/opt/archmap/releases/<версия>`: релизы (хранятся три последних);
- `/opt/archmap/current`: ссылка на работающий релиз;
- `/etc/archmap/archmap.env`: настройки (см. [Справочник переменных окружения](env.md));
- `/etc/systemd/system/archmap.service`: служба, работает от пользователя `archmap`;
- `/etc/nginx/conf.d/archmap.conf`: сайт в nginx;
- `/usr/local/bin/archmap-admin`: команды администрирования.
:::

## Выпустить сертификат Let's Encrypt

::: note
Если сервер открыт в интернет, сертификат можно бесплатно получить в Let's Encrypt. Для этого сначала установите ArchMap по HTTP, а затем запустите установщик ещё раз уже с сертификатом.
:::

Чтобы установить ArchMap с сертификатом Let's Encrypt, выполните следующие действия:

1. Установите ArchMap без сертификата (см. [Установить ArchMap](#установить-archmap)):

    ```bash
    sudo ./deploy/install.sh --server-name archmap.example.com
    ```

2. Выпустите сертификат с помощью certbot:

    ```bash
    sudo certbot certonly --nginx -d archmap.example.com --deploy-hook "systemctl reload nginx"
    ```

3. Запустите установщик ещё раз с выпущенным сертификатом:

    ```bash
    sudo ./deploy/install.sh --server-name archmap.example.com \
      --tls-cert /etc/letsencrypt/live/archmap.example.com/fullchain.pem \
      --tls-key /etc/letsencrypt/live/archmap.example.com/privkey.pem
    ```

4. В файле `/etc/archmap/archmap.env` исправьте в переменной `CORS_ORIGINS` адрес с `http://` на `https://`.
5. Перезапустите службу:

    ```bash
    sudo systemctl restart archmap
    ```

::: note
Сертификат продлевает служба `certbot.timer`, а после продления nginx перечитывает его сам.
:::

## Установить без nginx

::: note
Если перед сервером уже стоит свой обратный прокси, nginx не нужен. Установщик с параметром `--no-nginx` ставит только службу ArchMap, а прокси нужно настроить самостоятельно.
:::

Чтобы установить ArchMap без nginx, выполните следующие действия:

1. Запустите установщик с параметром `--no-nginx`:

    ```bash
    sudo ./deploy/install.sh --no-nginx
    ```

2. Настройте свой обратный прокси:
    - отдавать файлы интерфейса из папки `/opt/archmap/current/frontend`, а на неизвестные пути отвечать файлом `index.html`;
    - передавать на `127.0.0.1:8000` пути `/api/`, `/mcp` и `/.well-known/oauth-`;
    - ждать ответа на `/mcp` и `/api/` до 300 секунд;
    - принимать запросы до 64 МБ.

::: note
За образец возьмите конфигурацию nginx, которую пишет установщик (функция `render_nginx` в файле `deploy/install.sh`).
:::
