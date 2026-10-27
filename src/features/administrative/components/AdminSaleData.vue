<script setup lang="ts">
import SalePaymentSecrets from '@/features/sales/components/SalePaymentSecrets.vue';
import type { Sale } from '@/services/http';
import EmptyState from '@/components/common/EmptyState.vue';
import SaleDetailFields from '@/features/sales/components/SaleDetailFields.vue';
import { formatDateTime } from '@/utils/format';
import {
  customerTypeLabel,
  healthPlanOptionLabel,
  MARITAL_OPTIONS,
  memberTypeLabel,
  PAYMENT_METHOD_OPTIONS,
  SEX_OPTIONS,
  showFum,
} from '@/features/sales/utils/sale-labels';

defineProps<{ sale: Sale; section: 'details' | 'members' | 'employment' | 'billing' }>();
const yesNo = (value: boolean | null | undefined) =>
  value === true ? 'Sí' : value === false ? 'No' : null;
const date = (value: string | null | undefined) =>
  value ? value.slice(0, 10).split('-').reverse().join('/') : null;

function memberFields(member: Sale['members'][number]) {
  return [
    { label: 'Nombre', value: member.firstName },
    { label: 'Apellido', value: member.lastName },
    { label: 'CUIL', value: member.cuil },
    { label: 'Fecha de nacimiento', value: date(member.birthDate) },
    { label: 'Edad', value: member.age == null ? null : `${member.age} años` },
    { label: 'Sexo', value: SEX_OPTIONS.find((option) => option.value === member.sex)?.title },
    { label: 'Nacionalidad', value: member.nationality },
    {
      label: 'Estado civil',
      value: MARITAL_OPTIONS.find((option) => option.value === member.maritalStatus)?.title,
    },
    { label: 'Peso', value: member.weightKg == null ? null : `${member.weightKg} kg` },
    { label: 'Altura', value: member.heightCm == null ? null : `${member.heightCm} cm` },
    ...(showFum(member.sex, member.birthDate) || member.lastMenstrualPeriod
      ? [{ label: 'Fecha de última menstruación (FUM)', value: date(member.lastMenstrualPeriod) }]
      : []),
    { label: 'Preexistencias', value: yesNo(member.hasPreexistingConditions) },
    ...(member.hasPreexistingConditions || member.preexistingConditionsDetails
      ? [{ label: 'Detalle de preexistencias', value: member.preexistingConditionsDetails }]
      : []),
  ];
}
</script>

