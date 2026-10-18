---
title: View broker channels
order: 8
---

::: note
Message broker channels are linked to logic diagrams through the “publishes” and “consumes” markers in diagram steps (see [View the logic of an operation or worker](logic.md)). Based on these markers, the **Channels** section shows which services and diagrams publish messages to a channel and consume them.
:::

## View a channel

To view the channels of a message broker, follow these steps:

1. Open the message broker page (see [Find a service's documentation](find-service.md)) and scroll to the **Channels** section.
2. In the **Channels** section, expand a channel. To do this, click the arrow to the left of its name. The delivery parameters, message fields, and the **Publishers / consumers** list appear.
3. In the **Publishers / consumers** list, find the services and their logic diagrams that publish messages to the channel or consume them.

![Channels section](../images/facts-channels.png "Channels section of the Kafka broker: the orders.events channel is expanded")

::: note
A channel in ArchMap is what each broker calls in its own way: a topic in Kafka, a queue or exchange in RabbitMQ, a stream in Redis, a subject in NATS. The kind of channel is shown to the right of its name.
:::

::: note
The rows of the **Publishers / consumers** list do not open logic diagrams. A diagram opens on the service page in the **Logic** section (see [View the logic of an operation or worker](logic.md)).
:::

::: note
If the section says **No channels documented**, the broker's channels have not been documented in the project yet.
:::
