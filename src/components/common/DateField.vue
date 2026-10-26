<script setup lang="ts">
import { computed, ref, useAttrs, watch } from 'vue';
import { displayDateFieldValue, localDateValue, parseDateFieldValue } from './date-field-value';

defineOptions({ inheritAttrs: false });
const props = withDefaults(
  defineProps<{
    modelValue?: string | null;
    label: string;
    type?: 'date' | 'datetime-local';
    disabled?: boolean;
    readonly?: boolean;
    clearable?: boolean;
    min?: string;
    max?: string;
  }>(),
  {
    modelValue: '',
    type: 'date',
    disabled: false,
    readonly: false,
    clearable: true,
    min: undefined,
    max: undefined,
  },
);
const emit = defineEmits<{ 'update:modelValue': [value: string] }>();
const attrs = useAttrs();
const open = ref(false);
const selectedDate = ref<Date | null>(null);
const selectedTime = ref('12:00');
const viewMode = ref<'month' | 'months' | 'year'>('month');
const withTime = computed(() => props.type === 'datetime-local');
const blocked = computed(() => props.disabled || props.readonly);
const display = computed(() => displayDateFieldValue(props.modelValue, withTime.value));
const validTime = computed(() => /^([01]\d|2[0-3]):[0-5]\d$/.test(selectedTime.value));

watch(open, (value) => {
  if (!value) return;
  selectedDate.value = parseDateFieldValue(props.modelValue);
  selectedTime.value = props.modelValue?.slice(11, 16) || '12:00';
  viewMode.value = 'month';
});
watch(blocked, (value) => {
  if (value) open.value = false;
});

function showCalendar() {
  if (!blocked.value) open.value = true;
}
function clear() {
  if (!blocked.value) {
    emit('update:modelValue', '');
    open.value = false;
  }
}
function selectDate(value: unknown) {
  if (!(value instanceof Date) || Number.isNaN(value.getTime()) || blocked.value) return;
  selectedDate.value = value;
  if (!withTime.value) apply();
}
function apply() {
  if (blocked.value || !selectedDate.value || (withTime.value && !validTime.value)) return;
  const date = localDateValue(selectedDate.value);
  if ((props.min && date < props.min.slice(0, 10)) || (props.max && date > props.max.slice(0, 10)))
    return;
  emit('update:modelValue', withTime.value ? `${date}T${selectedTime.value}` : date);
  open.value = false;
}
</script>

<template>
  <v-menu
    v-model="open"
    :disabled="blocked"
    :close-on-content-click="false"
    location="bottom start"
    :offset="8"
    :min-width="0"
    max-width="360"
    :open-on-focus="false"
  >
    <template #activator="{ props: activatorProps }">
      <v-text-field
        v-bind="{ ...attrs, ...activatorProps, onClick: showCalendar }"
        :model-value="display"
        :label="label"
        :placeholder="withTime ? 'dd/mm/aaaa hh:mm' : 'dd/mm/aaaa'"
        :disabled="disabled"
        readonly
        :clearable="clearable && !blocked"
        persistent-placeholder
        class="altium-date-field"
        aria-haspopup="dialog"
        :aria-expanded="open"
        @click:control="showCalendar"
        @click:clear="clear"
        @keydown.enter.prevent="showCalendar"
        @keydown.space.prevent="showCalendar"
        @keydown.down.prevent="showCalendar"
      >
        <template #append-inner>
          <v-btn
            icon="mdi-calendar-month-outline"
            variant="text"
            size="small"
            color="primary"
            :disabled="blocked"
            :aria-label="`Abrir calendario: ${label}`"
            :aria-expanded="open"
            @click.stop="showCalendar"
          />
        </template>
      </v-text-field>
    </template>
    <v-card
      role="dialog"
      :aria-label="`Calendario: ${label}`"
      class="altium-date-calendar"
      color="surface"
    >
      <v-date-picker
        v-model:view-mode="viewMode"
        :model-value="selectedDate ?? undefined"
        :min="min"
        :max="max"
        color="primary"
        bg-color="surface"
        hide-header
        show-adjacent-months
        width="100%"
        @update:model-value="selectDate"
      />
      <div v-if="withTime" class="px-4 pb-2">
        <v-text-field
          v-model="selectedTime"
          type="time"
          label="Hora"
          :error-messages="validTime ? [] : ['Ingresá una hora válida.']"
        />
      </div>
      <v-divider />
      <v-card-actions class="flex-wrap">
        <v-btn v-if="clearable" variant="text" @click="clear">Borrar</v-btn>
        <v-btn variant="text" @click="open = false">Cancelar</v-btn>
        <v-btn
          v-if="withTime"
          color="primary"
          :disabled="!selectedDate || !validTime"
          @click="apply"
          >Aplicar</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-menu>
</template>
