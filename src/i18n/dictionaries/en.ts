export const en = {
  metadata: {
    title: 'Discover events — Prototype',
    description:
      'Explore fictional prototype events across Sierra Leone, Ghana, and Côte d’Ivoire.',
  },
  navigation: {
    platform: 'Events',
    discover: 'Discover',
    skip: 'Skip to content',
    prototype: 'Fictional prototype',
  },
  market: {
    country: 'Country',
    language: 'Language',
    updating: 'Updating selection…',
  },
  discovery: {
    eyebrow: 'EVENTS / DISCOVERY',
    title: 'What’s happening in',
    subtitle: 'Find a night, a stage, or a room worth showing up for.',
    searchLabel: 'Search events',
    searchPlaceholder: 'Title, venue, city, or organizer',
    searchButton: 'Search',
    clearSearch: 'Clear search',
    featured: 'Featured',
    upcoming: 'Upcoming events',
    categories: 'Categories',
    all: 'All',
    results: 'events found',
    oneResult: 'event found',
    noMatches: 'No events match your search.',
    noMatchesDetail: 'Try another search or clear the category filter.',
    invalidCountry:
      'This country is not supported. Sierra Leone is selected instead.',
    invalidCategory: 'That category is not available. Showing all events.',
  },
  event: {
    from: 'From',
    at: 'at',
    by: 'By',
    details: 'Event details',
    tickets: 'Tickets',
    venue: 'Venue',
    organizer: 'Organizer',
    date: 'Date',
    time: 'Time',
    age: 'Age',
    refund: 'Cancellation and refund terms',
    back: 'Back to discovery',
    getTickets: 'Get tickets',
    purchasingLater: 'Ticket purchasing arrives in a later sprint.',
    remaining: 'remaining',
  },
  availability: {
    AVAILABLE: 'Available',
    SOLD_OUT: 'Sold out',
    SALE_NOT_STARTED: 'Sale starts soon',
    SALE_ENDED: 'Sale ended',
  },
  categories: {
    CONCERTS: 'Concerts',
    PARTIES: 'Parties',
    FESTIVALS: 'Festivals',
    NIGHTLIFE: 'Nightlife',
    SPORTS: 'Sports',
    ARTS_CULTURE: 'Arts & culture',
    CONFERENCES: 'Conferences',
    OTHER: 'Other',
  },
  footer: {
    scope: 'Fictional Sprint 1 event data',
    policy: 'Purchasing is not available in this prototype.',
  },
  loading: {
    title: 'Loading events…',
    detail: 'Preparing discovery for your selected country.',
  },
  error: {
    title: 'This view could not load.',
    detail: 'Try again or return to event discovery.',
    retry: 'Try again',
    home: 'Return to discovery',
  },
  notFound: {
    title: 'This event is not available.',
    detail: 'It may be unpublished or the address may be incorrect.',
  },
} as const;

type TextShape<T> = {
  [K in keyof T]: T[K] extends string ? string : TextShape<T[K]>;
};
export type Dictionary = TextShape<typeof en>;
