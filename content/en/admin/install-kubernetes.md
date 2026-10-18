---
title: Install ArchMap in Kubernetes
order: 2
---

::: note
ArchMap has a Helm chart for Kubernetes. The pod runs a single process that serves both the interface and the API. Before it starts, an init container checks the database and applies migrations. The pod runs without root or privileges, with a read-only root file system, and passes the Pod Security “restricted” profile. The chart doesn't install PostgreSQL, so you need a database of your own.
:::

::: note
You'll need:

- Kubernetes 1.25 or later and Helm 3.8 or later;
- Gateway API (a Gateway in the cluster) or an Ingress controller with TLS;
- network access from the pods to PostgreSQL;
- a dedicated DNS name for ArchMap, because serving it under a path (for example, `https://portal.example.com/archmap/`) isn't supported.

By default, the pod requests 0.1 CPU and 256 MB of memory, with a memory limit of 1 GB.
:::

<!--@include: ../_shared/postgres.md-->

## Install the chart

To install ArchMap in the cluster, follow these steps:

1. Create a namespace and a Secret with the database URL:

    ```bash
    kubectl create namespace archmap
    kubectl -n archmap create secret generic archmap-db \
      --from-literal=database-url='postgresql://archmap:PASSWORD@pg.example.com:5432/archmap'
    ```

2. Create an `archmap-values.yaml` values file with the database and the way ArchMap is exposed:
    - for Gateway API:

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

    - for Ingress:

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

3. Install the chart:

    ```bash
    helm install archmap oci://ghcr.io/eidunyushkinhse/charts/archmap -n archmap \
      -f archmap-values.yaml --wait
    ```

4. Test the installation:

    ```bash
    helm test archmap -n archmap
    ```

5. Create the first administrator. The command asks for the password twice:

    ```bash
    kubectl -n archmap exec -it deploy/archmap -c archmap -- archmap-admin create-admin admin
    ```

6. Open the ArchMap address (for example, `https://archmap.example.com`) and sign in with the administrator account.
7. Create accounts for your colleagues (see [Create user accounts and assign roles](users.md)).

::: note
By default, the chart uses the `ghcr.io/eidunyushkinhse/archmap` image of its own version (for linux/amd64 and linux/arm64). To install ArchMap in a cluster without internet access or from your own registry, see [Install ArchMap in an isolated network](install-offline.md).
:::

::: note
The chart creates the sign-in signing key itself and keeps it across upgrades. To use your own key, set `secretKey.existingSecret` to the name of a Secret with a `secret-key` key at least 32 characters long.
:::

::: note
The Gateway or Ingress controller must:

- wait up to 300 seconds for a response, because importing a large archive or an AI agent request can take that long. For HTTPRoute, the chart sets the timeout itself; for Ingress, set it with controller annotations in `ingress.annotations`;
- accept requests of at least `config.maxRequestMb` (64 MB by default);
- append the user's address to the `X-Forwarded-For` header, because ArchMap uses it to limit sign-in attempts. All common controllers do this. If there's no proxy in front of the pod (for example, a LoadBalancer Service is exposed directly), set `config.trustForwardedFor: false`.
:::

::: note
The chart creates the `archmap` Deployment (the `migrate` init container and the application on port 8080), the `archmap` Service (port 80 inside the cluster), the `archmap` Secret (the signing key and, unless `database.existingSecret` is set, the database URL), and the `archmap` HTTPRoute or Ingress if exposure is enabled. For the other chart values, see [Helm chart values](env.md#helm).
:::
