import type { Language } from '../i18n/locales';

type CountryConfiguration = {
  name: string;
  currency: string;
  defaultLanguage: Language;
  defaultLocale: string;
  paymentMethods: readonly { id: string; label: string }[];
  settings: { salesEnabled: boolean };
};

// Authoritative market configuration. No payment method is enabled in Sprint 0.
export const countries = {
  SL: {
    name: 'Sierra Leone',
    currency: 'SLE',
    defaultLanguage: 'en',
    defaultLocale: 'en-SL',
    paymentMethods: [],
    settings: { salesEnabled: false },
  },
  GH: {
    name: 'Ghana',
    currency: 'GHS',
    defaultLanguage: 'en',
    defaultLocale: 'en-GH',
    paymentMethods: [],
    settings: { salesEnabled: false },
  },
  CI: {
    name: 'Côte d’Ivoire',
    currency: 'XOF',
    defaultLanguage: 'fr',
    defaultLocale: 'fr-CI',
    paymentMethods: [],
    settings: { salesEnabled: false },
  },
} as const satisfies Record<string, CountryConfiguration>;

export type CountryCode = keyof typeof countries;
export const countryCodes = Object.keys(countries) as CountryCode[];
export const prototypeDefault = { country: 'SL', language: 'en' } as const;

export function isCountryCode(value: string): value is CountryCode {
  return Object.hasOwn(countries, value);
}

export function resolveCountry(value: string | string[] | undefined) {
  const valid = typeof value === 'string' && isCountryCode(value);
  return {
    code: valid ? value : prototypeDefault.country,
    invalid: value !== undefined && !valid,
  };
}

export function foundationPath(language: Language, country: CountryCode) {
  return `/${language}?${new URLSearchParams({ country })}`;
}
