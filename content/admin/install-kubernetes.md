---
title: Установить ArchMap в Kubernetes
order: 2
---

::: note
Для установки в Kubernetes у ArchMap есть Helm-чарт. В поде работает один процесс, который отдаёт и интерфейс, и API. Перед его запуском init-контейнер проверяет базу и применяет миграции. Под работает без прав root и привилегий, с корневой файловой системой только для чтения, и проходит профиль Pod Security «restricted». PostgreSQL чарт не ставит: нужна своя база.
:::

::: note
Что понадобится:

- Kubernetes 1.25 или новее и Helm 3.8 или новее;
- Gateway API (Gateway в кластере) или Ingress-контроллер с TLS;
- сетевой доступ из подов к PostgreSQL;
- отдельное DNS-имя для ArchMap: работа по подпути (например, `https://portal.example.com/archmap/`) не поддерживается.

По умолчанию под запрашивает 0,1 CPU и 256 МБ памяти, а предел памяти составляет 1 ГБ.
:::

<!--@include: ../_shared/postgres.md-->

## Установить чарт

Чтобы установить ArchMap в кластер, выполните следующие действия:

1. Создайте пространство имён и Secret с адресом базы:

    ```bash
    kubectl create namespace archmap
    kubectl -n archmap create secret generic archmap-db \
      --from-literal=database-url='postgresql://archmap:ПАРОЛЬ@pg.example.com:5432/archmap'
    ```

2. Создайте файл значений `archmap-values.yaml` с адресом базы и способом публикации:
    - для Gateway API:

        ```yaml
        database:
          existingSecret: archmap-db
        httpRoute:
          enabled: true
          parentRefs:
            - name: main-gateway
              namespace: gateway-system
          hostnames:
            - archmap.example.com
        ```

    - для Ingress:

        ```yaml
        database:
          existingSecret: archmap-db
        ingress:
          enabled: true
          className: nginx
          hosts:
            - host: archmap.example.com
              paths:
                - path: /
                  pathType: Prefix
          tls:
            - secretName: archmap-tls
              hosts:
                - archmap.example.com
        ```

3. Установите чарт:

    ```bash
    helm install archmap oci://ghcr.io/eidunyushkinhse/charts/archmap -n archmap \
      -f archmap-values.yaml --wait
    ```

4. Проверьте установку:

    ```bash
    helm test archmap -n archmap
    ```

5. Создайте первого администратора. Команда дважды спросит пароль:

    ```bash
    kubectl -n archmap exec -it deploy/archmap -c archmap -- archmap-admin create-admin admin
    ```

6. Откройте адрес ArchMap (например, `https://archmap.example.com`) и войдите под учётной записью администратора.
7. Заведите учётные записи для коллег (см. [Создать учётные записи и назначить роли](users.md)).

::: note
Чарт по умолчанию берёт образ `ghcr.io/eidunyushkinhse/archmap` своей версии (для linux/amd64 и linux/arm64). Как поставить ArchMap в кластер без доступа в интернет или из своего реестра, см. [Установить ArchMap в закрытом контуре](install-offline.md).
:::

::: note
Ключ подписи входа чарт создаст сам и сохранит при обновлениях. Чтобы задать свой ключ, укажите в значении `secretKey.existingSecret` имя Secret с ключом `secret-key` длиной не меньше 32 символов.
:::

::: note
Gateway или Ingress-контроллер должен:

- ждать ответа до 300 секунд: столько может занять ввоз большого архива или запрос ИИ-агента. У HTTPRoute чарт задаёт тайм-аут сам, а для Ingress задайте его аннотациями контроллера в значении `ingress.annotations`;
- принимать запросы размером не меньше `config.maxRequestMb` (по умолчанию 64 МБ);
- дописывать адрес пользователя последним в заголовок `X-Forwarded-For`: по нему ArchMap ограничивает попытки входа. Так делают все распространённые контроллеры. Если перед подом нет прокси (например, Service типа LoadBalancer смотрит наружу), задайте `config.trustForwardedFor: false`.
:::

::: note
Чарт создаёт Deployment `archmap` (init-контейнер `migrate` и приложение на порту 8080), Service `archmap` (порт 80 внутри кластера), Secret `archmap` (ключ подписи и, если не задан `database.existingSecret`, адрес базы) и HTTPRoute или Ingress `archmap`, если публикация включена. Остальные значения чарта описаны в [справочнике настроек](env.md#helm).
:::
