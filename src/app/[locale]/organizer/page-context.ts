import { notFound } from 'next/navigation';
import { resolveCountry } from '../../../config/countries';
import { getDictionary } from '../../../i18n';
import { isLanguage } from '../../../i18n/locales';
import { getPrototypeOrganizerContext } from '../../../modules/organizers/context.server';

export type OrganizerPageProps<
  T extends Record<string, string> = Record<never, string>,
> = {
  params: Promise<{ locale: string } & T>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function loadOrganizerPage<T extends Record<string, string>>(
  params: OrganizerPageProps<T>['params'],
  searchParams: OrganizerPageProps<T>['searchParams'],
) {
  const [route, query] = await Promise.all([params, searchParams]);
  if (!isLanguage(route.locale)) notFound();
  const country = resolveCountry(query.country).code;
  const selector =
    typeof query.organizer === 'string' ? query.organizer : undefined;
  let prototypeContext;
  try {
    prototypeContext = await getPrototypeOrganizerContext(selector);
  } catch {
    notFound();
  }
  return {
    route,
    query,
    language: route.locale,
    country,
    text: getDictionary(route.locale),
    ...prototypeContext,
  };
}
