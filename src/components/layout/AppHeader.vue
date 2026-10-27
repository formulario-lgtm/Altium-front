<script setup lang="ts">
import { computed } from 'vue';
import UserAvatar from '@/components/common/UserAvatar.vue';
import { initialsFromLabel } from '@/utils/format';
import { roleLabel } from '@/utils/role-labels';
import AltiumMark from './AltiumMark.vue';
import NotificationsMenu from './NotificationsMenu.vue';
import ThemeToggleButton from './ThemeToggleButton.vue';

const props = withDefaults(
  defineProps<{
    userName?: string;
    username?: string;
    roleCode?: string | null;
    showNavToggle?: boolean;
    loggingOut?: boolean;
  }>(),
  { userName: '', username: '', roleCode: null, showNavToggle: true, loggingOut: false },
);

const emit = defineEmits<{ 'toggle-nav': []; logout: [] }>();

const avatarInitials = computed(() => initialsFromLabel(props.userName));
const roleDisplay = computed(() => roleLabel(props.roleCode));
</script>

<template>
  <v-app-bar class="altium-app-bar" density="comfortable">
    <v-app-bar-nav-icon
      v-if="showNavToggle"
      aria-label="Abrir o cerrar navegación"
      @click="emit('toggle-nav')"
    />

    <v-app-bar-title class="altium-app-bar__title ms-1">
      <router-link :to="{ name: 'home' }" class="altium-app-bar__brand text-decoration-none">
        <AltiumMark size="sm" />
      </router-link>
    </v-app-bar-title>

    <template #append>
      <NotificationsMenu />
      <ThemeToggleButton />
      <v-divider vertical inset class="mx-3 my-3 d-none d-sm-flex" />

      <v-menu v-if="userName" location="bottom end" :offset="10" transition="fade-transition">
        <template #activator="{ props: menuProps, isActive }">
          <v-btn
            v-bind="menuProps"
            variant="text"
            class="altium-user-menu__activator text-none"
            :class="{ 'altium-user-menu__activator--open': isActive }"
            aria-label="Menú de usuario"
            data-testid="user-menu"
          >
            <UserAvatar :initials="avatarInitials" :size="34" />
            <span class="altium-user-menu__activator-meta d-none d-sm-flex">
              <span class="altium-user-menu__activator-name">{{ userName }}</span>
              <span v-if="roleDisplay" class="altium-user-menu__activator-role">{{
                roleDisplay
              }}</span>
            </span>
            <v-icon
              icon="mdi-chevron-down"
              size="20"
              class="altium-user-menu__chevron ms-1"
              :class="{ 'altium-user-menu__chevron--open': isActive }"
            />
          </v-btn>
        </template>

        <v-card class="altium-user-menu" width="288" border>
          <div class="altium-user-menu__header">
            <UserAvatar :initials="avatarInitials" :size="44" :label="userName" />
            <div class="altium-user-menu__identity">
              <p class="altium-user-menu__name">{{ userName }}</p>
              <p v-if="username" class="text-caption text-medium-emphasis mb-1">
                Usuario: {{ username }}
              </p>
              <p v-if="roleDisplay" class="altium-user-menu__role">{{ roleDisplay }}</p>
            </div>
          </div>

          <v-divider />

          <v-list class="altium-user-menu__list py-2" density="comfortable" nav>
            <v-list-item
              :to="{ name: 'account-change-password' }"
              prepend-icon="mdi-key-outline"
              title="Cambiar contraseña"
              rounded="lg"
            />
            <v-list-item
              :to="{ name: 'account-sessions' }"
              prepend-icon="mdi-devices"
              title="Sesiones activas"
              rounded="lg"
            />
          </v-list>

          <v-divider />

          <v-list class="altium-user-menu__list py-2" density="comfortable" nav>
            <v-list-item
              class="altium-user-menu__logout"
              prepend-icon="mdi-logout"
              title="Cerrar sesión"
              rounded="lg"
              :disabled="loggingOut"
              data-testid="logout"
              @click="emit('logout')"
            />
          </v-list>
        </v-card>
      </v-menu>
    </template>
  </v-app-bar>
</template>

<style scoped lang="scss">
.altium-app-bar__title {
  display: flex;
  align-items: center;
  line-height: 1;
}

.altium-app-bar__title :deep(.v-toolbar-title__placeholder),
.altium-app-bar__title :deep(.v-toolbar-title) {
  line-height: 1;
}

.altium-app-bar__brand {
  display: inline-flex;
  align-items: center;
  line-height: 1;
  color: inherit;
}

.altium-user-menu__activator {
  min-height: 2.75rem !important;
  padding-inline: 0.45rem 0.55rem !important;
  border-radius: var(--altium-radius-pill, 999px) !important;
  border: 1px solid transparent;
  gap: 0.55rem;
}

.altium-user-menu__activator:hover,
.altium-user-menu__activator--open {
  border-color: var(--altium-glass-border) !important;
  background: rgba(var(--v-theme-primary), 0.08) !important;
}

.altium-user-menu__activator-meta {
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
  max-width: 11rem;
  line-height: 1.15;
  text-align: left;
}

.altium-user-menu__activator-name {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.875rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
}

.altium-user-menu__activator-role {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.7rem;
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface-variant));
}

.altium-user-menu__chevron {
  color: rgb(var(--v-theme-on-surface-variant));
  transition: transform 0.18s ease;
}

.altium-user-menu__chevron--open {
  transform: rotate(180deg);
}

.altium-user-menu {
  overflow: hidden;
  border-radius: var(--altium-radius-xl, 1.25rem) !important;
  background: var(--altium-glass) !important;
  border-color: var(--altium-glass-border) !important;
  box-shadow: var(--altium-card-shadow);
  backdrop-filter: blur(18px) saturate(1.15);
  -webkit-backdrop-filter: blur(18px) saturate(1.15);
}

.altium-user-menu__header {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 1rem 1.1rem 0.95rem;
}

.altium-user-menu__identity {
  min-width: 0;
}

.altium-user-menu__name {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  line-height: 1.25;
  color: rgb(var(--v-theme-on-surface));
}

.altium-user-menu__role {
  margin: 0.15rem 0 0;
  font-size: 0.78rem;
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface-variant));
}

.altium-user-menu__list {
  padding-inline: 0.45rem !important;
  background: transparent !important;
}

.altium-user-menu__list :deep(.v-list-item-title) {
  font-size: 0.9rem;
  font-weight: 500;
}

.altium-user-menu__logout :deep(.v-list-item-title),
.altium-user-menu__logout :deep(.v-icon) {
  color: rgb(var(--v-theme-error)) !important;
}
</style>
