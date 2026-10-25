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
