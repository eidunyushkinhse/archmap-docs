---
title: Environment variable reference
order: 13
---

## Change a setting

To change an ArchMap setting, follow these steps:

1. Set the variable for your installation method:
    - server: in `/etc/archmap/archmap.env` in the `VARIABLE=value` format, without spaces around `=`;
    - Docker Compose: in the `environment` section of the `archmap` service in `compose.yaml`;
    - Kubernetes: in a chart value from the `config` section (see [Helm chart values](#helm)) or, if there's no such value, in the `extraEnv` value.
2. Restart ArchMap:
    - server: `sudo systemctl restart archmap`;
    - Docker Compose: `docker compose up -d`;
    - Kubernetes: `helm upgrade archmap oci://ghcr.io/eidunyushkinhse/charts/archmap -n archmap --reuse-values -f archmap-values.yaml --wait`.

## Environment variables {#vars}

| Variable | Default | What it sets |
| --- | --- | --- |
| `DATABASE_URL` | — | The PostgreSQL database address (for example, `postgresql://archmap:PASSWORD@pg.example.com:5432/archmap`). |
| `SECRET_KEY` | generated during installation | The sign-in signing key, at least 32 characters long. After you change it, everyone has to sign in again. |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `10080` | How many minutes a user's sign-in lasts (7 days by default). |
| `CORS_ORIGINS` | the server address | Comma-separated addresses at which users open ArchMap. You need it only if the interface and the API have different addresses. |
| `TRUST_FORWARDED_FOR` | `true` on a server and in Kubernetes, `false` in Docker Compose | Whether to take the user's address from the `X-Forwarded-For` header added by the proxy. Turn it off if there's no proxy in front of ArchMap. |
| `LOGIN_ATTEMPTS_PER_MINUTE` | `10` | Failed sign-in attempts per minute from one address (`0` removes the limit). On a server, the nginx limit applies instead. |
| `MAX_REQUEST_MB` | `64` | The largest request size in MB (for example, when importing a project archive). |
| `MCP_REQUESTS_PER_MINUTE` | `300` | AI agent requests per minute per token (`0` removes the limit). |
| `MCP_ALLOWED_ORIGINS` | empty | Comma-separated addresses of pages from which a browser can access `…/mcp`. |

Each worker process keeps up to 15 connections to PostgreSQL. If you increase the number of processes or pods, make sure that the database's `max_connections` setting is at least pods × processes × 15.

### Server only

- `ARCHMAP_PORT` (`8000` by default): the backend port on `127.0.0.1` that nginx connects to;
- `ARCHMAP_WORKERS` (`2` by default): the number of worker processes. Under noticeable load, set it to `4`;
- `ARCHMAP_BACKUP_DIR` (`/opt/archmap/backups` by default): the directory for the database backups that the installer makes before migrations. Set it when you run the installer (for example, `sudo ARCHMAP_BACKUP_DIR=/srv/backups ./deploy/install.sh`).

### Docker Compose and Kubernetes only

- `WEB_CONCURRENCY` (`2` by default): the number of worker processes in the container;
- `MIGRATE_ON_START` (`true` by default): whether to apply migrations when the container starts. In Kubernetes, the chart turns this off for the application and applies migrations in an init container.

In Docker Compose, you can also set `ARCHMAP_PORT` (the port on the machine, `8080` by default) and `POSTGRES_PASSWORD` (the database password, `archmap` by default) in the `.env` file next to `compose.yaml`.

## Helm chart values {#helm}

| Value | Default | What it sets |
| --- | --- | --- |
| `database.url` | empty | The database address. You can specify a Secret instead. |
| `database.existingSecret`, `database.existingSecretKey` | empty, `database-url` | The Secret with the database address and the name of its key. |
| `secretKey.value` | empty | The sign-in signing key. If the value is empty, the chart generates a random key and keeps it across upgrades. |
| `secretKey.existingSecret`, `secretKey.existingSecretKey` | empty, `secret-key` | The Secret with the signing key and the name of its key. |
| `config.workers` | `2` | The number of worker processes in a pod (`WEB_CONCURRENCY`). |
| `config.loginAttemptsPerMinute` | `10` | `LOGIN_ATTEMPTS_PER_MINUTE`. |
| `config.maxRequestMb` | `64` | `MAX_REQUEST_MB`. The proxy in front of ArchMap must allow requests at least this large. |
| `config.trustForwardedFor` | `true` | `TRUST_FORWARDED_FOR`. |
| `config.corsOrigins` | empty | `CORS_ORIGINS`. |
| `extraEnv` | empty | Other environment variables as a list of `name`/`value` pairs (for example, `MCP_ALLOWED_ORIGINS`). |
| `replicaCount` | `1` | The number of pods. With several pods, migrations run one at a time. |
| `image.repository`, `image.tag` | `ghcr.io/eidunyushkinhse/archmap`, the chart version | The ArchMap image. |
| `imagePullSecrets` | empty | The Secret for pulling the image from a private registry. |
| `ingress.*` | off | Publishing through Ingress: `enabled`, `className`, `annotations`, `hosts`, `tls`. |
| `httpRoute.*` | off | Publishing through the Gateway API: `enabled`, `parentRefs`, `hostnames`, `timeout` (`300s` by default). |
| `resources` | request of 0.1 CPU and 256 MB, limit of 1 GB | Pod resources. |
