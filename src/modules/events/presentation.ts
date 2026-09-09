import type { CountryCode } from '../../config/countries';
import type { Language } from '../../i18n/locales';
import { formattingLocale } from '../../lib/format';

export function formatEventDate(
  isoDate: string,
  country: CountryCode,
  language: Language,
) {
  return new Intl.DateTimeFormat(formattingLocale(country, language), {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(isoDate));
}

export function formatEventTimeRange(
  start: string,
  end: string,
  country: CountryCode,
  language: Language,
) {
  const formatter = new Intl.DateTimeFormat(
    formattingLocale(country, language),
    {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'UTC',
    },
  );
  return `${formatter.format(new Date(start))}–${formatter.format(new Date(end))}`;
}
