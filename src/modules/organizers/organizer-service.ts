import type { OrganizerRecord } from './domain';
import { WorkspaceError } from './errors';
import type { WorkspaceRepositories } from './repository';
import { cleanOptional, cleanRequired } from './validation';

export async function requireOrganizer(
  organizerId: string,
  repositories: WorkspaceRepositories,
) {
  const organizer = await repositories.organizers.findById(organizerId);
  if (!organizer) throw new WorkspaceError('NOT_FOUND');
  return organizer;
}

export async function resolvePrototypeOrganizer(
  selector: string | undefined,
  repositories: WorkspaceRepositories,
) {
  const organizers = await repositories.organizers.list();
  const selected = selector
    ? await repositories.organizers.findBySlug(selector)
    : organizers[0];
  if (!selected) throw new WorkspaceError('NOT_FOUND');
  return { selected, organizers };
}

export async function updateOrganizerProfile(
  currentOrganizerId: string,
  input: Pick<OrganizerRecord, 'displayName'> & { about?: string },
  repositories: WorkspaceRepositories,
) {
  const organizer = await requireOrganizer(currentOrganizerId, repositories);
  const about = cleanOptional(input.about, 1000);
  const updated: OrganizerRecord = {
    id: organizer.id,
    slug: organizer.slug,
    displayName: cleanRequired(input.displayName, 120),
    ...(about ? { about } : {}),
  };
  await repositories.organizers.save(updated);
  return updated;
}
