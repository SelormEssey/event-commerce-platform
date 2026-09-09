import Link from 'next/link';
import type { CountryCode } from '../../config/countries';
import type { Dictionary } from '../../i18n';
import type { Language } from '../../i18n/locales';
import { MarketSwitcher } from './market-switcher';

export function SiteHeader({
  country,
  language,
  text,
  eventSlug,
}: {
  country: CountryCode;
  language: Language;
  text: Dictionary;
  eventSlug?: string;
}) {
  return (
    <>
      <a className="skip-link" href="#main-content">
        {text.navigation.skip}
      </a>
      <header className="site-header page-width">
        <Link
          href={`/${language}?country=${country}`}
          className="platform-wordmark"
        >
          <span className="platform-symbol" aria-hidden="true">
            ↗
          </span>
          {text.navigation.platform}
        </Link>
        <MarketSwitcher
          country={country}
          language={language}
          text={text.market}
          {...(eventSlug ? { eventSlug } : {})}
        />
      </header>
    </>
  );
}

export function SiteFooter({ text }: { text: Dictionary['footer'] }) {
  return (
    <footer className="site-footer page-width">
      <p>{text.scope}</p>
      <p>{text.policy}</p>
    </footer>
  );
}
