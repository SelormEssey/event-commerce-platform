import type { CountryCode } from '../../config/countries';
import type { Dictionary } from '../../i18n';
import type { Language } from '../../i18n/locales';
import { ticketAvailability } from '../../modules/events/availability';
import type { TicketTierRecord } from '../../modules/events/domain';
import { formatMoney } from '../../modules/events/money';
import { AvailabilityLabel } from './availability-label';

export function TicketTierList({
  tiers,
  country,
  language,
  text,
}: {
  tiers: readonly TicketTierRecord[];
  country: CountryCode;
  language: Language;
  text: Dictionary;
}) {
  return (
    <div className="ticket-list">
      {tiers.map((tier) => {
        const availability = ticketAvailability(tier);
        return (
          <article className="ticket-tier" key={tier.id}>
            <div>
              <h3>{tier.name}</h3>
              {tier.description && <p>{tier.description}</p>}
              {availability === 'AVAILABLE' && (
                <p className="ticket-remaining">
                  {tier.availableQuantity} {text.event.remaining}
                </p>
              )}
            </div>
            <div className="ticket-tier__price">
              <strong>{formatMoney(tier.price, country, language)}</strong>
              <AvailabilityLabel
                availability={availability}
                text={text.availability}
              />
            </div>
          </article>
        );
      })}
    </div>
  );
}
