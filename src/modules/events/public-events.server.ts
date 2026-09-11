import 'server-only';
import type { CountryCode } from '../../config/countries';
import type { EventCategory } from './domain';
import { getPrototypeRepositories } from '../prototype-data/repositories.server';
import { getPublicEventBySlug, listPublicEvents } from './public-events';

export function listActivePublicEvents(filters: {
  country: CountryCode;
  category?: EventCategory;
  search?: string;
}) {
  return listPublicEvents(filters, getPrototypeRepositories().events);
}

export function getActivePublicEventBySlug(slug: string) {
  return getPublicEventBySlug(slug, getPrototypeRepositories().events);
}
