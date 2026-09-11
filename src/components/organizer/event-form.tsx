import {
  countries,
  countryCodes,
  type CountryCode,
} from '../../config/countries';
import type { Dictionary } from '../../i18n';
import { eventCategories, type EventRecord } from '../../modules/events/domain';
import { FormField } from './form-field';

const treatments = [
  'orbit',
  'grid',
  'rays',
  'stacks',
  'wave',
  'frame',
] as const;
const tones = ['lilac', 'coral', 'blue', 'amber', 'green', 'red'] as const;

function dateTimeLocal(isoDate: string) {
  return isoDate.slice(0, 16);
}

export function EventForm({
  event,
  defaultCountry,
  text,
  action,
}: {
  event?: EventRecord;
  defaultCountry: CountryCode;
  text: Dictionary;
  action: (formData: FormData) => void | Promise<void>;
}) {
  return (
    <form action={action} className="workspace-form">
      <fieldset>
        <legend>{text.organizer.eventDetails}</legend>
        <div className="workspace-form-grid">
          <FormField label={text.organizer.fields.title} htmlFor="title">
            <input
              id="title"
              name="title"
              defaultValue={event?.title}
              required
              maxLength={120}
            />
          </FormField>
          <FormField label={text.organizer.fields.category} htmlFor="category">
            <select
              id="category"
              name="category"
              defaultValue={event?.category ?? 'CONCERTS'}
            >
              {eventCategories.map((category) => (
                <option value={category} key={category}>
                  {text.categories[category]}
                </option>
              ))}
            </select>
          </FormField>
        </div>
        <FormField
          label={text.organizer.fields.description}
          htmlFor="description"
        >
          <textarea
            id="description"
            name="description"
            defaultValue={event?.description}
            required
            rows={6}
            maxLength={4000}
          />
        </FormField>
        <div className="workspace-form-grid">
          <FormField
            label={text.organizer.fields.starts}
            htmlFor="startDateTime"
          >
            <input
              id="startDateTime"
              name="startDateTime"
              type="datetime-local"
              defaultValue={
                event ? dateTimeLocal(event.startDateTime) : '2027-06-12T18:00'
              }
              required
            />
          </FormField>
          <FormField label={text.organizer.fields.ends} htmlFor="endDateTime">
            <input
              id="endDateTime"
              name="endDateTime"
              type="datetime-local"
              defaultValue={
                event ? dateTimeLocal(event.endDateTime) : '2027-06-12T22:00'
              }
              required
            />
          </FormField>
        </div>
        <FormField label={text.organizer.fields.age} htmlFor="ageRestriction">
          <input
            id="ageRestriction"
            name="ageRestriction"
            defaultValue={event?.ageRestriction}
            maxLength={40}
            placeholder="18+"
          />
        </FormField>
        <FormField label={text.organizer.fields.refund} htmlFor="refundPolicy">
          <textarea
            id="refundPolicy"
            name="refundPolicy"
            defaultValue={event?.refundPolicy}
            required
            rows={4}
            maxLength={2000}
          />
        </FormField>
      </fieldset>

      <fieldset>
        <legend>{text.organizer.venueDetails}</legend>
        <div className="workspace-form-grid">
          <FormField
            label={text.organizer.fields.country}
            htmlFor="countryCode"
          >
            <select
              id="countryCode"
              name="countryCode"
              defaultValue={event?.venue.countryCode ?? defaultCountry}
            >
              {countryCodes.map((code) => (
                <option value={code} key={code}>
                  {countries[code].name} · {countries[code].currency}
                </option>
              ))}
            </select>
          </FormField>
          <FormField
            label={text.organizer.fields.venueName}
            htmlFor="venueName"
          >
            <input
              id="venueName"
              name="venueName"
              defaultValue={event?.venue.name}
              required
              maxLength={160}
            />
          </FormField>
          <FormField label={text.organizer.fields.city} htmlFor="city">
            <input
              id="city"
              name="city"
              defaultValue={event?.venue.city}
              required
              maxLength={120}
            />
          </FormField>
          <FormField label={text.organizer.fields.address} htmlFor="address">
            <input
              id="address"
              name="address"
              defaultValue={event?.venue.address}
              maxLength={240}
            />
          </FormField>
        </div>
      </fieldset>

      <fieldset>
        <legend>{text.organizer.artworkDetails}</legend>
        <div className="workspace-form-grid">
          <FormField
            label={text.organizer.fields.treatment}
            htmlFor="artworkTreatment"
          >
            <select
              id="artworkTreatment"
              name="artworkTreatment"
              defaultValue={event?.artwork.treatment ?? 'orbit'}
            >
              {treatments.map((item) => (
                <option value={item} key={item}>
                  {text.organizer.artworkOptions[item]}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label={text.organizer.fields.tone} htmlFor="artworkTone">
            <select
              id="artworkTone"
              name="artworkTone"
              defaultValue={event?.artwork.tone ?? 'lilac'}
            >
              {tones.map((item) => (
                <option value={item} key={item}>
                  {text.organizer.artworkOptions[item]}
                </option>
              ))}
            </select>
          </FormField>
        </div>
      </fieldset>
      <button type="submit" className="workspace-primary-action">
        {event
          ? text.organizer.actions.saveEvent
          : text.organizer.actions.createEvent}
      </button>
    </form>
  );
}
