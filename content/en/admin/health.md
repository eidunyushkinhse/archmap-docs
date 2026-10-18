---
title: Check the service status and read the logs
order: 11
---

## Check that the service is running

To check the status of ArchMap, follow these steps:

1. Request the `/health` address:
    - on a server: `curl -s http://127.0.0.1:8000/health`;
    - in Docker Compose: `curl -s http://localhost:8080/health`.

    If the ArchMap process is alive, it replies `{"status":"ok"}`.

2. Request the `/ready` address:
    - on a server: `curl -s http://127.0.0.1:8000/ready`;
    - in Docker Compose: `curl -s http://localhost:8080/ready`.

    If ArchMap is ready and the database responds, it replies `{"status":"ok"}`. If the database doesn't respond, ArchMap replies with code 503.

::: note
In Kubernetes, the cluster checks these addresses itself: the startup and liveness probes request `/health`, and the readiness probe requests `/ready`. To see the pod status, run `kubectl -n archmap get pods`. On a server, `systemctl status archmap` shows the service status.
:::

## Read the logs

To read the ArchMap log, run the command for your installation method:

- server: `journalctl -u archmap -f`;
- Docker Compose: `docker compose logs -f archmap`;
- Kubernetes: `kubectl -n archmap logs deploy/archmap`.

::: note
The log has one line per request (method, path, response code, and address) and errors with tracebacks. AI agent calls are logged on separate lines labeled `archmap.mcp`: the user, the token name and prefix, the tool, the project, the result, the duration, and the address. Passwords, tokens, and document contents never get into the log.
:::

::: note
ArchMap doesn't write its own log files. On a server, journald keeps the service log, and nginx logs are in `/var/log/nginx/`. To keep the service log across reboots and limit its size, configure journald (for example, in `/etc/systemd/journald.conf.d/archmap.conf`):

```ini
[Journal]
Storage=persistent
SystemMaxUse=1G
MaxRetentionSec=90day
```

Then run `sudo systemctl restart systemd-journald`.
:::

::: note
On a server, the installer writes its log only to the terminal. To save it, run the installer like this: `sudo ./deploy/install.sh 2>&1 | tee install.log`.
:::

## Common problems

### On a server

- **nginx replies 502**: the ArchMap service isn't running. Check the last lines of the log: `journalctl -u archmap -n 50`.
- **The bundled Python doesn't start**: the distribution directory is mounted with `noexec`, a closed software environment is enabled (for example, in Astra Linux SE it runs only signed programs), or an SELinux policy blocks it (check `ausearch -m avc`).
- **The installer stopped at the database check**: the message says what to fix (the connection, the PostgreSQL version, the database encoding, or the user's privileges).

### In Kubernetes

- **The pod is in `Init:Error` or `Init:CrashLoopBackOff`**: the init container failed the database check or the migrations. Check its log: `kubectl -n archmap logs <pod> -c migrate`. The message in the log says what to fix.
- **`ImagePullBackOff`**: the image address is wrong (`image.repository`, `image.tag`), or the namespace has no access to the registry (`imagePullSecrets`).
- **`CreateContainerConfigError`**: the Secret from `database.existingSecret` doesn't exist, or its key has a different name than `database.existingSecretKey`.

### With any installation method

- **Importing a large archive breaks off or returns 413**: the proxy in front of ArchMap limits the request size or the response time. Raise the limit to 64 MB and the timeout to 300 seconds.
- **“Too many sign-in attempts” for all users at once**: ArchMap treats requests from all users as requests from the single address of the proxy. In Docker Compose and Kubernetes, turn on `TRUST_FORWARDED_FOR` (see [Environment variable reference](env.md)). On a server, nginx allows 10 sign-in attempts per minute from one address. If all users come through one proxy, raise `rate` in `/etc/nginx/conf.d/archmap.conf` and run `sudo systemctl reload nginx`.
- **An AI agent can't connect at `…/mcp`**: on a server installed before this address appeared, nginx doesn't have it (see [Connect AI agents on a server installed before /mcp](update.md#mcp)).
