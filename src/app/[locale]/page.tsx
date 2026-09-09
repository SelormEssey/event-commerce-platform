import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DiscoveryFilters } from '../../components/events/discovery-filters';
import { EventCard } from '../../components/events/event-card';
import { SiteFooter, SiteHeader } from '../../components/events/site-header';
import { StatusMessage } from '../../components/ui/status-message';
import { countries, resolveCountry } from '../../config/countries';
import { getDictionary } from '../../i18n';
import { isLanguage } from '../../i18n/locales';
import { resolveCategory } from '../../modules/events/categories';
import { listPublicEvents } from '../../modules/events/public-events';

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

export default async function DiscoveryPage({
  params,
  searchParams,
}: PageProps) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  if (!isLanguage(locale)) notFound();

  const text = getDictionary(locale);
  const country = resolveCountry(query.country);
  const category = resolveCategory(query.category);
  const search =
    typeof query.q === 'string' ? query.q.trim().slice(0, 100) : '';
  const events = await listPublicEvents({
    country: country.code,
    search,
    ...(category.category ? { category: category.category } : {}),
  });
  const featured =
    search || category.category
      ? []
      : events
          .filter((event) => event.featuredRank !== undefined)
          .sort((a, b) => (a.featuredRank ?? 99) - (b.featuredRank ?? 99))
          .slice(0, 2);

  return (
    <>
      <SiteHeader country={country.code} language={locale} text={text} />
      <main
        id="main-content"
        className="page-width discovery-page"
        tabIndex={-1}
      >
        <section className="discovery-intro" aria-labelledby="page-title">
          <div>
            <p className="eyebrow">{text.discovery.eyebrow}</p>
            <h1 id="page-title">
              {text.discovery.title} <span>{countries[country.code].name}</span>
            </h1>
            <p>{text.discovery.subtitle}</p>
          </div>
          <span className="prototype-badge">{text.navigation.prototype}</span>
        </section>

        {country.invalid && (
          <StatusMessage tone="warning">
            {text.discovery.invalidCountry}
          </StatusMessage>
        )}
        {category.invalid && (
          <StatusMessage tone="warning">
            {text.discovery.invalidCategory}
          </StatusMessage>
        )}

        <DiscoveryFilters
          language={locale}
          country={country.code}
          search={search}
          {...(category.category ? { category: category.category } : {})}
          text={text}
        />

        {featured.length > 0 && (
          <section className="event-section" aria-labelledby="featured-title">
            <div className="section-title-row">
              <h2 id="featured-title">{text.discovery.featured}</h2>
              <span>01</span>
            </div>
            <div className="event-grid event-grid--featured">
              {featured.map((event, index) => (
                <EventCard
                  key={event.id}
                  event={event}
                  country={country.code}
                  language={locale}
                  text={text}
                  priority={index === 0}
                />
              ))}
            </div>
          </section>
        )}

        <section className="event-section" aria-labelledby="upcoming-title">
          <div className="section-title-row">
            <h2 id="upcoming-title">{text.discovery.upcoming}</h2>
            <span>
              {events.length}{' '}
              {events.length === 1
                ? text.discovery.oneResult
                : text.discovery.results}
            </span>
          </div>
          {events.length > 0 ? (
            <div className="event-grid">
              {events.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  country={country.code}
                  language={locale}
                  text={text}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>{text.discovery.noMatches}</p>
              <span>{text.discovery.noMatchesDetail}</span>
              <a href={`/${locale}?country=${country.code}`}>
                {text.discovery.clearSearch}
              </a>
            </div>
          )}
        </section>
      </main>
      <SiteFooter text={text.footer} />
    </>
  );
}
