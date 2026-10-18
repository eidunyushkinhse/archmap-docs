---
title: View a service's configuration
order: 9
---

::: note
A service's configuration parameters are linked to its logic diagrams through the “depends on” markers in diagram steps (see [View the logic of an operation or worker](logic.md)). Based on these markers, the **Configuration** section shows which parameters the service's diagrams depend on.
:::

## View a parameter

To view a service's configuration, follow these steps:

1. Open the service page (see [Find a service's documentation](find-service.md)) and scroll to the **Configuration** section.
2. In the **Configuration** section, find the parameter.
3. Below the parameter, in the **used by:** line, read the names of the service's logic diagrams that depend on it.

![Configuration section](../images/facts-config.png "Configuration section of the Order API service: parameters and the diagrams that depend on them")

::: note
The **Default** column shows the value from the service's code. ArchMap does not store parameter values for environments (test, production, and others).
:::

::: note
Only parameters referenced by “depends on” markers in the logic diagrams of the same service have a **used by:** line. The diagram names in it do not open the diagrams: a diagram opens in the **Logic** section on the same page (see [View the logic of an operation or worker](logic.md)).
:::

::: note
If the section says **No parameters documented**, the service's configuration has not been documented in the project yet.
:::
