import type { CurrencyCode } from '../../../config/countries';
import type {
  EventArtwork,
  EventCategory,
  EventRecord,
  TicketTierRecord,
  VenueRecord,
} from '../domain';
import { money } from '../money';

function fixtureId(group: number, index: number) {
  return `00000000-0000-4000-${group.toString().padStart(4, '0')}-${index
    .toString()
    .padStart(12, '0')}`;
}

const venues = {
  freetownStudio: {
    id: fixtureId(8101, 1),
    name: 'Harbour Studio',
    address: '17 Atlantic Road',
    city: 'Freetown',
    countryCode: 'SL',
  },
  freetownGrounds: {
    id: fixtureId(8101, 2),
    name: 'Lumley Garden Grounds',
    city: 'Freetown',
    countryCode: 'SL',
  },
  accraHall: {
    id: fixtureId(8101, 3),
    name: 'Indigo Assembly Hall',
    address: '8 Lantern Street',
    city: 'Accra',
    countryCode: 'GH',
  },
  accraCourt: {
    id: fixtureId(8101, 4),
    name: 'Osu Night Court',
    city: 'Accra',
    countryCode: 'GH',
  },
  abidjanGallery: {
    id: fixtureId(8101, 5),
    name: 'Galerie du Passage',
    address: '24 Rue des Palmes',
    city: 'Abidjan',
    countryCode: 'CI',
  },
  abidjanTerrace: {
    id: fixtureId(8101, 6),
    name: 'La Terrasse Lagune',
    city: 'Abidjan',
    countryCode: 'CI',
  },
} as const satisfies Record<string, VenueRecord>;

type TierInput = {
  name: string;
  description?: string;
  minorUnits: string;
  currency: CurrencyCode;
  capacity: number;
  availableQuantity: number;
  salesStart?: string;
  salesEnd: string;
};

function tier(index: number, input: TierInput): TicketTierRecord {
  return {
    id: fixtureId(8301, index),
    name: input.name,
    ...(input.description ? { description: input.description } : {}),
    price: money(input.minorUnits, input.currency),
    capacity: input.capacity,
    availableQuantity: input.availableQuantity,
    salesStart: input.salesStart ?? '2026-09-01T00:00:00.000Z',
    salesEnd: input.salesEnd,
  };
}

type EventInput = {
  slug: string;
  title: string;
  description: string;
  organizerDisplayName: string;
  category: EventCategory;
  artwork: EventArtwork;
  venue: VenueRecord;
  startDateTime: string;
  endDateTime: string;
  refundPolicy: string;
  ageRestriction?: string;
  featuredRank?: number;
  ticketTiers: readonly TicketTierRecord[];
};

function event(index: number, input: EventInput): EventRecord {
  return {
    id: fixtureId(8201, index),
    ...input,
    status: 'PUBLISHED',
    publishedAt: '2026-09-01T12:00:00.000Z',
  };
}

const standardRefund =
  'Prototype terms: ticket purchases are not enabled. Final cancellation and refund terms will be published before sales open.';
const conditionsVente =
  'Conditions prototypes : aucun achat n’est activé. Les conditions définitives d’annulation et de remboursement seront publiées avant l’ouverture des ventes.';

/**
 * Fictional prototype records only. UI code must access them through the
 * EventRepository interface so this module can be replaced by PostgreSQL.
 */
