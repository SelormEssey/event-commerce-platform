import { describe, expect, it } from 'vitest';
import { dictionaries, getDictionary } from '../src/i18n';
import { isLanguage, languages } from '../src/i18n/locales';
import { formattingLocale, formatCurrency } from '../src/lib/format';

function leafPaths(value: object, prefix = ''): string[] {
  return Object.entries(value)
    .flatMap(([key, item]: [string, unknown]) => {
      const path = `${prefix}${key}`;
      if (typeof item === 'string') {
        expect(item.trim(), path).not.toBe('');
        return path;
      }
      if (item !== null && typeof item === 'object')
        return leafPaths(item, `${path}.`);
      throw new Error(`Unexpected dictionary value at ${path}`);
    })
    .sort();
}

describe('localization', () => {
  it('provides a complete nonempty dictionary for every registered language', () => {
    expect(Object.keys(dictionaries).sort()).toEqual(
      Object.keys(languages).sort(),
    );
    for (const dictionary of Object.values(dictionaries)) {
      expect(leafPaths(dictionary)).toEqual(leafPaths(dictionaries.en));
    }
  });
  it('changes actual interface text', () => {
    expect(getDictionary('en').controls.country).toBe('Country');
    expect(getDictionary('fr').controls.country).toBe('Pays');
  });
  it.each(['kr', 'constructor', '__proto__', 'en-US', ''])(
    'rejects an unregistered language: %s',
    (language) => {
      expect(isLanguage(language)).toBe(false);
    },
  );
  it('combines an explicit language choice with the selected market', () => {
    expect(formattingLocale('CI', 'fr')).toBe('fr-CI');
    expect(formattingLocale('GH', 'fr')).toBe('fr-GH');
    expect(formattingLocale('CI', 'en')).toBe('en-CI');
  });
  it('respects currencies with different fraction digits', () => {
    expect(formatCurrency(1234.5, 'GH', 'en')).toContain('1,234.50');
    expect(formatCurrency(1234.5, 'CI', 'en')).toContain('1,235');
    expect(formatCurrency(1234.5, 'CI', 'en')).not.toContain('.00');
    expect(formatCurrency(1234.5, 'SL', 'en')).toContain('1,234.50');
  });
  it.each([NaN, Infinity, -Infinity])(
    'rejects a non-finite display amount',
    (amount) => {
      expect(() => formatCurrency(amount, 'SL', 'en')).toThrow(
        'Amount must be finite.',
      );
    },
  );
});
