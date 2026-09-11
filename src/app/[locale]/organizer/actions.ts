'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { isCountryCode } from '../../../config/countries';
import { eventCategories } from '../../../modules/events/domain';
import { parseMajorUnits } from '../../../modules/events/money-input';
import {
  createOrganizerEvent,
  createOrganizerTicketTier,
  removeOrganizerTicketTier,
  setOrganizerEventPublished,
  updateOrganizerEvent,
  updateOrganizerTicketTier,
  type EventDetailsInput,
  type TicketTierInput,
} from '../../../modules/organizers/event-service';
import {
  WorkspaceError,
  type WorkspaceErrorCode,
} from '../../../modules/organizers/errors';
import { updateOrganizerProfile } from '../../../modules/organizers/organizer-service';
import {
  saveOrganizerPromotion,
  type PromotionInput,
} from '../../../modules/organizers/promotion-service';
import type { PrototypeOrganizerContext } from '../../../modules/organizers/context.server';
import { getPrototypeRepositories } from '../../../modules/prototype-data/repositories.server';
import { parseBasisPoints } from '../../../modules/promotions/money';

function value(formData: FormData, key: string) {
  const item = formData.get(key);
  return typeof item === 'string' ? item : '';
}

function optionalValue(formData: FormData, key: string) {
  const item = value(formData, key).trim();
  return item || undefined;
}

function utcDateTime(formData: FormData, key: string) {
  const item = value(formData, key);
  return item ? `${item}:00.000Z` : '';
}

function integerValue(formData: FormData, key: string) {
  const item = value(formData, key);
  return /^\d+$/.test(item) ? Number(item) : Number.NaN;
}

function actionCode(error: unknown): WorkspaceErrorCode {
  if (error instanceof WorkspaceError) return error.code;
  if (error instanceof Error) {
    if (error.message === 'INVALID_MONEY') return 'INVALID_MONEY';
    if (error.message === 'CURRENCY_MISMATCH') return 'CURRENCY_MISMATCH';
  }
  return 'INVALID_TEXT';
}

function organizerUrl(
  context: PrototypeOrganizerContext,
  path = '',
  state?: { saved?: string; error?: WorkspaceErrorCode },
) {
  const query = new URLSearchParams({
    country: context.country,
    organizer: context.organizerSlug,
  });
  if (state?.saved) query.set('saved', state.saved);
  if (state?.error) query.set('error', state.error);
  return `/${context.locale}/organizer${path}?${query}`;
}

function revalidateOrganizerAndPublic(context: PrototypeOrganizerContext) {
  revalidatePath(`/${context.locale}/organizer`);
  revalidatePath(`/${context.locale}`);
}

async function resolveCurrentOrganizer(context: PrototypeOrganizerContext) {
  const repositories = getPrototypeRepositories();
  const organizer = await repositories.organizers.findBySlug(
    context.organizerSlug,
  );
  if (!organizer) throw new WorkspaceError('NOT_FOUND');
  return { repositories, organizer };
}

function parseEventDetails(formData: FormData): EventDetailsInput {
  const countryCode = value(formData, 'countryCode');
  const category = value(formData, 'category');
  const treatment = value(formData, 'artworkTreatment');
  const tone = value(formData, 'artworkTone');
  const address = optionalValue(formData, 'address');
  const ageRestriction = optionalValue(formData, 'ageRestriction');
  if (
    !isCountryCode(countryCode) ||
    !eventCategories.includes(category as (typeof eventCategories)[number]) ||
    !['orbit', 'grid', 'rays', 'stacks', 'wave', 'frame'].includes(treatment) ||
    !['lilac', 'coral', 'blue', 'amber', 'green', 'red'].includes(tone)
  ) {
    throw new WorkspaceError('INVALID_TEXT');
  }
  return {
    title: value(formData, 'title'),
    description: value(formData, 'description'),
    category: category as EventDetailsInput['category'],
    artwork: {
      treatment: treatment as EventDetailsInput['artwork']['treatment'],
      tone: tone as EventDetailsInput['artwork']['tone'],
    },
    venue: {
      name: value(formData, 'venueName'),
      city: value(formData, 'city'),
      ...(address ? { address } : {}),
      countryCode,
    },
    startDateTime: utcDateTime(formData, 'startDateTime'),
    endDateTime: utcDateTime(formData, 'endDateTime'),
    ...(ageRestriction ? { ageRestriction } : {}),
    refundPolicy: value(formData, 'refundPolicy'),
  };
}

function parseTier(
  formData: FormData,
  country: PrototypeOrganizerContext['country'],
): TicketTierInput {
  const description = optionalValue(formData, 'description');
  return {
    name: value(formData, 'name'),
    ...(description ? { description } : {}),
    price: parseMajorUnits(value(formData, 'price'), country),
    capacity: integerValue(formData, 'capacity'),
    salesStart: utcDateTime(formData, 'salesStart'),
    salesEnd: utcDateTime(formData, 'salesEnd'),
  };
}

export async function updateProfileAction(
  context: PrototypeOrganizerContext,
  formData: FormData,
) {
  let error: WorkspaceErrorCode | undefined;
  try {
    const { repositories, organizer } = await resolveCurrentOrganizer(context);
    const about = optionalValue(formData, 'about');
    await updateOrganizerProfile(
      organizer.id,
      {
        displayName: value(formData, 'displayName'),
        ...(about ? { about } : {}),
      },
      repositories,
    );
    revalidateOrganizerAndPublic(context);
  } catch (cause) {
    error = actionCode(cause);
  }
  redirect(
    organizerUrl(context, '/profile', error ? { error } : { saved: 'profile' }),
  );
}

