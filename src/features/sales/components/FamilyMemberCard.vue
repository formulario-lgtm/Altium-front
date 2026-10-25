<script setup lang="ts">
import { computed } from 'vue';
import type { SaleMemberInput } from '@/services/http';
import { memberFieldErrorProps } from '../utils/sale-field-errors';
import {
  ageFromBirthDate,
  MARITAL_OPTIONS,
  memberTypeLabel,
  SEX_OPTIONS,
  showFum,
} from '../utils/sale-labels';

const props = withDefaults(
  defineProps<{
    member: SaleMemberInput;
    index: number;
    childIndex?: number;
    removable?: boolean;
    disabled?: boolean;
    /** Submit/save Problem Details map (`members[i].cuil` → message). */
    fieldErrors?: Readonly<Record<string, string>>;
  }>(),
  {
    removable: false,
    disabled: false,
    childIndex: undefined,
    fieldErrors: () => ({}),
  },
);

const emit = defineEmits<{
  remove: [];
  'update:member': [SaleMemberInput];
  'clear-field-error': [path: string];
}>();

const title = computed(() => {
  if (props.member.memberType === 'CHILD') {
    return `Hijo/a ${props.childIndex ?? 1}`;
  }
  return memberTypeLabel(props.member.memberType);
});

const age = computed(() => ageFromBirthDate(props.member.birthDate));
const fumVisible = computed(() => showFum(props.member.sex, props.member.birthDate));

function err(key: string) {
  return memberFieldErrorProps(props.fieldErrors, props.index, key);
}

function patch(partial: Partial<SaleMemberInput>): void {
  for (const key of Object.keys(partial)) {
    emit('clear-field-error', `members[${props.index}].${key}`);
  }
  emit('update:member', { ...props.member, ...partial });
}
</script>

<template>
  <v-card variant="outlined" class="mb-4 pa-4">
    <div class="d-flex justify-space-between align-start mb-4">
      <div>
        <div class="text-subtitle-1 font-weight-bold">{{ title }}</div>
        <div class="text-medium-emphasis text-body-2">
          {{
            [member.firstName, member.lastName].filter(Boolean).join(' ') || 'Datos del integrante'
          }}
        </div>
      </div>
      <v-btn
        v-if="removable && !disabled"
        variant="text"
        color="error"
        size="small"
        @click="emit('remove')"
      >
        Quitar
      </v-btn>
      <span v-else-if="!removable" class="text-caption text-medium-emphasis">Incluido siempre</span>
    </div>

    <v-row dense>
      <v-col cols="12" md="4">
        <v-text-field
          :model-value="member.cuil ?? ''"
          label="CUIL"
          maxlength="11"
          :disabled="disabled"
          v-bind="err('cuil')"
          @update:model-value="patch({ cuil: $event || null })"
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field
          :model-value="member.lastName ?? ''"
          label="Apellido"
          :disabled="disabled"
          v-bind="err('lastName')"
          @update:model-value="patch({ lastName: $event || null })"
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field
          :model-value="member.firstName ?? ''"
          label="Nombre"
          :disabled="disabled"
          v-bind="err('firstName')"
          @update:model-value="patch({ firstName: $event || null })"
        />
      </v-col>
      <v-col cols="12" md="3">
        <v-select
          :model-value="member.sex"
          :items="SEX_OPTIONS"
          label="Sexo"
          clearable
          :disabled="disabled"
          v-bind="err('sex')"
          @update:model-value="patch({ sex: $event })"
        />
      </v-col>
      <v-col cols="12" md="3">
        <v-text-field
          :model-value="member.birthDate ?? ''"
          type="date"
          label="Fecha de nacimiento"
          :disabled="disabled"
          v-bind="err('birthDate')"
          @update:model-value="patch({ birthDate: $event || null })"
        />
      </v-col>
      <v-col cols="12" md="2">
        <v-text-field :model-value="age ?? ''" label="Edad" readonly />
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field
          :model-value="member.nationality ?? ''"
          label="Nacionalidad"
          :disabled="disabled"
          v-bind="err('nationality')"
          @update:model-value="patch({ nationality: $event || null })"
        />
      </v-col>
      <v-col v-if="member.memberType === 'HOLDER'" cols="12" md="4">
        <v-select
          :model-value="member.maritalStatus"
          :items="MARITAL_OPTIONS"
          label="Estado civil"
          clearable
          :disabled="disabled"
          v-bind="err('maritalStatus')"
          @update:model-value="patch({ maritalStatus: $event })"
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field
          :model-value="member.weightKg ?? ''"
          type="number"
          label="Peso (kg)"
          step="0.1"
          :disabled="disabled"
          v-bind="err('weightKg')"
          @update:model-value="patch({ weightKg: $event === '' ? null : Number($event) })"
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field
          :model-value="member.heightCm ?? ''"
          type="number"
          label="Altura (cm)"
          step="0.1"
          :disabled="disabled"
          v-bind="err('heightCm')"
          @update:model-value="patch({ heightCm: $event === '' ? null : Number($event) })"
        />
      </v-col>
      <v-col v-if="fumVisible" cols="12" md="4">
        <v-text-field
          :model-value="member.lastMenstrualPeriod ?? ''"
          type="date"
          label="FUM"
          hint="Sexo F y edad mayor de 12"
          persistent-hint
          :disabled="disabled"
          v-bind="err('lastMenstrualPeriod')"
          @update:model-value="patch({ lastMenstrualPeriod: $event || null })"
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-select
          :model-value="member.hasPreexistingConditions ? 'Si' : 'No'"
          :items="['No', 'Si']"
          label="¿Tiene preexistencias?"
          :disabled="disabled"
          v-bind="err('hasPreexistingConditions')"
          @update:model-value="
            patch({
              hasPreexistingConditions: $event === 'Si',
              preexistingConditionsDetails:
                $event === 'Si' ? member.preexistingConditionsDetails : null,
            })
          "
        />
      </v-col>
      <v-col v-if="member.hasPreexistingConditions" cols="12">
        <v-textarea
          :model-value="member.preexistingConditionsDetails ?? ''"
          label="Detalle de preexistencia"
          rows="2"
          :disabled="disabled"
          v-bind="err('preexistingConditionsDetails')"
          @update:model-value="patch({ preexistingConditionsDetails: $event || null })"
        />
      </v-col>
    </v-row>
  </v-card>
</template>
