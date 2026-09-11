import Link from 'next/link';
import { notFound } from 'next/navigation';
import { EventForm } from '../../../../../../components/organizer/event-form';
import { OrganizerShell } from '../../../../../../components/organizer/organizer-shell';
import { EventStatusBadge } from '../../../../../../components/organizer/status-badge';
import { TicketTierManager } from '../../../../../../components/organizer/ticket-tier-manager';
import { requireOwnedEvent } from '../../../../../../modules/organizers/event-service';
import { WorkspaceError } from '../../../../../../modules/organizers/errors';
import { saveEventAction, setPublicationAction } from '../../../actions';
import {
  loadOrganizerPage,
  type OrganizerPageProps,
} from '../../../page-context';

type EventRoute = { eventId: string };

export default async function EditOrganizerEventPage(
  props: OrganizerPageProps<EventRoute>,
) {
  const context = await loadOrganizerPage(props.params, props.searchParams);
  const {
    selected,
    text,
    language,
    country,
    query,
    organizers,
    repositories,
    route,
  } = context;
  let event;
  try {
    event = await requireOwnedEvent(selected.id, route.eventId, repositories);
  } catch (error) {
    if (error instanceof WorkspaceError) notFound();
    throw error;
  }
  const actionContext = {
    locale: language,
    country,
    organizerSlug: selected.slug,
  };
  const queryString = new URLSearchParams({
    country,
    organizer: selected.slug,
  });

  return (
    <OrganizerShell
      country={country}
      language={language}
      organizer={selected}
      organizers={organizers}
      currentRoute={`/organizer/events/${event.id}/edit`}
      text={text}
      saved={typeof query.saved === 'string' ? query.saved : undefined}
      error={typeof query.error === 'string' ? query.error : undefined}
    >
      <div className="workspace-heading">
        <div>
          <p className="eyebrow">{text.organizer.editEvent}</p>
          <h1>{event.title}</h1>
          <EventStatusBadge
            status={event.status}
            text={text.organizer.statuses}
          />
        </div>
        <Link
          className="workspace-secondary-action"
          href={`/${language}/organizer/events/${event.id}/promotions?${queryString}`}
        >
          {text.organizer.promotions}
        </Link>
      </div>

      <section
        className="workspace-publication"
        aria-labelledby="publication-title"
      >
        <div>
          <h2 id="publication-title">{text.organizer.publication}</h2>
          <p>
            {event.ticketTiers.length
              ? text.organizer.publicationReady
              : text.organizer.noTiers}
          </p>
        </div>
        <form
          action={setPublicationAction.bind(
            null,
            actionContext,
            event.id,
            event.status !== 'PUBLISHED',
          )}
        >
          <button
            className={
              event.status === 'PUBLISHED'
                ? 'workspace-secondary-action'
                : 'workspace-primary-action'
            }
            type="submit"
            disabled={
              event.status !== 'PUBLISHED' && event.ticketTiers.length === 0
            }
          >
            {event.status === 'PUBLISHED'
              ? text.organizer.actions.unpublish
              : text.organizer.actions.publish}
          </button>
        </form>
      </section>

      <EventForm
        event={event}
        defaultCountry={event.venue.countryCode}
        text={text}
        action={saveEventAction.bind(null, actionContext, event.id)}
      />
      <TicketTierManager event={event} context={actionContext} text={text} />
    </OrganizerShell>
  );
}
