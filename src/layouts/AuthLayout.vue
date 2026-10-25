<script setup lang="ts">
import AltiumMark from '@/components/layout/AltiumMark.vue';
import ThemeToggleButton from '@/components/layout/ThemeToggleButton.vue';
import { useThemeSync } from '@/composables/useThemeSync';

useThemeSync();

const highlights = [
  { icon: 'mdi-chart-bar', label: 'Procesos más\neficientes' },
  { icon: 'mdi-account-group-outline', label: 'Equipos más\nconectados' },
  { icon: 'mdi-shield-check-outline', label: 'Información más\nsegura' },
] as const;
</script>

<template>
  <v-app>
    <v-main class="auth-stage">
      <div class="auth-stage__atmosphere" aria-hidden="true">
        <span class="auth-stage__glow auth-stage__glow--tl" />
        <span class="auth-stage__glow auth-stage__glow--br" />
        <span class="auth-stage__ring auth-stage__ring--a" />
        <span class="auth-stage__ring auth-stage__ring--b" />
        <span class="auth-stage__dots" />
      </div>

      <div class="auth-stage__grid">
        <section class="auth-stage__brand">
          <AltiumMark size="xl" class="auth-stage__logo" />

          <h1 class="auth-stage__headline">
            <span class="auth-stage__headline-line">Gestión inteligente</span>
            <span class="auth-stage__headline-line">para tu operación</span>
          </h1>
          <p class="auth-stage__lede">
            Centralizá tu información, optimizá tus procesos y hacé crecer tu negocio, todo en un
            solo lugar.
          </p>

          <ul class="auth-stage__highlights">
            <li v-for="item in highlights" :key="item.label" class="auth-stage__highlight">
              <v-icon
                :icon="item.icon"
                size="40"
                class="auth-stage__highlight-icon"
                aria-hidden="true"
              />
              <span class="auth-stage__highlight-label">{{ item.label }}</span>
            </li>
          </ul>
        </section>

        <section class="auth-stage__panel-wrap">
          <div class="auth-stage__panel">
            <div class="auth-stage__panel-toolbar">
              <AltiumMark size="sm" class="d-md-none" />
              <v-spacer class="d-md-none" />
              <ThemeToggleButton />
            </div>
            <router-view />
          </div>
        </section>
      </div>
    </v-main>
  </v-app>
</template>

