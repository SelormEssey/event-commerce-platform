'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  countries,
  countryCodes,
  isCountryCode,
  type CountryCode,
} from '../../config/countries';
import { isLanguage, languages, type Language } from '../../i18n/locales';
import type { Dictionary } from '../../i18n';

export function MarketSwitcher({
  country,
  language,
  text,
  eventSlug,
}: {
  country: CountryCode;
  language: Language;
  text: Dictionary['market'];
  eventSlug?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="market-switcher" aria-busy={pending}>
      <label>
        <span>{text.country}</span>
        <select
          value={country}
          disabled={pending}
          onChange={(event) => {
            const nextCountry = event.target.value;
            if (!isCountryCode(nextCountry)) return;
            startTransition(() =>
              router.push(
                `/${countries[nextCountry].defaultLanguage}?${new URLSearchParams({ country: nextCountry })}`,
              ),
            );
          }}
        >
          {countryCodes.map((code) => (
            <option value={code} key={code}>
              {countries[code].name}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>{text.language}</span>
        <select
          value={language}
          disabled={pending}
          onChange={(event) => {
            const nextLanguage = event.target.value;
            if (!isLanguage(nextLanguage)) return;
            const route = eventSlug ? `/events/${eventSlug}` : '';
            startTransition(() =>
              router.push(
                `/${nextLanguage}${route}?${new URLSearchParams({ country })}`,
              ),
            );
          }}
        >
          {Object.entries(languages).map(([code, value]) => (
            <option value={code} key={code} lang={code}>
              {value.nativeName}
            </option>
          ))}
        </select>
      </label>
      <span className="sr-only" role="status" aria-live="polite">
        {pending ? text.updating : ''}
      </span>
    </div>
  );
}
