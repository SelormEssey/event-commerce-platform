import type { Dictionary } from '../../i18n';
import type { TicketAvailability } from '../../modules/events/domain';

export function AvailabilityLabel({
  availability,
  text,
}: {
  availability: TicketAvailability;
  text: Dictionary['availability'];
}) {
  return (
    <span className="availability" data-availability={availability}>
      <span aria-hidden="true">●</span>
      {text[availability]}
    </span>
  );
}
