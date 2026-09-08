'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  countries,
  countryCodes,
  foundationPath,
  isCountryCode,
  type CountryCode,
} from '../../config/countries';
import { isLanguage, languages, type Language } from '../../i18n/locales';
import type { Dictionary } from '../../i18n';
import { formattingLocale } from '../../lib/format';
import { SelectField } from '../ui/select-field';

export function MarketControls({
  country,
  language,
  text,
}: {
  country: CountryCode;
  language: Language;
  text: Dictionary['controls'];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function navigate(nextLanguage: Language, nextCountry: CountryCode) {
    startTransition(() =>
      router.push(foundationPath(nextLanguage, nextCountry), { scroll: false }),
    );
  }

  return (
    <section
      className="context-panel"
      aria-labelledby="context-title"
      aria-busy={pending}
    >
      <div className="section-heading">
        <span className="section-mark" aria-hidden="true">
          ↗
        </span>
        <h2 id="context-title">{text.title}</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          id="country"
          name="country"
          label={text.country}
          value={country}
          disabled={pending}
          aria-describedby="context-help"
          onChange={(event) => {
            const value = event.target.value;
            if (isCountryCode(value))
              navigate(countries[value].defaultLanguage, value);
          }}
        >
          {countryCodes.map((code) => (
            <option key={code} value={code}>
              {countries[code].name}
            </option>
          ))}
        </SelectField>
        <SelectField
          id="language"
          name="language"
          label={text.language}
          value={language}
          disabled={pending}
          aria-describedby="context-help"
          onChange={(event) => {
            const value = event.target.value;
            if (isLanguage(value)) navigate(value, country);
          }}
        >
          {Object.entries(languages).map(([code, value]) => (
            <option key={code} value={code} lang={code}>
              {value.nativeName}
            </option>
          ))}
        </SelectField>
      </div>
      <p id="context-help" className="help-text">
        {text.help}
      </p>
      <dl className="context-values">
        <div>
          <dt>{text.currency}</dt>
          <dd>{countries[country].currency}</dd>
        </div>
        <div>
          <dt>{text.locale}</dt>
          <dd>{formattingLocale(country, language)}</dd>
        </div>
      </dl>
      <p className="selection-status" role="status" aria-live="polite">
        {pending
          ? text.updating
          : `${text.selected}: ${countries[country].name} / ${languages[language].nativeName}`}
      </p>
    </section>
  );
}
