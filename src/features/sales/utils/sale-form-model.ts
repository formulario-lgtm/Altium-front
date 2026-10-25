import type {
  Sale,
  SaleCustomerType,
  SaleMemberInput,
  SaleMemberType,
  UpdateSaleBody,
} from '@/services/http';

type EmployerInput = NonNullable<
  NonNullable<NonNullable<UpdateSaleBody['employment']>['employers']>[number]
>;

export type SaleFormModel = {
  version: number;
  healthInsurerId: string;
  healthPlanId: string | null;
  customerType: SaleCustomerType | null;
  observations: string | null;
  members: SaleMemberInput[];
  contact: NonNullable<UpdateSaleBody['contact']>;
  employment: {
    currentInsurance: string | null;
    grossSalary: number | null;
    employers: EmployerInput[];
  };
  taxInfo: NonNullable<UpdateSaleBody['taxInfo']>;
  billing: NonNullable<UpdateSaleBody['billing']>;
};

function emptyMember(memberType: SaleMemberType): SaleMemberInput {
  return {
    memberType,
    cuil: null,
    firstName: null,
    lastName: null,
    sex: null,
    birthDate: null,
    nationality: 'Argentino',
    maritalStatus: null,
    weightKg: null,
    heightCm: null,
    lastMenstrualPeriod: null,
    hasPreexistingConditions: false,
    preexistingConditionsDetails: null,
    displayOrder: 0,
  };
}

export function saleToFormModel(sale: Sale): SaleFormModel {
  const members =
    sale.members.length > 0
      ? sale.members.map((member, index) => ({
          id: member.id,
          memberType: member.memberType,
          cuil: member.cuil,
          firstName: member.firstName,
          lastName: member.lastName,
          sex: member.sex,
          birthDate: member.birthDate,
          nationality: member.nationality,
          maritalStatus: member.maritalStatus,
          weightKg: member.weightKg,
          heightCm: member.heightCm,
          lastMenstrualPeriod: member.lastMenstrualPeriod,
          hasPreexistingConditions: member.hasPreexistingConditions,
          preexistingConditionsDetails: member.preexistingConditionsDetails,
          displayOrder: member.displayOrder ?? index,
        }))
      : [emptyMember('HOLDER')];

  return {
    version: sale.version,
    healthInsurerId: sale.healthInsurer.id,
    healthPlanId: sale.healthPlan?.id ?? null,
    customerType: sale.customerType,
    observations: sale.observations,
    members,
    contact: {
      areaCode: sale.contact?.areaCode ?? null,
      phone: sale.contact?.phone ?? null,
      email: sale.contact?.email ?? null,
      address: sale.contact?.address ?? null,
      postalCode: sale.contact?.postalCode ?? null,
      province: sale.contact?.province ?? null,
    },
    employment: {
      currentInsurance: sale.employment?.currentInsurance ?? null,
      grossSalary: sale.employment?.grossSalary ?? null,
      employers: sale.employment?.employers?.map((employer, index) => ({
        id: employer.id,
        employerCuit: employer.employerCuit,
        displayOrder: employer.displayOrder ?? index,
      })) ?? [{ employerCuit: '', displayOrder: 0 }],
    },
    taxInfo: {
      monotaxCategory: sale.taxInfo?.monotaxCategory ?? null,
      currentInsurance: sale.taxInfo?.currentInsurance ?? null,
    },
    billing: {
      paymentMethod: sale.billing?.paymentMethod ?? null,
      holderIsPayer: sale.billing?.holderIsPayer ?? null,
      paymentMedium: sale.billing?.paymentMedium ?? null,
      payerIdentifier: sale.billing?.payerIdentifier ?? null,
      payerEmail: sale.billing?.payerEmail ?? null,
      payerPhone: sale.billing?.payerPhone ?? null,
      cardBrand: sale.billing?.cardBrand ?? null,
      cardLastFour: sale.billing?.cardLastFour ?? null,
      cardExpiryMonth: sale.billing?.cardExpiryMonth ?? null,
      cardExpiryYear: sale.billing?.cardExpiryYear ?? null,
      paymentProviderReference: sale.billing?.paymentProviderReference ?? null,
    },
  };
}

/** Build PATCH body — never includes cardNumber/cvv/cbu. */
export function formModelToUpdateBody(model: SaleFormModel): UpdateSaleBody {
  const customerType = model.customerType;
  const body: UpdateSaleBody = {
    version: model.version,
    healthInsurerId: model.healthInsurerId,
    healthPlanId: model.healthPlanId,
    customerType,
    observations: model.observations,
    members: model.members.map((member, index) => ({
      ...member,
      displayOrder: member.displayOrder ?? index,
    })),
    contact: model.contact,
    billing: {
      paymentMethod: model.billing.paymentMethod,
      holderIsPayer: model.billing.holderIsPayer,
      paymentMedium: model.billing.paymentMedium,
      payerIdentifier: model.billing.payerIdentifier,
      payerEmail: model.billing.payerEmail,
      payerPhone: model.billing.payerPhone,
      cardBrand: model.billing.cardBrand,
      cardLastFour: model.billing.cardLastFour,
      cardExpiryMonth: model.billing.cardExpiryMonth,
      cardExpiryYear: model.billing.cardExpiryYear,
      paymentProviderReference: model.billing.paymentProviderReference,
    },
  };

  if (customerType === 'DEREGULATED') {
    body.employment = {
      currentInsurance: model.employment.currentInsurance,
      grossSalary: model.employment.grossSalary,
      employers: model.employment.employers,
    };
    body.taxInfo = null;
  } else if (customerType === 'MONOTAX') {
    body.taxInfo = model.taxInfo;
    body.employment = null;
  } else {
    body.employment = null;
    body.taxInfo = null;
  }

  return body;
}

export { emptyMember };
