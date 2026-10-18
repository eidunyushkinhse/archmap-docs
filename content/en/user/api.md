---
title: View a service's API
order: 6
---

::: note
An OpenAPI specification describes a service's HTTP API: endpoints, their parameters, request body, and responses.
:::

## Open the specification

To view a service's API, follow these steps:

1. Open the service page (see [Find a service's documentation](find-service.md)) and scroll to the **OpenAPI** section.
2. In the **OpenAPI** section, click **Specification**. A window with the list of endpoints opens.
3. In the window, click an endpoint. Its parameters, request body, and responses expand.
4. Close the window with the cross in the upper-right corner or with the <kbd>Esc</kbd> key.

![Specification window](../images/api-viewer.png "Order API specification: the order creation endpoint is expanded")

::: note
If a service page has no **OpenAPI** section, no specification has been documented for the service.
:::

::: note
The window only displays the specification: you cannot send a request to the service from it.
:::

::: note
The **Show code** button in the window header opens the specification's source text. You can copy the text but not change it.
:::

::: note
For a container service, the **OpenAPI** section collects the specifications of its components. The left part of a row opens the specification; the right part, **from …**, leads to the page of the component that owns it.
:::

## View an endpoint's logic

To view an endpoint's logic, follow these steps:

1. In the specification window, find the endpoint and note its method and path (for example, **POST /orders**).
2. Close the window.
3. On the service page, in the **Logic** section, in the **Operations** list, click the diagram next to which this endpoint is shown. A window with the diagram opens (see [View the logic of an operation or worker](logic.md)).

::: note
If the **Operations** list has no diagram with this endpoint, the endpoint's logic has not been documented.
:::
