import type { CountryCode } from '../../config/countries';
import type { EventCategory, EventRecord } from './domain';
import { fixtureEventRepository } from './fixtures/fixture-event-repository';
import type { EventRepository } from './repository';

function normalizeSearch(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase()
    .trim();
}

export function filterPublicEvents(
  events: readonly EventRecord[],
  filters: {
    country: CountryCode;
    category?: EventCategory;
    search?: string;
  },
) {
  const search = normalizeSearch(filters.search ?? '');
  return events
    .filter(
      (event) =>
        event.status === 'PUBLISHED' &&
        event.venue.countryCode === filters.country,
    )
    .filter((event) => !filters.category || event.category === filters.category)
    .filter((event) => {
      if (!search) return true;
      return normalizeSearch(
        [
          event.title,
          event.venue.name,
          event.venue.city,
          event.organizerDisplayName,
        ].join(' '),
      ).includes(search);
    })
    .toSorted(
      (left, right) =>
        Date.parse(left.startDateTime) - Date.parse(right.startDateTime),
    );
}

export async function listPublicEvents(
  filters: {
    country: CountryCode;
    category?: EventCategory;
    search?: string;
  },
  repository: EventRepository = fixtureEventRepository,
) {
  return filterPublicEvents(await repository.list(), filters);
}

export async function getPublicEventBySlug(
  slug: string,
  repository: EventRepository = fixtureEventRepository,
) {
  const event = await repository.findBySlug(slug);
  return event?.status === 'PUBLISHED' ? event : undefined;
}
