import type { OrganizerRecord } from '../domain';

function organizerId(index: number) {
  return `00000000-0000-4000-8401-${index.toString().padStart(12, '0')}`;
}

export const prototypeOrganizers = [
  {
    id: organizerId(1),
    slug: 'open-current-collective',
    displayName: 'Open Current Collective',
    about: 'A fictional prototype collective for live and collaborative sound.',
  },
  {
    id: organizerId(2),
    slug: 'signal-house',
    displayName: 'Signal House',
    about: 'A fictional prototype programme for electronic music gatherings.',
  },
  {
    id: organizerId(3),
    slug: 'common-ground-studio',
    displayName: 'Common Ground Studio',
    about: 'A fictional prototype studio for independent makers and new work.',
  },
  {
    id: organizerId(4),
    slug: 'parallel-sound-room',
    displayName: 'Parallel Sound Room',
    about: 'A fictional prototype producer of live room programmes.',
  },
  {
    id: organizerId(5),
    slug: 'side-line-projects',
    displayName: 'Side Line Projects',
    about: 'A fictional prototype organiser for sport and social programmes.',
  },
  {
    id: organizerId(6),
    slug: 'field-notes-lab',
    displayName: 'Field Notes Lab',
    about:
      'A fictional prototype forum for creative practice and digital craft.',
  },
  {
    id: organizerId(7),
    slug: 'atelier-minuit',
    displayName: 'Atelier Minuit',
    about: 'Un organisateur fictif pour des programmes sonores nocturnes.',
  },
  {
    id: organizerId(8),
    slug: 'editions-passage',
    displayName: 'Éditions Passage',
    about:
      'Un organisateur fictif pour l’édition, les installations et la performance.',
  },
  {
    id: organizerId(9),
    slug: 'collectif-clairiere',
    displayName: 'Collectif Clairière',
    about: 'Un collectif fictif pour des rencontres musicales en plein air.',
  },
] as const satisfies readonly OrganizerRecord[];

export function prototypeOrganizerForDisplayName(displayName: string) {
  const organizer = prototypeOrganizers.find(
    (candidate) => candidate.displayName === displayName,
  );
  if (!organizer)
    throw new Error(`Missing prototype organizer: ${displayName}`);
  return organizer;
}
