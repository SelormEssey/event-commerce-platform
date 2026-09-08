import { countries, type CountryCode } from '../config/countries';
import type { Language } from '../i18n/locales';

export function formattingLocale(country: CountryCode, language: Language) {
  const configuration = countries[country];
  return language === configuration.defaultLanguage
    ? configuration.defaultLocale
    : `${language}-${country}`;
}

// Display only. Future monetary calculations must not use floating-point amounts.
export function formatCurrency(
  amount: number,
  country: CountryCode,
  language: Language,
) {
  if (!Number.isFinite(amount)) throw new Error('Amount must be finite.');
  return new Intl.NumberFormat(formattingLocale(country, language), {
    style: 'currency',
    currency: countries[country].currency,
  }).format(amount);
}
