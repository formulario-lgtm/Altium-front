# NotificationsMenu

| Field        | Value       |
| ------------ | ----------- |
| Last updated | 2026-10-25  |
| Version      | 0.1.0       |
| Status       | Implemented |

Global header menu (`src/components/layout/NotificationsMenu.vue`) for in-app notifications.

## Behaviour

- Visible when the session has `notifications.read`.
- Badge with unread count (`GET /notifications/unread-count`, polled every 60s).
- Lists recent items; click marks read and routes to sale detail or admin review when `entityType=sale`.
- “Marcar todas” → `POST /notifications/read-all`.

No email or push in this stage. Uses design-system surfaces (no one-off palette).

Sale notifications keep the event title and timestamp, and show the API-provided `number - holder full name` message (for example, 5 - Pedro Pereira). The event title uses bold text. Number/holder and timestamp share a single metadata row, with the timestamp aligned right. The menu expands up to 520px on desktop and fits the mobile viewport; long names use ellipsis with their full text available in the title attribute. Technical entity IDs remain available only for detail navigation. Coverage: `tests/e2e/notifications.spec.ts`.
