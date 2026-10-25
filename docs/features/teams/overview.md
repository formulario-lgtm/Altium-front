# Teams

| Field        | Value       |
| ------------ | ----------- |
| Last updated | 2026-10-24  |
| Version      | 0.1.0       |
| Status       | Implemented |

## Goal

Manage commercial teams: supervisor, description, active flag and members.

## Routes

| Path         | Name          | View             | Permission   |
| ------------ | ------------- | ---------------- | ------------ |
| `/teams`     | `teams`       | `TeamsView`      | `teams.read` |
| `/teams/:id` | `team-detail` | `TeamDetailView` | `teams.read` |

## Expected behavior

- **List:** server-side table with `limit`/`offset`, search `q` (team name) and active filter. Rows open the detail. SUPER_ADMIN sees all teams; other roles only teams they supervise/belong to (backend scope).
- **Create / edit** (`teams.create` / `teams.update`): `TeamFormDialog` with name, supervisor select, description and (edit only) active switch. Edit sends only changed fields; emptying the description sends `null`.
- **Supervisor picker:** active users with role `SUPERVISOR`.
- **Members** (`teams.manage_members`): list (toggle “Incluir históricos” → `includeFormer=true`), add an active SELLER/ADMINISTRATIVE user (autocomplete), remove with `ConfirmDialog` (history kept). Adding is hidden for inactive teams. `409` (user already in another team) is shown inline.

## Components

- Feature-local: `TeamFormDialog`
- Global: `PageHeader`, `StatusBadge`, `ConfirmDialog`, `EmptyState`, `ErrorState`

## Composables / utils

- `useTeamsQuery`, `useTeamQuery`, `useTeamMembersQuery`, `useCreateTeamMutation`, `useUpdateTeamMutation`, `useAddTeamMemberMutation`, `useRemoveTeamMemberMutation`, `useActiveUsersByRole`
- `useTeamEditor` (dialog state shared by list and detail)
- `utils/team-payload.ts`: `toCreateTeamBody`, `toUpdateTeamBody`

## Services / endpoints

| Function           | Endpoint                                              |
| ------------------ | ----------------------------------------------------- |
| `listTeams`        | `GET /api/v1/teams`                                   |
| `getTeam`          | `GET /api/v1/teams/{id}`                              |
| `createTeam`       | `POST /api/v1/teams`                                  |
| `updateTeam`       | `PATCH /api/v1/teams/{id}`                            |
| `listTeamMembers`  | `GET /api/v1/teams/{id}/members`                      |
| `addTeamMember`    | `POST /api/v1/teams/{id}/members`                     |
| `removeTeamMember` | `DELETE /api/v1/teams/{id}/members/{userId}`          |
| `listUsers`        | `GET /api/v1/users?status=ACTIVE&limit=100` (pickers) |

## Validations

`teamFormSchema`: name 1–150, description ≤ 2000, supervisor required (limits mirror backend DTOs).

## Limitations

- Pickers load the first 100 active users and filter by role code client-side (fine for ~20 users; revisit with server-side role filtering when the user base grows). They require `users.read`.

## Tests

Unit: `tests/unit/feature-utils.spec.ts` (team payloads). No E2E yet.
