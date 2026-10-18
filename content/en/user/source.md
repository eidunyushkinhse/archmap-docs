---
title: Find a service's source code
order: 10
---

::: note
An object's source tells you where its code lives: a repository and a path within it. For a dependency whose code isn't part of the product (a database, a broker, or another product), the source is the name the product uses for it in its configuration. ArchMap uses the source to identify the object when the documentation is updated from the code.
:::

## Find the service's code

To find a service's repository and code path, follow these steps:

1. Open the service page (see [Find service documentation](find-service.md)).
2. In the **Properties** section, find the **Source** row. It shows one of the following:
    - **code:** the repository and the path to the service's directory; if there is no path, the whole repository belongs to the service;
    - **dependency name:** the name the product uses for the object in its configuration (for example, in docker-compose); the object's code isn't part of the product;
    - **none — matched by name:** no source is set.
3. Copy the repository address and open it in your browser.
4. In the repository, go to the directory shown after **path**.

![Properties section](../images/source-props.png "The source of Order API: the github.com/yarmarka/orders repository, path services/order-api")

::: note
Objects that an AI agent has documented from the code get their source automatically. Objects added manually may have no source.
:::

::: note
The source describes the product, not its deployment: it never includes server or environment addresses.
:::
