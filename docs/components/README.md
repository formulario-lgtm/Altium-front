# Global components index

| Component            | Path                                             | Doc                                                    |
| -------------------- | ------------------------------------------------ | ------------------------------------------------------ |
| AppHeader            | `src/components/layout/AppHeader.vue`            | [app-header.md](app-header.md)                         |
| AppNavigation        | `src/components/layout/AppNavigation.vue`        | [app-navigation.md](app-navigation.md)                 |
| ThemeToggleButton    | `src/components/layout/ThemeToggleButton.vue`    | [theme-toggle-button.md](theme-toggle-button.md)       |
| NotificationsMenu    | `src/components/layout/NotificationsMenu.vue`    | [notifications-menu.md](notifications-menu.md)         |
| AltiumMark           | `src/components/layout/AltiumMark.vue`           | [altium-mark.md](altium-mark.md)                       |
| PageHeader           | `src/components/common/PageHeader.vue`           | [page-header.md](page-header.md)                       |
| StatusBadge          | `src/components/common/StatusBadge.vue`          | [status-badge.md](status-badge.md)                     |
| ConfirmDialog        | `src/components/common/ConfirmDialog.vue`        | [confirm-dialog.md](confirm-dialog.md)                 |
| EmptyState           | `src/components/common/EmptyState.vue`           | [empty-state.md](empty-state.md)                       |
| ErrorState           | `src/components/common/ErrorState.vue`           | [error-state.md](error-state.md)                       |
| GlobalLoadingOverlay | `src/components/common/GlobalLoadingOverlay.vue` | [global-loading-overlay.md](global-loading-overlay.md) |
| DateField            | `src/components/common/DateField.vue`            | [date-field.md](date-field.md)                         |
| PasswordField        | `src/components/common/PasswordField.vue`        | [password-field.md](password-field.md)                 |
| UserAvatar           | `src/components/common/UserAvatar.vue`           | [user-avatar.md](user-avatar.md)                       |

Tables use Vuetify `v-data-table-server` inside a default `v-card` (`altium-surface-card`). Filter rows use `v-row.altium-filters`. Do not add a table wrapper until a second divergent pattern appears.

Feature-local components are documented under `docs/features/`, not here.

Design tokens and mandatory reuse rules: [visual-identity.md](../architecture/visual-identity.md).
