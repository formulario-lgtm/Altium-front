<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { computed, watch } from 'vue';
import { vuetifyFieldConfig } from '@/composables/vuetifyField';
import type { Team, User } from '@/services/http';
import { fullName } from '@/utils/format';
import { teamFormSchema, type TeamFormValues } from '../schemas/team.schema';

const props = withDefaults(
  defineProps<{
    team?: Team | null;
    supervisors: readonly User[];
    supervisorsLoading?: boolean;
    loading?: boolean;
    errorMessage?: string | null;
  }>(),
  { team: null, supervisorsLoading: false, loading: false, errorMessage: null },
);

const open = defineModel<boolean>({ default: false });
const emit = defineEmits<{ submit: [values: TeamFormValues] }>();

const isEdit = computed(() => props.team !== null);

const supervisorItems = computed(() => {
  const items = props.supervisors.map((user) => ({
    title: `${fullName(user)} · ${user.email}`,
    value: user.id,
  }));
  const current = props.team?.supervisor;
  if (current && !items.some((item) => item.value === current.id)) {
    items.unshift({ title: `${fullName(current)} · ${current.email}`, value: current.id });
  }
  return items;
});

const { defineField, handleSubmit, resetForm } = useForm({
  validationSchema: toTypedSchema(teamFormSchema),
});

const [name, nameProps] = defineField('name', vuetifyFieldConfig);
const [description, descriptionProps] = defineField('description', vuetifyFieldConfig);
const [supervisorId, supervisorIdProps] = defineField('supervisorId', vuetifyFieldConfig);
const [isActive] = defineField('isActive');

watch(open, (isOpen) => {
  if (!isOpen) return;
  resetForm({
    values: {
      name: props.team?.name ?? '',
      description: props.team?.description ?? '',
      supervisorId: props.team?.supervisor.id ?? '',
      isActive: props.team?.isActive ?? true,
    },
  });
});

const onSubmit = handleSubmit((values) => emit('submit', values));
</script>

<template>
  <v-dialog v-model="open" max-width="560" :persistent="loading">
    <v-card :title="isEdit ? 'Editar equipo' : 'Nuevo equipo'">
      <v-form novalidate @submit.prevent="onSubmit">
        <v-card-text class="pt-2">
          <v-alert v-if="errorMessage" type="error" density="compact" class="mb-4" role="alert">
            {{ errorMessage }}
          </v-alert>
          <v-text-field v-model="name" v-bind="nameProps" label="Nombre" class="mb-3" />
          <v-select
            v-model="supervisorId"
            v-bind="supervisorIdProps"
            :items="supervisorItems"
            :loading="supervisorsLoading"
            label="Supervisor"
            hint="Usuario activo con rol Supervisor."
            persistent-hint
            class="mb-3"
          />
          <v-textarea
            v-model="description"
            v-bind="descriptionProps"
            label="Descripción (opcional)"
            rows="3"
            auto-grow
            counter="2000"
          />
          <v-switch
            v-if="isEdit"
            v-model="isActive"
            label="Equipo activo"
            hide-details
            class="mt-2"
          />
        </v-card-text>
        <v-card-actions class="px-6 pb-4">
          <v-spacer />
          <v-btn variant="text" :disabled="loading" @click="open = false">Cancelar</v-btn>
          <v-btn type="submit" color="primary" variant="flat" :loading="loading">
            {{ isEdit ? 'Guardar' : 'Crear equipo' }}
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>
