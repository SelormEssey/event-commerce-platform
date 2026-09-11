import { isCountryCode, type CountryCode } from '../../config/countries';
import type {
  EventArtwork,
  EventCategory,
  EventRecord,
  Money,
  TicketTierRecord,
} from '../events/domain';
import { assertCurrencyForCountry } from '../events/money-input';
import { WorkspaceError } from './errors';
import { requireOrganizer } from './organizer-service';
import type { WorkspaceRepositories } from './repository';
import { cleanOptional, cleanRequired, isValidDate } from './validation';

export type EventDetailsInput = {
  title: string;
  description: string;
  category: EventCategory;
  artwork: Pick<EventArtwork, 'treatment' | 'tone'>;
  venue: {
    name: string;
    city: string;
    address?: string;
    countryCode: CountryCode;
  };
  startDateTime: string;
  endDateTime: string;
  ageRestriction?: string;
  refundPolicy: string;
};

export type TicketTierInput = {
  name: string;
  description?: string;
  price: Money;
  capacity: number;
  salesStart: string;
  salesEnd: string;
};

function slugify(value: string) {
  const slug = value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 70);
  return slug || 'prototype-event';
}

async function uniqueEventSlug(
  title: string,
  repositories: WorkspaceRepositories,
) {
  const existing = new Set(
    (await repositories.events.list()).map((event) => event.slug),
  );
  const base = slugify(title);
  let candidate = base;
  let suffix = 2;
  while (existing.has(candidate)) candidate = `${base}-${suffix++}`;
  return candidate;
}

export async function requireOwnedEvent(
  organizerId: string,
  eventId: string,
  repositories: WorkspaceRepositories,
) {
  const event = await repositories.events.findById(eventId);
  if (!event) throw new WorkspaceError('NOT_FOUND');
  if (event.organizerId !== organizerId) throw new WorkspaceError('NOT_OWNED');
  return event;
}

function validateEventDetails(input: EventDetailsInput) {
  if (!isCountryCode(input.venue.countryCode)) {
    throw new WorkspaceError('INVALID_COUNTRY');
  }
  if (
    !isValidDate(input.startDateTime) ||
    !isValidDate(input.endDateTime) ||
    Date.parse(input.endDateTime) <= Date.parse(input.startDateTime)
  ) {
    throw new WorkspaceError('INVALID_DATES');
  }
  const title = cleanRequired(input.title, 120);
  const address = cleanOptional(input.venue.address, 240);
  const ageRestriction = cleanOptional(input.ageRestriction, 40);
  return {
    title,
    description: cleanRequired(input.description, 4000),
    category: input.category,
    artwork: {
      ...input.artwork,
      alt: `Abstract prototype artwork for ${title}.`,
    },
    venue: {
      name: cleanRequired(input.venue.name, 160),
      city: cleanRequired(input.venue.city, 120),
      ...(address ? { address } : {}),
      countryCode: input.venue.countryCode,
    },
    startDateTime: new Date(input.startDateTime).toISOString(),
    endDateTime: new Date(input.endDateTime).toISOString(),
    ...(ageRestriction ? { ageRestriction } : {}),
    refundPolicy: cleanRequired(input.refundPolicy, 2000),
  };
}

export async function createOrganizerEvent(
  currentOrganizerId: string,
  input: EventDetailsInput,
  repositories: WorkspaceRepositories,
) {
  const organizer = await requireOrganizer(currentOrganizerId, repositories);
  const details = validateEventDetails(input);
  const event: EventRecord = {
    id: crypto.randomUUID(),
    slug: await uniqueEventSlug(details.title, repositories),
    organizerDisplayName: organizer.displayName,
    organizerId: organizer.id,
    organizer: {
      id: organizer.id,
      slug: organizer.slug,
      displayName: organizer.displayName,
    },
    ...details,
    venue: { id: crypto.randomUUID(), ...details.venue },
    status: 'DRAFT',
    ticketTiers: [],
  };
  await repositories.events.save(event);
  return event;
}

export async function updateOrganizerEvent(
  currentOrganizerId: string,
  eventId: string,
  input: EventDetailsInput,
  repositories: WorkspaceRepositories,
) {
  const existing = await requireOwnedEvent(
    currentOrganizerId,
    eventId,
    repositories,
  );
  if (existing.status !== 'DRAFT' && existing.status !== 'PUBLISHED') {
    throw new WorkspaceError('STATUS_NOT_EDITABLE');
  }
  const details = validateEventDetails(input);
  const venueChanged =
    existing.venue.name !== details.venue.name ||
    existing.venue.city !== details.venue.city ||
    existing.venue.address !== details.venue.address ||
    existing.venue.countryCode !== details.venue.countryCode;
  for (const tier of existing.ticketTiers) {
    try {
      assertCurrencyForCountry(tier.price.currency, details.venue.countryCode);
    } catch {
      throw new WorkspaceError('CURRENCY_MISMATCH');
    }
  }
  const updated: EventRecord = {
    ...existing,
    ...details,
    venue: {
      id: venueChanged ? crypto.randomUUID() : existing.venue.id,
      ...details.venue,
    },
  };
  await repositories.events.save(updated);
  return updated;
}

