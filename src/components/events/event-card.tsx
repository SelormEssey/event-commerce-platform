import Link from 'next/link';
import type { CountryCode } from '../../config/countries';
import type { Dictionary } from '../../i18n';
import type { Language } from '../../i18n/locales';
import { eventAvailability } from '../../modules/events/availability';
import type { EventRecord } from '../../modules/events/domain';
import { formatMoney, lowestPrice } from '../../modules/events/money';
import { formatEventDate } from '../../modules/events/presentation';
import { AvailabilityLabel } from './availability-label';
import { EventArtwork } from './event-artwork';

export function EventCard({
  event,
  country,
  language,
  text,
  priority = false,
}: {
  event: EventRecord;
  country: CountryCode;
  language: Language;
  text: Dictionary;
  priority?: boolean;
}) {
  const price = lowestPrice(event.ticketTiers);
  const availability = eventAvailability(event.ticketTiers);
  return (
    <article className="event-card">
      <Link href={`/${language}/events/${event.slug}?country=${country}`}>
        <EventArtwork
          artwork={event.artwork}
          title={event.title}
          category={text.categories[event.category]}
          priority={priority}
        />
        <div className="event-card__body">
          <div className="event-card__topline">
            <p className="event-date">
              {formatEventDate(event.startDateTime, country, language)}
            </p>
            <AvailabilityLabel
              availability={availability}
              text={text.availability}
            />
          </div>
          <h3>{event.title}</h3>
          <p className="event-location">
            {event.venue.name} <span aria-hidden="true">·</span>{' '}
            {event.venue.city}
          </p>
          {price && (
            <p className="event-price">
              <span>{text.event.from}</span>{' '}
              {formatMoney(price, country, language)}
            </p>
          )}
        </div>
      </Link>
    </article>
  );
}
