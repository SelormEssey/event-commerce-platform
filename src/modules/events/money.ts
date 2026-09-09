import {
  countries,
  type CountryCode,
  type CurrencyCode,
} from '../../config/countries';
import type { Language } from '../../i18n/locales';
import { formattingLocale } from '../../lib/format';
import type { Money } from './domain';

export function money(minorUnits: string, currency: CurrencyCode): Money {
  if (!/^\d+$/.test(minorUnits)) {
    throw new Error('Money minor units must be a non-negative integer string.');
  }
  return { minorUnits, currency };
}

export function formatMoney(
  value: Money,
  country: CountryCode,
  language: Language,
): string {
  const configuration = countries[country];
  if (value.currency !== configuration.currency) {
    throw new Error('Money currency does not match the selected market.');
  }
  if (!/^\d+$/.test(value.minorUnits)) {
    throw new Error('Money minor units must be a non-negative integer string.');
  }

  const fractionDigits = configuration.currencyFractionDigits;
  const scale = 10n ** BigInt(fractionDigits);
  const amount = BigInt(value.minorUnits);
  const whole = amount / scale;
  const fraction = (amount % scale).toString().padStart(fractionDigits, '0');
  const locale = formattingLocale(country, language);
  const parts = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: value.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).formatToParts(whole);

  if (fractionDigits === 0) return parts.map((part) => part.value).join('');

  const decimal =
    new Intl.NumberFormat(locale)
      .formatToParts(1.1)
      .find((part) => part.type === 'decimal')?.value ?? '.';
  const lastNumberPart = parts.findLastIndex(
    (part) => part.type === 'integer' || part.type === 'group',
  );
  parts.splice(lastNumberPart + 1, 0, {
    type: 'decimal',
    value: `${decimal}${fraction}`,
  });
  return parts.map((part) => part.value).join('');
}

export function lowestPrice(
  tiers: readonly { price: Money }[],
): Money | undefined {
  return tiers.reduce<Money | undefined>((lowest, tier) => {
    if (!lowest) return tier.price;
    if (tier.price.currency !== lowest.currency) {
      throw new Error('Ticket tiers for one event must use one currency.');
    }
    return BigInt(tier.price.minorUnits) < BigInt(lowest.minorUnits)
      ? tier.price
      : lowest;
  }, undefined);
}