<style scoped lang="scss">
/* Auth marketing shell — local tokens so the login mock can be vivid without changing CRM chrome. */
.auth-stage {
  --auth-bg: #07101f;
  --auth-text: #f4f7fc;
  --auth-muted: #9eb0c9;
  --auth-accent: #3b82f6;
  --auth-accent-strong: #2563eb;
  --auth-glass: rgba(16, 28, 50, 0.42);
  --auth-glass-border: rgba(110, 168, 255, 0.3);
  --auth-field-bg: transparent;
  --auth-field-border: rgba(160, 190, 230, 0.28);

  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background:
    radial-gradient(1200px 700px at 12% -10%, rgba(55, 110, 210, 0.28), transparent 55%),
    radial-gradient(900px 600px at 55% 110%, rgba(40, 90, 180, 0.22), transparent 50%),
    linear-gradient(160deg, #050b16 0%, var(--auth-bg) 45%, #0a1730 100%);
  color: var(--auth-text);
}

:global(.v-theme--light) .auth-stage {
  --auth-bg: #eef3f9;
  --auth-text: #15233a;
  --auth-muted: #5f7088;
  --auth-accent: #3b82f6;
  --auth-accent-strong: #2563eb;
  --auth-glass: rgba(255, 255, 255, 0.7);
  --auth-glass-border: rgba(59, 130, 246, 0.22);
  --auth-field-bg: transparent;
  --auth-field-border: rgba(36, 59, 90, 0.18);

  background:
    radial-gradient(1000px 620px at 8% -8%, rgba(80, 140, 230, 0.22), transparent 55%),
    radial-gradient(800px 520px at 70% 110%, rgba(120, 170, 240, 0.18), transparent 50%),
    linear-gradient(160deg, #f7f9fc 0%, var(--auth-bg) 50%, #e7eef8 100%);
}

.auth-stage__atmosphere {
  pointer-events: none;
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.auth-stage__glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(2px);
}

.auth-stage__glow--tl {
  width: min(58vw, 620px);
  height: min(58vw, 620px);
  top: -18%;
  left: -10%;
  background: radial-gradient(circle, rgba(75, 142, 247, 0.55) 0%, transparent 68%);
  opacity: 0.9;
}

.auth-stage__glow--br {
  width: min(70vw, 760px);
  height: min(70vw, 760px);
  bottom: -28%;
  left: 10%;
  background: radial-gradient(circle, rgba(55, 120, 220, 0.35) 0%, transparent 70%);
}

:global(.v-theme--light) .auth-stage__glow--tl {
  background: radial-gradient(circle, rgba(80, 140, 230, 0.35) 0%, transparent 68%);
}

:global(.v-theme--light) .auth-stage__glow--br {
  background: radial-gradient(circle, rgba(100, 160, 240, 0.22) 0%, transparent 70%);
}

.auth-stage__ring {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(120, 175, 255, 0.16);
  box-shadow: inset 0 0 40px rgba(80, 140, 240, 0.08);
}

.auth-stage__ring--a {
  width: min(48vw, 520px);
  height: min(48vw, 520px);
  top: -8%;
  left: 6%;
  opacity: 0.55;
}

.auth-stage__ring--b {
  width: min(36vw, 380px);
  height: min(36vw, 380px);
  top: 8%;
  left: 18%;
  opacity: 0.35;
  border-color: rgba(120, 175, 255, 0.1);
}

.auth-stage__dots {
  position: absolute;
  top: 6%;
  left: 18%;
  width: min(42vw, 480px);
  height: 46%;
  opacity: 0.45;
  background-image: radial-gradient(rgba(190, 215, 255, 0.55) 1.1px, transparent 1.1px);
  background-size: 16px 16px;
  mask-image: radial-gradient(ellipse at 40% 40%, black 10%, transparent 72%);
}

:global(.v-theme--light) .auth-stage__dots {
  opacity: 0.28;
  background-image: radial-gradient(rgba(60, 100, 160, 0.35) 1.1px, transparent 1.1px);
}

.auth-stage__grid {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 2rem;
  min-height: 100vh;
  width: 100%;
  padding: 1.5rem;
  align-items: center;
  box-sizing: border-box;
}

@media (min-width: 960px) {
  .auth-stage__grid {
    grid-template-columns: minmax(0, 1.4fr) minmax(440px, 500px);
    column-gap: clamp(1.5rem, 3vw, 2.75rem);
    padding: 3.25rem clamp(1.75rem, 4vw, 3.5rem) 3.25rem clamp(2.25rem, 5vw, 4.5rem);
    max-width: 1520px;
    margin-inline: auto;
  }
}

.auth-stage__brand {
  display: none;
}

@media (min-width: 960px) {
  .auth-stage__brand {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 0;
    width: 100%;
    max-width: 52ch;
    min-height: 0;
    padding-right: clamp(0.5rem, 2vw, 1.5rem);
  }
}

.auth-stage__logo {
  margin-bottom: 2.15rem;
}

.auth-stage__headline {
  margin: 0 0 1.15rem;
  max-width: none;
  font-size: clamp(2.85rem, 4.2vw, 3.75rem);
  font-weight: 700;
  line-height: 1.06;
  letter-spacing: -0.035em;
  color: var(--auth-text);
}

.auth-stage__headline-line {
  display: block;
  white-space: nowrap;
}

.auth-stage__lede {
  margin: 0 0 2rem;
  max-width: 52ch;
  font-size: 1.2rem;
  line-height: 1.55;
  color: var(--auth-muted);
}

.auth-stage__highlights {
  display: grid;
  grid-template-columns: repeat(3, max-content);
  justify-content: start;
  column-gap: 2.75rem;
  row-gap: 0.75rem;
  list-style: none;
  margin: 0;
  padding: 0;
  width: 100%;
  max-width: 52ch;
}

.auth-stage__highlight {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.75rem;
  padding: 0;
  border: none;
  background: none;
  box-shadow: none;
  color: color-mix(in srgb, var(--auth-text) 88%, var(--auth-muted));
}

.auth-stage__highlight-icon {
  flex-shrink: 0;
  color: var(--auth-accent) !important;
  opacity: 1;
}

.auth-stage__highlight-label {
  font-size: 0.95rem;
  font-weight: 600;
  line-height: 1.25;
  letter-spacing: -0.01em;
  white-space: pre-line;
}

.auth-stage__panel-wrap {
  display: flex;
  justify-content: center;
  width: 100%;
}

@media (min-width: 960px) {
  .auth-stage__panel-wrap {
    justify-content: flex-end;
    align-self: center;
  }
}

.auth-stage__panel {
  width: 100%;
  max-width: 500px;
  padding: 1.75rem 2rem 2.15rem;
  border-radius: 1.5rem;
  border: 1px solid var(--auth-glass-border);
  background: var(--auth-glass);
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.03) inset,
    0 24px 70px rgba(0, 0, 0, 0.45),
    0 0 48px rgba(55, 120, 230, 0.12);
  backdrop-filter: blur(22px) saturate(1.2);
  -webkit-backdrop-filter: blur(22px) saturate(1.2);
}

:global(.v-theme--light) .auth-stage__panel {
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.65) inset,
    0 20px 50px rgba(25, 43, 69, 0.1),
    0 0 36px rgba(47, 111, 214, 0.08);
}

