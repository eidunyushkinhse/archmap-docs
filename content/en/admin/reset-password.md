---
title: Reset a user's password
order: 7
---

::: note
If a user has forgotten their password, an administrator sets a new one on the **Users** screen. Administrators can't see or find out the old password.
:::

## Reset a password

To reset a user's password, follow these steps:

1. Open the **Users** screen (see [Open the Users screen](users.md#open)).
2. On the right side of the user's row, click **Reset password**. The **Reset password** window opens.
3. In the **New password** field, enter a password at least 8 characters long.
4. Click **Reset**.
5. Give the password to the user and ask them to change it after they sign in (see [Change your password](../user/password.md)).

::: note
Administrators change their own password in the profile menu, like everyone else. If an administrator can't sign in, a server command restores access (see [Restore administrator access](first-admin.md#restore)).
:::

::: note
Resetting a password ends all of the user's active sessions, so they can sign in only with the new password. Their AI agent tokens keep working. If a token may have fallen into the wrong hands, ask the user to revoke it (see [Revoke a token](../user/agent-setup.md#revoke-a-token)).
:::
