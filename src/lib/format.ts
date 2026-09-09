import { countries, type CountryCode } from '../config/countries';
import type { Language } from '../i18n/locales';

export function formattingLocale(country: CountryCode, language: Language) {
  const configuration = countries[country];
  return language === configuration.defaultLanguage
    ? configuration.defaultLocale
    : `${language}-${country}`;
}