.auth-stage__panel-toolbar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin: 0 -0.25rem 0.35rem 0;
  min-height: 44px;
}

/* Inputs blend with the glass card — thin border only, no separate fill. */
.auth-stage__panel :deep(.v-field) {
  --v-field-border-opacity: 1;
  --v-input-control-height: 56px;
  min-height: 56px;
  border-radius: 0.85rem !important;
  background: transparent !important;
  box-shadow: none !important;
}

.auth-stage__panel :deep(.v-field__input) {
  min-height: 56px;
  font-size: 1.05rem;
  padding-top: 0.55rem;
}

.auth-stage__panel :deep(.v-label) {
  font-size: 0.95rem;
}

.auth-stage__panel :deep(.v-field__prepend-inner .v-icon),
.auth-stage__panel :deep(.v-field__append-inner .v-icon) {
  font-size: 1.35rem !important;
  opacity: 1;
}

.auth-stage__panel :deep(.v-checkbox .v-label) {
  font-size: 0.98rem;
}

.auth-stage__panel :deep(.v-field__overlay) {
  opacity: 0 !important;
}

.auth-stage__panel :deep(.v-field__outline) {
  --v-field-border-opacity: 1;
  color: var(--auth-field-border);
}

/* Keep empty fields readable on glass (avoid “ghosted” unused controls). */
.auth-stage__panel :deep(.v-field) {
  background: color-mix(in srgb, var(--auth-text) 4%, transparent) !important;
}

.auth-stage__panel :deep(.v-label.v-field-label) {
  opacity: 1;
  color: var(--auth-muted);
}

.auth-stage__panel :deep(.v-field--focused .v-field__outline) {
  color: var(--auth-accent);
}

.auth-stage__panel :deep(.v-label),
.auth-stage__panel :deep(.v-messages) {
  color: var(--auth-muted);
}

.auth-stage__panel :deep(.v-field__input),
.auth-stage__panel :deep(.v-field__prepend-inner .v-icon),
.auth-stage__panel :deep(.v-checkbox .v-label) {
  color: var(--auth-text);
}

.auth-stage__panel :deep(.v-selection-control__input > .v-icon) {
  opacity: 1;
  color: var(--auth-accent);
}

.auth-stage__panel :deep(.v-btn--icon) {
  color: var(--auth-muted);
}

/* Kill browser autofill yellow/dark slabs inside glass inputs. */
.auth-stage__panel :deep(input:-webkit-autofill),
.auth-stage__panel :deep(input:-webkit-autofill:hover),
.auth-stage__panel :deep(input:-webkit-autofill:focus) {
  -webkit-text-fill-color: var(--auth-text) !important;
  caret-color: var(--auth-text);
  transition: background-color 99999s ease-out;
  box-shadow: 0 0 0 1000px transparent inset !important;
}
</style>
