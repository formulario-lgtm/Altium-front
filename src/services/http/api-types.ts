import type { components, operations } from '@/types/generated/api';

/** Aliases over generated OpenAPI schemas — never hand-write backend DTOs. */
type Schemas = components['schemas'];

export type AuthSessionResponse = Schemas['AuthSessionResponseDto'];
export type AuthUser = Schemas['AuthUserDto'];
export type AuthSessionSummary = Schemas['AuthSessionSummaryDto'];
export type LoginBody = Schemas['LoginDto'];
export type ChangePasswordBody = Schemas['ChangePasswordDto'];
export type ForgotPasswordBody = Schemas['ForgotPasswordDto'];
export type ResetPasswordBody = Schemas['ResetPasswordDto'];
export type ActivateAccountBody = Schemas['ActivateAccountDto'];
export type MessageResponse = Schemas['MessageResponseDto'];
export type Session = Schemas['SessionDto'];
export type SessionList = Schemas['SessionListResponseDto'];

export type User = Schemas['UserDto'];
export type UserList = Schemas['UserListResponseDto'];
export type UserStatus = Schemas['UserStatus'];
export type SettableUserStatus = Schemas['SettableUserStatus'];
export type CreateUserBody = Schemas['CreateUserDto'];
export type UpdateUserBody = Schemas['UpdateUserDto'];
export type UserListQuery = NonNullable<operations['Users_listUsers']['parameters']['query']>;

export type Team = Schemas['TeamDto'];
export type TeamList = Schemas['TeamListResponseDto'];
export type TeamMember = Schemas['TeamMemberDto'];
export type TeamMemberList = Schemas['TeamMemberListResponseDto'];
export type CreateTeamBody = Schemas['CreateTeamDto'];
export type UpdateTeamBody = Schemas['UpdateTeamDto'];
export type TeamListQuery = NonNullable<operations['Teams_listTeams']['parameters']['query']>;

export type Role = Schemas['RoleDto'];
export type RoleList = Schemas['RoleListResponseDto'];
export type Permission = Schemas['PermissionDto'];
export type PermissionList = Schemas['PermissionListResponseDto'];

export type AuditLog = Schemas['AuditLogDto'];
export type AuditLogList = Schemas['AuditLogListResponseDto'];
export type AuditOutcome = Schemas['AuditOutcome'];
export type AuditLogQuery = NonNullable<operations['Audit_listAuditLogs']['parameters']['query']>;

export type OffsetPageInfo = Schemas['OffsetPageInfoDto'];

export type HealthInsurer = Schemas['HealthInsurerDto'];
export type HealthInsurerList = Schemas['HealthInsurerListResponseDto'];
export type HealthPlan = Schemas['HealthPlanDto'];
export type HealthPlanList = Schemas['HealthPlanListResponseDto'];

export type Sale = Schemas['SaleDto'];
export type SaleList = Schemas['SaleListResponseDto'];
export type SaleListItem = Schemas['SaleListItemDto'];
export type SaleListQuery = NonNullable<operations['Sales_listSales']['parameters']['query']>;
export type CreateSaleBody = Schemas['CreateSaleDto'];
export type UpdateSaleBody = Schemas['UpdateSaleDto'];
export type ReturnSaleBody = Schemas['ReturnSaleDto'];
export type ResolveSaleBody = Schemas['ResolveSaleDto'];
export type SaleMember = Schemas['SaleMemberDto'];
export type SaleMemberInput = Schemas['SaleMemberInputDto'];
export type SaleDocuments = Schemas['SaleDocumentsResponseDto'];
export type SaleDocumentMeta = Schemas['SaleDocumentMetaDto'];
export type RequiredDocumentCategory = Schemas['RequiredDocumentCategoryDto'];
export type SaleStatusHistory = Schemas['SaleStatusHistoryResponseDto'];
export type SaleObservation = Schemas['SaleObservationDto'];
export type SaleObservationList = Schemas['SaleObservationListResponseDto'];
export type CreateSaleObservationBody = Schemas['CreateSaleObservationDto'];
export type SaleFollowUp = Schemas['SaleFollowUpDto'];
export type SaleFollowUpList = Schemas['SaleFollowUpListResponseDto'];
export type CreateSaleFollowUpBody = Schemas['CreateSaleFollowUpDto'];
export type PatchSaleAssigneeBody = Schemas['PatchSaleAssigneeDto'];
export type AdministrativeDashboard = Schemas['AdministrativeDashboardDto'];

export type SupervisionDashboard = Schemas['SupervisionDashboardDto'];
export type SupervisionCompliance = Schemas['ComplianceDto'];
export type SupervisionReturnRate = Schemas['ReturnRateDto'];
export type SupervisionAlert = Schemas['SupervisionAlertDto'];
/** OpenAPI nullable UUID fields sometimes emit as `Record<string, never>`; normalize to string. */
type NullableUuid = string | null;

