// Vocabulary only. These values never authenticate a user or authorize a query.
export const roles = [
  'customer',
  'organizer',
  'event_staff',
  'internal_admin',
] as const;
export type Role = (typeof roles)[number];
