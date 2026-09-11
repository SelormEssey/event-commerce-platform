import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { AvailabilityLabel } from '../../../../components/events/availability-label';
import { EventArtwork } from '../../../../components/events/event-artwork';
import {
  SiteFooter,
  SiteHeader,
} from '../../../../components/events/site-header';
import { TicketTierList } from '../../../../components/events/ticket-tier-list';
import { resolveCountry } from '../../../../config/countries';
import { getDictionary } from '../../../../i18n';
import { isLanguage } from '../../../../i18n/locales';
import { eventAvailability } from '../../../../modules/events/availability';
import { getActivePublicEventBySlug } from '../../../../modules/events/public-events.server';
import {
  formatEventDate,
  formatEventTimeRange,
} from '../../../../modules/events/presentation';

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLanguage(locale)) notFound();
  const event = await getActivePublicEventBySlug(slug);
  if (!event) return { title: getDictionary(locale).notFound.title };
  return {
    title: `${event.title} — Prototype`,
    description: event.description,
    robots: { index: false, follow: false },
  };
}

export default async function EventDetailPage({
  params,
  searchParams,
}: PageProps) {
  const [{ locale, slug }, query] = await Promise.all([params, searchParams]);
  if (!isLanguage(locale)) notFound();
  const event = await getActivePublicEventBySlug(slug);
  if (!event) notFound();

  const selectedCountry = resolveCountry(query.country);
  const country = event.venue.countryCode;
  if (selectedCountry.code !== country || selectedCountry.invalid) {
    redirect(`/${locale}/events/${event.slug}?country=${country}`);
  }

  const text = getDictionary(locale);
  const availability = eventAvailability(event.ticketTiers);
  return (
    <>
      <SiteHeader
        country={country}
        language={locale}
        text={text}
        eventSlug={event.slug}
      />
      <main id="main-content" className="page-width event-detail" tabIndex={-1}>
        <Link className="back-link" href={`/${locale}?country=${country}`}>
          <span aria-hidden="true">←</span> {text.event.back}
        </Link>
        <div className="detail-hero">
          <EventArtwork
            artwork={event.artwork}
            title={event.title}
            category={text.categories[event.category]}
            priority
          />
          <div className="detail-intro">
            <div className="detail-labels">
              <span className="prototype-badge">
                {text.navigation.prototype}
              </span>
              <AvailabilityLabel
                availability={availability}
                text={text.availability}
              />
            </div>
            <p className="event-date">
              {formatEventDate(event.startDateTime, country, locale)}
            </p>
            <h1>{event.title}</h1>
            <p className="detail-location">
              {event.venue.name} <span aria-hidden="true">·</span>{' '}
              {event.venue.city}
            </p>
            <p className="detail-description">{event.description}</p>
            <button
              className="ticket-cta"
              type="button"
              aria-disabled="true"
              aria-describedby="ticket-cta-note"
            >
              {text.event.getTickets}
            </button>
            <p className="cta-note" id="ticket-cta-note">
              {text.event.purchasingLater}
            </p>
          </div>
        </div>

        <div className="detail-content">
          <section className="detail-section" aria-labelledby="details-title">
            <div className="section-title-row">
              <h2 id="details-title">{text.event.details}</h2>
              <span>01</span>
            </div>
            <dl className="event-facts">
              <div>
                <dt>{text.event.date}</dt>
                <dd>{formatEventDate(event.startDateTime, country, locale)}</dd>
              </div>
              <div>
                <dt>{text.event.time}</dt>
                <dd>
                  {formatEventTimeRange(
                    event.startDateTime,
                    event.endDateTime,
                    country,
                    locale,
                  )}
                </dd>
              </div>
              <div>
                <dt>{text.event.venue}</dt>
                <dd>
                  {event.venue.name}, {event.venue.city}
                  {event.venue.address ? ` · ${event.venue.address}` : ''}
                </dd>
              </div>
              <div>
                <dt>{text.event.organizer}</dt>
                <dd>
                  {event.organizer?.displayName ?? event.organizerDisplayName}
                </dd>
              </div>
              {event.ageRestriction && (
                <div>
                  <dt>{text.event.age}</dt>
                  <dd>{event.ageRestriction}</dd>
                </div>
              )}
            </dl>
          </section>

          <section className="detail-section" aria-labelledby="tickets-title">
            <div className="section-title-row">
              <h2 id="tickets-title">{text.event.tickets}</h2>
              <span>02</span>
            </div>
            <TicketTierList
              tiers={event.ticketTiers}
              country={country}
              language={locale}
              text={text}
            />
          </section>

          <section className="terms-section" aria-labelledby="terms-title">
            <h2 id="terms-title">{text.event.refund}</h2>
            <p>{event.refundPolicy}</p>
          </section>
        </div>
      </main>
      <SiteFooter text={text.footer} />
    </>
  );
}
