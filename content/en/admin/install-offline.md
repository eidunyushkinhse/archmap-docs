---
title: Install ArchMap in an isolated network
order: 4
---

::: note
ArchMap doesn't connect to external networks: once installed, it only needs the PostgreSQL database and its users. You need internet access once, to get the distribution, and then you can install it on a server or in a cluster without internet access. Both the server installation and the Kubernetes installation work in an isolated network. Docker Compose builds the image from source and doesn't work without the internet.
:::

## Install on a server without internet access

To install ArchMap on a server without internet access, follow these steps:

1. On a machine with internet access, build the distribution archive (see [Build the distribution archive](install-server.md#bundle)).
2. Transfer the archive and the `.sha256` file to the isolated network the way your organization does it.
3. Install ArchMap from the archive (see [Install ArchMap](install-server.md#install)).

::: note
All dependencies are already in the distribution archive: the portable Python, the backend packages, and the built interface. The backend packages are installed during the build strictly from `backend/requirements-prod.lock` with checksums, so the distribution contains exactly the versions specified in the repository.
:::

## Copy the image and chart to your registry

To install ArchMap in a cluster without internet access, follow these steps:

1. On a machine with internet access, save the ArchMap image of the version you need to a file (for example, with skopeo):

    ```bash
    skopeo copy --all docker://ghcr.io/eidunyushkinhse/archmap:VERSION \
      oci-archive:archmap-VERSION.tar
    ```

2. Download the chart archive of the same version:

    ```bash
    helm pull oci://ghcr.io/eidunyushkinhse/charts/archmap --version VERSION
    ```

3. Transfer `archmap-VERSION.tar` and `archmap-VERSION.tgz` to the isolated network.
4. Push the image to the isolated network's registry:

    ```bash
    skopeo copy --all oci-archive:archmap-VERSION.tar \
      docker://registry.example.com/archmap:VERSION
    ```

5. Add the image address in your registry to the `archmap-values.yaml` values file:

    ```yaml
    image:
      repository: registry.example.com/archmap
      tag: VERSION
    ```

6. Install the chart from the archive (see [Install the chart](install-kubernetes.md#install-the-chart)), using the file path instead of `oci://…`:

    ```bash
    helm install archmap ./archmap-VERSION.tgz -n archmap -f archmap-values.yaml --wait
    ```

::: note
You can also build the image yourself from source: run `docker build -t registry.example.com/archmap:VERSION .` in the repository root, and then `docker push`. If the registry requires authentication, set the Secret for pulling the image in `imagePullSecrets`.
:::

## Connect AI agents when you use an internal certificate authority

::: note
If the ArchMap certificate is issued by an internal certificate authority, your users' AI agents must trust that authority, or they won't connect via MCP.
:::

To let your users' AI agents connect to ArchMap, follow these steps:

1. Find the root certificate file on your users' computers that includes your certificate authority (usually `/etc/ssl/certs/ca-certificates.crt` on Debian, Ubuntu, and Astra Linux, or `/etc/pki/tls/certs/ca-bundle.crt` on RHEL and related systems).
2. Tell your users the path to this file and the environment variable to set it in:
    - for agents built on Node.js (for example, Claude Code or Qwen Code), `NODE_EXTRA_CA_CERTS`;
    - for the local ArchMap MCP server, `SSL_CERT_FILE`.
3. If network access goes through a proxy, ask your users to add the ArchMap address to the `NO_PROXY` variable (see [Connect an AI agent to ArchMap](../user/agent-setup.md)).

::: note
To document code with an AI agent, users can use any agents allowed in your network. An agent connects to ArchMap at `…/mcp` or works with prompts from ArchMap windows.
:::
