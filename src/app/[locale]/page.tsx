import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { resolveCountry } from '../../config/countries';
import { getDictionary } from '../../i18n';
import { isLanguage } from '../../i18n/locales';
import { MarketControls } from '../../components/foundation/market-controls';
import { DesignExamples } from '../../components/foundation/design-examples';
import { StatusMessage } from '../../components/ui/status-message';

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLanguage(locale)) notFound();
  return {
    ...getDictionary(locale).metadata,
    robots: { index: false, follow: false },
  };
}

export default async function FoundationPage({
  params,
  searchParams,
}: PageProps) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  if (!isLanguage(locale)) notFound();
  const text = getDictionary(locale);
  const country = resolveCountry(query.country);
  const architecture = [
    {
      number: '01',
      title: text.system.countries,
      detail: text.system.countriesDetail,
    },
    {
      number: '02',
      title: text.system.languages,
      detail: text.system.languagesDetail,
    },
    {
      number: '03',
      title: text.system.database,
      detail: text.system.databaseDetail,
    },
    {
      number: '04',
      title: text.system.tokens,
      detail: text.system.tokensDetail,
    },
  ];

  return (
    <>
      <a className="skip-link" href="#main-content">
        {text.navigation.skip}
      </a>
      <header className="site-header page-width">
        <a
          href={`/${locale}?country=${country.code}`}
          className="platform-wordmark"
        >
          <span className="platform-symbol" aria-hidden="true">
            ↗
          </span>
          {text.navigation.platform}
        </a>
        <span className="header-label">
          {text.navigation.foundation}
          <span className="sprint-tag">00</span>
        </span>
      </header>
      <main id="main-content" className="page-width" tabIndex={-1}>
        <section className="intro-grid" aria-labelledby="page-title">
          <div className="intro-copy">
            <p className="eyebrow">{text.intro.eyebrow}</p>
            <h1 id="page-title">{text.intro.title}</h1>
            <p className="intro-description">{text.intro.description}</p>
            <p className="scope-note">
              <span aria-hidden="true">○</span>
              {text.intro.scope}
            </p>
          </div>
          <MarketControls
            country={country.code}
            language={locale}
            text={text.controls}
          />
        </section>
        {country.invalid && (
          <StatusMessage tone="warning" label={text.interaction.warningLabel}>
            {text.controls.invalid}
          </StatusMessage>
        )}
        <div className="design-grid">
          <section className="artwork-panel" aria-labelledby="artwork-title">
            <p className="eyebrow">{text.artwork.eyebrow}</p>
            <h2 id="artwork-title" className="section-title">
              {text.artwork.title}
            </h2>
            <figure>
              <div className="poster-canvas">
                <span className="poster-meta">{text.artwork.ratio}</span>
                <p className="poster-placeholder">{text.artwork.placeholder}</p>
                <div className="poster-bottom">
                  <span aria-hidden="true">↗</span>
                  <p>{text.artwork.note}</p>
                </div>
              </div>
              <figcaption>{text.artwork.caption}</figcaption>
            </figure>
          </section>
          <DesignExamples text={text.interaction} />
        </div>
        <section className="system-section" aria-labelledby="system-title">
          <div>
            <p className="eyebrow">{text.system.eyebrow}</p>
            <h2 id="system-title" className="section-title">
              {text.system.title}
            </h2>
          </div>
          <div className="system-rows">
            {architecture.map((item) => (
              <div className="system-row" key={item.number}>
                <span className="row-number" aria-hidden="true">
                  {item.number}
                </span>
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
              </div>
            ))}
          </div>
          <ul className="token-strip" aria-label={text.system.tokens}>
            <li>
              <span className="token-swatch" data-token="surface" />
              {text.system.surface}
            </li>
            <li>
              <span className="token-swatch" data-token="text" />
              {text.system.text}
            </li>
            <li>
              <span className="token-swatch" data-token="action" />
              {text.system.action}
            </li>
            <li>
              <span className="token-swatch" data-token="accent" />
              {text.system.accent}
            </li>
          </ul>
        </section>
      </main>
      <footer className="site-footer page-width">
        <p>
          {text.footer.scope}
          <span aria-hidden="true"> / </span>
          {text.footer.next}
        </p>
        <p>{text.footer.policy}</p>
      </footer>
    </>
  );
}
