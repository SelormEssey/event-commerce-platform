import type { Metadata } from 'next';
import Link from 'next/link';
import { OrganizerShell } from '../../../components/organizer/organizer-shell';
import { EventStatusBadge } from '../../../components/organizer/status-badge';
import { organizerEventCounts } from '../../../modules/organizers/promotion-service';
import { formatEventDate } from '../../../modules/events/presentation';
import { loadOrganizerPage, type OrganizerPageProps } from './page-context';

export async function generateMetadata({ params }: OrganizerPageProps) {
  const { locale } = await params;
  const title =
    locale === 'fr'
      ? 'Espace organisateur — Prototype'
      : 'Organizer workspace — Prototype';
  return { title, robots: { index: false, follow: false } } satisfies Metadata;
}

export default async function OrganizerDashboard(props: OrganizerPageProps) {
  const context = await loadOrganizerPage(props.params, props.searchParams);
  const { selected, repositories, text, language, country, query, organizers } =
    context;
  const events = (await repositories.events.list())
    .filter((event) => event.organizerId === selected.id)
    .toSorted(
      (left, right) =>
        Date.parse(left.startDateTime) - Date.parse(right.startDateTime),
    );
  const promotions = (
    await Promise.all(
      events.map((event) => repositories.promotions.listByEvent(event.id)),
    )
  ).flat();
  const counts = organizerEventCounts(events, promotions);
  const summary = [
    ['totalEvents', counts.totalEvents],
    ['publishedEvents', counts.publishedEvents],
    ['draftEvents', counts.draftEvents],
    ['upcomingEvents', counts.upcomingEvents],
    ['ticketTiers', counts.ticketTiers],
    ['activePromotions', counts.activePromotions],
  ] as const;
  const hrefFor = (path: string) =>
    `/${language}/organizer${path}?${new URLSearchParams({
      country,
      organizer: selected.slug,
    })}`;

  return (
    <OrganizerShell
      country={country}
      language={language}
      organizer={selected}
      organizers={organizers}
      currentRoute="/organizer"
      text={text}
      saved={typeof query.saved === 'string' ? query.saved : undefined}
      error={typeof query.error === 'string' ? query.error : undefined}
    >
      <div className="workspace-heading">
        <div>
          <p className="eyebrow">{text.organizer.workspace}</p>
          <h1>{text.organizer.dashboard}</h1>
        </div>
        <Link
          className="workspace-primary-action"
          href={hrefFor('/events/new')}
        >
          {text.organizer.newEvent}
        </Link>
      </div>
      <p className="workspace-lede">{text.organizer.nonDurable}</p>
      <section
        className="workspace-summary"
        aria-label={text.organizer.dashboard}
      >
        {summary.map(([label, count]) => (
          <article key={label}>
            <strong>{count}</strong>
            <span>{text.organizer[label]}</span>
          </article>
        ))}
      </section>
      <section
        className="workspace-section"
        aria-labelledby="organizer-events-title"
      >
        <div className="workspace-section-heading">
          <h2 id="organizer-events-title">{text.organizer.events}</h2>
          <span>{events.length}</span>
        </div>
        {events.length === 0 ? (
          <p className="workspace-empty">{text.organizer.noEvents}</p>
        ) : (
          <div className="organizer-event-list">
            {events.map((event) => (
              <article key={event.id} className="organizer-event-row">
                <div>
                  <EventStatusBadge
                    status={event.status}
                    text={text.organizer.statuses}
                  />
                  <h3>{event.title}</h3>
                  <p>
                    {formatEventDate(
                      event.startDateTime,
                      event.venue.countryCode,
                      language,
                    )}{' '}
                    · {event.venue.city} · {event.venue.countryCode}
                  </p>
                  <span>
                    {event.ticketTiers.length}{' '}
                    {text.organizer.ticketTiers.toLowerCase()}
                  </span>
                </div>
                <div className="organizer-event-actions">
                  <Link href={hrefFor(`/events/${event.id}/edit`)}>
                    {text.organizer.editEvent}
                  </Link>
                  <Link href={hrefFor(`/events/${event.id}/promotions`)}>
                    {text.organizer.promotions}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </OrganizerShell>
  );
}
