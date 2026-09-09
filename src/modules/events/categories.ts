import { eventCategories, type EventCategory } from './domain';

export const categorySlugs = {
  CONCERTS: 'concerts',
  PARTIES: 'parties',
  FESTIVALS: 'festivals',
  NIGHTLIFE: 'nightlife',
  SPORTS: 'sports',
  ARTS_CULTURE: 'arts-culture',
  CONFERENCES: 'conferences',
  OTHER: 'other',
} as const satisfies Record<EventCategory, string>;

export type CategorySlug = (typeof categorySlugs)[EventCategory];

export function resolveCategory(value: string | string[] | undefined): {
  category?: EventCategory;
  invalid: boolean;
} {
  if (value === undefined) return { invalid: false };
  if (typeof value !== 'string') return { invalid: true };
  const category = eventCategories.find(
    (candidate) => categorySlugs[candidate] === value,
  );
  return category ? { category, invalid: false } : { invalid: true };
}