export async function setOrganizerEventPublished(
  currentOrganizerId: string,
  eventId: string,
  published: boolean,
  repositories: WorkspaceRepositories,
) {
  const event = await requireOwnedEvent(
    currentOrganizerId,
    eventId,
    repositories,
  );
  if (event.status !== 'DRAFT' && event.status !== 'PUBLISHED') {
    throw new WorkspaceError('STATUS_NOT_EDITABLE');
  }
  if (published && event.ticketTiers.length === 0) {
    throw new WorkspaceError('TIER_REQUIRED_TO_PUBLISH');
  }
  const withoutPublishedAt = { ...event };
  delete withoutPublishedAt.publishedAt;
  const updated: EventRecord = published
    ? {
        ...event,
        status: 'PUBLISHED',
        publishedAt: new Date().toISOString(),
      }
    : { ...withoutPublishedAt, status: 'DRAFT' };
  await repositories.events.save(updated);
  return updated;
}

function validateTicketTier(input: TicketTierInput, country: CountryCode) {
  if (!Number.isSafeInteger(input.capacity) || input.capacity <= 0) {
    throw new WorkspaceError('INVALID_CAPACITY');
  }
  if (
    !isValidDate(input.salesStart) ||
    !isValidDate(input.salesEnd) ||
    Date.parse(input.salesEnd) <= Date.parse(input.salesStart)
  ) {
    throw new WorkspaceError('INVALID_SALES_WINDOW');
  }
  try {
    assertCurrencyForCountry(input.price.currency, country);
  } catch {
    throw new WorkspaceError('CURRENCY_MISMATCH');
  }
  const description = cleanOptional(input.description, 500);
  return {
    name: cleanRequired(input.name, 100),
    ...(description ? { description } : {}),
    price: input.price,
    capacity: input.capacity,
    salesStart: new Date(input.salesStart).toISOString(),
    salesEnd: new Date(input.salesEnd).toISOString(),
  };
}

export async function createOrganizerTicketTier(
  currentOrganizerId: string,
  eventId: string,
  input: TicketTierInput,
  repositories: WorkspaceRepositories,
) {
  const event = await requireOwnedEvent(
    currentOrganizerId,
    eventId,
    repositories,
  );
  const validated = validateTicketTier(input, event.venue.countryCode);
  const tier: TicketTierRecord = {
    id: crypto.randomUUID(),
    ...validated,
    availableQuantity: validated.capacity,
  };
  await repositories.events.saveTicketTier(event.id, tier);
  return tier;
}

async function findTierParent(
  tierId: string,
  repositories: WorkspaceRepositories,
) {
  const parent = (await repositories.events.list()).find((event) =>
    event.ticketTiers.some((tier) => tier.id === tierId),
  );
  if (!parent) throw new WorkspaceError('NOT_FOUND');
  return parent;
}

export async function updateOrganizerTicketTier(
  currentOrganizerId: string,
  tierId: string,
  input: TicketTierInput,
  repositories: WorkspaceRepositories,
) {
  const parent = await findTierParent(tierId, repositories);
  const event = await requireOwnedEvent(
    currentOrganizerId,
    parent.id,
    repositories,
  );
  const existing = event.ticketTiers.find((tier) => tier.id === tierId);
  if (!existing) throw new WorkspaceError('NOT_FOUND');
  const validated = validateTicketTier(input, event.venue.countryCode);
  if (validated.capacity < existing.availableQuantity) {
    throw new WorkspaceError('CAPACITY_BELOW_AVAILABLE');
  }
  const tier: TicketTierRecord = {
    ...existing,
    ...validated,
    availableQuantity: existing.availableQuantity,
  };
  await repositories.events.saveTicketTier(event.id, tier);
  return tier;
}

export async function removeOrganizerTicketTier(
  currentOrganizerId: string,
  tierId: string,
  repositories: WorkspaceRepositories,
) {
  const parent = await findTierParent(tierId, repositories);
  const event = await requireOwnedEvent(
    currentOrganizerId,
    parent.id,
    repositories,
  );
  if (event.status === 'PUBLISHED' && event.ticketTiers.length === 1) {
    throw new WorkspaceError('FINAL_PUBLISHED_TIER');
  }
  const promotions = await repositories.promotions.listByEvent(event.id);
  if (
    promotions.some((promotion) => promotion.ticketTierIds.includes(tierId))
  ) {
    throw new WorkspaceError('TIER_HAS_PROMOTIONS');
  }
  await repositories.events.removeTicketTier(event.id, tierId);
}
