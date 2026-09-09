import type { CountryCode, CurrencyCode } from '../../config/countries';

export const eventCategories = [
  'CONCERTS',
  'PARTIES',
  'FESTIVALS',
  'NIGHTLIFE',
  'SPORTS',
  'ARTS_CULTURE',
  'CONFERENCES',
  'OTHER',
] as const;

export type EventCategory = (typeof eventCategories)[number];
export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';
export type TicketAvailability =
  'AVAILABLE' | 'SOLD_OUT' | 'SALE_NOT_STARTED' | 'SALE_ENDED';

export type Money = {
  /** Base-10 integer string so amounts remain exact and JSON-safe. */
  minorUnits: string;
  currency: CurrencyCode;
};

export type EventArtwork = {
  treatment: 'orbit' | 'grid' | 'rays' | 'stacks' | 'wave' | 'frame';
  tone: 'lilac' | 'coral' | 'blue' | 'amber' | 'green' | 'red';
  alt: string;
};

export type VenueRecord = {
  id: string;
  name: string;
  address?: string;
  city: string;
  countryCode: CountryCode;
};

export type TicketTierRecord = {
  id: string;
  name: string;
  description?: string;
  price: Money;
  capacity: number;
  availableQuantity: number;
  salesStart: string;
  salesEnd: string;
};

export type EventRecord = {
  id: string;
  slug: string;
  organizerDisplayName: string;
  title: string;
  description: string;
  category: EventCategory;
  artwork: EventArtwork;
  venue: VenueRecord;
  startDateTime: string;
  endDateTime: string;
  status: EventStatus;
  ageRestriction?: string;
  refundPolicy: string;
  featuredRank?: number;
  publishedAt: string;
  ticketTiers: readonly TicketTierRecord[];
};
