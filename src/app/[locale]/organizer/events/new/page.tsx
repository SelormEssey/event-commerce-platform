import { EventForm } from '../../../../../components/organizer/event-form';
import { OrganizerShell } from '../../../../../components/organizer/organizer-shell';
import { saveEventAction } from '../../actions';
import { loadOrganizerPage, type OrganizerPageProps } from '../../page-context';

export default async function NewOrganizerEventPage(props: OrganizerPageProps) {
  const context = await loadOrganizerPage(props.params, props.searchParams);
  const { selected, text, language, country, query, organizers } = context;
  const actionContext = {
    locale: language,
    country,
    organizerSlug: selected.slug,
  };

  return (
    <OrganizerShell
      country={country}
      language={language}
      organizer={selected}
      organizers={organizers}
      currentRoute="/organizer/events/new"
      text={text}
      saved={typeof query.saved === 'string' ? query.saved : undefined}
      error={typeof query.error === 'string' ? query.error : undefined}
    >
      <div className="workspace-heading">
        <div>
          <p className="eyebrow">{text.organizer.events}</p>
          <h1>{text.organizer.newEvent}</h1>
        </div>
      </div>
      <p className="workspace-lede">{text.organizer.newEventHint}</p>
      <EventForm
        defaultCountry={country}
        text={text}
        action={saveEventAction.bind(null, actionContext, undefined)}
      />
    </OrganizerShell>
  );
}
