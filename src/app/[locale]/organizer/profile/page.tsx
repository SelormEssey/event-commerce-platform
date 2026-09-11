import { OrganizerShell } from '../../../../components/organizer/organizer-shell';
import { FormField } from '../../../../components/organizer/form-field';
import { loadOrganizerPage, type OrganizerPageProps } from '../page-context';
import { updateProfileAction } from '../actions';

export default async function OrganizerProfilePage(props: OrganizerPageProps) {
  const context = await loadOrganizerPage(props.params, props.searchParams);
  const { selected, text, language, country, query, organizers } = context;
  const actionContext = {
    locale: language,
    country,
    organizerSlug: selected.slug,
  };
  const action = updateProfileAction.bind(null, actionContext);
  return (
    <OrganizerShell
      country={country}
      language={language}
      organizer={selected}
      organizers={organizers}
      currentRoute="/organizer/profile"
      text={text}
      saved={typeof query.saved === 'string' ? query.saved : undefined}
      error={typeof query.error === 'string' ? query.error : undefined}
    >
      <div className="workspace-heading">
        <div>
          <p className="eyebrow">{text.organizer.workspace}</p>
          <h1>{text.organizer.profile}</h1>
        </div>
      </div>
      <form action={action} className="workspace-form workspace-form--narrow">
        <FormField
          label={text.organizer.fields.displayName}
          htmlFor="displayName"
        >
          <input
            id="displayName"
            name="displayName"
            defaultValue={selected.displayName}
            required
            maxLength={120}
          />
        </FormField>
        <FormField label={text.organizer.fields.about} htmlFor="about">
          <textarea
            id="about"
            name="about"
            defaultValue={selected.about}
            rows={6}
            maxLength={1000}
          />
        </FormField>
        <button type="submit" className="workspace-primary-action">
          {text.organizer.actions.saveProfile}
        </button>
      </form>
    </OrganizerShell>
  );
}
