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
