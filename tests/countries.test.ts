import { describe, expect, it } from 'vitest';
import {
  countries,
  foundationPath,
  isCountryCode,
  prototypeDefault,
  resolveCountry,
} from '../src/config/countries';
import { businessConfiguration } from '../src/config/business';

describe('market selection', () => {
  it.each([
    ['SL', 'SLE', 'en', 'en-SL'],
    ['GH', 'GHS', 'en', 'en-GH'],
    ['CI', 'XOF', 'fr', 'fr-CI'],
  ] as const)(
    'resolves %s to the agreed currency and defaults',
    (code, currency, language, locale) => {
      expect(countries[code]).toMatchObject({
        currency,
        defaultLanguage: language,
        defaultLocale: locale,
      });
      expect(resolveCountry(code)).toEqual({ code, invalid: false });
      expect(countries[code].paymentMethods).toEqual([]);
      expect(countries[code].settings.salesEnabled).toBe(false);
    },
  );

  it('defines currency precision in the market registry', () => {
    expect(countries.SL.currencyFractionDigits).toBe(2);
    expect(countries.GH.currencyFractionDigits).toBe(2);
    expect(countries.CI.currencyFractionDigits).toBe(0);
  });

  it('uses a documented default when the country is absent', () => {
    expect(resolveCountry(undefined)).toEqual({ code: 'SL', invalid: false });
    expect(
      foundationPath(prototypeDefault.language, prototypeDefault.country),
    ).toBe('/en?country=SL');
  });

  it.each(['US', 'sl', '', '__proto__', 'constructor', ['GH', 'SL']])(
    'rejects unsupported or ambiguous input: %s',
    (value) => {
      expect(resolveCountry(value)).toEqual({ code: 'SL', invalid: true });
    },
  );

  it('never treats inherited object properties as country codes', () => {
    expect(isCountryCode('toString')).toBe(false);
  });

  it('allows French in Ghana without changing market identity', () => {
    expect(foundationPath('fr', 'GH')).toBe('/fr?country=GH');
    expect(countries.GH.currency).toBe('GHS');
  });

  it('keeps financial policy explicitly undecided', () => {
    expect(businessConfiguration.label).toBe(
      'PROTOTYPE DEFAULTS — NOT FINAL BUSINESS POLICY',
    );
    for (const key of [
      'platformFee',
      'feePayer',
      'payoutTiming',
      'refundPolicy',
      'reservePolicy',
    ] as const) {
      expect(businessConfiguration[key]).toBeNull();
    }
  });
});
