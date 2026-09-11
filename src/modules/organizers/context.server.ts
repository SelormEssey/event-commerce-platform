import 'server-only';
import type { CountryCode } from '../../config/countries';
import type { Language } from '../../i18n/locales';
import { getPrototypeRepositories } from '../prototype-data/repositories.server';
import { resolvePrototypeOrganizer } from './organizer-service';

export type PrototypeOrganizerContext = {
  locale: Language;
  country: CountryCode;
  organizerSlug: string;
};

export async function getPrototypeOrganizerContext(selector?: string) {
  const repositories = getPrototypeRepositories();
  const context = await resolvePrototypeOrganizer(selector, repositories);
  return { ...context, repositories };
}
