# Features documentation index

| Feature             | Route(s)                                                                              | Doc                                                                                         | Status      |
| ------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ----------- |
| Auth (guest)        | `/login`, `/forgot-password`, `/reset-password`, `/activate`                          | [auth/overview.md](auth/overview.md)                                                        | Implemented |
| Home (por rol)      | `/`                                                                                   | [home/overview.md](home/overview.md)                                                        | Implemented |
| Account             | `/account/change-password`, `/account/sessions`                                       | [account/overview.md](account/overview.md)                                                  | Implemented |
| Users               | `/users`                                                                              | [users/overview.md](users/overview.md)                                                      | Implemented |
| Teams               | `/teams`, `/teams/:id`                                                                | [teams/overview.md](teams/overview.md)                                                      | Implemented |
| Roles & permissions | `/roles`                                                                              | [roles/overview.md](roles/overview.md)                                                      | Implemented |
| Audit               | `/audit`                                                                              | [audit/overview.md](audit/overview.md)                                                      | Implemented |
| Sales               | `/sales`, `/sales/new`, `/sales/:id`, `/sales/:id/edit`                               | [sales/overview.md](sales/overview.md)                                                      | Implemented |
| Administrative      | `/administrative/sales`, `…/:id`, `/administrative/follow-ups` (KPIs on `/` via home) | [administrative/overview.md](administrative/overview.md)                                    | Implemented |
| Supervision         | `/supervision/sellers`, `…/administratives`, `…/goals` (KPIs on `/` via home)         | [supervision/overview.md](supervision/overview.md), [indicators](supervision/indicators.md) | Implemented |
| System status       | `/system`, `/forbidden`, not-found                                                    | [system-status/overview.md](system-status/overview.md)                                      | Implemented |

Session handling, CSRF and guards: [guides/authentication.md](../guides/authentication.md).

Other commercial CRM modules (customers, opportunities, generic BI dashboards) are **not** implemented yet. Administrative and supervision dashboards are in scope.
