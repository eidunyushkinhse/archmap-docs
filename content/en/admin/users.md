---
title: Create user accounts and assign roles
order: 6
---

::: note
An administrator creates accounts on the **Users** screen. ArchMap doesn't send email, so the administrator gives the temporary password to the person directly, and they change it in the profile menu.
:::

## Open the Users screen {#open}

To open the **Users** screen, follow these steps:

1. Click your profile icon in the upper-right corner of any page. The profile menu opens.
2. Select **Users**. A screen opens with the list of accounts: username, role, administrator flag, status, and creation date.

::: note
Only administrators have **Users** in the menu.
:::

## Create an account

To create an account, follow these steps:

1. On the **Users** screen, click **New user**. The **New user** window opens.
2. Enter the username in the **Username** field.
3. In the **Role** list, select the account role:
    - **Architect**, if the person will create projects and edit diagrams;
    - **Viewer**, if the person only needs to read the documentation.
4. If the person will manage accounts, select **Administrator**.
5. In the **Temporary password** field, enter a password at least 8 characters long.
6. Click **Create**. The account appears in the list.
7. Give the person their username and temporary password. Ask them to change the password after they first sign in (see [Change your password](../user/password.md)).

::: note
An account alone doesn't give access to any projects. The person sees only the projects they've been added to as a member and the projects visible to all users (see [Share a project and assign roles](../architect/access.md)).
:::

## Change an account role

To change a user's account role, follow these steps:

1. On the **Users** screen, find the user.
2. Select a new role in the **Role** column. The change is saved immediately.

::: note
When an architect becomes a viewer, their editor roles in projects change to reader. You can't change the role of a user who owns projects, so transfer their projects to another architect first (see [Transfer a project or restore it from the archive](projects.md)).
:::

::: note
You can't change an administrator's role, because administrators are always architects.
:::

## Grant or revoke administrator rights

To grant or revoke administrator rights, follow these steps:

1. On the **Users** screen, find the user.
2. On the right side of the user's row, click one of the following:
    - **Make admin**: the user gets administrator rights immediately;
    - **Revoke admin**: a confirmation window opens; click **Revoke** in it.

::: note
A user who becomes an administrator gets the Architect account role. When administrator rights are revoked, the role stays the same. You can't revoke your own rights or the rights of the last administrator.
:::

## Block an account

To block an account, follow these steps:

1. On the **Users** screen, find the user.
2. On the right side of the user's row, click **Block**. A confirmation window opens.
3. Click **Block**. **Blocked** appears in the **Status** column.

::: note
A blocked user can't sign in, their open sessions end, and their AI agent tokens stop working. You can't delete an account, but you can block it.
:::

::: note
To restore access, click **Unblock** in the user's row. You can't block yourself or the last administrator.
:::

<!--@include: ../_shared/project-roles.md-->
