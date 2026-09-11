import {
  countries,
  type CountryCode,
  type CurrencyCode,
} from '../../config/countries';
import { money } from './money';

const postgresBigIntMaximum = 9_223_372_036_854_775_807n;

export function parseMajorUnits(input: string, country: CountryCode) {
  const value = input.trim();
  const fractionDigits = countries[country].currencyFractionDigits;
  const pattern =
    fractionDigits === 0
      ? /^(\d+)$/
      : new RegExp(`^(\\d+)(?:\\.(\\d{1,${fractionDigits}}))?$`);
  const match = pattern.exec(value);
  if (!match?.[1]) throw new Error('INVALID_MONEY');

  const fraction = (match[2] ?? '').padEnd(fractionDigits, '0');
  const minorUnits = BigInt(`${match[1]}${fraction}`);
  if (minorUnits > postgresBigIntMaximum) throw new Error('INVALID_MONEY');
  return money(minorUnits.toString(), countries[country].currency);
}

export function moneyToMajorUnits(minorUnits: string, country: CountryCode) {
  if (!/^\d+$/.test(minorUnits)) throw new Error('INVALID_MONEY');
  const fractionDigits = countries[country].currencyFractionDigits;
  if (fractionDigits === 0) return BigInt(minorUnits).toString();
  const padded = minorUnits.padStart(fractionDigits + 1, '0');
  return `${padded.slice(0, -fractionDigits)}.${padded.slice(-fractionDigits)}`;
}

export function assertCurrencyForCountry(
  currency: CurrencyCode,
  country: CountryCode,
) {
  if (countries[country].currency !== currency) {
    throw new Error('CURRENCY_MISMATCH');
  }
}
