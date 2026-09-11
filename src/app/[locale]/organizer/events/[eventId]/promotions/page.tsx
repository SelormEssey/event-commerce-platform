import Link from 'next/link';
import { notFound } from 'next/navigation';
import { OrganizerShell } from '../../../../../../components/organizer/organizer-shell';
import { PromotionManager } from '../../../../../../components/organizer/promotion-manager';
import { requireOwnedEvent } from '../../../../../../modules/organizers/event-service';
import { WorkspaceError } from '../../../../../../modules/organizers/errors';
import {
  loadOrganizerPage,
  type OrganizerPageProps,
} from '../../../page-context';

type EventRoute = { eventId: string };

export default async function OrganizerPromotionsPage(
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
  const promotions = await repositories.promotions.listByEvent(event.id);
  const editingId =
    typeof query.promotion === 'string' ? query.promotion : undefined;
  const editing = editingId
    ? promotions.find((promotion) => promotion.id === editingId)
    : undefined;
  if (editingId && !editing) notFound();
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
      currentRoute={`/organizer/events/${event.id}/promotions`}
      text={text}
      saved={typeof query.saved === 'string' ? query.saved : undefined}
      error={typeof query.error === 'string' ? query.error : undefined}
    >
      <div className="workspace-heading">
        <div>
          <p className="eyebrow">{text.organizer.promotions}</p>
          <h1>{event.title}</h1>
        </div>
        <Link
          className="workspace-secondary-action"
          href={`/${language}/organizer/events/${event.id}/edit?${queryString}`}
        >
          {text.organizer.actions.backToEvent}
        </Link>
      </div>
      <p className="workspace-lede">{text.organizer.promotionScope}</p>
      <PromotionManager
        event={event}
        promotions={promotions}
        editing={editing}
        context={actionContext}
        language={language}
        text={text}
      />
    </OrganizerShell>
  );
}
