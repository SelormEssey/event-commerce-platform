export const en = {
  metadata: {
    title: 'Platform — Sprint 0',
    description:
      'The technical and visual foundation for a multi-country ticketing platform.',
  },
  navigation: {
    platform: 'Platform',
    foundation: 'Foundation',
    skip: 'Skip to content',
  },
  intro: {
    eyebrow: 'SPRINT 0 / FOUNDATION',
    title: 'The artwork leads.\nThe platform makes room.',
    description:
      'A shared foundation for Sierra Leone, Ghana, and Côte d’Ivoire. Explore the markets, languages, and visual system below.',
    scope: 'Foundation preview · No events or purchases yet',
  },
  controls: {
    title: 'Choose your context',
    country: 'Country',
    language: 'Language',
    help: 'Changing country selects its default language. You can then choose another language without changing currency.',
    currency: 'Currency',
    locale: 'Formatting locale',
    updating: 'Updating your selection…',
    selected: 'Current selection',
    invalid: 'This country is not supported. Sierra Leone is selected instead.',
  },
  artwork: {
    eyebrow: '01 / ARTWORK SPACE',
    title: 'Room for expression.',
    placeholder: 'Event artwork belongs here.',
    note: 'An empty poster canvas, ready for a future event. This is not an event listing.',
    caption: 'A quiet shell. Space for the poster to carry the color.',
    ratio: 'POSTER CANVAS / 4:5',
  },
  interaction: {
    eyebrow: '02 / INTERACTION',
    title: 'Clear at every step.',
    description:
      'Try a small action to see feedback. Keyboard focus and disabled controls are part of the same system.',
    primary: 'Show feedback',
    secondary: 'Reset example',
    disabled: 'Unavailable',
    pending: 'Working…',
    idle: 'No action yet. Try “Show feedback”.',
    success: 'Example action complete.',
    successLabel: 'SUCCESS',
    warningLabel: 'WARNING',
    warning: 'An example that needs attention.',
    errorLabel: 'ERROR',
    error: 'An example that needs correcting.',
    focusHint:
      'Use Tab to move between controls. Every state has a text label.',
  },
  system: {
    eyebrow: '03 / SHARED FOUNDATION',
    title: 'One system. Three markets.',
    countries: 'Market configuration',
    countriesDetail:
      'Currency, defaults, and available methods in one typed registry.',
    languages: 'Language dictionaries',
    languagesDetail:
      'English and French today, with room for additional languages.',
    database: 'PostgreSQL + Prisma',
    databaseDetail:
      'Country identifiers only. Database connectivity is verified separately.',
    tokens: 'Semantic color tokens',
    tokensDetail: 'Surfaces, text, actions, and feedback share one palette.',
    surface: 'Surface',
    text: 'Text',
    action: 'Action',
    accent: 'Expression',
  },
  footer: {
    scope: 'Sprint 0 only',
    next: 'Next planned: events',
    policy: 'Financial policy is not configured.',
  },
  loading: {
    title: 'Loading your context…',
    detail: 'Preparing the foundation in your selected language.',
  },
  error: {
    title: 'This view could not load.',
    detail:
      'Try again. Your selected country and language are still in the address.',
    retry: 'Try again',
    home: 'Return to the foundation',
  },
  notFound: {
    title: 'This page is not available.',
    detail:
      'Return to the foundation to select a supported country and language.',
  },
} as const;

type TextShape<T> = {
  [K in keyof T]: T[K] extends string ? string : TextShape<T[K]>;
};
export type Dictionary = TextShape<typeof en>;
