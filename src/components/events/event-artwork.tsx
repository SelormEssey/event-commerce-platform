import type { EventArtwork as Artwork } from '../../modules/events/domain';

export function EventArtwork({
  artwork,
  title,
  category,
  priority = false,
}: {
  artwork: Artwork;
  title: string;
  category: string;
  priority?: boolean;
}) {
  return (
    <div
      className="event-artwork"
      data-treatment={artwork.treatment}
      data-tone={artwork.tone}
      role="img"
      aria-label={artwork.alt}
      data-priority={priority || undefined}
    >
      <span className="artwork-grid" aria-hidden="true" />
      <span className="artwork-shape artwork-shape--one" aria-hidden="true" />
      <span className="artwork-shape artwork-shape--two" aria-hidden="true" />
      <span className="artwork-label">{category}</span>
      <strong>{title}</strong>
      <span className="artwork-mark" aria-hidden="true">
        ↗
      </span>
    </div>
  );
}