<template>
  <v-card v-if="section === 'details'" class="pa-4 pa-md-6" data-testid="admin-sale-details">
    <h2 class="text-h6 mb-5">Datos de venta</h2>
    <SaleDetailFields
      :fields="[
        { label: 'Prepaga', value: sale.healthInsurer.name },
        { label: 'Plan', value: sale.healthPlan ? healthPlanOptionLabel(sale.healthPlan) : null },
        {
          label: 'Tipo de venta',
          value: sale.customerType ? customerTypeLabel(sale.customerType) : null,
        },
        { label: 'Vendedor', value: `${sale.seller.firstName} ${sale.seller.lastName}` },
        { label: 'Correo del vendedor', value: sale.seller.email },
        { label: 'Creada', value: formatDateTime(sale.createdAt) },
        {
          label: 'Presentada',
          value: sale.submittedAt ? formatDateTime(sale.submittedAt) : 'Aún no presentada',
        },
        { label: 'Última modificación', value: formatDateTime(sale.updatedAt) },
        { label: 'Observaciones del vendedor', value: sale.observations || 'Sin observaciones' },
      ]"
    />
  </v-card>

  <v-card v-else-if="section === 'members'" class="pa-4 pa-md-6" data-testid="admin-sale-members">
    <h2 class="text-h6 mb-2">Integrantes ({{ sale.members.length }})</h2>
    <p class="text-body-2 text-medium-emphasis mb-5">
      Datos personales y de salud para verificar la solicitud.
    </p>
    <div
      v-for="member in sale.members"
      :key="member.id"
      class="mb-6"
      data-testid="admin-sale-member"
    >
      <v-divider class="mb-4" />
      <div class="d-flex flex-wrap align-center ga-2 mb-4">
        <v-chip color="primary" variant="tonal">{{ memberTypeLabel(member.memberType) }}</v-chip>
        <h3 class="text-subtitle-1 font-weight-bold text-break">
          {{
            [member.firstName, member.lastName].filter(Boolean).join(' ') || 'Nombre sin completar'
          }}
        </h3>
      </div>
      <SaleDetailFields :fields="memberFields(member)" />
    </div>
    <EmptyState v-if="!sale.members.length" compact title="Sin integrantes cargados" />
  </v-card>

  <v-card
    v-else-if="section === 'employment'"
    class="pa-4 pa-md-6"
    data-testid="admin-sale-employment"
  >
    <template v-if="sale.employment || sale.customerType === 'DEREGULATED'">
      <h2 class="text-h6 mb-5">Situación laboral</h2>
      <SaleDetailFields
        :fields="[
          ...(sale.employment?.employers.length
            ? sale.employment.employers.map((employer, index) => ({
                label: `CUIT empleador ${index + 1}`,
                value: employer.employerCuit,
              }))
            : [{ label: 'CUIT empleador', value: null }]),
          { label: 'Obra social actual', value: sale.employment?.currentInsurance },
          {
            label: 'Sueldo bruto (sin aporte)',
            value:
              sale.employment?.grossSalary == null
                ? null
                : new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(
                    sale.employment.grossSalary,
                  ),
          },
        ]"
      />
    </template>
    <template v-if="sale.taxInfo || sale.customerType === 'MONOTAX'">
      <v-divider v-if="sale.employment || sale.customerType === 'DEREGULATED'" class="my-5" />
      <h2 class="text-h6 mb-5">Situación impositiva</h2>
      <SaleDetailFields
        :fields="[
          { label: 'Categoría de monotributo', value: sale.taxInfo?.monotaxCategory },
          { label: 'Obra social actual', value: sale.taxInfo?.currentInsurance },
        ]"
      />
    </template>
  </v-card>

  <v-card v-else-if="section === 'billing'" class="pa-4 pa-md-6" data-testid="admin-sale-billing">
    <h2 class="text-h6 mb-5">Cobranza</h2>
    <SaleDetailFields
      :fields="[
        {
          label: 'Forma de pago',
          value: PAYMENT_METHOD_OPTIONS.find(
            (option) => option.value === sale.billing?.paymentMethod,
          )?.title,
        },
        { label: 'El titular es el pagador', value: yesNo(sale.billing?.holderIsPayer) },
        {
          label:
            sale.billing?.paymentMethod === 'CBU'
              ? 'CBU / CVU / alias'
              : 'Medio de cobro registrado',
          value: sale.billing?.paymentMedium,
        },
        ...(sale.billing?.paymentMethod === 'CARD' ||
        sale.billing?.cardBrand ||
        sale.billing?.cardLastFour ||
        sale.billing?.cardExpiryMonth ||
        sale.billing?.cardExpiryYear
          ? [
              { label: 'Marca de tarjeta', value: sale.billing?.cardBrand },
              {
                label: 'Últimos 4 dígitos',
                value: sale.billing?.cardLastFour ? `•••• ${sale.billing.cardLastFour}` : null,
              },
              {
                label: 'Mes de vencimiento',
                value:
                  sale.billing?.cardExpiryMonth == null
                    ? null
                    : String(sale.billing.cardExpiryMonth).padStart(2, '0'),
              },
              { label: 'Año de vencimiento', value: sale.billing?.cardExpiryYear },
            ]
          : []),
        ...(sale.billing?.holderIsPayer === false ||
        sale.billing?.payerIdentifier ||
        sale.billing?.payerEmail ||
        sale.billing?.payerPhone
          ? [
              { label: 'CUIL / CUIT del pagador', value: sale.billing?.payerIdentifier },
              { label: 'Correo del pagador', value: sale.billing?.payerEmail },
              { label: 'Teléfono del pagador', value: sale.billing?.payerPhone },
            ]
          : []),
        ...(sale.billing?.paymentProviderReference
          ? [
              {
                label: 'Referencia del proveedor de pago',
                value: sale.billing.paymentProviderReference,
              },
            ]
          : []),
      ]"
    />
    <SalePaymentSecrets :card-number="sale.billing?.cardNumber" :cvv="sale.billing?.cvv" />
  </v-card>
</template>