export async function saveEventAction(
  context: PrototypeOrganizerContext,
  eventId: string | undefined,
  formData: FormData,
) {
  let error: WorkspaceErrorCode | undefined;
  let savedEventId = eventId;
  try {
    const { repositories, organizer } = await resolveCurrentOrganizer(context);
    const input = parseEventDetails(formData);
    const event = eventId
      ? await updateOrganizerEvent(organizer.id, eventId, input, repositories)
      : await createOrganizerEvent(organizer.id, input, repositories);
    savedEventId = event.id;
    revalidateOrganizerAndPublic(context);
  } catch (cause) {
    error = actionCode(cause);
  }
  if (error) {
    redirect(
      organizerUrl(
        context,
        eventId ? `/events/${eventId}/edit` : '/events/new',
        { error },
      ),
    );
  }
  redirect(
    organizerUrl(context, `/events/${savedEventId}/edit`, { saved: 'event' }),
  );
}

export async function setPublicationAction(
  context: PrototypeOrganizerContext,
  eventId: string,
  publish: boolean,
) {
  let error: WorkspaceErrorCode | undefined;
  try {
    const { repositories, organizer } = await resolveCurrentOrganizer(context);
    await setOrganizerEventPublished(
      organizer.id,
      eventId,
      publish,
      repositories,
    );
    revalidateOrganizerAndPublic(context);
  } catch (cause) {
    error = actionCode(cause);
  }
  redirect(
    organizerUrl(
      context,
      `/events/${eventId}/edit`,
      error ? { error } : { saved: publish ? 'published' : 'unpublished' },
    ),
  );
}

export async function saveTicketTierAction(
  context: PrototypeOrganizerContext,
  eventId: string,
  tierId: string | undefined,
  formData: FormData,
) {
  let error: WorkspaceErrorCode | undefined;
  try {
    const { repositories, organizer } = await resolveCurrentOrganizer(context);
    const event = await repositories.events.findById(eventId);
    if (!event) throw new WorkspaceError('NOT_FOUND');
    const input = parseTier(formData, event.venue.countryCode);
    if (tierId) {
      await updateOrganizerTicketTier(
        organizer.id,
        tierId,
        input,
        repositories,
      );
    } else {
      await createOrganizerTicketTier(
        organizer.id,
        eventId,
        input,
        repositories,
      );
    }
    revalidateOrganizerAndPublic(context);
  } catch (cause) {
    error = actionCode(cause);
  }
  redirect(
    organizerUrl(
      context,
      `/events/${eventId}/edit`,
      error ? { error } : { saved: 'tier' },
    ),
  );
}

export async function removeTicketTierAction(
  context: PrototypeOrganizerContext,
  eventId: string,
  tierId: string,
) {
  let error: WorkspaceErrorCode | undefined;
  try {
    const { repositories, organizer } = await resolveCurrentOrganizer(context);
    await removeOrganizerTicketTier(organizer.id, tierId, repositories);
    revalidateOrganizerAndPublic(context);
  } catch (cause) {
    error = actionCode(cause);
  }
  redirect(
    organizerUrl(
      context,
      `/events/${eventId}/edit`,
      error ? { error } : { saved: 'tierRemoved' },
    ),
  );
}

export async function savePromotionAction(
  context: PrototypeOrganizerContext,
  eventId: string,
  promotionId: string | undefined,
  formData: FormData,
) {
  let error: WorkspaceErrorCode | undefined;
  try {
    const { repositories, organizer } = await resolveCurrentOrganizer(context);
    const event = await repositories.events.findById(eventId);
    if (!event) throw new WorkspaceError('NOT_FOUND');
    const type = value(formData, 'type');
    const usageLimit = optionalValue(formData, 'usageLimit');
    const attributionLabel = optionalValue(formData, 'attributionLabel');
    const shared = {
      code: value(formData, 'code'),
      name: value(formData, 'name'),
      startsAt: utcDateTime(formData, 'startsAt'),
      endsAt: utcDateTime(formData, 'endsAt'),
      ...(usageLimit
        ? { usageLimit: integerValue(formData, 'usageLimit') }
        : {}),
      isActive: value(formData, 'isActive') === 'on',
      ...(attributionLabel ? { attributionLabel } : {}),
      ticketTierIds: formData
        .getAll('ticketTierIds')
        .filter((item): item is string => typeof item === 'string'),
    };
    let input: PromotionInput;
    if (type === 'PERCENTAGE') {
      input = {
        ...shared,
        type,
        percentageBasisPoints: parseBasisPoints(value(formData, 'percentage')),
      };
    } else if (type === 'FIXED_AMOUNT') {
      input = {
        ...shared,
        type,
        fixedAmount: parseMajorUnits(
          value(formData, 'fixedAmount'),
          event.venue.countryCode,
        ),
      };
    } else {
      throw new WorkspaceError('INVALID_PROMOTION');
    }
    await saveOrganizerPromotion(
      organizer.id,
      eventId,
      promotionId,
      input,
      repositories,
    );
    revalidateOrganizerAndPublic(context);
  } catch (cause) {
    error = actionCode(cause);
  }
  redirect(
    organizerUrl(
      context,
      `/events/${eventId}/promotions`,
      error ? { error } : { saved: 'promotion' },
    ),
  );
}
