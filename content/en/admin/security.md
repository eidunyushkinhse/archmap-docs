---
title: Secure your installation
order: 12
---

## What's protected by default {#defaults}

ArchMap is secure by default:

- users can't sign up themselves, and an administrator creates the accounts;
- failed sign-in attempts are limited (10 per minute from one address);
- the API description (Swagger) isn't exposed;
- AI agent tokens are stored only as hashes, and a token is shown once when it's issued. A token can't delete anything, manage projects or users, change a password, or issue a new token;
- every response has security headers, and ArchMap can't be embedded in someone else's page;
- in Kubernetes, the pod runs without root and privileges and meets the Pod Security “restricted” profile;
- on a server, the service runs as a separate `archmap` user in a systemd sandbox, and the system is read-only for it.

Without TLS, passwords and tokens travel over the network in plain text. Use ArchMap without TLS only in a trusted test network segment.

## Set your own sign-in signing key

::: note
The signing key protects users' sign-in tokens. ArchMap generates a random key during installation. Set your own key if the previous one may have become known to others.
:::

To set your own signing key, follow these steps:

1. Generate a random key that is at least 32 characters long:

    ```bash
    openssl rand -hex 32
    ```

2. Set the key in the settings for your installation method:
    - server: in the `SECRET_KEY` variable in `/etc/archmap/archmap.env`;
    - Docker Compose: in the `SECRET_KEY` variable in the `environment` section of the `archmap` service in `compose.yaml`;
    - Kubernetes: in the `secret-key` key of the Secret named in the `secretKey.existingSecret` value.
3. Restart ArchMap:
    - server: `sudo systemctl restart archmap`;
    - Docker Compose: `docker compose up -d`;
    - Kubernetes: `kubectl -n archmap rollout restart deploy/archmap`.

::: note
After you change the key, all users have to sign in again. AI agent tokens keep working, because they don't depend on the signing key.
:::

## Request limits {#limits}

You set request limits with environment variables (see [Environment variable reference](env.md)):

| Variable | What it limits | Default |
| --- | --- | --- |
| `LOGIN_ATTEMPTS_PER_MINUTE` | Failed sign-in attempts per minute from one address. On a server, nginx limits sign-in attempts, and the `rate` parameter in `/etc/nginx/conf.d/archmap.conf` sets the limit. | `10` |
| `MCP_REQUESTS_PER_MINUTE` | AI agent requests per minute per token. In addition, ArchMap accepts no more than 30 failed token checks per minute from one address. | `300` |
| `MCP_ALLOWED_ORIGINS` | Addresses of pages from which a browser can access `…/mcp`. AI agents don't send the `Origin` header, so you need this setting only if a web application accesses ArchMap. | empty |

The value `0` for `LOGIN_ATTEMPTS_PER_MINUTE` and `MCP_REQUESTS_PER_MINUTE` removes the limit.

Each ArchMap worker process counts requests on its own, so the actual limit equals the set limit multiplied by the number of processes (and in Kubernetes, also by the number of pods).

ArchMap gets the user's address from the `X-Forwarded-For` header added by the proxy in front of it. If there's no proxy, stop trusting this header (`TRUST_FORWARDED_FOR=false`). Otherwise, users can fake their address and get around the limits.

## Relax the service sandbox on a server

::: note
If programs in your environment (for example, security tools) need access that the systemd sandbox blocks, change the restrictions in an override file, not in the unit itself, because an upgrade overwrites the unit.
:::

To change the service restrictions, follow these steps:

1. Open the editor for the service override settings:

    ```bash
    sudo systemctl edit archmap
    ```

2. Add the systemd parameters you need and save the file.
3. Restart the service:

    ```bash
    sudo systemctl restart archmap
    ```

::: note
To see how isolated the service is, run `systemd-analyze security archmap`. For ArchMap, it gives a score of about 1.5 (“OK”).
:::
