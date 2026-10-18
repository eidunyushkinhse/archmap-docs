---
title: Document broker channels
order: 8
---

::: note
A message broker's channels (topics, queues, and exchanges) and the fields of their messages are documented in the **Channels** section of the broker page. Changes in the section are saved when you leave the field.
:::

## Describe a channel manually {#channel}

To describe a channel, follow these steps:

1. On the broker page, in the **Channels** section, click **+ Channel** and select **Manually**. A new channel appears.
2. Enter the channel name exactly as it appears in the code (for example, `orders.events`) and briefly describe what the channel is for.
3. Enter the channel type (for example, `topic` in Kafka, or `queue` or `exchange` in RabbitMQ).
4. If needed, fill in the delivery settings:
    - the partition key;
    - the delivery guarantee (for example, `at-least-once`);
    - the message retention period (for example, `7d`).
5. Click **+ Field** and describe a message field: its name, type, whether it's required, and the meaning of its value.
6. Repeat the previous step for the remaining fields.

::: note
If the broker groups channels (vhosts in RabbitMQ, namespaces in Pulsar), enter the channel's group. Kafka has no such level, so leave the field empty for it.
:::

::: note
ArchMap builds the **Publishers / consumers** line of a channel from the `publishes:` and `consumes:` markers in logic diagram steps (see [Refer to tables, channels, and parameters](logic.md#markers)).
:::

## Describe channels with an AI agent {#agent}

<!--@include: ../_shared/agent-beta.md-->

::: note
A broker has no repository of its own. Channels are declared in the code of the services that publish and consume messages, so you need to run the agent in the repository of each of these services. In each repository, the agent documents only the channels that its code uses.
:::

::: note
The agent looks for channels in constants and configuration, in publish and subscribe calls, in event schemas (for example, Avro or Protobuf), and in deployment configuration. It takes message fields from event classes and schemas. The agent doesn't connect to the broker itself.
:::

::: note
Before you run the agent, add every broker the repository's code works with to the diagram. The prompt gives the agent the list of the project's brokers, and the agent assigns channels only to them.
:::

To document a broker's channels with an agent, follow these steps:

1. On the broker page, in the **Channels** section, click **+ Channel** and select **With an AI agent**. The **Describe channels with an AI agent** window opens.
2. Click **Copy prompt**.
3. Start the agent in the repository of one of the services that work with the broker. Paste the prompt and send it. The agent saves its files to the `archmap-docs/` directory of the repository.
4. Add the files from `archmap-docs/` to the window in one of the following ways:
    - drag the files into the field on the right;
    - click **Upload files…** and select the files;
    - click **+ paste from clipboard** and paste the file's text.

    The check appears under the field. It shows which channels will be written and how many fields each one has.
5. Click **Apply**. The window closes, and the channels appear in the **Channels** section.
6. Repeat steps 2–5 in the repositories of the other services that publish to the broker or consume from it.

::: note
Files from different repositories complement each other. New channels and fields are added to the ones already documented, and nothing is duplicated. If repositories specify different delivery settings for a channel (for example, retention), ArchMap keeps the value documented first, and the check shows the difference in the **Check:** list.
:::

::: note
Each file from the agent belongs to one broker, and the agent writes the broker's address on the file's first line (for example, `# archmap-node: Yarmarka Marketplace / Kafka`). If a service works with several brokers, the agent creates a separate file for each. Channels from a file without this line go to the broker whose page you opened the window from.
:::

::: note
The prompt passes the agent the channels already set in the **Channel** field of relationships on the diagram, and the agent documents each of them if it finds it in the code. If a channel isn't in any file and the broker doesn't have it either, the check reports it in the **Check:** list. This usually means the channel has a different name in the code than in the relationship. In that case, fix the channel name on the relationship (see [Edit or delete a relationship](edges.md#edit)).
:::

::: note
The agent fills in delivery settings (partition key, delivery guarantee, and retention) only if they are set in the code or configuration. Otherwise, the fields stay empty.
:::

::: note
By default, what's already documented stays as it is, and the agent only adds what's missing. To replace old descriptions with new ones, select **Overwrite filled fields** before you apply. Nothing is deleted with any setting.
:::

::: note
This window doesn't record who publishes to a channel and who consumes from it. That's what the `publishes:` and `consumes:` markers in logic diagrams are for, so it's best to document the channels before the logic. The agent then refers to channel names that are already known when it documents the logic (see [Document the system with an AI agent](agent-docs.md#order)).
:::

<!--@include: ../_shared/agent-remarks.md-->

::: note
An agent connected via MCP can also document channels. Ask it in your own words (for example, “Document the Kafka channels in the Yarmarka project from this repository”). The agent shows you a plan and writes the channels to the project after you confirm (see [Connect your agent via MCP](mcp.md)).
:::
