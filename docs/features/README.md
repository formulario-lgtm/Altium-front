# Features documentation index

| Feature             | Route(s)                                                     | Doc                                                    | Status      |
| ------------------- | ------------------------------------------------------------ | ------------------------------------------------------ | ----------- |
| Auth (guest)        | `/login`, `/forgot-password`, `/reset-password`, `/activate` | [auth/overview.md](auth/overview.md)                   | Implemented |
| Home                | `/`                                                          | [home/overview.md](home/overview.md)                   | Implemented |
| Account             | `/account/change-password`, `/account/sessions`              | [account/overview.md](account/overview.md)             | Implemented |
| Users               | `/users`                                                     | [users/overview.md](users/overview.md)                 | Implemented |
| Teams               | `/teams`, `/teams/:id`                                       | [teams/overview.md](teams/overview.md)                 | Implemented |
| Roles & permissions | `/roles`                                                     | [roles/overview.md](roles/overview.md)                 | Implemented |
| Audit               | `/audit`                                                     | [audit/overview.md](audit/overview.md)                 | Implemented |
| Sales               | `/sales`, `/sales/new`, `/sales/:id`, `/sales/:id/edit`      | [sales/overview.md](sales/overview.md)                 | Implemented |
| System status       | `/system`, `/forbidden`, not-found                           | [system-status/overview.md](system-status/overview.md) | Implemented |

Session handling, CSRF and guards: [guides/authentication.md](../guides/authentication.md).

Other commercial CRM modules (customers, opportunities, dashboards/KPIs) are **not** implemented yet.
