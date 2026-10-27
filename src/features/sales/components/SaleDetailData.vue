<script setup lang="ts">
import SalePaymentSecrets from './SalePaymentSecrets.vue';
import type { Sale } from '@/services/http';
import { formatDateTime } from '@/utils/format';
import EmptyState from '@/components/common/EmptyState.vue';
import SaleDetailFields from './SaleDetailFields.vue';
import {
  memberTypeLabel,
  PAYMENT_METHOD_OPTIONS,
  SEX_OPTIONS,
  MARITAL_OPTIONS,
} from '../utils/sale-labels';

defineProps<{ sale: Sale }>();
const yesNo = (value: boolean | null | undefined) =>
  value === true ? 'Sí' : value === false ? 'No' : null;
const date = (value: string | null | undefined) =>
  value ? value.slice(0, 10).split('-').reverse().join('/') : null;
</script>

<template>
  <div class="d-flex flex-column ga-4">
    <v-card class="pa-4 pa-md-6">
      <h2 class="text-h6 mb-5">
        <v-icon icon="mdi-account-group-outline" size="22" class="mr-2 text-primary" />Integrantes
        <span class="text-body-2 text-medium-emphasis">({{ sale.members.length }})</span>
      </h2>
      <div v-for="member in sale.members" :key="member.id" class="sale-member mb-4">
        <div class="d-flex flex-wrap align-center ga-2 mb-4">
          <v-chip color="primary" variant="tonal">{{ memberTypeLabel(member.memberType) }}</v-chip>
          <h3 class="text-subtitle-1 font-weight-bold">
            {{
              [member.firstName, member.lastName].filter(Boolean).join(' ') ||
              'Nombre sin completar'
            }}
          </h3>
        </div>
        <SaleDetailFields
          :fields="[
            { label: 'CUIL', value: member.cuil },
            { label: 'Edad', value: member.age == null ? null : `${member.age} años` },
          ]"
        />
        <details class="mt-4">
          <summary class="text-body-2 text-primary">Datos personales y de salud</summary>
          <SaleDetailFields
            class="mt-4"
            :fields="[
              { label: 'Fecha de nacimiento', value: date(member.birthDate) },
              {
                label: 'Sexo',
                value: SEX_OPTIONS.find((option) => option.value === member.sex)?.title,
              },
              { label: 'Nacionalidad', value: member.nationality },
              {
                label: 'Estado civil',
                value: MARITAL_OPTIONS.find((option) => option.value === member.maritalStatus)
                  ?.title,
              },
              { label: 'Peso', value: member.weightKg == null ? null : `${member.weightKg} kg` },
              { label: 'Altura', value: member.heightCm == null ? null : `${member.heightCm} cm` },
              ...(member.lastMenstrualPeriod
                ? [
                    {
                      label: 'Fecha de última menstruación',
                      value: date(member.lastMenstrualPeriod),
                    },
                  ]
                : []),
              { label: 'Preexistencias', value: yesNo(member.hasPreexistingConditions) },
              ...(member.hasPreexistingConditions
                ? [
                    {
                      label: 'Detalle de preexistencias',
                      value: member.preexistingConditionsDetails,
                    },
                  ]
                : []),
            ]"
          />
        </details>
      </div>
      <EmptyState v-if="!sale.members.length" compact title="Sin integrantes cargados" />
    </v-card>

    <v-card class="pa-4 pa-md-6" data-testid="sale-detail-contact">
      <h2 class="text-h6 mb-5">
        <v-icon icon="mdi-card-account-phone-outline" size="22" class="mr-2 text-primary" />Contacto
      </h2>
      <SaleDetailFields
        :fields="[
          {
            label: 'Teléfono',
            value: [sale.contact?.areaCode, sale.contact?.phone].filter(Boolean).join(' '),
          },
          { label: 'Correo electrónico', value: sale.contact?.email },
          { label: 'Domicilio', value: sale.contact?.address },
          { label: 'Provincia', value: sale.contact?.province },
          { label: 'Código postal', value: sale.contact?.postalCode },
        ]"
      />
    </v-card>

    <v-card v-if="sale.customerType === 'DEREGULATED'" class="pa-4 pa-md-6">
      <h2 class="text-h6 mb-5">
        <v-icon icon="mdi-briefcase-outline" size="22" class="mr-2 text-primary" />Situación laboral
      </h2>
      <SaleDetailFields
        :fields="[
          ...(sale.employment?.employers.map((employer, index) => ({
            label: `CUIT empleador ${index + 1}`,
            value: employer.employerCuit,
          })) ?? [{ label: 'CUIT empleador', value: null }]),
          { label: 'Obra social actual', value: sale.employment?.currentInsurance },
          {
            label: 'Sueldo bruto',
            value:
              sale.employment?.grossSalary == null
                ? null
                : new Intl.NumberFormat('es-AR', {
                    style: 'currency',
                    currency: 'ARS',
                    maximumFractionDigits: 2,
                  }).format(sale.employment.grossSalary),
          },
        ]"
      />
    </v-card>

    <v-card v-if="sale.customerType === 'MONOTAX'" class="pa-4 pa-md-6">
      <h2 class="text-h6 mb-5">Situación impositiva</h2>
      <SaleDetailFields
        :fields="[
          { label: 'Categoría de monotributo', value: sale.taxInfo?.monotaxCategory },
          { label: 'Obra social actual', value: sale.taxInfo?.currentInsurance },
        ]"
      />
    </v-card>

    <v-card class="pa-4 pa-md-6" data-testid="sale-detail-billing">
      <h2 class="text-h6 mb-5">
        <v-icon icon="mdi-credit-card-outline" size="22" class="mr-2 text-primary" />Cobranza
      </h2>
      <SaleDetailFields
        :fields="[
          {
            label: 'Forma de pago',
            value: PAYMENT_METHOD_OPTIONS.find(
              (option) => option.value === sale.billing?.paymentMethod,
            )?.title,
          },
          { label: 'El titular es el pagador', value: yesNo(sale.billing?.holderIsPayer) },
          ...(sale.billing?.paymentMethod === 'CARD' && sale.billing.holderIsPayer !== false
            ? [
                {
                  label: 'Tarjeta',
                  value: sale.billing.cardLastFour
                    ? `${sale.billing.cardBrand ?? 'Tarjeta'} •••• ${sale.billing.cardLastFour}`
                    : null,
                },
                {
                  label: 'Vencimiento',
                  value:
                    sale.billing.cardExpiryMonth && sale.billing.cardExpiryYear
                      ? `${String(sale.billing.cardExpiryMonth).padStart(2, '0')}/${sale.billing.cardExpiryYear}`
                      : null,
                },
              ]
            : []),
          ...(sale.billing?.paymentMethod === 'CBU' && sale.billing.holderIsPayer !== false
            ? [{ label: 'CBU / CVU / alias', value: sale.billing.paymentMedium }]
            : []),
          ...(sale.billing?.holderIsPayer === false
            ? [
                { label: 'CUIL / CUIT del pagador', value: sale.billing.payerIdentifier },
                { label: 'Correo del pagador', value: sale.billing.payerEmail },
                { label: 'Teléfono del pagador', value: sale.billing.payerPhone },
              ]
            : []),
        ]"
      />
      <SalePaymentSecrets :card-number="sale.billing?.cardNumber" :cvv="sale.billing?.cvv" />
    </v-card>

    <v-card v-if="sale.observations" class="pa-4 pa-md-6">
      <h2 class="text-h6 mb-3">Observaciones del vendedor</h2>
      <p class="text-body-2 sale-detail-note">{{ sale.observations }}</p>
    </v-card>

    <v-card class="pa-4 pa-md-6">
      <h2 class="text-h6 mb-5">Datos de la operación</h2>
      <SaleDetailFields
        :fields="[
          { label: 'Vendedor', value: `${sale.seller.firstName} ${sale.seller.lastName}` },
          { label: 'Creada', value: formatDateTime(sale.createdAt) },
          { label: 'Última modificación', value: formatDateTime(sale.updatedAt) },
          {
            label: 'Presentada',
            value: sale.submittedAt ? formatDateTime(sale.submittedAt) : 'Aún no presentada',
          },
        ]"
      />
    </v-card>
  </div>
</template>

<style scoped>
.sale-member {
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
.sale-member:last-of-type {
  margin-bottom: 0 !important;
  padding-bottom: 0;
  border-bottom: 0;
}
summary {
  cursor: pointer;
  padding: 4px 0;
}
.sale-detail-note {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
</style>