export const prototypeEvents = [
  event(1, {
    slug: 'afterglow-sessions-freetown',
    title: 'Afterglow Sessions',
    description:
      'An evening of live rhythm, layered vocals, and late-night selections in an intimate harbour-side room.',
    organizerDisplayName: 'Open Current Collective',
    category: 'CONCERTS',
    artwork: {
      treatment: 'orbit',
      tone: 'lilac',
      alt: 'Abstract lilac rings and a glowing centre for Afterglow Sessions.',
    },
    venue: venues.freetownStudio,
    startDateTime: '2027-01-16T19:30:00.000Z',
    endDateTime: '2027-01-17T00:30:00.000Z',
    ageRestriction: '18+',
    refundPolicy: standardRefund,
    featuredRank: 1,
    ticketTiers: [
      tier(1, {
        name: 'Early room',
        minorUnits: '12000',
        currency: 'SLE',
        capacity: 80,
        availableQuantity: 0,
        salesEnd: '2027-01-16T18:30:00.000Z',
      }),
      tier(2, {
        name: 'General room',
        minorUnits: '18000',
        currency: 'SLE',
        capacity: 180,
        availableQuantity: 126,
        salesEnd: '2027-01-16T18:30:00.000Z',
      }),
    ],
  }),
  event(2, {
    slug: 'atlantic-frequency',
    title: 'Atlantic Frequency',
    description:
      'A shoreline electronic music programme moving from sunset ambience into a focused night set.',
    organizerDisplayName: 'Signal House',
    category: 'NIGHTLIFE',
    artwork: {
      treatment: 'wave',
      tone: 'blue',
      alt: 'Abstract blue wave bands for Atlantic Frequency.',
    },
    venue: venues.freetownGrounds,
    startDateTime: '2027-02-13T17:00:00.000Z',
    endDateTime: '2027-02-14T01:00:00.000Z',
    ageRestriction: '21+',
    refundPolicy: standardRefund,
    featuredRank: 2,
    ticketTiers: [
      tier(3, {
        name: 'Sunset entry',
        minorUnits: '15000',
        currency: 'SLE',
        capacity: 140,
        availableQuantity: 72,
        salesEnd: '2027-02-13T16:00:00.000Z',
      }),
      tier(4, {
        name: 'Night entry',
        minorUnits: '22000',
        currency: 'SLE',
        capacity: 220,
        availableQuantity: 165,
        salesEnd: '2027-02-13T21:00:00.000Z',
      }),
    ],
  }),
  event(3, {
    slug: 'makers-field-day',
    title: 'Makers’ Field Day',
    description:
      'A daytime programme of small exhibitions, print, food, conversation, and new work from independent makers.',
    organizerDisplayName: 'Common Ground Studio',
    category: 'ARTS_CULTURE',
    artwork: {
      treatment: 'stacks',
      tone: 'amber',
      alt: 'Layered amber blocks for Makers’ Field Day.',
    },
    venue: venues.freetownGrounds,
    startDateTime: '2027-03-06T11:00:00.000Z',
    endDateTime: '2027-03-06T18:00:00.000Z',
    refundPolicy: standardRefund,
    ticketTiers: [
      tier(5, {
        name: 'Day pass',
        minorUnits: '8000',
        currency: 'SLE',
        capacity: 300,
        availableQuantity: 240,
        salesEnd: '2027-03-06T10:00:00.000Z',
      }),
    ],
  }),
  event(4, {
    slug: 'golden-hour-assembly',
    title: 'Golden Hour Assembly',
    description:
      'A live band programme and collaborative vocal showcase built for one warm, high-energy room.',
    organizerDisplayName: 'Parallel Sound Room',
    category: 'CONCERTS',
    artwork: {
      treatment: 'rays',
      tone: 'coral',
      alt: 'Radiating coral lines for Golden Hour Assembly.',
    },
    venue: venues.accraHall,
    startDateTime: '2027-01-30T18:00:00.000Z',
    endDateTime: '2027-01-30T23:30:00.000Z',
    refundPolicy: standardRefund,
    featuredRank: 1,
    ticketTiers: [
      tier(6, {
        name: 'First release',
        minorUnits: '18000',
        currency: 'GHS',
        capacity: 120,
        availableQuantity: 0,
        salesEnd: '2027-01-30T17:00:00.000Z',
      }),
      tier(7, {
        name: 'General release',
        minorUnits: '26000',
        currency: 'GHS',
        capacity: 280,
        availableQuantity: 173,
        salesEnd: '2027-01-30T17:00:00.000Z',
      }),
    ],
  }),
  event(5, {
    slug: 'night-court-social',
    title: 'Night Court Social',
    description:
      'A floodlit five-a-side exhibition followed by DJs, food stalls, and an open-air social.',
    organizerDisplayName: 'Side Line Projects',
    category: 'SPORTS',
    artwork: {
      treatment: 'grid',
      tone: 'green',
      alt: 'Green court lines and offset circles for Night Court Social.',
    },
    venue: venues.accraCourt,
    startDateTime: '2027-02-20T16:00:00.000Z',
    endDateTime: '2027-02-20T23:00:00.000Z',
    refundPolicy: standardRefund,
    featuredRank: 2,
    ticketTiers: [
      tier(8, {
        name: 'Court-side',
        minorUnits: '10000',
        currency: 'GHS',
        capacity: 240,
        availableQuantity: 198,
        salesEnd: '2027-02-20T15:00:00.000Z',
      }),
    ],
  }),
  event(6, {
    slug: 'new-forms-forum',
    title: 'New Forms Forum',
    description:
      'A compact afternoon of talks and demonstrations about creative practice, independent publishing, and digital craft.',
    organizerDisplayName: 'Field Notes Lab',
    category: 'CONFERENCES',
    artwork: {
      treatment: 'frame',
      tone: 'red',
      alt: 'Nested red frames for New Forms Forum.',
    },
    venue: venues.accraHall,
    startDateTime: '2027-04-10T10:00:00.000Z',
    endDateTime: '2027-04-10T17:00:00.000Z',
    refundPolicy: standardRefund,
    ticketTiers: [
      tier(9, {
        name: 'Forum pass',
        minorUnits: '32000',
        currency: 'GHS',
        capacity: 180,
        availableQuantity: 180,
        salesStart: '2026-10-15T09:00:00.000Z',
        salesEnd: '2027-04-10T09:00:00.000Z',
      }),
    ],
  }),
  event(7, {
    slug: 'nuits-en-mouvement',
    title: 'Nuits en mouvement',
    description:
      'Une soirée de sélections électroniques, de rythmes en direct et de projections abstraites au bord de la lagune.',
    organizerDisplayName: 'Atelier Minuit',
    category: 'NIGHTLIFE',
    artwork: {
      treatment: 'wave',
      tone: 'lilac',
      alt: 'Vagues abstraites violettes pour Nuits en mouvement.',
    },
    venue: venues.abidjanTerrace,
    startDateTime: '2027-01-23T20:00:00.000Z',
    endDateTime: '2027-01-24T02:00:00.000Z',
    ageRestriction: '21+',
    refundPolicy: conditionsVente,
    featuredRank: 1,
    ticketTiers: [
      tier(10, {
        name: 'Entrée générale',
        minorUnits: '12000',
        currency: 'XOF',
        capacity: 260,
        availableQuantity: 144,
        salesEnd: '2027-01-23T19:00:00.000Z',
      }),
    ],
  }),
  event(8, {
    slug: 'passage-des-arts',
    title: 'Passage des arts',
    description:
      'Un parcours d’installations, d’édition et de performances courtes imaginé pour une galerie en mouvement.',
    organizerDisplayName: 'Éditions Passage',
    category: 'ARTS_CULTURE',
    artwork: {
      treatment: 'stacks',
      tone: 'blue',
      alt: 'Formes bleues superposées pour Passage des arts.',
    },
    venue: venues.abidjanGallery,
    startDateTime: '2027-02-27T12:00:00.000Z',
    endDateTime: '2027-02-27T20:00:00.000Z',
    refundPolicy: conditionsVente,
    featuredRank: 2,
    ticketTiers: [
      tier(11, {
        name: 'Pass journée',
        minorUnits: '8000',
        currency: 'XOF',
        capacity: 320,
        availableQuantity: 0,
        salesEnd: '2027-02-27T11:00:00.000Z',
      }),
    ],
  }),
  event(9, {
    slug: 'jardin-sonore',
    title: 'Jardin sonore',
    description:
      'Un festival en plein air réunissant concerts, espaces d’écoute et petites scènes pendant tout un après-midi.',
    organizerDisplayName: 'Collectif Clairière',
    category: 'FESTIVALS',
    artwork: {
      treatment: 'orbit',
      tone: 'amber',
      alt: 'Cercles ambrés et lignes organiques pour Jardin sonore.',
    },
    venue: venues.abidjanTerrace,
    startDateTime: '2027-03-20T13:00:00.000Z',
    endDateTime: '2027-03-20T23:00:00.000Z',
    refundPolicy: conditionsVente,
    ticketTiers: [
      tier(12, {
        name: 'Premier passage',
        minorUnits: '10000',
        currency: 'XOF',
        capacity: 180,
        availableQuantity: 0,
        salesEnd: '2027-03-20T12:00:00.000Z',
      }),
      tier(13, {
        name: 'Pass festival',
        minorUnits: '16000',
        currency: 'XOF',
        capacity: 420,
        availableQuantity: 336,
        salesEnd: '2027-03-20T12:00:00.000Z',
      }),
    ],
  }),
] as const satisfies readonly EventRecord[];

export const prototypeVenues = Object.values(venues);
