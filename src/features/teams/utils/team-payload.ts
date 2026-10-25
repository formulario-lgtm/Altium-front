import type { CreateTeamBody, Team, UpdateTeamBody } from '@/services/http';
import type { TeamFormValues } from '../schemas/team.schema';

export function toCreateTeamBody(values: TeamFormValues): CreateTeamBody {
  const body: CreateTeamBody = { name: values.name, supervisorId: values.supervisorId };
  if (values.description) body.description = values.description;
  return body;
}

/** Only changed fields; an emptied description is sent as `null` to clear it. */
export function toUpdateTeamBody(team: Team, values: TeamFormValues): UpdateTeamBody {
  const body: UpdateTeamBody = {};
  if (values.name !== team.name) body.name = values.name;
  if (values.supervisorId !== team.supervisor.id) body.supervisorId = values.supervisorId;
  if (values.isActive !== team.isActive) body.isActive = values.isActive;
  const description = values.description || null;
  if (description !== team.description) body.description = description;
  return body;
}
