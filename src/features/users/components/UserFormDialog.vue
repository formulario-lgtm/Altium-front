<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { computed, watch } from 'vue';
import { vuetifyFieldConfig } from '@/composables/vuetifyField';
import type { Role, User } from '@/services/http';
import { usernamePreview } from '../utils/username-preview';
import { userFormSchema, type UserFormValues } from '../schemas/user.schema';

const props = withDefaults(
  defineProps<{
    user?: User | null;
    roles: readonly Role[];
    loading?: boolean;
    errorMessage?: string | null;
    fieldErrors?: Record<string, string>;
    roleLocked?: boolean;
  }>(),
  { user: null, loading: false, errorMessage: null, fieldErrors: () => ({}), roleLocked: false },
);

const open = defineModel<boolean>({ default: false });
const emit = defineEmits<{ submit: [values: UserFormValues] }>();

const isEdit = computed(() => props.user !== null);
const roleItems = computed(() => {
  const items = props.roles.map((role) => ({ title: role.name, value: role.id }));
  const current = props.user?.role;
  if (current && !items.some((item) => item.value === current.id)) {
    items.push({ title: current.name, value: current.id });
  }
  return items;
});

const { defineField, handleSubmit, resetForm, setErrors } = useForm({
  validationSchema: toTypedSchema(userFormSchema),
});

const [firstName, firstNameProps] = defineField('firstName', vuetifyFieldConfig);
const [lastName, lastNameProps] = defineField('lastName', vuetifyFieldConfig);
const [email, emailProps] = defineField('email', vuetifyFieldConfig);
const loginUsername = computed(
  () => props.user?.username ?? usernamePreview(firstName.value ?? '', lastName.value ?? ''),
);
const [roleId, roleIdProps] = defineField('roleId', vuetifyFieldConfig);

watch(open, (isOpen) => {
  if (!isOpen) return;
  resetForm({
    values: {
      firstName: props.user?.firstName ?? '',
      lastName: props.user?.lastName ?? '',
      email: props.user?.email ?? '',
      roleId: props.user?.role.id ?? '',
    },
  });
});

watch(
  () => props.fieldErrors,
  (errors) => setErrors(errors),
);

const onSubmit = handleSubmit((values) => emit('submit', values));
</script>

<template>
  <v-dialog v-model="open" max-width="520" :persistent="loading">
    <v-card :title="isEdit ? 'Editar usuario' : 'Nuevo usuario'">
      <v-form novalidate @submit.prevent="onSubmit">
        <v-card-text class="pt-2">
          <p v-if="!isEdit" class="text-body-2 text-medium-emphasis mb-4">
            El usuario se crea como pendiente y recibirá un enlace de activación.
          </p>
          <v-alert v-if="errorMessage" type="error" density="compact" class="mb-4" role="alert">
            {{ errorMessage }}
          </v-alert>
          <v-row dense>
            <v-col cols="12" sm="6">
              <v-text-field v-model="firstName" v-bind="firstNameProps" label="Nombre" />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field v-model="lastName" v-bind="lastNameProps" label="Apellido" />
            </v-col>
            <v-col cols="12">
              <v-text-field
                :model-value="loginUsername"
                label="Usuario de acceso"
                readonly
                prepend-inner-icon="mdi-account-outline"
                :hint="
                  isEdit
                    ? 'Se conserva al cambiar el nombre o el correo.'
                    : 'Se genera al crear la cuenta. Si ya existe, se agrega un número.'
                "
                persistent-hint
              />
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="email"
                v-bind="emailProps"
                label="Correo electrónico"
                type="email"
                autocomplete="off"
              />
            </v-col>
            <v-col cols="12">
              <v-select
                v-model="roleId"
                v-bind="roleIdProps"
                :items="roleItems"
                :disabled="roleLocked"
                :hint="roleLocked ? 'No puedes cambiar tu propio rol.' : undefined"
                :persistent-hint="roleLocked"
                label="Rol"
              />
            </v-col>
          </v-row>
          <p v-if="isEdit" class="text-caption text-medium-emphasis mt-2 mb-0">
            Cambiar el rol cierra las sesiones activas. Cambiar el correo conserva el usuario de
            acceso e invalida los enlaces de activación o recuperación anteriores.
          </p>
        </v-card-text>
        <v-card-actions class="px-6 pb-4">
          <v-spacer />
          <v-btn variant="text" :disabled="loading" @click="open = false">Cancelar</v-btn>
          <v-btn type="submit" color="primary" variant="flat" :loading="loading">
            {{ isEdit ? 'Guardar' : 'Crear usuario' }}
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>
