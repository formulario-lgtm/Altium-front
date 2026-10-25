<script setup lang="ts">
import { computed } from 'vue';
import StatusBadge from '@/components/common/StatusBadge.vue';
import type { AuditLog } from '@/services/http';
import { auditActionLabel } from '@/utils/audit-labels';
import { entityTypeLabel } from '@/utils/entity-labels';
import { formatDateTime } from '@/utils/format';
import { formatAuditPayload } from '../utils/sanitize-json';

const props = defineProps<{ log: AuditLog | null }>();
const open = defineModel<boolean>({ default: false });

const fields = computed(() => {
  const log = props.log;
  if (!log) return [];
  const entity = entityTypeLabel(log.entityType) || '—';
  return [
    { label: 'Fecha', value: formatDateTime(log.occurredAt) },
    { label: 'Acción', value: auditActionLabel(log.action) },
    {
      label: 'Entidad',
      value: `${entity}${log.entityId ? ` · ${log.entityId}` : ''}`,
    },
    { label: 'Actor', value: log.actorUserId ?? 'Sistema / anónimo' },
    { label: 'IP', value: log.ipAddress ?? '—' },
    { label: 'Agente', value: log.userAgent ?? '—' },
    { label: 'ID de solicitud', value: log.requestId ?? '—' },
  ];
});

const payloads = computed(() => {
  const log = props.log;
  if (!log) return [];
  return [
    { label: 'Antes', json: formatAuditPayload(log.beforeData) },
    { label: 'Después', json: formatAuditPayload(log.afterData) },
    { label: 'Metadatos', json: formatAuditPayload(log.metadata) },
  ];
});
</script>

<template>
  <v-navigation-drawer
    v-model="open"
    location="right"
    temporary
    width="480"
    aria-label="Detalle de auditoría"
  >
    <div v-if="log" class="pa-4" data-testid="audit-detail">
      <div class="d-flex align-center mb-4">
        <h2 class="text-subtitle-1 font-weight-bold flex-grow-1 mb-0">Detalle del evento</h2>
        <v-btn icon="mdi-close" variant="text" aria-label="Cerrar detalle" @click="open = false" />
      </div>
      <StatusBadge :status="log.outcome" class="mb-4" />
      <dl class="mb-4">
        <div v-for="field in fields" :key="field.label" class="mb-2">
          <dt class="text-caption text-medium-emphasis">{{ field.label }}</dt>
          <dd class="text-body-2 text-break">{{ field.value }}</dd>
        </div>
      </dl>
      <section v-for="payload in payloads" :key="payload.label" class="mb-4">
        <h3 class="text-overline text-medium-emphasis">{{ payload.label }}</h3>
        <pre v-if="payload.json" class="altium-json">{{ payload.json }}</pre>
        <p v-else class="text-body-2 text-medium-emphasis mb-0">Sin datos</p>
      </section>
    </div>
  </v-navigation-drawer>
</template>
