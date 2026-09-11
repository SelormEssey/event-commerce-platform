'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import {
  countries,
  countryCodes,
  isCountryCode,
  type CountryCode,
} from '../../config/countries';
import { isLanguage, languages, type Language } from '../../i18n/locales';
import type { Dictionary } from '../../i18n';
import type { OrganizerRecord } from '../../modules/organizers/domain';

export function WorkspaceSwitcher({
  country,
  language,
  organizerSlug,
  organizers,
  currentRoute,
  text,
}: {
  country: CountryCode;
  language: Language;
  organizerSlug: string;
  organizers: readonly OrganizerRecord[];
  currentRoute: string;
  text: Dictionary;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function navigate(
    nextLanguage: Language,
    nextCountry: CountryCode,
    nextOrganizer: string,
  ) {
    startTransition(() => {
      const query = new URLSearchParams({
        country: nextCountry,
        organizer: nextOrganizer,
      });
      router.push(`/${nextLanguage}${currentRoute}?${query}`);
    });
  }

  return (
    <div className="workspace-switcher" aria-busy={pending}>
      <label>
        <span>{text.organizer.prototypeSelector}</span>
        <select
          value={organizerSlug}
          disabled={pending}
          onChange={(event) => navigate(language, country, event.target.value)}
        >
          {organizers.map((organizer) => (
            <option value={organizer.slug} key={organizer.id}>
              {organizer.displayName}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>{text.market.country}</span>
        <select
          value={country}
          disabled={pending}
          onChange={(event) => {
            const nextCountry = event.target.value;
            if (isCountryCode(nextCountry)) {
              navigate(
                countries[nextCountry].defaultLanguage,
                nextCountry,
                organizerSlug,
              );
            }
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
        <span>{text.market.language}</span>
        <select
          value={language}
          disabled={pending}
          onChange={(event) => {
            const nextLanguage = event.target.value;
            if (isLanguage(nextLanguage)) {
              navigate(nextLanguage, country, organizerSlug);
            }
          }}
        >
          {Object.entries(languages).map(([code, value]) => (
            <option value={code} key={code} lang={code}>
              {value.nativeName}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
