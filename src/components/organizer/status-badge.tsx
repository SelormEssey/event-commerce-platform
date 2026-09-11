import type { Dictionary } from '../../i18n';
import type { EventStatus } from '../../modules/events/domain';

export function EventStatusBadge({
  status,
  text,
}: {
  status: EventStatus;
  text: Dictionary['organizer']['statuses'];
}) {
  return (
    <span className="workspace-status" data-status={status}>
      <span aria-hidden="true">●</span>
      {text[status]}
    </span>
  );
}
