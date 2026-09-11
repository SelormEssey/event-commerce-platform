import { countries } from '../../config/countries';
import type { Dictionary } from '../../i18n';
import type {
  EventRecord,
  TicketTierRecord,
} from '../../modules/events/domain';
import { moneyToMajorUnits } from '../../modules/events/money-input';
import type { PrototypeOrganizerContext } from '../../modules/organizers/context.server';
import {
  removeTicketTierAction,
  saveTicketTierAction,
} from '../../app/[locale]/organizer/actions';
import { FormField } from './form-field';

function dateTimeLocal(isoDate: string) {
  return isoDate.slice(0, 16);
}

function TierFields({
  event,
  tier,
  text,
}: {
  event: EventRecord;
  tier?: TicketTierRecord;
  text: Dictionary;
}) {
  const country = event.venue.countryCode;
  return (
    <div className="tier-fields">
      <div className="workspace-form-grid">
        <FormField
          label={text.organizer.fields.tierName}
          htmlFor={`tier-name-${tier?.id ?? 'new'}`}
        >
          <input
            id={`tier-name-${tier?.id ?? 'new'}`}
            name="name"
            defaultValue={tier?.name}
            required
            maxLength={100}
          />
        </FormField>
        <FormField
          label={`${text.organizer.fields.price} (${countries[country].currency})`}
          htmlFor={`tier-price-${tier?.id ?? 'new'}`}
          hint={text.organizer.hints.price}
        >
          <input
            id={`tier-price-${tier?.id ?? 'new'}`}
            name="price"
            inputMode="decimal"
            defaultValue={
              tier ? moneyToMajorUnits(tier.price.minorUnits, country) : ''
            }
            required
            placeholder={
              countries[country].currencyFractionDigits === 0 ? '500' : '10.00'
            }
          />
        </FormField>
      </div>
      <FormField
        label={text.organizer.fields.tierDescription}
        htmlFor={`tier-description-${tier?.id ?? 'new'}`}
      >
        <input
          id={`tier-description-${tier?.id ?? 'new'}`}
          name="description"
          defaultValue={tier?.description}
          maxLength={500}
        />
      </FormField>
      <div className="workspace-form-grid workspace-form-grid--three">
        <FormField
          label={text.organizer.fields.capacity}
          htmlFor={`tier-capacity-${tier?.id ?? 'new'}`}
          hint={text.organizer.hints.capacity}
        >
          <input
            id={`tier-capacity-${tier?.id ?? 'new'}`}
            name="capacity"
            type="number"
            min="1"
            step="1"
            defaultValue={tier?.capacity}
            required
          />
        </FormField>
        <FormField
          label={text.organizer.fields.salesStart}
          htmlFor={`tier-start-${tier?.id ?? 'new'}`}
        >
          <input
            id={`tier-start-${tier?.id ?? 'new'}`}
            name="salesStart"
            type="datetime-local"
            defaultValue={
              tier
                ? dateTimeLocal(tier.salesStart)
                : dateTimeLocal(new Date().toISOString())
            }
            required
          />
        </FormField>
        <FormField
          label={text.organizer.fields.salesEnd}
          htmlFor={`tier-end-${tier?.id ?? 'new'}`}
        >
          <input
            id={`tier-end-${tier?.id ?? 'new'}`}
            name="salesEnd"
            type="datetime-local"
            defaultValue={
              tier
                ? dateTimeLocal(tier.salesEnd)
                : dateTimeLocal(event.startDateTime)
            }
            required
          />
        </FormField>
      </div>
    </div>
  );
}

export function TicketTierManager({
  event,
  context,
  text,
}: {
  event: EventRecord;
  context: PrototypeOrganizerContext;
  text: Dictionary;
}) {
  return (
    <section
      className="workspace-section"
      aria-labelledby="tier-management-title"
    >
      <div className="workspace-section-heading">
        <h2 id="tier-management-title">{text.organizer.tierManagement}</h2>
        <span>{event.ticketTiers.length}</span>
      </div>
      {event.ticketTiers.map((tier) => {
        const saveAction = saveTicketTierAction.bind(
          null,
          context,
          event.id,
          tier.id,
        );
        const removeAction = removeTicketTierAction.bind(
          null,
          context,
          event.id,
          tier.id,
        );
        return (
          <details className="tier-editor" key={tier.id}>
            <summary>
              <strong>{tier.name}</strong>
              <span>
                {countries[event.venue.countryCode].currency}{' '}
                {moneyToMajorUnits(
                  tier.price.minorUnits,
                  event.venue.countryCode,
                )}
              </span>
            </summary>
            <form
              action={saveAction}
              className="workspace-form workspace-form--embedded"
            >
              <TierFields event={event} tier={tier} text={text} />
              <button type="submit" className="workspace-secondary-action">
                {text.organizer.actions.updateTier}
              </button>
            </form>
            <form action={removeAction} className="inline-action-form">
              <button type="submit" className="workspace-danger-action">
                {text.organizer.actions.removeTier}
              </button>
            </form>
          </details>
        );
      })}
      <details className="tier-editor" open={event.ticketTiers.length === 0}>
        <summary>
          <strong>{text.organizer.actions.addTier}</strong>
        </summary>
        <form
          action={saveTicketTierAction.bind(null, context, event.id, undefined)}
          className="workspace-form workspace-form--embedded"
        >
          <TierFields event={event} text={text} />
          <button type="submit" className="workspace-primary-action">
            {text.organizer.actions.addTier}
          </button>
        </form>
      </details>
    </section>
  );
}