export type SellerListItem = Omit<Schemas['SellerListItemDto'], 'teamId' | 'teamName'> & {
  teamId: NullableUuid;
  teamName: NullableUuid;
};
export type SellerListResponse = Omit<Schemas['SellerListResponseDto'], 'items'> & {
  items: SellerListItem[];
};
export type SellerDetail = Schemas['SellerDetailDto'];
export type SellerComparisonResponse = Schemas['SellerComparisonResponseDto'];
export type AdministrativeListItem = Omit<
  Schemas['AdministrativeListItemDto'],
  'teamId' | 'teamName'
> & {
  teamId: NullableUuid;
  teamName: NullableUuid;
};
export type AdministrativeListResponse = Omit<Schemas['AdministrativeListResponseDto'], 'items'> & {
  items: AdministrativeListItem[];
};
export type AdministrativeDetail = Schemas['AdministrativeDetailDto'];
export type MonthlyGoal = Omit<Schemas['MonthlyGoalDto'], 'teamId' | 'userId'> & {
  teamId: NullableUuid;
  userId: NullableUuid;
};
export type MonthlyGoalList = Omit<Schemas['MonthlyGoalListResponseDto'], 'items'> & {
  items: MonthlyGoal[];
};
export type MonthlyGoalHistoryItem = Omit<Schemas['MonthlyGoalHistoryItemDto'], 'reason'> & {
  reason: string | null;
};
export type MonthlyGoalHistory = Omit<Schemas['MonthlyGoalHistoryResponseDto'], 'items'> & {
  items: MonthlyGoalHistoryItem[];
};
export type CreateMonthlyGoalBody = Omit<Schemas['CreateMonthlyGoalDto'], 'teamId' | 'userId'> & {
  teamId?: string | null;
  userId?: string | null;
};
export type PatchMonthlyGoalBody = Schemas['PatchMonthlyGoalDto'];
export type SupervisionPeriodQuery = NonNullable<
  operations['Supervision_getDashboard']['parameters']['query']
>;
export type SupervisionSellerListQuery = NonNullable<
  operations['Supervision_listSellers']['parameters']['query']
>;
export type SupervisionAdministrativeListQuery = NonNullable<
  operations['Supervision_listAdministratives']['parameters']['query']
>;
export type SupervisionGoalsQuery = NonNullable<
  operations['Supervision_listGoals']['parameters']['query']
>;
export type MonthlyGoalType = MonthlyGoal['goalType'];
export type MonthlyGoalTargetType = MonthlyGoal['targetType'];
export type MonthlyGoalUnit = MonthlyGoal['unit'];

export type SellerHome = Schemas['SellerHomeResponseDto'];
export type AdministrativeHome = Schemas['AdministrativeHomeResponseDto'];
export type SupervisorHome = Schemas['SupervisorHomeResponseDto'];
export type AdminHome = Schemas['AdminHomeResponseDto'];
export type HomeKpi = Schemas['HomeKpiDto'];
export type HomeAlert = Schemas['HomeAlertDto'];
export type HomeSaleRef = Schemas['HomeSaleRefDto'];
export type HomeSeriesPoint = Schemas['HomeSeriesPointDto'];
export type HomeCompliance = Schemas['HomeComplianceDto'];
export type HomeFollowUpRef = Schemas['HomeFollowUpRefDto'];
export type HomeAuditRef = Schemas['HomeAuditRefDto'];
export type HomeNotificationRef = Schemas['HomeNotificationRefDto'];
export type HomeSellerPace = Schemas['HomeSellerPaceDto'];
export type HomeTeamPerformance = Schemas['HomeTeamPerformanceDto'];
export type HomePeriodQuery = NonNullable<operations['Home_getSeller']['parameters']['query']>;
export type HomePeriodTeamQuery = NonNullable<
  operations['Home_getSupervisor']['parameters']['query']
>;

export type UserNotification = Schemas['UserNotificationDto'];
export type UserNotificationList = Schemas['UserNotificationListResponseDto'];
export type NotificationListQuery = NonNullable<
  operations['Notifications_listMine']['parameters']['query']
>;
export type UnreadCount = Schemas['UnreadCountResponseDto'];
/** Inline OpenAPI enums (no standalone schema names in the generated contract). */
export type SaleStatus = Sale['status'];
export type SaleCustomerType = NonNullable<Sale['customerType']>;
export type SalePaymentMethod = NonNullable<NonNullable<Sale['billing']>['paymentMethod']>;
export type SaleMemberType = SaleMember['memberType'];
export type SaleMemberSex = NonNullable<SaleMember['sex']>;
export type SaleMaritalStatus = NonNullable<SaleMember['maritalStatus']>;
export type SaleDocumentType = SaleDocumentMeta['documentType'];
export type SaleDocumentStatus = SaleDocumentMeta['status'];
export type SaleObservationType = SaleObservation['type'];
export type SaleObservationStatus = SaleObservation['status'];
export type SaleFollowUpType = SaleFollowUp['followUpType'];
export type UserNotificationType = UserNotification['type'];
